"use client";

import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Carga gtag tras interacción o timeout — fuera de la ruta crítica de PageSpeed. */
export function DeferredAnalytics() {
  useEffect(() => {
    if (!GA_ID) return;

    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;

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

      cleanup();
    };

    const events = ["scroll", "pointerdown", "keydown"] as const;
    const onInteraction = () => load();

    for (const event of events) {
      window.addEventListener(event, onInteraction, {
        once: true,
        passive: true,
        capture: true,
      });
    }

    function cleanup() {
      for (const event of events) {
        window.removeEventListener(event, onInteraction, { capture: true });
      }
    }

    return cleanup;
  }, []);

  return null;
}
