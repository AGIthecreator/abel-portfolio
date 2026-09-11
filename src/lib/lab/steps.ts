import type {
  LabAction,
  LabActionStatus,
  LabClassification,
  LabEmailStatus,
  LabRoute,
  LabStep,
} from "./types";
import { describeEmailEvent } from "./actions/email";
import type { LabActionOutcome } from "./actions/provider";

/**
 * Construcción del timeline del Acto 1.
 *
 * El timeline no es una animación con pasos fijos: es la traza de la ejecución.
 * Los pasos base los produce el servidor con el resultado real, y las acciones
 * posteriores (estado, informe, seguimiento, cancelación) añaden pasos nuevos
 * conforme ocurren. La numeración la calcula la interfaz por posición, así que
 * un flujo que no llega al seguimiento simplemente no tiene ese paso.
 */

interface RunTimelineArgs {
  classification: LabClassification;
  route: LabRoute;
  /** Resultado real del aviso interno. */
  internal: LabActionOutcome;
  /** Resultado real de la confirmación al visitante. */
  visitor: LabActionOutcome;
  quotaExhausted: boolean;
  /** False cuando la petición no llegó a anotarse (honeypot). */
  recorded: boolean;
}

export function buildRunTimeline({
  classification,
  route,
  internal,
  visitor,
  quotaExhausted,
  recorded,
}: RunTimelineArgs): LabStep[] {
  const anyReal = internal.ok || visitor.ok;

  const actionDetail = anyReal
    ? internal.ok && visitor.ok
      ? "Dos emails aceptados por el proveedor: aviso interno y confirmación."
      : "Un email aceptado por el proveedor; el otro no salió."
    : quotaExhausted
      ? "Límite de ejecuciones reales alcanzado: el aviso queda representado."
      : (internal.error ?? visitor.error)
        ? "El proveedor rechazó el envío, así que el paso queda representado."
        : internal.detail;

  return [
    {
      id: "entrada",
      type: "input",
      label: "Entrada",
      description: "Solicitud recibida",
      status: "done",
      executionMode: "real",
      detail: "Petición validada en el servidor antes de ejecutar nada.",
    },
    {
      id: "registro",
      type: "record",
      label: "Registro",
      description: "Datos guardados",
      status: recorded ? "done" : "blocked",
      executionMode: "real",
      detail: recorded
        ? "Registrado en servidor. Identificadores en hash; los datos de reentrada caducan en dos horas."
        : "La solicitud no ha pasado los controles de entrada.",
    },
    {
      id: "clasificacion",
      type: "classify",
      label: `Clasificación: ${classification.type}`,
      description: "Reglas deterministas sobre el texto, sin IA",
      status: "done",
      executionMode: "real",
      detail: `${classification.area} · Prioridad ${classification.priority}. ${classification.reason}`,
    },
    {
      id: "decision",
      type: "decision",
      label: `Ruta seleccionada: ${route.team.toLowerCase()}`,
      description: route.label,
      status: "done",
      executionMode: "real",
      detail: `${route.reason} Determina plantilla, asunto y plazo: ${route.sla}`,
    },
    {
      id: "accion",
      type: "action",
      label: "Acción",
      description: "Ejecutando el siguiente paso",
      status: anyReal ? "done" : "blocked",
      executionMode: anyReal ? "real" : "simulated",
      detail: actionDetail,
    },
  ];
}

