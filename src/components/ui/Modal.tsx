"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      // Focus trap (simple): keep focus within dialog for Tab/Shift+Tab
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const isShift = e.shiftKey;

        if (!isShift && active === last) {
          e.preventDefault();
          first.focus();
        } else if (isShift && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    // Focus initial: close button if present, else dialog
    setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      const auto = root.querySelector<HTMLElement>("[data-autofocus]");
      (auto ?? root).focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastActiveElementRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="relative w-full max-w-230 overflow-hidden rounded-2xl border border-white/12 bg-[rgba(2,6,23,0.92)] shadow-[0_30px_80px_rgba(0,0,0,0.55)] outline-none"
      >
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.16),transparent_55%),radial-gradient(circle_at_80%_5%,rgba(139,92,246,0.18),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>

        {/* Terminal top bar */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-black/25 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>

          {title ? (
            <div
              id={titleId}
              className="font-mono text-[12px] tracking-[0.18em] text-white/70"
            >
              {title}
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[12px] text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
          >
            X
          </button>
        </div>

        {/* Content */}
        <div className="relative max-h-[78vh] overflow-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
