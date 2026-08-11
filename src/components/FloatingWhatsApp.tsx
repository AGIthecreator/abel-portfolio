"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { trackEvent } from "@/lib/analytics";

const BONE_WHITE = "rgba(243, 241, 235, 0.92)";
const INK = "#070b13";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola Abel, quería comentarte una idea que tengo para mi negocio."
);

/** España: 34 + 9 dígitos (ej. 711206230 → 34711206230) */
function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 9 && /^[679]/.test(digits)) {
    return `34${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("34")) {
    return digits;
  }
  return digits;
}

const WHATSAPP_NUMBER = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "711206230"
);

const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingWhatsApp() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const { isOpen: contactModalOpen } = useContactModal();

  if (!WHATSAPP_NUMBER || contactModalOpen) {
    return null;
  }

  // En /presupuesto: sticky CTA (z-40) visible hasta lg en configurador y lead.
  // Elevamos el FAB solo bajo lg para no tapar Continuar / Enviar.
  const onQuoteFlow =
    pathname === "/presupuesto" || pathname.startsWith("/presupuesto/");
  const positionClass = onQuoteFlow
    ? "fixed bottom-[5.75rem] right-4 z-50 flex items-center gap-3 rounded-full px-4 py-2.5 text-[#070b13] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-[box-shadow,transform] duration-300 ease-out hover:shadow-[0_12px_36px_rgba(0,0,0,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] lg:bottom-6 lg:right-6 lg:px-5 lg:py-3"
    : "fixed bottom-4 right-4 z-60 flex items-center gap-3 rounded-full px-5 py-3 text-[#070b13] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-[box-shadow,transform] duration-300 ease-out hover:shadow-[0_12px_36px_rgba(0,0,0,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] sm:bottom-6 sm:right-6";

  return (
    <motion.a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp — Te respondo yo"
      className={positionClass}
      style={{ backgroundColor: BONE_WHITE, color: INK }}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -2, scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }
      }
      onClick={() =>
        trackEvent("click_whatsapp", {
          location: onQuoteFlow ? "floating_cta_presupuesto" : "floating_cta",
        })
      }
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />

      <span className="font-semibold text-sm sm:hidden">WhatsApp</span>

      <div className="hidden flex-col sm:flex">
        <span className="text-sm font-semibold leading-tight">WhatsApp</span>
        <span className="text-[11px] font-normal leading-none text-zinc-500">
          Te respondo yo
        </span>
      </div>
    </motion.a>
  );
}
