/**
 * Tarifas públicas vigentes de la oferta de AGI TheCreator.
 * Única fuente de los importes. El motor, la página de precios, el
 * configurador, el PDF y los correos leen estos valores (directamente
 * o a través del catálogo).
 *
 * `previousEur` es la tarifa que ya se había publicado. Solo se muestra
 * tachada en /precios. No entra en calculateQuote, en el ahorro del pack
 * ni en ningún total.
 */

export const PUBLIC_RATES = {
  entrada: { eur: 390, previousEur: 510 },
  profesional: { eur: 790, previousEur: 1190 },
  aMedida: { eur: 1690, previousEur: 2490 },
  /** Mínimo de una automatización. No es el precio de cualquier sistema. */
  sistemasFromEur: 290,
  maintenanceMonthlyEur: 59,
  maintenancePreviousEur: 99,
} as const;

/** Céntimo comercial: mitad hacia arriba, estable frente al error binario. */
export function roundEur(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Importe de presupuesto, con dos decimales y el mismo criterio en toda la entrega. */
export function formatEurCents(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundEur(value));
}

/** Importe en euros con separador de miles español, sin decimales. */
export function formatEurAmount(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped} €`;
}

export function publicPriceLabel(amount: number, from = false): string {
  return `${from ? "Desde " : ""}${formatEurAmount(amount)} + IVA`;
}
