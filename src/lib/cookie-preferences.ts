export const OPTIONAL_COOKIES = {
  analytics: {
    label: "Estadísticas",
    description: "Google Analytics para entender el uso general de la web.",
  },
} as const;

export type OptionalCookieId = keyof typeof OPTIONAL_COOKIES;

export function createDefaultOptionalPreferences(): Record<
  OptionalCookieId,
  boolean
> {
  return Object.fromEntries(
    Object.keys(OPTIONAL_COOKIES).map((id) => [id, true]),
  ) as Record<OptionalCookieId, boolean>;
}

export function hasOptionalConsent(
  preferences: Record<OptionalCookieId, boolean>,
): boolean {
  return Object.values(preferences).some(Boolean);
}

export function createEssentialOnlyPreferences(): Record<
  OptionalCookieId,
  boolean
> {
  return Object.fromEntries(
    Object.keys(OPTIONAL_COOKIES).map((id) => [id, false]),
  ) as Record<OptionalCookieId, boolean>;
}
