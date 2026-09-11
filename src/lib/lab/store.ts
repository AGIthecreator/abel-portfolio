import { createHash, randomUUID } from "node:crypto";
import type {
  LabAction,
  LabClassification,
  LabRouteId,
  LabStep,
} from "./types";

/**
 * Tipos, hashes y límites del registro del laboratorio.
 *
 * La persistencia vive en `lib/lab/db` (Supabase o memoria). Este módulo no
 * habla con el proveedor: solo define el contrato y las funciones de hashing.
 *
 * Privacidad: el email y la IP se hashean. El token de acceso se hashea con
 * otra sal. El mensaje se guarda en la fila de la ejecución con caducidad
 * corta, solo para reconstruir PDF y seguimiento tras una reentrada.
 */

/** Ventana en la que un mismo email se considera solicitud duplicada. */
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

/** Ventana durante la que una ejecución acepta acciones posteriores. */
const RUN_TTL_MS = 2 * 60 * 60 * 1000;

/** Ejecuciones reales permitidas por IP dentro de la ventana de cuota. */
const REAL_RUN_QUOTA = 3;
const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

const EMAIL_SALT = "agi-lab-v1";

/** Contadores de acciones consumidas por una ejecución. */
export interface LabRunUsage {
  emails: number;
  statusChecks: number;
  pdfs: number;
  followups: number;
  reschedules: number;
}

export interface LabRunRecord {
  runId: string;
  accessTokenHash: string;
  emailHash: string;
  ipHash: string;
  /** Hash de la entrada, para que las acciones posteriores no puedan falsearla. */
  payloadHash: string;
  createdAt: number;
  expiresAt: number;
  routeId: LabRouteId;
  classification: LabClassification;
  classificationType: string;
  visitor: { name: string; email: string; message: string } | null;
  duplicate: boolean;
  degradedReason?: string;
  steps: LabStep[];
  actions: LabAction[];
  capabilities: {
    emailStatus: boolean;
    pdf: boolean;
    followup: boolean;
  };
  /** Id del aviso interno en el proveedor, cuando el envío fue real. */
  internalEmailId: string | null;
  /** Id del email de confirmación al visitante, cuando el envío fue real. */
  visitorEmailId: string | null;
  /** Id del seguimiento programado en el proveedor. */
  followupEmailId: string | null;
  followupScheduledAt: string | null;
  followupCanceled: boolean;
  usage: LabRunUsage;
}

export interface LabLogEntry {
  at: number;
  runId: string;
  event:
    | "run_accepted"
    | "run_duplicate"
    | "run_quota_exhausted"
    | "run_email_sent"
    | "run_email_failed"
    | "run_rejected"
    | "status_checked"
    | "pdf_generated"
    | "followup_scheduled"
    | "followup_canceled"
    | "followup_rescheduled"
    | "action_failed"
    | "limit_reached";
  detail?: string;
}

function hash(value: string): string {
  return createHash("sha256")
    .update(`${EMAIL_SALT}:${value}`)
    .digest("hex")
    .slice(0, 32);
}

export function hashLabIdentifier(value: string): string {
  return hash(value);
}

/**
 * Hash de integridad de la entrada del visitante. Las acciones posteriores
 * (informe, seguimiento) reenvían los datos y el servidor comprueba que
 * coinciden con los de la ejecución original.
 */
export function hashLabPayload(input: {
  name: string;
  email: string;
  message: string;
}): string {
  return hash(
    `${input.name.trim()}|${input.email.trim().toLowerCase()}|${input.message.trim()}`,
  );
}

export function createLabRunId(): string {
  return randomUUID();
}

export function createEmptyUsage(): LabRunUsage {
  return { emails: 0, statusChecks: 0, pdfs: 0, followups: 0, reschedules: 0 };
}

export const LAB_STORE_LIMITS = {
  dedupeWindowMs: DEDUPE_WINDOW_MS,
  runTtlMs: RUN_TTL_MS,
  realRunQuota: REAL_RUN_QUOTA,
  quotaWindowMs: QUOTA_WINDOW_MS,
  rateWindowMs: 10 * 60 * 1000,
  rateMaxRequests: 12,
} as const;
