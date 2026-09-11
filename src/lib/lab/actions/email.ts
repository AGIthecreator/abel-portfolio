import {
  BUDGET_EXHAUSTED_MESSAGE,
  refundEmailBudget,
  reserveEmailBudget,
} from "../budget";
import {
  buildLabInternalEmailHtml,
  buildLabInternalSubject,
  buildLabVisitorEmailHtml,
  buildLabVisitorSubject,
} from "../email-template";
import type {
  LabClassification,
  LabEmailEvent,
  LabEmailStatus,
  LabRoute,
} from "../types";
import {
  describeProviderError,
  failed,
  getLabProvider,
  providerUnavailableOutcome,
  simulated,
  succeeded,
  type LabActionOutcome,
} from "./provider";

/**
 * Acciones de email del laboratorio.
 *
 * `sendLabRouteEmails` envía el aviso interno y la confirmación al visitante
 * usando la plantilla de la ruta que decidió el servidor.
 * `getLabEmailStatus` consulta el estado real en el proveedor.
 */

interface SendArgs {
  runId: string;
  name: string;
  email: string;
  message: string;
  classification: LabClassification;
  route: LabRoute;
}

export interface LabEmailSendResult {
  internal: LabActionOutcome;
  visitor: LabActionOutcome;
}

export async function sendLabRouteEmails({
  runId,
  name,
  email,
  message,
  classification,
  route,
}: SendArgs): Promise<LabEmailSendResult> {
  const provider = getLabProvider();
  if (!provider) {
    return {
      internal: providerUnavailableOutcome(),
      visitor: providerUnavailableOutcome(),
    };
  }

  if (!(await reserveEmailBudget(2))) {
    return {
      internal: simulated(BUDGET_EXHAUSTED_MESSAGE),
      visitor: simulated(BUDGET_EXHAUSTED_MESSAGE),
    };
  }

  const { client, internalRecipient, from } = provider;

  // Las dos peticiones son independientes: si una falla la otra debe salir.
  const [internalSettled, visitorSettled] = await Promise.allSettled([
    client.emails.send(
      {
        from,
        to: internalRecipient,
        replyTo: email,
        subject: buildLabInternalSubject(route, name),
        html: buildLabInternalEmailHtml({
          name,
          email,
          message,
          classification,
          route,
          runId,
        }),
        tags: [
          { name: "source", value: "laboratorio" },
          { name: "route", value: route.id },
        ],
      },
      // La clave de idempotencia evita duplicar el aviso si el cliente reintenta.
      { idempotencyKey: `lab-internal-${runId}` },
    ),
    client.emails.send(
      {
        from,
        to: email,
        subject: buildLabVisitorSubject(route),
        html: buildLabVisitorEmailHtml(name, route),
        tags: [
          { name: "source", value: "laboratorio" },
          { name: "route", value: route.id },
        ],
      },
      { idempotencyKey: `lab-visitor-${runId}` },
    ),
  ]);

  const internal = readSendOutcome(
    internalSettled,
    "Aviso interno entregado al proveedor de email.",
    "El proveedor no aceptó el aviso interno.",
  );
  const visitor = readSendOutcome(
    visitorSettled,
    "Confirmación entregada al proveedor de email.",
    "El proveedor no aceptó la confirmación al visitante.",
  );

  const realSends = Number(internal.ok) + Number(visitor.ok);
  const unused = 2 - realSends;
  if (unused > 0) await refundEmailBudget(unused);

  return { internal, visitor };
}

type SendSettled = PromiseSettledResult<{
  data: { id: string } | null;
  error: unknown;
}>;

function readSendOutcome(
  settled: SendSettled,
  okDetail: string,
  failDetail: string,
): LabActionOutcome {
  if (settled.status === "rejected") {
    return failed(failDetail, describeProviderError(settled.reason));
  }
  if (settled.value.error || !settled.value.data?.id) {
    return failed(failDetail, describeProviderError(settled.value.error));
  }
  return succeeded(okDetail, settled.value.data.id);
}

const EVENT_COPY: Record<LabEmailEvent, string> = {
  queued: "En cola en el proveedor.",
  scheduled: "Programado para salir más tarde.",
  sent: "Enviado al servidor de destino.",
  delivered: "Entregado en el buzón de destino.",
  delivery_delayed: "Entrega retrasada por el servidor de destino.",
  opened: "Abierto por el destinatario.",
  clicked: "El destinatario ha pulsado un enlace.",
  bounced: "Rechazado por el servidor de destino.",
  complained: "Marcado como spam por el destinatario.",
  failed: "El proveedor no pudo entregarlo.",
  canceled: "Cancelado antes de salir.",
  suppressed: "Bloqueado por la lista de supresión.",
};

export function describeEmailEvent(event: LabEmailEvent | null): string {
  if (!event) return "El proveedor todavía no informa de ningún evento.";
  return EVENT_COPY[event] ?? "Estado no reconocido.";
}

/**
 * Consulta el estado real del email en el proveedor.
 *
 * No traduce un 200 en "entregado": devuelve exactamente el último evento que
 * informa el proveedor, y `null` si aún no informa de ninguno.
 */
export async function getLabEmailStatus(
  emailId: string,
): Promise<LabActionOutcome<LabEmailStatus>> {
  const provider = getLabProvider();
  if (!provider) return providerUnavailableOutcome<LabEmailStatus>();

  try {
    const response = await provider.client.emails.get(emailId);
    if (response.error || !response.data) {
      return failed<LabEmailStatus>(
        "El proveedor no devolvió el estado del email.",
        describeProviderError(response.error),
      );
    }

    const status: LabEmailStatus = {
      event: response.data.last_event ?? null,
      scheduledAt: response.data.scheduled_at ?? null,
      checkedAt: new Date().toISOString(),
    };

    return succeeded<LabEmailStatus>(
      describeEmailEvent(status.event),
      emailId,
      status,
    );
  } catch (error) {
    return failed<LabEmailStatus>(
      "No se pudo consultar el estado en el proveedor.",
      describeProviderError(error),
    );
  }
}
