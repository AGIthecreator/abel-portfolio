import { getBundleLineItems, type ProductId } from "./products";
import { LINE_ITEMS, type LineItem } from "./lineItems";

/** Suma orientativa del valor de partidas de un pack (sin IVA). */
export function sumBundleValue(productId: ProductId): number {
  return getBundleLineItems(productId).reduce((acc, item) => {
    if (item.priceEur == null) return acc;
    return acc + item.priceEur;
  }, 0);
}

export function resolveLineItems(ids: string[]): LineItem[] {
  return ids
    .map((id) => LINE_ITEMS[id])
    .filter((item): item is LineItem => Boolean(item));
}
