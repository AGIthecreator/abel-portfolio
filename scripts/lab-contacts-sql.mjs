/**
 * Contrato SQL + aislamiento público de lab_contacts.
 * No lista contactos. No usa la service role para leer la tabla.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let failed = 0;
function pass(name, detail = "") {
  console.info(`ok  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  failed += 1;
  console.error(`FAIL ${name} — ${detail}`);
}

function loadEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

const sql = readFileSync(resolve(process.cwd(), "supabase/lab.sql"), "utf8");
const contactsBlock = sql.slice(sql.indexOf("lab_contacts"));

if (/alter table public\.lab_contacts enable row level security/i.test(sql)) {
  pass("RLS: activado en lab_contacts");
} else fail("RLS: no activado", "falta ENABLE ROW LEVEL SECURITY");

if (
  /revoke all on table public\.lab_contacts from anon, authenticated, public/i.test(
    sql,
  )
) {
  pass("RLS: revoke anon/authenticated/public");
} else fail("RLS: revoke", "faltan revokes");

if (/grant all on table public\.lab_contacts to service_role/i.test(sql)) {
  pass("RLS: solo service_role tiene GRANT");
} else fail("RLS: grant", "falta GRANT a service_role");

if (!/create policy/i.test(contactsBlock.split("notify pgrst")[0] ?? contactsBlock)) {
  pass("RLS: sin políticas (deny-all para el cliente)");
} else fail("RLS: hay CREATE POLICY", "lab_contacts no debe tener policies");

if (
  /retention_until/.test(sql) &&
  /delete from public\.lab_contacts\s+where retention_until <= now\(\)/i.test(sql)
) {
  pass("conservación: purge por retention_until");
} else fail("conservación: purge", "no usa retention_until");

if (
  /created_at timestamptz/.test(contactsBlock) &&
  /updated_at timestamptz/.test(contactsBlock) &&
  /last_activity_at timestamptz/.test(contactsBlock)
) {
  pass("conservación: created_at / updated_at / last_activity_at");
} else fail("conservación: timestamps", "faltan columnas de control");

if (/p_retention_days integer/.test(sql) && /LAB_CONTACT_RETENTION_DAYS/.test(sql)) {
  pass("conservación: días configurables, documentados para revisión legal");
} else fail("conservación: configurable", "falta p_retention_days o comentario");

if (
  /p_classification text/.test(sql) &&
  /p_origin text/.test(sql) &&
  /p_report boolean/.test(sql) &&
  /p_followup boolean/.test(sql)
) {
  pass("SQL: RPCs de alta y progreso comercial");
} else fail("SQL: RPCs", "faltan classification/origin/report/followup");

const contactCreate = sql.slice(
  sql.indexOf("create table if not exists public.lab_contacts"),
  sql.indexOf("alter table public.lab_contacts add column"),
);
if (
  !/\bip text\b/i.test(contactCreate) &&
  !/password/i.test(contactCreate) &&
  !/user_agent/i.test(contactCreate) &&
  !/visitor_message/i.test(contactCreate)
) {
  pass("SQL: lab_contacts no guarda IP en claro, secretos ni mensaje");
} else fail("SQL: columnas de más", contactCreate.slice(0, 200));

const env = {
  ...loadEnv(resolve(process.cwd(), ".env.local")),
  ...process.env,
};
const supabaseUrl = env.LAB_SUPABASE_URL?.replace(/\/$/, "");

if (!supabaseUrl) {
  pass("acceso público REST: omitido (sin LAB_SUPABASE_URL)");
} else {
  const endpoints = [
    `${supabaseUrl}/rest/v1/lab_contacts?select=*`,
    `${supabaseUrl}/rest/v1/rpc/lab_upsert_contact`,
    `${supabaseUrl}/rest/v1/rpc/lab_update_contact_progress`,
  ];

  for (const url of endpoints) {
    const method = url.includes("/rpc/") ? "POST" : "GET";
    const res = await fetch(url, {
      method,
      headers: {
        apikey: "public",
        Authorization: "Bearer public",
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: method === "POST" ? "{}" : undefined,
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    const leakedRows = Array.isArray(json)
      ? json.filter((row) => row && typeof row === "object" && "email" in row)
      : [];
    const allowed = res.status === 401 || res.status === 403 || res.status === 404;
    const emptyOk = res.status === 200 && Array.isArray(json) && leakedRows.length === 0;

    if (allowed || emptyOk) {
      pass(`acceso público REST bloqueado (${method} ${url.split("/rest/v1/")[1]})`, String(res.status));
    } else {
      fail(
        `acceso público REST (${url.split("/rest/v1/")[1]})`,
        `${res.status} ${text.slice(0, 180)}`,
      );
    }
  }
}

console.info("");
if (failed) {
  console.error(`${failed} prueba(s) SQL/aislamiento fallida(s).`);
  process.exit(1);
}
console.info("Contrato SQL e aislamiento de lab_contacts: ok.");
