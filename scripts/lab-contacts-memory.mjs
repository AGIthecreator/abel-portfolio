/**
 * Pruebas del registro de participantes en memoria (fallback sin Supabase).
 * Replica las reglas de src/lib/lab/db/contact-logic.ts.
 */
const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
const SOURCE = "laboratorio";

function createLabContact(input, id, now) {
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
    source: SOURCE,
    firstSeenAt: now,
    lastSeenAt: now,
    testCount: 1,
    lastRunId: input.lastRunId ?? null,
  };
}

function mergeUpsert(existing, input, now) {
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

function mergeProgress(existing, patch, now) {
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
    goal: "Reserva",
    route: "reserva",
    lastRunId: "run-1",
  },
  1_000,
);
if (first.testCount === 1 && store.length === 1) pass("memoria: crea contacto");
else fail("memoria: crea", JSON.stringify(first));

const second = upsert(
  {
    email: "a@example.com",
    emailHash: "hash-a",
    name: "Ada Lovelace",
    goal: "Reserva",
    route: "reserva",
    lastRunId: "run-2",
  },
  2_000,
);
if (store.length === 1) pass("memoria: no duplica");
else fail("memoria: duplica", String(store.length));

if (second.testCount === 2) pass("memoria: incrementa test_count");
else fail("memoria: test_count", String(second.testCount));

if (second.firstSeenAt === 1_000) pass("memoria: first_seen intacto");
else fail("memoria: first_seen", String(second.firstSeenAt));

if (second.lastSeenAt === 2_000) pass("memoria: last_seen cambia");
else fail("memoria: last_seen", String(second.lastSeenAt));

if (second.goal === "Reserva" && second.route === "reserva") {
  pass("memoria: diagnóstico permitido (goal/ruta)");
} else fail("memoria: diagnóstico", `${second.goal} ${second.route}`);

if (
  second.businessType === null &&
  second.currentMethod === null &&
  second.blocker === null &&
  second.timeframe === null
) {
  pass("memoria: no inventa campos de sector");
} else fail("memoria: campos inventados", JSON.stringify(second));

const progressed = mergeProgress(second, { experiencesCompleted: 2 }, 3_000);
const demo = mergeProgress(progressed, { demoCompleted: true }, 4_000);
const demoAgain = mergeProgress(demo, { demoCompleted: true }, 5_000);
const cta = mergeProgress(demoAgain, { ctaClicked: true }, 6_000);

if (progressed.experiencesCompleted === 2) pass("memoria: experiencias");
else fail("memoria: experiencias", String(progressed.experiencesCompleted));

if (demo.demoCompleted && demoAgain.demoCompleted && demoAgain.testCount === 2) {
  pass("memoria: demo_completed idempotente");
} else fail("memoria: demo", JSON.stringify(demoAgain));

if (cta.ctaClicked) pass("memoria: cta_clicked");
else fail("memoria: cta", JSON.stringify(cta));

if (!("consentMarketing" in cta) && cta.source === SOURCE) {
  pass("memoria: email no es consentimiento de marketing");
} else fail("memoria: marketing", JSON.stringify(cta));

function expired(contact, now) {
  return now - contact.lastSeenAt >= RETENTION_MS;
}
const stale = createLabContact(
  { email: "old@example.com", emailHash: "old" },
  "old",
  1,
);
if (expired(stale, 1 + RETENTION_MS) && !expired(first, first.lastSeenAt + 60_000)) {
  pass("memoria: retención 12 meses (tope, no indefinida)");
} else fail("memoria: retención", String(stale.lastSeenAt));

console.info("");
if (failed) {
  console.error(`${failed} prueba(s) de memoria fallida(s).`);
  process.exit(1);
}
console.info("Fallback de memoria del registro de participantes: ok.");
