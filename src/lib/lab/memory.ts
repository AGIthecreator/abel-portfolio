/**
 * Estado en memoria compartido por todas las rutas del laboratorio.
 *
 * Es el fallback cuando no hay `LAB_SUPABASE_*`. Next.js empaqueta cada route
 * handler por separado: `globalThis` evita que `/informe` no vea lo que `/run`
 * acaba de guardar dentro del mismo proceso.
 *
 * En serverless multi-instancia esta memoria no se comparte. Si hay Supabase
 * configurado, `getLabRepository()` usa Postgres y este módulo no interviene.
 */

export interface LabMemory {
  runs: unknown[];
  contacts: unknown[];
  realRunHits: Map<string, number[]>;
  logs: unknown[];
  rateHits: Map<string, number[]>;
  budgetWindowStart: number;
  emailsSentToday: number;
}

const KEY = "__agiLabMemoryV2" as const;

type GlobalWithLab = typeof globalThis & { [KEY]?: LabMemory };

export function getLabMemory(): LabMemory {
  const g = globalThis as GlobalWithLab;
  if (!g[KEY]) {
    g[KEY] = {
      runs: [],
      contacts: [],
      realRunHits: new Map(),
      logs: [],
      rateHits: new Map(),
      budgetWindowStart: Date.now(),
      emailsSentToday: 0,
    };
  }
  if (!Array.isArray(g[KEY].contacts)) {
    g[KEY].contacts = [];
  }
  return g[KEY];
}
