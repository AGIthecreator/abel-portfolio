import type { LabClassification, LabRouteId } from "../types";
import type { LabRepository } from "./repository";
import type { LabContactRecord, LabContactProgressPatch } from "./contact-logic";

/**
 * Alta o actualización del participante comercial. No sustituye lab_runs.
 * El fallo no debe tumbar la ejecución de la demo.
 */
export async function rememberLabContact(
  repo: LabRepository,
  input: {
    email: string;
    emailHash: string;
    name: string | null;
    classification?: LabClassification | null;
    routeId?: LabRouteId | string | null;
    origin?: string | null;
    runId?: string | null;
  },
): Promise<LabContactRecord | null> {
  try {
    return await repo.upsertLabContact({
      email: input.email,
      emailHash: input.emailHash,
      name: input.name,
      classification: input.classification?.type ?? null,
      route: input.routeId ?? null,
      origin: input.origin ?? null,
      lastRunId: input.runId ?? null,
    });
  } catch (error) {
    console.error(
      "[lab] contact upsert",
      error instanceof Error ? error.message : "error",
    );
    return null;
  }
}

/** Marca de progreso interno. Nunca rompe PDF, seguimiento ni la demo. */
export async function markLabContactProgress(
  repo: LabRepository,
  emailHash: string,
  patch: LabContactProgressPatch,
): Promise<void> {
  try {
    await repo.updateLabContactProgress(emailHash, patch);
  } catch (error) {
    console.error(
      "[lab] contact progress",
      error instanceof Error ? error.message : "error",
    );
  }
}
