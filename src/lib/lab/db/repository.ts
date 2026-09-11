import type { LabAction, LabFollowupState } from "../types";
import type { LabLogEntry, LabRunRecord, LabRunUsage } from "../store";
import type {
  LabContactProgressPatch,
  LabContactRecord,
  LabContactUpsertInput,
} from "./contact-logic";

export interface DedupClaim {
  duplicate: boolean;
  existing: LabRunRecord | null;
}

export interface LabFollowupWrite {
  providerId: string | null;
  status: LabFollowupState["status"];
  executionMode: LabFollowupState["executionMode"];
  scheduledAt: string | null;
  cancelled: boolean;
  reschedules: number;
}

/**
 * Persistencia del laboratorio. Los handlers no hablan con Supabase ni con
 * globalThis: pasan por aquí. Hay dos implementaciones: Postgres (Supabase)
 * y memoria de proceso, esta última solo cuando no hay credenciales de DB.
 */
export interface LabRepository {
  readonly kind: "supabase" | "memory";

  claimDedup(emailHash: string, runId: string): Promise<DedupClaim>;
  createRun(record: LabRunRecord): Promise<void>;
  getRunById(runId: string): Promise<LabRunRecord | null>;
  getRunByAccessTokenHash(tokenHash: string): Promise<LabRunRecord | null>;
  updateRun(
    runId: string,
    patch: Partial<Omit<LabRunRecord, "runId" | "usage" | "accessTokenHash">> & {
      usage?: Partial<LabRunUsage>;
    },
  ): Promise<LabRunRecord | null>;

  replaceActions(runId: string, actions: readonly LabAction[]): Promise<void>;
  upsertFollowup(runId: string, followup: LabFollowupWrite): Promise<void>;
  addEvent(entry: Omit<LabLogEntry, "at">): Promise<void>;

  hasExhaustedRealRunQuota(ipHash: string): Promise<boolean>;
  consumeRealRunQuota(ipHash: string): Promise<void>;
  isRateLimited(ipHash: string): Promise<boolean>;
  hasEmailBudget(count: number, limit: number): Promise<boolean>;
  /** Reserva atómica. False si no cabe. */
  tryConsumeEmailBudget(count: number, limit: number): Promise<boolean>;
  refundEmailBudget(count: number): Promise<void>;

  upsertLabContact(input: LabContactUpsertInput): Promise<LabContactRecord>;
  updateLabContactProgress(
    emailHash: string,
    patch: LabContactProgressPatch,
  ): Promise<LabContactRecord | null>;
  getLabContactByEmailHash(emailHash: string): Promise<LabContactRecord | null>;
}
