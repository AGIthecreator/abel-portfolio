/**
 * Registro comercial mínimo de participantes del laboratorio.
 *
 * Distinto de lab_runs (traza técnica, TTL 2 h, mensaje, hashes de IP).
 * Aquí no hay consentimiento de marketing: el email sirve para ejecutar la
 * demo y para saber internamente quién la ha usado.
 *
 * La conservación (retention_until) es un tope operativo configurable
 * (`LAB_CONTACT_RETENTION_DAYS`). No es un plazo legal.
 */

import { getLabContactRetentionDays } from "../config";

export const LAB_CONTACT_SOURCE = "laboratorio" as const;

export interface LabContactRecord {
  id: string;
  email: string;
  emailHash: string;
  name: string | null;
  route: string | null;
  classification: string | null;
  origin: string | null;
  experiencesCompleted: number;
  demoCompleted: boolean;
  ctaClicked: boolean;
  reportGenerated: boolean;
  followupScheduled: boolean;
  source: typeof LAB_CONTACT_SOURCE;
  createdAt: number;
  updatedAt: number;
  lastSeenAt: number;
  lastActivityAt: number;
  retentionUntil: number;
  testCount: number;
  lastRunId: string | null;
}

export interface LabContactUpsertInput {
  email: string;
  emailHash: string;
  name?: string | null;
  classification?: string | null;
  route?: string | null;
  origin?: string | null;
  lastRunId?: string | null;
}

export interface LabContactProgressPatch {
  experiencesCompleted?: number;
  demoCompleted?: boolean;
  ctaClicked?: boolean;
  reportGenerated?: boolean;
  followupScheduled?: boolean;
}

export function labContactRetentionMs(
  days = getLabContactRetentionDays(),
): number {
  return days * 24 * 60 * 60 * 1000;
}

export function computeLabContactRetentionUntil(
  lastActivityAt: number,
  days = getLabContactRetentionDays(),
): number {
  return lastActivityAt + labContactRetentionMs(days);
}

/**
 * Origen grosero (pathname del propio sitio). No guarda query ni hosts ajenos.
 */
export function labContactOriginFromRequest(req: Request): string | null {
  const referer = req.headers.get("referer");
  if (!referer) return null;
  try {
    const url = new URL(referer);
    const requestHost = req.headers.get("host");
    const sameHost = Boolean(requestHost && url.host === requestHost);
    const ownDomain =
      url.hostname === "agithecreator.com" ||
      url.hostname.endsWith(".agithecreator.com");
    if (!sameHost && !ownDomain) return null;
    const path = url.pathname || "/";
    return path.length > 80 ? path.slice(0, 80) : path;
  } catch {
    return null;
  }
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
    classification: input.classification ?? null,
    route: input.route ?? null,
    origin: input.origin ?? null,
    experiencesCompleted: 1,
    demoCompleted: false,
    ctaClicked: false,
    reportGenerated: false,
    followupScheduled: false,
    source: LAB_CONTACT_SOURCE,
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    lastActivityAt: now,
    retentionUntil: computeLabContactRetentionUntil(now),
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
    classification: input.classification ?? existing.classification,
    route: input.route ?? existing.route,
    origin: existing.origin ?? input.origin ?? null,
    lastRunId: input.lastRunId ?? existing.lastRunId,
    experiencesCompleted: Math.max(existing.experiencesCompleted, 1),
    createdAt: existing.createdAt,
    updatedAt: now,
    lastSeenAt: now,
    lastActivityAt: now,
    retentionUntil: computeLabContactRetentionUntil(now),
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
    updatedAt: now,
    lastActivityAt: now,
    retentionUntil: computeLabContactRetentionUntil(now),
    experiencesCompleted: Math.max(
      existing.experiencesCompleted,
      patch.experiencesCompleted ?? existing.experiencesCompleted,
    ),
    demoCompleted: existing.demoCompleted || Boolean(patch.demoCompleted),
    ctaClicked: existing.ctaClicked || Boolean(patch.ctaClicked),
    reportGenerated: existing.reportGenerated || Boolean(patch.reportGenerated),
    followupScheduled:
      existing.followupScheduled || Boolean(patch.followupScheduled),
  };
}

export function isLabContactExpired(
  contact: LabContactRecord,
  now = Date.now(),
): boolean {
  return now >= contact.retentionUntil;
}

/** Resumen no identificativo para la sesión propia. Nunca incluye email ni nombre. */
export function toLabContactPublic(contact: LabContactRecord) {
  return {
    ok: true as const,
    testCount: contact.testCount,
    experiencesCompleted: contact.experiencesCompleted,
    demoCompleted: contact.demoCompleted,
    ctaClicked: contact.ctaClicked,
    firstSeenAt: new Date(contact.createdAt).toISOString(),
    lastSeenAt: new Date(contact.lastActivityAt).toISOString(),
    source: contact.source,
  };
}
