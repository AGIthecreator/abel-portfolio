import { getLabRepository } from "./db";
import { resolveLabRoute } from "./routing";
import { rebuildRunState } from "./rebuild";
import type { LabRunRecord } from "./store";
import type {
  LabAction,
  LabFollowupState,
  LabSessionResponse,
  LabStep,
} from "./types";

type LabActivation = NonNullable<LabSessionResponse["activation"]>;

/** Estado de seguimiento derivado del registro, nunca del cliente. */
export function followupFromRun(run: LabRunRecord): LabFollowupState | null {
  if (!run.followupEmailId && !run.followupScheduledAt) return null;
  return {
    providerId: run.followupEmailId,
    scheduledAt: run.followupCanceled ? null : run.followupScheduledAt,
    status: run.followupCanceled
      ? "canceled"
      : run.followupEmailId
        ? "scheduled"
        : "failed",
    executionMode: run.followupEmailId ? "real" : "simulated",
    reschedules: run.usage.reschedules,
  };
}

/** Fusiona un paso/acción nuevos sin duplicar ids. */
export function mergeLabTrace(
  run: LabRunRecord,
  step: LabStep,
  action: LabAction,
): { steps: LabStep[]; actions: LabAction[] } {
  return {
    steps: [...run.steps.filter((item) => item.id !== step.id), step],
    actions: [...run.actions.filter((item) => item.id !== action.id), action],
  };
}

/** Persiste la traza visible: columnas JSON y filas de `lab_actions`. */
export async function persistLabTrace(
  runId: string,
  steps: readonly LabStep[],
  actions: readonly LabAction[],
): Promise<void> {
  const repo = getLabRepository();
  await repo.updateRun(runId, { steps: [...steps], actions: [...actions] });
  await repo.replaceActions(runId, actions);
}

/**
 * Reconstruye el estado de Acto 1 que puede devolver el servidor.
 * Sin instantánea de visitante no hay reentrada útil (PDF/seguimiento).
 */
export function activationFromRun(
  run: LabRunRecord,
): LabActivation | null {
  if (!run.visitor) return null;

  const rebuilt =
    run.steps.length > 0 && run.actions.length > 0
      ? {
          classification: run.classification,
          route: resolveLabRoute(run.routeId),
          steps: run.steps,
          actions: run.actions,
        }
      : rebuildRunState(run, run.visitor.message);

  return {
    runId: run.runId,
    duplicate: run.duplicate,
    classification: rebuilt.classification,
    route: rebuilt.route,
    steps: rebuilt.steps,
    actions: rebuilt.actions,
    capabilities: run.capabilities,
    degradedReason: run.degradedReason,
    followup: followupFromRun(run),
    input: run.visitor,
  };
}
