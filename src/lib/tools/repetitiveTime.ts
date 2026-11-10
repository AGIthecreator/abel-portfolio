export const WEEKS_PER_MONTH = 4.33;
export const WEEKS_PER_YEAR = 52;

export const LIMITS = {
  timesPerWeek: 200,
  minutesEach: 12 * 60,
  people: 50,
  hourlyCostEur: 300,
} as const;

export const EXAMPLE_INPUT = {
  timesPerWeek: "5",
  minutesEach: "15",
  people: "1",
  hourlyCostEur: "",
} as const;

export type ParseReason = "empty" | "invalid" | "negative" | "excessive";

export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: ParseReason };

export type TimeFigures = {
  hoursWeek: number;
  hoursMonth: number;
  hoursYear: number;
  costWeekEur: number | null;
  costMonthEur: number | null;
  costYearEur: number | null;
};

export function parseBoundedNumber(raw: string, max: number): ParseResult {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return { ok: false, reason: "empty" };
  if (trimmed.startsWith("-")) return { ok: false, reason: "negative" };
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return { ok: false, reason: "invalid" };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false, reason: "invalid" };
  if (value > max) return { ok: false, reason: "excessive" };
  return { ok: true, value };
}

export function parseOptionalCost(raw: string): ParseResult | { ok: true; value: null } {
  if (!raw.trim()) return { ok: true, value: null };
  return parseBoundedNumber(raw, LIMITS.hourlyCostEur);
}

export function hoursFrom(timesPerWeek: number, minutesEach: number, people: number): TimeFigures {
  const hoursWeek = (timesPerWeek * minutesEach * people) / 60;
  return {
    hoursWeek,
    hoursMonth: hoursWeek * WEEKS_PER_MONTH,
    hoursYear: hoursWeek * WEEKS_PER_YEAR,
    costWeekEur: null,
    costMonthEur: null,
    costYearEur: null,
  };
}

export function withCost(figures: TimeFigures, hourlyCostEur: number | null): TimeFigures {
  if (hourlyCostEur == null) return figures;
  return {
    ...figures,
    costWeekEur: figures.hoursWeek * hourlyCostEur,
    costMonthEur: figures.hoursMonth * hourlyCostEur,
    costYearEur: figures.hoursYear * hourlyCostEur,
  };
}

export function calculateFromRaw(input: {
  timesPerWeek: string;
  minutesEach: string;
  people: string;
  hourlyCostEur: string;
}): { ok: true; figures: TimeFigures } | { ok: false; fields: Record<string, ParseReason> } {
  const times = parseBoundedNumber(input.timesPerWeek, LIMITS.timesPerWeek);
  const minutes = parseBoundedNumber(input.minutesEach, LIMITS.minutesEach);
  const people = parseBoundedNumber(input.people, LIMITS.people);
  const cost = parseOptionalCost(input.hourlyCostEur);
  const fields: Record<string, ParseReason> = {};
  if (!times.ok) fields.timesPerWeek = times.reason;
  if (!minutes.ok) fields.minutesEach = minutes.reason;
  if (!people.ok) fields.people = people.reason;
  if (!cost.ok) fields.hourlyCostEur = cost.reason;
  if (Object.keys(fields).length) return { ok: false, fields };
  if (!times.ok || !minutes.ok || !people.ok || !cost.ok) return { ok: false, fields };
  return {
    ok: true,
    figures: withCost(hoursFrom(times.value, minutes.value, people.value), cost.value),
  };
}

export function formatHours(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatToolEur(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function fieldMessage(reason: ParseReason): string {
  if (reason === "empty") return "Indica un número.";
  if (reason === "negative") return "No uses valores negativos.";
  if (reason === "excessive") return "El valor es demasiado alto para un cálculo útil.";
  return "Usa un número válido.";
}
