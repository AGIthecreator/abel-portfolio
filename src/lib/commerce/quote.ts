import type { MaintenanceChoice } from "./maintenance";
import type { ProductId } from "./products";
import type { QuoteContact, QuoteDiagnostic } from "./diagnostic";

export type QuoteLineKind = "bundle" | "extra" | "maintenance" | "note";

export type QuoteLine = {
  id: string;
  kind: QuoteLineKind;
  name: string;
  description?: string;
  quantity: number;
  unitPriceEur: number | null;
  lineTotalEur: number | null;
  includedInPack?: boolean;
};

export type QuoteWarning = {
  code: string;
  message: string;
  severity: "info" | "suggest_upgrade";
  suggestedProductId?: ProductId;
};

/** Estado editable del configurador (entrada de calculateQuote). */
export type QuoteInput = {
  productId: ProductId | null;
  /** Cantidades de extras por lineItemId */
  extras: Record<string, number>;
  maintenance: MaintenanceChoice;
  businessType?: string | null;
  goal?: string | null;
  currentSituation?: string | null;
};

/** Resultado del motor comercial. */
export type QuoteResult = {
  productId: ProductId | null;
  productName: string | null;
  packPriceEur: number | null;
  bundleValueEur: number;
  extrasTotalEur: number;
  lines: QuoteLine[];
  subtotalEur: number;
  vatRate: number;
  vatEur: number;
  totalEur: number;
  maintenance: MaintenanceChoice;
  maintenanceMonthlyEur: number | null;
  warnings: QuoteWarning[];
  isOrientative: true;
};

/**
 * Snapshot reproducible para diagnóstico / envío / PDF futuro.
 */
export type QuoteSnapshot = {
  id: string;
  timestamp: string;
  input: QuoteInput;
  result: QuoteResult;
  diagnostic?: QuoteDiagnostic | null;
  contact?: QuoteContact | null;
};

export function createQuoteId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildQuoteSnapshot(
  input: QuoteInput,
  result: QuoteResult,
): QuoteSnapshot {
  return {
    id: createQuoteId(),
    timestamp: new Date().toISOString(),
    input,
    result,
    diagnostic: null,
    contact: null,
  };
}
