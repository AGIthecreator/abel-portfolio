import {
  BUDGET_EXHAUSTED_MESSAGE,
  refundEmailBudget,
  reserveEmailBudget,
} from "../budget";
import {
  buildLabFollowupEmailHtml,
  buildLabFollowupSubject,
} from "../email-template";
import type { LabRoute } from "../types";
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
 * Seguimiento programado del laboratorio.
 *
 * Usa `scheduledAt` de Resend, así que el email queda de verdad en el futuro
 * dentro del proveedor. La fecha que se muestra en la interfaz es la misma que
 * se envió al proveedor: no es un texto decorativo.
 *
 * Cancelar y reprogramar también son operaciones reales (`emails.cancel` y
 * `emails.update`). Ambas están disponibles en la versión instalada del SDK.
 */

export interface LabFollowupData {
  scheduledAt: string;
}

interface ScheduleArgs {
  runId: string;
  name: string;
  email: string;
  route: LabRoute;
  delayMinutes: number;
}

export async function scheduleLabFollowup({
  runId,
  name,
  email,
  route,
  delayMinutes,
}: ScheduleArgs): Promise<LabActionOutcome<LabFollowupData>> {
  const provider = getLabProvider();
  if (!provider) return providerUnavailableOutcome<LabFollowupData>();

  if (!(await reserveEmailBudget(1))) {
    return simulated<LabFollowupData>(BUDGET_EXHAUSTED_MESSAGE);
  }

  const scheduledAt = new Date(Date.now() + delayMinutes * 60_000).toISOString();

  try {
    const response = await provider.client.emails.send(
      {
        from: provider.from,
        to: email,
        subject: buildLabFollowupSubject(route),
        html: buildLabFollowupEmailHtml(name, route),
        scheduledAt,
        tags: [
          { name: "source", value: "laboratorio" },
          { name: "kind", value: "followup" },
        ],
      },
      { idempotencyKey: `lab-followup-${runId}` },
    );

    if (response.error || !response.data?.id) {
      await refundEmailBudget(1);
      return failed<LabFollowupData>(
        "El proveedor no aceptó la programación del seguimiento.",
        describeProviderError(response.error),
      );
    }

    return succeeded<LabFollowupData>(
      "Seguimiento programado en el proveedor.",
      response.data.id,
      { scheduledAt },
    );
  } catch (error) {
    await refundEmailBudget(1);
    return failed<LabFollowupData>(
      "No se pudo programar el seguimiento.",
      describeProviderError(error),
    );
  }
}

export async function cancelLabFollowup(
  emailId: string,
): Promise<LabActionOutcome> {
  const provider = getLabProvider();
  if (!provider) return providerUnavailableOutcome();

  try {
    const response = await provider.client.emails.cancel(emailId);

    if (response.error || !response.data?.id) {
      return failed(
        "El proveedor no pudo cancelar el seguimiento. Puede que ya haya salido.",
        describeProviderError(response.error),
      );
    }

    return succeeded("Seguimiento cancelado en el proveedor.", response.data.id);
  } catch (error) {
    return failed(
      "No se pudo cancelar el seguimiento.",
      describeProviderError(error),
    );
  }
}

export async function rescheduleLabFollowup(
  emailId: string,
  delayMinutes: number,
): Promise<LabActionOutcome<LabFollowupData>> {
  const provider = getLabProvider();
  if (!provider) return providerUnavailableOutcome<LabFollowupData>();

  const scheduledAt = new Date(Date.now() + delayMinutes * 60_000).toISOString();

  try {
    // `emails.update` mueve la fecha del envío ya programado: no crea otro email.
    const response = await provider.client.emails.update({
      id: emailId,
      scheduledAt,
    });

    if (response.error || !response.data?.id) {
      return failed<LabFollowupData>(
        "El proveedor no pudo mover la fecha del seguimiento.",
        describeProviderError(response.error),
      );
    }

    return succeeded<LabFollowupData>(
      "Seguimiento reprogramado en el proveedor.",
      response.data.id,
      { scheduledAt },
    );
  } catch (error) {
    return failed<LabFollowupData>(
      "No se pudo reprogramar el seguimiento.",
      describeProviderError(error),
    );
  }
}
