"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LuckyEasterEggModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LuckyEasterEggModal({ open, onClose }: LuckyEasterEggModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center p-5" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lucky-modal-title"
        className="relative z-10 w-full max-w-88 border border-neutral-600/90 bg-[#1c1c1f] text-neutral-200 shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center justify-between border-b border-neutral-700/90 bg-[#252528] px-3 py-2">
          <span id="lucky-modal-title" className="text-[11px] font-medium tracking-wide text-neutral-400">
            Mensaje del sistema
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-[12px] text-neutral-500 transition-colors hover:bg-white/10 hover:text-neutral-200"
            aria-label="Cerrar ventana"
          >
            Cerrar
          </button>
        </div>
        <div className="space-y-4 px-4 py-5">
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-100">
            No todo el mundo pulsa ese botón.
          </p>
          <div className="space-y-3 text-[13px] leading-relaxed text-neutral-400">
            <p>
              Te llevas un 20% de descuento si acabas trabajando conmigo.
              <br />
              <br />
              Haz una captura antes de cerrar esto.
            </p>
            <p className="rounded border border-neutral-700/80 bg-black/40 px-3 py-2.5 font-mono text-[12px] text-neutral-300">
              Coupon unlocked: AGI-LUCKY20
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
