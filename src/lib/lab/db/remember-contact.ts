import type { LabClassification, LabRouteId } from "../types";
import type { LabRepository } from "./repository";
import type { LabContactRecord } from "./contact-logic";

/**
 * Alta o actualización del participante. No sustituye lab_runs.
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
    runId?: string | null;
  },
): Promise<LabContactRecord | null> {
  try {
    return await repo.upsertLabContact({
      email: input.email,
      emailHash: input.emailHash,
      name: input.name,
      goal: input.classification?.type ?? null,
      route: input.routeId ?? null,
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
