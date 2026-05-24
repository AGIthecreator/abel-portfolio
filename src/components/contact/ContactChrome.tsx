"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";

const ContactModal = dynamic(
  () =>
    import("@/components/contact/ContactModal").then((m) => ({
      default: m.ContactModal,
    })),
  { ssr: false },
);

const FloatingWhatsApp = dynamic(
  () =>
    import("@/components/FloatingWhatsApp").then((m) => ({
      default: m.FloatingWhatsApp,
    })),
  { ssr: false },
);

/** Modal y WhatsApp fuera del bundle inicial (framer-motion + portal). */
export function ContactChrome() {
  const { isOpen } = useContactModal();
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

  return (
    <>
      {isOpen ? <ContactModal /> : null}
      {showChrome ? <FloatingWhatsApp /> : null}
    </>
  );
}
