"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FloatingWhatsApp = dynamic(
  () =>
    import("@/components/FloatingWhatsApp").then((m) => ({
      default: m.FloatingWhatsApp,
    })),
  { ssr: false },
);

/** WhatsApp flotante fuera del bundle inicial. */
export function ContactChrome() {
  const [showChrome, setShowChrome] = useState(false);

  useEffect(() => {
    const enable = () => setShowChrome(true);
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(enable, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(enable, 2000);
    return () => clearTimeout(t);
  }, []);

  return showChrome ? <FloatingWhatsApp /> : null;
}
