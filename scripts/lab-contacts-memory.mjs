/**
 * Pruebas del registro comercial de participantes (fallback en memoria).
 * Replica las reglas de src/lib/lab/db/contact-logic.ts.
 */
const RETENTION_DAYS = 365;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const SOURCE = "laboratorio";

function computeRetentionUntil(lastActivityAt, days = RETENTION_DAYS) {
  return lastActivityAt + days * 24 * 60 * 60 * 1000;
}

function labContactOriginFromRequest(req) {
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

function createLabContact(input, id, now) {
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
    source: SOURCE,
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    lastActivityAt: now,
    retentionUntil: computeRetentionUntil(now),
    testCount: 1,
    lastRunId: input.lastRunId ?? null,
  };
}

function mergeUpsert(existing, input, now) {
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
    retentionUntil: computeRetentionUntil(now),
    testCount: existing.testCount + 1,
  };
}

function mergeProgress(existing, patch, now) {
  return {
    ...existing,
    updatedAt: now,
    lastActivityAt: now,
    retentionUntil: computeRetentionUntil(now),
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

function toPublic(contact) {
  return {
    ok: true,
    testCount: contact.testCount,
    experiencesCompleted: contact.experiencesCompleted,
    demoCompleted: contact.demoCompleted,
    ctaClicked: contact.ctaClicked,
    firstSeenAt: new Date(contact.createdAt).toISOString(),
    lastSeenAt: new Date(contact.lastActivityAt).toISOString(),
    source: contact.source,
  };
}

function expired(contact, now) {
  return now >= contact.retentionUntil;
}

let failed = 0;
function pass(name) {
  console.info(`ok  ${name}`);
}
function fail(name, detail) {
  failed += 1;
  console.error(`FAIL ${name} — ${detail}`);
}

const store = [];
function upsert(input, now, id = `id-${store.length + 1}`) {
  const index = store.findIndex((item) => item.emailHash === input.emailHash);
  if (index === -1) {
    const created = createLabContact(input, id, now);
    store.push(created);
    return created;
  }
  store[index] = mergeUpsert(store[index], input, now);
  return store[index];
}

const first = upsert(
  {
    email: "a@example.com",
    emailHash: "hash-a",
    name: "Ada",
    classification: "lead_capture",
    route: "reserva",
    origin: "/automatizacion-de-procesos",
    lastRunId: "run-1",
  },
  1_000,
);
if (
  first.testCount === 1 &&
  store.length === 1 &&
  first.email === "a@example.com" &&
  first.name === "Ada"
) {
  pass("alta: crea contacto");
} else fail("alta: crea", JSON.stringify(first));

const second = upsert(
  {
    email: "a@example.com",
    emailHash: "hash-a",
    name: "Ada Lovelace",
    classification: "ops_followup",
    route: "seguimiento",
    origin: "/laboratorio",
    lastRunId: "run-2",
  },
  2_000,
);
if (store.length === 1) pass("deduplicación: un registro por email_hash");
else fail("deduplicación: duplica", String(store.length));

if (second.testCount === 2) pass("actualización: incrementa ejecuciones");
else fail("actualización: test_count", String(second.testCount));

if (second.createdAt === 1_000) pass("actualización: created_at intacto");
else fail("actualización: created_at", String(second.createdAt));

if (second.lastSeenAt === 2_000 && second.lastActivityAt === 2_000) {
  pass("actualización: última ejecución y actividad");
} else fail("actualización: last_seen", `${second.lastSeenAt} ${second.lastActivityAt}`);

if (second.name === "Ada Lovelace") pass("actualización: nombre más reciente");
else fail("actualización: nombre", String(second.name));

if (second.classification === "ops_followup" && second.route === "seguimiento") {
  pass("actualización: clasificación y ruta más recientes");
} else fail("actualización: diagnóstico", `${second.classification} ${second.route}`);

if (second.origin === "/automatizacion-de-procesos") {
  pass("origen: el primero gana");
} else fail("origen: se sobrescribe", String(second.origin));

const progressed = mergeProgress(second, { experiencesCompleted: 2 }, 3_000);
if (progressed.lastSeenAt === 2_000 && progressed.lastActivityAt === 3_000) {
  pass("progreso: no cuenta como nueva ejecución");
} else {
  fail(
    "progreso: last_seen",
    `${progressed.lastSeenAt} ${progressed.lastActivityAt}`,
  );
}

const demo = mergeProgress(progressed, { demoCompleted: true }, 4_000);
const demoAgain = mergeProgress(demo, { demoCompleted: true }, 5_000);
const cta = mergeProgress(demoAgain, { ctaClicked: true }, 6_000);
const report = mergeProgress(cta, { reportGenerated: true }, 7_000);
const follow = mergeProgress(report, { followupScheduled: true }, 8_000);
const followAgain = mergeProgress(follow, { followupScheduled: false }, 9_000);

if (progressed.experiencesCompleted === 2) pass("progreso: experiencias");
else fail("progreso: experiencias", String(progressed.experiencesCompleted));

if (demo.demoCompleted && demoAgain.demoCompleted && demoAgain.testCount === 2) {
  pass("progreso: demo_completed idempotente");
} else fail("progreso: demo", JSON.stringify(demoAgain));

if (cta.ctaClicked) pass("progreso: cta final");
else fail("progreso: cta", JSON.stringify(cta));

if (report.reportGenerated) pass("progreso: informe generado");
else fail("progreso: informe", JSON.stringify(report));

if (follow.followupScheduled && followAgain.followupScheduled) {
  pass("progreso: seguimiento OR-true");
} else fail("progreso: seguimiento", JSON.stringify(followAgain));

if (!("consentMarketing" in follow) && follow.source === SOURCE) {
  pass("consentimiento: el email no es marketing");
} else fail("consentimiento: marketing", JSON.stringify(follow));

const publicPayload = toPublic(follow);
const publicKeys = Object.keys(publicPayload);
const leaked = [
  "email",
  "name",
  "emailHash",
  "origin",
  "classification",
  "route",
  "retentionUntil",
  "lastRunId",
  "reportGenerated",
  "followupScheduled",
].filter((key) => key in publicPayload);
if (leaked.length === 0 && publicPayload.email === undefined) {
  pass("no exposición: resumen de sesión sin PII");
} else fail("no exposición: PII", publicKeys.join(","));

const stale = createLabContact(
  { email: "old@example.com", emailHash: "old" },
  "old",
  1,
);
if (expired(stale, stale.retentionUntil) && !expired(first, first.lastActivityAt + 60_000)) {
  pass("conservación: borra al llegar a retention_until");
} else fail("conservación: retención", String(stale.retentionUntil));

const short = computeRetentionUntil(1_000, 1);
const year = computeRetentionUntil(1_000, 365);
if (short < year && year - 1_000 === RETENTION_MS) {
  pass("conservación: días configurables (no es plazo legal)");
} else fail("conservación: configurable", `${short} ${year}`);

function fakeRequest(referer, host) {
  return { headers: { get: (name) => (name === "referer" ? referer : name === "host" ? host : null) } };
}

if (
  labContactOriginFromRequest(fakeRequest("https://agithecreator.com/precios?utm=x", "localhost:3000")) ===
    "/precios" &&
  labContactOriginFromRequest(fakeRequest("https://evil.test/precios", "localhost:3000")) === null &&
  labContactOriginFromRequest(fakeRequest("https://localhost:3000/contacto", "localhost:3000")) ===
    "/contacto"
) {
  pass("origen: pathname propio, sin query ni hosts ajenos");
} else fail("origen: sanitizado", "referer");

console.info("");
if (failed) {
  console.error(`${failed} prueba(s) de memoria fallida(s).`);
  process.exit(1);
}
console.info("Registro comercial en memoria: ok.");