export function buildDuplicateTimeline(minutesAgo: number): LabStep[] {
  return [
    {
      id: "entrada",
      type: "input",
      label: "Entrada",
      description: "Solicitud recibida",
      status: "done",
      executionMode: "real",
      detail: "Petición validada en el servidor.",
    },
    {
      id: "comprobacion",
      type: "decision",
      label: "Comprobación",
      description: "Buscando solicitudes anteriores",
      status: "done",
      executionMode: "real",
      detail: "Consulta al registro del servidor por el email de la solicitud.",
    },
    {
      id: "duplicado",
      type: "exception",
      label: "Duplicado",
      description: "Solicitud ya registrada",
      status: "exception",
      executionMode: "real",
      detail:
        minutesAgo <= 1
          ? "Ya existe una solicitud con este email de hace menos de un minuto."
          : `Ya existe una solicitud con este email de hace ${minutesAgo} min.`,
    },
    {
      id: "no-ejecutar",
      type: "action",
      label: "No ejecutar",
      description: "El proceso se detiene aquí",
      status: "blocked",
      executionMode: "real",
      detail:
        "No se repite ninguna acción real: ni registro nuevo, ni email, ni aviso.",
    },
  ];
}

function outcomeStatus(outcome: LabActionOutcome<unknown>): LabActionStatus {
  if (outcome.ok) return "done";
  return outcome.error ? "failed" : "skipped";
}

export function buildRunActions({
  internal,
  visitor,
  quotaExhausted,
  classification,
  recorded,
}: {
  internal: LabActionOutcome;
  visitor: LabActionOutcome;
  quotaExhausted: boolean;
  classification: LabClassification;
  recorded: boolean;
}): LabAction[] {
  return [
    {
      id: "email_internal",
      label: "Aviso por email al responsable",
      executionMode: internal.executionMode,
      status: quotaExhausted && !internal.ok ? "blocked" : outcomeStatus(internal),
      detail: quotaExhausted && !internal.ok
        ? "Límite de ejecuciones reales alcanzado."
        : internal.detail,
      providerId: internal.providerId,
      error: internal.error,
    },
    {
      id: "email_visitor",
      label: "Confirmación por email al solicitante",
      executionMode: visitor.executionMode,
      status: quotaExhausted && !visitor.ok ? "blocked" : outcomeStatus(visitor),
      detail: quotaExhausted && !visitor.ok
        ? "Límite de ejecuciones reales alcanzado."
        : visitor.detail,
      providerId: visitor.providerId,
      error: visitor.error,
    },
    {
      id: "record",
      label: "Registro de la solicitud",
      executionMode: "real",
      status: recorded ? "done" : "blocked",
      detail: recorded
        ? "Anotada en el registro del servidor para detectar duplicados y recuperar el estado."
        : "La solicitud no ha pasado los controles de entrada.",
    },
    {
      id: "whatsapp",
      label: "Aviso por WhatsApp",
      executionMode: "simulated",
      status: "skipped",
      detail: "No hay integración de WhatsApp conectada a este proceso.",
    },
    {
      id: "crm",
      label: `Alta en CRM como «${classification.type}»`,
      executionMode: "simulated",
      status: "skipped",
      detail: "No hay CRM conectado a este proceso.",
    },
  ];
}

export function buildDuplicateActions(): LabAction[] {
  return [
    {
      id: "email_internal",
      label: "Aviso por email al responsable",
      executionMode: "real",
      status: "blocked",
      detail: "Bloqueado por la comprobación de duplicados.",
    },
    {
      id: "record",
      label: "Registro de la solicitud",
      executionMode: "real",
      status: "blocked",
      detail: "No se crea un registro nuevo: ya existe uno reciente.",
    },
  ];
}

/** Paso y acción del estado real del email. */
export function buildStatusStep(
  outcome: LabActionOutcome<LabEmailStatus>,
): { step: LabStep; action: LabAction } {
  const event = outcome.data?.event ?? null;
  const real = outcome.executionMode === "real";

  // Un 200 del proveedor no significa "entregado": se distingue explícitamente.
  const label = real
    ? event
      ? `Estado: ${EVENT_LABEL[event]}`
      : "Estado: pendiente"
    : "Estado: no disponible";

  return {
    step: {
      id: "estado",
      type: "status",
      label,
      description: "Consulta al proveedor de email",
      status: real ? "done" : "blocked",
      executionMode: outcome.executionMode,
      detail: real ? describeEmailEvent(event) : outcome.detail,
    },
    action: {
      id: "email_status",
      label: "Consulta del estado del envío",
      executionMode: outcome.executionMode,
      status: outcome.ok ? "done" : outcome.error ? "failed" : "skipped",
      detail: outcome.detail,
      providerId: outcome.providerId,
      error: outcome.error,
    },
  };
}

