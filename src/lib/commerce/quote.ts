import type { MaintenanceChoice } from "./maintenance";
import type { ProductId } from "./products";
import type { QuoteContact, QuoteDiagnostic } from "./diagnostic";
import { roundEur } from "./rates";

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

/** Importes que el cliente ha visto. No fijan el precio: el servidor los compara. */
export type QuoteSeenTotals = {
  subtotalEur: number;
  vatEur: number;
  totalEur: number;
  maintenanceMonthlyEur: number | null;
};

export function seenTotalsFromResult(result: QuoteResult): QuoteSeenTotals {
  return {
    subtotalEur: result.subtotalEur,
    vatEur: result.vatEur,
    totalEur: result.totalEur,
    maintenanceMonthlyEur: result.maintenanceMonthlyEur,
  };
}

export function quoteTotalsMatch(seen: QuoteSeenTotals, result: QuoteResult): boolean {
  const same = (left: number, right: number) => roundEur(left) === roundEur(right);
  const maintenanceMatches =
    seen.maintenanceMonthlyEur == null
      ? result.maintenanceMonthlyEur == null
      : result.maintenanceMonthlyEur != null &&
        same(seen.maintenanceMonthlyEur, result.maintenanceMonthlyEur);
  return (
    same(seen.subtotalEur, result.subtotalEur) &&
    same(seen.vatEur, result.vatEur) &&
    same(seen.totalEur, result.totalEur) &&
    maintenanceMatches
  );
}

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
