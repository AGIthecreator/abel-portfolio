import { classifyLabMessage } from "./classify";
import { resolveLabRoute } from "./routing";
import { buildRunActions, buildRunTimeline, formatFollowupDate } from "./steps";
import type { LabRunRecord } from "./store";
import { simulated, succeeded } from "./actions/provider";
import type { LabAction, LabClassification, LabRoute, LabStep } from "./types";

/**
 * Reconstruye el estado de una ejecución a partir del registro del servidor.
 *
 * Prefiere la traza persistida (pasos, acciones, clasificación). Si falta,
 * la deriva de los identificadores del proveedor. El informe nunca acepta
 * la traza que envíe el cliente.
 */
export function rebuildRunState(
  run: LabRunRecord,
  message: string,
): {
  classification: LabClassification;
  route: LabRoute;
  steps: LabStep[];
  actions: LabAction[];
} {
  const route = resolveLabRoute(run.routeId);
  const classification =
    run.classification?.type
      ? run.classification
      : classifyLabMessage(message).classification;

  if (run.steps.length > 0 && run.actions.length > 0) {
    return {
      classification,
      route,
      steps: run.steps,
      actions: run.actions,
    };
  }

  const internal = run.internalEmailId
    ? succeeded("Aviso interno aceptado por el proveedor.", run.internalEmailId)
    : simulated("El aviso interno no llegó a salir en esta ejecución.");
  const visitor = run.visitorEmailId
    ? succeeded("Confirmación aceptada por el proveedor.", run.visitorEmailId)
    : simulated("La confirmación no llegó a salir en esta ejecución.");

  const steps = buildRunTimeline({
    classification,
    route,
    internal,
    visitor,
    quotaExhausted: false,
    recorded: true,
  });

  const actions = buildRunActions({
    classification,
    internal,
    visitor,
    quotaExhausted: false,
    recorded: true,
  });

  if (run.followupEmailId && run.followupScheduledAt) {
    const canceled = run.followupCanceled;
    steps.push({
      id: "seguimiento",
      type: "followup",
      label: canceled ? "Seguimiento cancelado" : "Seguimiento programado",
      description: canceled
        ? "Cancelado en el proveedor"
        : "Programado en el proveedor",
      status: "done",
      executionMode: "real",
      detail: canceled
        ? "El envío programado se anuló antes de salir."
        : `Saldrá el ${formatFollowupDate(run.followupScheduledAt)}.`,
    });
    actions.push({
      id: canceled ? "followup_cancel" : "followup",
      label: canceled ? "Cancelación del seguimiento" : "Seguimiento programado",
      executionMode: "real",
      status: "done",
      detail: canceled
        ? "Cancelado en el proveedor antes de enviarse."
        : `Programado para ${formatFollowupDate(run.followupScheduledAt)}.`,
      providerId: run.followupEmailId,
    });
  }

  return { classification, route, steps, actions };
}
