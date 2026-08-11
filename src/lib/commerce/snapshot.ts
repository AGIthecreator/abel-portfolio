import type { QuoteResult, QuoteSnapshot, QuoteInput } from "./quote";
import {
  EMPTY_FLOW_STATE,
  QUOTE_FLOW_KEY,
  QUOTE_SNAPSHOT_KEY,
  type QuoteContact,
  type QuoteDiagnostic,
  type QuoteFlowState,
} from "./diagnostic";
import { PRODUCTS, type ProductId } from "./products";
import type { MaintenanceChoice } from "./maintenance";

const PRODUCT_IDS = new Set(PRODUCTS.map((p) => p.id));
const MAINTENANCE = new Set<MaintenanceChoice>(["yes", "no", "later"]);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isProductId(v: unknown): v is ProductId {
  return typeof v === "string" && PRODUCT_IDS.has(v as ProductId);
}

function isMaintenance(v: unknown): v is MaintenanceChoice {
  return typeof v === "string" && MAINTENANCE.has(v as MaintenanceChoice);
}

function parseExtras(v: unknown): Record<string, number> | null {
  if (!isRecord(v)) return null;
  const out: Record<string, number> = {};
  for (const [k, qty] of Object.entries(v)) {
    if (typeof qty !== "number" || !Number.isFinite(qty) || qty < 0) return null;
    out[k] = qty;
  }
  return out;
}

function parseInput(v: unknown): QuoteInput | null {
  if (!isRecord(v)) return null;
  if (v.productId !== null && !isProductId(v.productId)) return null;
  const extras = parseExtras(v.extras);
  if (!extras) return null;
  if (!isMaintenance(v.maintenance)) return null;
  return {
    productId: v.productId as ProductId | null,
    extras,
    maintenance: v.maintenance,
    businessType: typeof v.businessType === "string" ? v.businessType : null,
    goal: typeof v.goal === "string" ? v.goal : null,
    currentSituation:
      typeof v.currentSituation === "string" ? v.currentSituation : null,
  };
}

function parseResult(v: unknown): QuoteResult | null {
  if (!isRecord(v)) return null;
  if (v.productId !== null && !isProductId(v.productId)) return null;
  if (typeof v.subtotalEur !== "number" || typeof v.totalEur !== "number") return null;
  if (typeof v.vatRate !== "number" || typeof v.vatEur !== "number") return null;
  if (!isMaintenance(v.maintenance)) return null;
  if (!Array.isArray(v.lines) || !Array.isArray(v.warnings)) return null;
  return v as unknown as QuoteResult;
}

/** Valida y parsea un snapshot (cliente o sessionStorage). */
export function parseQuoteSnapshot(raw: unknown): QuoteSnapshot | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.timestamp !== "string" || !raw.timestamp) return null;
  const input = parseInput(raw.input);
  const result = parseResult(raw.result);
  if (!input || !result) return null;
  if (!input.productId) return null;

  return {
    id: raw.id,
    timestamp: raw.timestamp,
    input,
    result,
    diagnostic: (raw.diagnostic as QuoteDiagnostic | null | undefined) ?? null,
    contact: (raw.contact as QuoteContact | null | undefined) ?? null,
  };
}

export function loadQuoteSnapshot(): QuoteSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(QUOTE_SNAPSHOT_KEY);
    if (!raw) return null;
    return parseQuoteSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveQuoteSnapshot(snapshot: QuoteSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUOTE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode */
  }
}

export function loadQuoteFlow(): QuoteFlowState {
  if (typeof window === "undefined") return { ...EMPTY_FLOW_STATE };
  try {
    const raw = sessionStorage.getItem(QUOTE_FLOW_KEY);
    if (!raw) return { ...EMPTY_FLOW_STATE };
    const parsed = JSON.parse(raw) as Partial<QuoteFlowState>;
    return {
      phase: parsed.phase ?? "configure",
      diagnosticStep:
        typeof parsed.diagnosticStep === "number" ? parsed.diagnosticStep : 0,
      diagnostic: isRecord(parsed.diagnostic) ? parsed.diagnostic : {},
      contact: isRecord(parsed.contact) ? parsed.contact : {},
    };
  } catch {
    return { ...EMPTY_FLOW_STATE };
  }
}

export function saveQuoteFlow(flow: QuoteFlowState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUOTE_FLOW_KEY, JSON.stringify(flow));
  } catch {
    /* ignore */
  }
}

export function clearQuoteFlow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUOTE_FLOW_KEY);
  } catch {
    /* ignore */
  }
}

export function clearQuoteSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUOTE_SNAPSHOT_KEY);
  } catch {
    /* ignore */
  }
}

/** Reinicia configurador y flujo de lead. */
export function clearQuoteSession(): void {
  clearQuoteFlow();
  clearQuoteSnapshot();
}
