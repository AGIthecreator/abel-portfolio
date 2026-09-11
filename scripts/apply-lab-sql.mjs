/**
 * Aplica `supabase/lab.sql` al proyecto del laboratorio vía Management API.
 * Lee `.env.local`. No imprime secretos.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

const env = loadEnv(resolve(process.cwd(), ".env.local"));
const ref = env.LAB_SUPABASE_PROJECT_REF;
const token = env.LAB_SUPABASE_ACCESS_TOKEN;
const sql = readFileSync(resolve(process.cwd(), "supabase/lab.sql"), "utf8");

if (!ref || !token) {
  console.error("Faltan LAB_SUPABASE_PROJECT_REF o LAB_SUPABASE_ACCESS_TOKEN.");
  process.exit(1);
}

const response = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  },
);

const text = await response.text();
if (!response.ok) {
  console.error("No se pudo aplicar el SQL.", response.status);
  console.error(text.slice(0, 800));
  process.exit(1);
}

console.info("Esquema del laboratorio aplicado.");
