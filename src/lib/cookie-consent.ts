export type CookieConsent = "accepted" | "rejected";

export const COOKIE_CONSENT_KEY = "agi-cookie-consent";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "accepted" || value === "rejected") {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

export function storeConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  } catch {
    // localStorage puede estar bloqueado; el banner volverá a mostrarse.
  }
}