const EVENT_LABEL: Record<NonNullable<LabEmailStatus["event"]>, string> = {
  queued: "en cola",
  scheduled: "programado",
  sent: "enviado",
  delivered: "entregado",
  delivery_delayed: "entrega retrasada",
  opened: "abierto",
  clicked: "enlace pulsado",
  bounced: "rechazado",
  complained: "marcado como spam",
  failed: "fallido",
  canceled: "cancelado",
  suppressed: "suprimido",
};

export function buildDocumentStep(
  outcome: LabActionOutcome,
  emailed: LabActionOutcome | null,
): { step: LabStep; action: LabAction } {
  const detail = emailed
    ? `${outcome.detail} ${emailed.detail}`
    : outcome.detail;

  return {
    step: {
      id: "documento",
      type: "document",
      label: "Documento",
      description: "Informe de la ejecución",
      status: outcome.ok ? "done" : "blocked",
      executionMode: outcome.executionMode,
      detail,
    },
    action: {
      id: "pdf",
      label: "Informe de automatización en PDF",
      executionMode: outcome.executionMode,
      status: outcome.ok ? "done" : outcome.error ? "failed" : "skipped",
      detail,
      providerId: emailed?.providerId,
      error: outcome.error ?? emailed?.error,
    },
  };
}

export function buildFollowupStep(
  outcome: LabActionOutcome<{ scheduledAt: string }>,
  kind: "schedule" | "reschedule",
): { step: LabStep; action: LabAction } {
  const scheduledAt = outcome.data?.scheduledAt ?? null;

  return {
    step: {
      id: kind === "schedule" ? "seguimiento" : "seguimiento-reprogramado",
      type: "followup",
      label: kind === "schedule" ? "Seguimiento" : "Seguimiento reprogramado",
      description: outcome.ok ? "Programado en el proveedor" : "No programado",
      status: outcome.ok ? "done" : "blocked",
      executionMode: outcome.executionMode,
      detail: scheduledAt
        ? `${outcome.detail} Saldrá el ${formatFollowupDate(scheduledAt)}.`
        : outcome.detail,
    },
    action: {
      id: kind === "schedule" ? "followup" : "followup_reschedule",
      label:
        kind === "schedule"
          ? "Seguimiento programado"
          : "Seguimiento reprogramado",
      executionMode: outcome.executionMode,
      status: outcome.ok ? "done" : outcome.error ? "failed" : "skipped",
      detail: scheduledAt
        ? `${outcome.detail} Fecha: ${formatFollowupDate(scheduledAt)}.`
        : outcome.detail,
      providerId: outcome.providerId,
      error: outcome.error,
    },
  };
}

export function buildCancelStep(outcome: LabActionOutcome): {
  step: LabStep;
  action: LabAction;
} {
  return {
    step: {
      id: "seguimiento-cancelado",
      type: "followup",
      label: "Seguimiento cancelado",
      description: outcome.ok
        ? "Cancelado en el proveedor"
        : "No se pudo cancelar",
      status: outcome.ok ? "done" : "exception",
      executionMode: outcome.executionMode,
      detail: outcome.detail,
    },
    action: {
      id: "followup_cancel",
      label: "Cancelación del seguimiento",
      executionMode: outcome.executionMode,
      status: outcome.ok ? "done" : outcome.error ? "failed" : "skipped",
      detail: outcome.detail,
      providerId: outcome.providerId,
      error: outcome.error,
    },
  };
}

/** Fecha corta en hora de Madrid, la misma que se envió al proveedor. */
export function formatFollowupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  }).format(date);
}
