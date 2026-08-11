/**
 * Compatibilidad: reexporta el sistema comercial.
 * Preferir `@/lib/commerce` en código nuevo.
 */

export {
  PRODUCTS as OFFER_TIERS_SOURCE,
  MAINTENANCE_OFFER,
  OFFER_SCOPE_NOTE,
  OFFER_GUARANTEE_NOTE,
  OFFER_INFRA_NOTE,
  OFFER_GUARANTEE_MONTHS,
  COMMERCE_CURRENCY as OFFER_CURRENCY,
  COMMERCE_TAX_NOTE as OFFER_TAX_NOTE,
  OFFER_EXTRAS_LABELS,
  getProduct,
  calculateQuote,
  type Product,
  type ProductId,
  type MaintenanceOffer,
} from "@/lib/commerce";

import { PRODUCTS, OFFER_EXTRAS_LABELS } from "@/lib/commerce";
import type { Product } from "@/lib/commerce";

/** Forma legacy usada por Pricing hasta migrar imports. */
export type OfferTier = {
  id: Product["id"];
  name: string;
  priceLabel: string;
  priceFromEur: number | null;
  summary: string;
  suitedFor: string;
  includes: string[];
  doesNotInclude: string[];
  highlight?: boolean;
  internalNotes?: string[];
};

export const OFFER_TIERS: OfferTier[] = PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  priceLabel: p.priceLabel,
  priceFromEur: p.priceFromEur,
  summary: p.summary,
  suitedFor: p.suitedFor,
  includes: p.includes,
  doesNotInclude: p.doesNotInclude,
  highlight: p.highlight,
  internalNotes: p.internalNotes,
}));

export type ExtraItem = { label: string; note?: string };

export const OFFER_EXTRAS: ExtraItem[] = OFFER_EXTRAS_LABELS.map((label) => ({
  label,
}));
