import { packValueNoteFor } from "./copy";
import { getBundleLineItems, getProduct } from "./products";
import { calculateQuote } from "./rules";
import { MAINTENANCE_OFFER } from "./maintenance";
import {
  labelBlocker,
  labelBusinessType,
  labelGoal,
  labelSituation,
  labelTimeline,
  type QuoteContact,
  type QuoteDiagnostic,
} from "./diagnostic";
import type { QuoteInput, QuoteResult } from "./quote";
import {
  QUOTE_PDF_BRAND,
  QUOTE_PDF_DOCUMENT,
  QUOTE_PDF_MAINTENANCE_NOTE,
  QUOTE_PDF_TERMS,
  QUOTE_PDF_VALIDITY_DAYS,
} from "./quotePdfCopy";

export type QuotePdfLine = {
  id: string;
  name: string;
  description: string;
  /** Precio sin IVA; null = según proyecto / passthrough */
  priceEur: number | null;
};

export type QuotePdfModel = {
  brand: typeof QUOTE_PDF_BRAND;
  documentTitle: string;
  issuedAt: string;
  validUntil: string;
  validityDays: number;
  quoteId: string;
  client: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  product: {
    id: string;
    name: string;
    summary: string;
    packPriceEur: number | null;
    includes: string[];
    doesNotInclude: string[];
  };
  includedLines: QuotePdfLine[];
  /** Suma catálogo de partidas del pack (sin IVA) */
  bundleValueEur: number;
  /** Ahorro pack = bundle - packPrice cuando aplica */
  packSavingsEur: number | null;
  extras: QuotePdfLine[];
  extrasTotalEur: number;
  maintenance: {
    selected: boolean;
    name: string;
    monthlyEur: number | null;
    summary: string;
    includes: string[];
    noteWhenNotSelected: string;
  };
  totals: {
    subtotalEur: number;
    vatRate: number;
    vatEur: number;
    totalEur: number;
  };
  context: {
    business: string;
    goal: string;
    situation: string;
    blocker: string;
    timeline: string;
  };
  terms: readonly string[];
  packValueNote: string;
  orientativeNote: string;
};

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/**
 * Construye el modelo del PDF a partir del presupuesto recalculado en servidor.
 * No lee totales del cliente.
 */
export function buildQuotePdfModel(args: {
  quoteId: string;
  timestamp: string;
  input: QuoteInput;
  result: QuoteResult;
  diagnostic: QuoteDiagnostic;
  contact: QuoteContact;
}): QuotePdfModel {
  const { input, result, diagnostic, contact, quoteId, timestamp } = args;
  const product = input.productId ? getProduct(input.productId) : undefined;

  const includedLines: QuotePdfLine[] = product
    ? getBundleLineItems(product.id).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        priceEur: item.priceEur,
      }))
    : [];

  const extras: QuotePdfLine[] = result.lines
    .filter((l) => l.kind === "extra")
    .map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description ?? "",
      priceEur: l.lineTotalEur,
    }));

  const packPriceEur = result.packPriceEur;
  const bundleValueEur = result.bundleValueEur;
  const packSavingsEur =
    packPriceEur != null && bundleValueEur > packPriceEur
      ? Math.round((bundleValueEur - packPriceEur) * 100) / 100
      : null;

  const maintenanceSelected = input.maintenance === "yes";

  return {
    brand: QUOTE_PDF_BRAND,
    documentTitle: QUOTE_PDF_DOCUMENT.title,
    issuedAt: timestamp,
    validUntil: addDaysIso(timestamp, QUOTE_PDF_VALIDITY_DAYS),
    validityDays: QUOTE_PDF_VALIDITY_DAYS,
    quoteId,
    client: {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
    },
    product: {
      id: product?.id ?? input.productId ?? "unknown",
      name: product?.name ?? result.productName ?? "Proyecto",
      summary: product?.summary ?? "",
      packPriceEur,
      includes: product?.includes ?? [],
      doesNotInclude: product?.doesNotInclude ?? [],
    },
    includedLines,
    bundleValueEur,
    packSavingsEur,
    extras,
    extrasTotalEur: result.extrasTotalEur,
    maintenance: {
      selected: maintenanceSelected,
      name: MAINTENANCE_OFFER.name,
      monthlyEur: result.maintenanceMonthlyEur,
      summary: MAINTENANCE_OFFER.scopeClarification,
      includes: MAINTENANCE_OFFER.includes,
      noteWhenNotSelected: QUOTE_PDF_MAINTENANCE_NOTE,
    },
    totals: {
      subtotalEur: result.subtotalEur,
      vatRate: result.vatRate,
      vatEur: result.vatEur,
      totalEur: result.totalEur,
    },
    context: {
      business: labelBusinessType(diagnostic),
      goal: labelGoal(diagnostic),
      situation: labelSituation(diagnostic),
      blocker: labelBlocker(diagnostic),
      timeline: labelTimeline(diagnostic),
    },
    terms: QUOTE_PDF_TERMS,
    packValueNote: packValueNoteFor(bundleValueEur, packPriceEur),
    orientativeNote: QUOTE_PDF_DOCUMENT.orientativeNote,
  };
}

/** Recalcula y construye modelo (entrada tipada ya validada). */
export function buildQuotePdfModelFromInput(args: {
  quoteId: string;
  timestamp: string;
  input: QuoteInput;
  diagnostic: QuoteDiagnostic;
  contact: QuoteContact;
}): QuotePdfModel {
  const result = calculateQuote(args.input);
  return buildQuotePdfModel({ ...args, result });
}
