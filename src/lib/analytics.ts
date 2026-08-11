type GtagEventParameters = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ONCE_STORAGE_KEY = "agi_analytics_once_v1";

function readOnceKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(ONCE_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((k): k is string => typeof k === "string"));
  } catch {
    return new Set();
  }
}

function writeOnceKeys(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ONCE_STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    /* quota / private mode */
  }
}

/** True si la clave ya se marcó en esta sesión de pestaña. */
export function hasTrackedOnce(onceKey: string): boolean {
  return readOnceKeys().has(onceKey);
}

/** Marca la clave como vista en esta sesión. */
export function markTrackedOnce(onceKey: string): void {
  const keys = readOnceKeys();
  if (keys.has(onceKey)) return;
  keys.add(onceKey);
  writeOnceKeys(keys);
}

export const trackEvent = (
  eventName: string,
  parameters?: GtagEventParameters,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};

/**
 * Dispara el evento como máximo una vez por `onceKey` en la sesión (pestaña).
 * Sobrevive a remounts de React Strict Mode.
 */
export function trackEventOnce(
  eventName: string,
  onceKey: string,
  parameters?: GtagEventParameters,
): boolean {
  if (hasTrackedOnce(onceKey)) return false;
  markTrackedOnce(onceKey);
  trackEvent(eventName, parameters);
  return true;
}

