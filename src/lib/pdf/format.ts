/** Formato moneda y fechas para PDF (es-ES). */

export function formatEurPdf(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Según proyecto";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEurPdfWithTaxNote(
  value: number | null | undefined,
  opts?: { withVat?: boolean },
): string {
  const base = formatEurPdf(value);
  if (value == null) return base;
  return opts?.withVat ? `${base} (con IVA)` : `${base} + IVA`;
}

export function formatDatePdf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(d);
}

export function formatPercentPdf(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}
