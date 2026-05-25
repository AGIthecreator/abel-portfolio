"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getStoredConsent,
  storeConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  consent: CookieConsent | null;
  ready: boolean;
  showPreferences: boolean;
  setShowPreferences: (open: boolean) => void;
  acceptAll: () => void;
  savePreferences: (analyticsEnabled: boolean) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

export function CookieConsentProvider({ children }: PropsWithChildren) {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    setConsentState(getStoredConsent());
    setReady(true);
  }, []);

  const persistConsent = useCallback((value: CookieConsent) => {
    storeConsent(value);
    setConsentState(value);
    setShowPreferences(false);
  }, []);

  const acceptAll = useCallback(() => {
    persistConsent("accepted");
  }, [persistConsent]);

  const savePreferences = useCallback(
    (analyticsEnabled: boolean) => {
      persistConsent(analyticsEnabled ? "accepted" : "rejected");
    },
    [persistConsent],
  );

  const value = useMemo(
    () => ({
      consent,
      ready,
      showPreferences,
      setShowPreferences,
      acceptAll,
      savePreferences,
    }),
    [consent, ready, showPreferences, acceptAll, savePreferences],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent debe usarse dentro de CookieConsentProvider",
    );
  }
  return context;
}
