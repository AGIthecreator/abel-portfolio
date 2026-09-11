/**
 * Modelo de participantes del laboratorio.
 *
 * Distinto de lab_runs: aquí no hay TTL de 2 horas. La conservación máxima
 * es 12 meses desde last_seen_at. No hay consentimiento de marketing.
 */

export const LAB_CONTACT_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
export const LAB_CONTACT_SOURCE = "laboratorio" as const;

export interface LabContactRecord {
  id: string;
  email: string;
  emailHash: string;
  name: string | null;
  businessType: string | null;
  goal: string | null;
  currentMethod: string | null;
  blocker: string | null;
  timeframe: string | null;
  route: string | null;
  experiencesCompleted: number;
  demoCompleted: boolean;
  ctaClicked: boolean;
  source: typeof LAB_CONTACT_SOURCE;
  firstSeenAt: number;
  lastSeenAt: number;
  testCount: number;
  lastRunId: string | null;
}

export interface LabContactUpsertInput {
  email: string;
  emailHash: string;
  name?: string | null;
  goal?: string | null;
  route?: string | null;
  lastRunId?: string | null;
}

export interface LabContactProgressPatch {
  experiencesCompleted?: number;
  demoCompleted?: boolean;
  ctaClicked?: boolean;
}

export function createLabContact(
  input: LabContactUpsertInput,
  id: string,
  now = Date.now(),
): LabContactRecord {
  return {
    id,
    email: input.email,
    emailHash: input.emailHash,
    name: input.name ?? null,
    businessType: null,
    goal: input.goal ?? null,
    currentMethod: null,
    blocker: null,
    timeframe: null,
    route: input.route ?? null,
    experiencesCompleted: 1,
    demoCompleted: false,
    ctaClicked: false,
    source: LAB_CONTACT_SOURCE,
    firstSeenAt: now,
    lastSeenAt: now,
    testCount: 1,
    lastRunId: input.lastRunId ?? null,
  };
}

export function mergeLabContactUpsert(
  existing: LabContactRecord,
  input: LabContactUpsertInput,
  now = Date.now(),
): LabContactRecord {
  return {
    ...existing,
    email: input.email || existing.email,
    name: input.name ?? existing.name,
    goal: input.goal ?? existing.goal,
    route: input.route ?? existing.route,
    lastRunId: input.lastRunId ?? existing.lastRunId,
    experiencesCompleted: Math.max(existing.experiencesCompleted, 1),
    firstSeenAt: existing.firstSeenAt,
    lastSeenAt: now,
    testCount: existing.testCount + 1,
  };
}

export function mergeLabContactProgress(
  existing: LabContactRecord,
  patch: LabContactProgressPatch,
  now = Date.now(),
): LabContactRecord {
  return {
    ...existing,
    lastSeenAt: now,
    experiencesCompleted: Math.max(
      existing.experiencesCompleted,
      patch.experiencesCompleted ?? existing.experiencesCompleted,
    ),
    demoCompleted: existing.demoCompleted || Boolean(patch.demoCompleted),
    ctaClicked: existing.ctaClicked || Boolean(patch.ctaClicked),
  };
}

export function isLabContactExpired(
  contact: LabContactRecord,
  now = Date.now(),
): boolean {
  return now - contact.lastSeenAt >= LAB_CONTACT_RETENTION_MS;
}

export function toLabContactPublic(contact: LabContactRecord) {
  return {
    ok: true as const,
    testCount: contact.testCount,
    experiencesCompleted: contact.experiencesCompleted,
    demoCompleted: contact.demoCompleted,
    ctaClicked: contact.ctaClicked,
    firstSeenAt: new Date(contact.firstSeenAt).toISOString(),
    lastSeenAt: new Date(contact.lastSeenAt).toISOString(),
    source: contact.source,
  };
}
