/**
 * Pruebas E2E del laboratorio contra un servidor local.
 *
 *   npm run test:lab
 *
 * No inventa REAL: lee executionMode del servidor. Cancela el seguimiento
 * programado para no dejar emails futuros en Resend.
 */
const BASE = process.env.LAB_E2E_BASE ?? "http://localhost:3000";

const stamp = Date.now();
const visitorA = `e2e.a.${stamp}@example.com`;
const visitorB = `e2e.b.${stamp}@example.com`;
const messageA =
  "Tengo muchas reservas que gestiono por WhatsApp cada dia y se me escapan.";

let failed = 0;
function pass(name, detail = "") {
  console.info(`ok  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  failed += 1;
  console.error(`FAIL ${name} — ${detail}`);
}

async function jsonRequest(path, { method = "GET", body, cookie } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, json, text, setCookie };
}

function cookieHeader(setCookie) {
  return setCookie
    .map((entry) => entry.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

const runBody = (email, extra = {}) => ({
  name: "E2E Laboratorio",
  email,
  message: messageA,
  ...extra,
});

async function main() {
  console.info(`E2E laboratorio → ${BASE}`);

  const pages = [
    "/",
    "/precios",
    "/presupuesto",
    "/como-trabajamos",
    "/contacto",
    "/desarrollo-web",
    "/automatizacion-de-procesos",
    "/desarrollo-web-valladolid",
    "/laboratorio",
  ];
  for (const path of pages) {
    const res = await fetch(`${BASE}${path}`);
    if (res.ok) pass(`smoke ${path}`, String(res.status));
    else fail(`smoke ${path}`, String(res.status));
  }

  const created = await jsonRequest("/api/laboratorio/run", {
    method: "POST",
    body: runBody(visitorA),
  });
  const cookie = cookieHeader(created.setCookie);
  const runId = created.json?.runId;
  const realEmails = (created.json?.actions ?? []).filter(
    (a) =>
      (a.id === "email_internal" || a.id === "email_visitor") &&
      a.executionMode === "real" &&
      a.status === "done",
  ).length;

  if (created.res.ok && runId && created.json.duplicate === false) {
    pass(
      "A crear ejecución",
      `runId=${runId.slice(0, 8)} emailsReales=${realEmails} persistHint=${created.json.degradedReason ?? "ok"}`,
    );
  } else {
    fail("A crear ejecución", created.text.slice(0, 240));
  }

  if (cookie.includes("agi_lab_at")) pass("B cookie de acceso");
  else fail("B cookie de acceso", "no se recibió agi_lab_at");

  const sesion = await jsonRequest("/api/laboratorio/sesion", { cookie });
  if (sesion.json?.found === true && sesion.json.activation?.runId === runId) {
    pass("C recuperar por cookie");
  } else {
    fail("C recuperar por cookie", JSON.stringify(sesion.json));
  }

  const firstContact = await jsonRequest("/api/laboratorio/progreso", { cookie });
  const firstSeen = firstContact.json?.firstSeenAt;
  const firstCount = firstContact.json?.testCount;
  if (
    firstContact.res.ok &&
    firstCount === 1 &&
    firstSeen &&
    firstContact.json.email === undefined &&
    firstContact.json.consentMarketing === undefined &&
    firstContact.json.source === "laboratorio"
  ) {
    pass("Q primer participante", `testCount=${firstCount}`);
  } else {
    fail("Q primer participante", firstContact.text.slice(0, 240));
  }

  const dup = await jsonRequest("/api/laboratorio/run", {
    method: "POST",
    body: runBody(visitorA),
    cookie,
  });
  if (dup.json?.duplicate === true && dup.json.runId === runId) {
    pass("D duplicado persistente");
  } else {
    fail("D duplicado persistente", JSON.stringify(dup.json));
  }

  await new Promise((resolve) => setTimeout(resolve, 1100));
  const secondContact = await jsonRequest("/api/laboratorio/progreso", { cookie });
  if (
    secondContact.res.ok &&
    secondContact.json?.testCount === 2 &&
    secondContact.json.firstSeenAt === firstSeen &&
    secondContact.json.lastSeenAt >= firstSeen &&
    secondContact.json.lastSeenAt !== firstSeen
  ) {
    pass("R mismo email incrementa test_count", `count=${secondContact.json.testCount}`);
  } else if (
    secondContact.res.ok &&
    secondContact.json?.testCount === 2 &&
    secondContact.json.firstSeenAt === firstSeen
  ) {
    pass(
      "R mismo email incrementa test_count",
      `count=2 first_seen intacto last_seen=${secondContact.json.lastSeenAt === firstSeen ? "igual (misma marca)" : "actualizado"}`,
    );
  } else {
    fail("R contacto repetido", secondContact.text.slice(0, 240));
  }

  const concBody = runBody(visitorB);
  const [c1, c2] = await Promise.all([
    jsonRequest("/api/laboratorio/run", { method: "POST", body: concBody }),
    jsonRequest("/api/laboratorio/run", { method: "POST", body: concBody }),
  ]);
  const sameId = c1.json?.runId && c1.json.runId === c2.json?.runId;
  const oneDup = Boolean(c1.json?.duplicate) !== Boolean(c2.json?.duplicate) ||
    (c1.json?.duplicate && c2.json?.duplicate);
  if (sameId && (c1.json?.duplicate || c2.json?.duplicate)) {
    pass("E POST simultáneos", `duplicate=${c1.json.duplicate}/${c2.json.duplicate}`);
  } else {
    fail(
      "E POST simultáneos",
      `sameId=${sameId} oneDup=${oneDup} a=${c1.json?.duplicate} b=${c2.json?.duplicate}`,
    );
  }

  const estado = await jsonRequest("/api/laboratorio/estado", {
    method: "POST",
    body: { runId },
    cookie,
  });
  if (created.json?.capabilities?.emailStatus) {
    if (estado.res.ok && estado.json?.ok) pass("F estado propio", estado.json.status?.event ?? "pendiente");
    else fail("F estado propio", estado.text.slice(0, 240));
  } else if (estado.res.status === 404) {
    pass("F estado propio", "sin envío real que consultar (honesto)");
  } else {
    fail("F estado propio", estado.text.slice(0, 240));
  }

  const estadoAjeno = await jsonRequest("/api/laboratorio/estado", {
    method: "POST",
    body: { runId: "00000000-0000-4000-8000-000000000001" },
    cookie,
  });
  const estadoSinCookie = await jsonRequest("/api/laboratorio/estado", {
    method: "POST",
    body: { runId },
  });
  if (estadoAjeno.res.status === 404 && estadoSinCookie.res.status === 404) {
    pass("G acceso a otra ejecución / sin cookie → 404");
  } else {
    fail("G acceso ajeno", `${estadoAjeno.res.status} ${estadoSinCookie.res.status}`);
  }

  const pdf = await jsonRequest("/api/laboratorio/informe", {
    method: "POST",
    body: { runId, name: "E2E Laboratorio", email: visitorA, message: messageA },
    cookie,
  });
  const pdfType = pdf.res.headers.get("content-type") ?? "";
  if (pdf.res.ok && pdfType.includes("pdf")) pass("H PDF propio", pdfType);
  else fail("H PDF propio", `${pdf.res.status} ${pdfType}`);

  const follow = await jsonRequest("/api/laboratorio/seguimiento", {
    method: "POST",
    body: {
      runId,
      name: "E2E Laboratorio",
      email: visitorA,
      message: messageA,
      operation: "schedule",
    },
    cookie,
  });
  if (follow.res.ok && follow.json?.followup) {
    pass(
      "I seguimiento propio",
      `${follow.json.followup.executionMode}/${follow.json.followup.status}`,
    );
  } else {
    fail("I seguimiento propio", follow.text.slice(0, 240));
  }

  if (follow.json?.followup?.status === "scheduled") {
    const moved = await jsonRequest("/api/laboratorio/seguimiento", {
      method: "POST",
      body: {
        runId,
        name: "E2E Laboratorio",
        email: visitorA,
        message: messageA,
        operation: "reschedule",
        shiftMinutes: 60,
      },
      cookie,
    });
    const canceled = await jsonRequest("/api/laboratorio/seguimiento", {
      method: "POST",
      body: {
        runId,
        name: "E2E Laboratorio",
        email: visitorA,
        message: messageA,
        operation: "cancel",
      },
      cookie,
    });
    if (moved.res.ok && canceled.json?.followup?.status === "canceled") {
      pass("J cancelación/reprogramación");
    } else {
      fail("J cancelación/reprogramación", canceled.text.slice(0, 240));
    }
  } else {
    pass("J cancelación/reprogramación", "omitida: no hubo seguimiento REAL que cancelar");
  }

  const honey = await jsonRequest("/api/laboratorio/run", {
    method: "POST",
    body: runBody(`bot.${stamp}@example.com`, { website: "http://spam.test" }),
  });
  const honeyCookie = cookieHeader(honey.setCookie);
  if (
    honey.res.ok &&
    honey.json?.degradedReason &&
    !honeyCookie.includes("agi_lab_at")
  ) {
    pass("K honeypot");
  } else {
    fail("K honeypot", honey.text.slice(0, 200));
  }

  const estadoGet = await fetch(`${BASE}/api/laboratorio/estado`);
  if (estadoGet.status === 405) pass("L GET estado bloqueado", "405");
  else fail("L GET estado", String(estadoGet.status));

  const demoOnce = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "demo_completed" },
    cookie,
  });
  const demoTwice = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "demo_completed" },
    cookie,
  });
  if (
    demoOnce.res.ok &&
    demoTwice.res.ok &&
    demoOnce.json?.demoCompleted === true &&
    demoTwice.json?.demoCompleted === true &&
    demoTwice.json?.testCount === demoOnce.json?.testCount
  ) {
    pass("S demo_completed idempotente");
  } else {
    fail("S demo_completed", `${demoOnce.text} ${demoTwice.text}`.slice(0, 240));
  }

  const cta = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "cta_clicked" },
    cookie,
  });
  if (cta.res.ok && cta.json?.ctaClicked === true && cta.json?.email === undefined) {
    pass("T cta_clicked");
  } else {
    fail("T cta_clicked", cta.text.slice(0, 240));
  }

  const decisions = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "experience", experience: "decisions" },
    cookie,
  });
  const builder = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "experience", experience: "builder" },
    cookie,
  });
  if (
    decisions.res.ok &&
    builder.res.ok &&
    decisions.json?.experiencesCompleted >= 2 &&
    builder.json?.experiencesCompleted >= 3
  ) {
    pass("U diagnóstico/experiencias", `${builder.json.experiencesCompleted}`);
  } else {
    fail("U experiencias", `${decisions.text} ${builder.text}`.slice(0, 240));
  }

  const noSession = await jsonRequest("/api/laboratorio/progreso", {
    method: "POST",
    body: { event: "cta_clicked" },
  });
  const noSessionGet = await jsonRequest("/api/laboratorio/progreso");
  if (noSession.res.status === 404 && noSessionGet.res.status === 404) {
    pass("V progreso sin sesión → 404");
  } else {
    fail("V progreso sin sesión", `${noSession.res.status} ${noSessionGet.res.status}`);
  }

  const leaked = await fetch(`${BASE}/api/laboratorio/contacts`);
  if (leaked.status === 404) pass("W lab_contacts no es público", "404");
  else fail("W lab_contacts expuesto", String(leaked.status));

  const sesion2 = await jsonRequest("/api/laboratorio/sesion", { cookie });
  if (sesion2.json?.found === true && sesion2.json.activation?.runId === runId) {
    pass("O reentrada tras más peticiones");
  } else {
    fail("O reentrada", JSON.stringify(sesion2.json));
  }

  const cleared = await jsonRequest("/api/laboratorio/sesion", {
    method: "DELETE",
    cookie,
  });
  const after = await jsonRequest("/api/laboratorio/sesion", {
    cookie: cookieHeader(cleared.setCookie) || cookie,
  });
  if (cleared.res.ok && after.json?.found === false) {
    pass("P empezar de nuevo");
  } else {
    fail("P empezar de nuevo", JSON.stringify(after.json));
  }

  const ownAfterClear = await jsonRequest("/api/laboratorio/estado", {
    method: "POST",
    body: { runId },
    cookie: cookieHeader(cleared.setCookie),
  });
  if (ownAfterClear.res.status === 404) {
    pass("P cookie olvidada no abre la ejecución");
  } else {
    fail("P cookie olvidada", String(ownAfterClear.res.status));
  }

  console.info("");
  if (failed) {
    console.error(`${failed} prueba(s) fallida(s).`);
    process.exit(1);
  }
  console.info("Todas las pruebas del laboratorio pasaron.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
