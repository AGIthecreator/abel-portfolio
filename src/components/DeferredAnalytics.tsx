"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/components/cookies/CookieConsentContext";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function loadGoogleAnalytics() {
  if (!GA_ID) return;

  const existing = document.querySelector(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"]`,
  );
  if (existing) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  script.onload = () => {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  };
  document.head.appendChild(script);
}

/** Solo carga Google Analytics tras consentimiento explícito (RGPD). */
export function DeferredAnalytics() {
  const { consent, ready } = useCookieConsent();

  useEffect(() => {
    if (!ready || !GA_ID || consent !== "accepted") return;
    loadGoogleAnalytics();
  }, [consent, ready]);

  return null;
}
