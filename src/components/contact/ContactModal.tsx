"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CornerTicks } from "@/components/contact/CornerTicks";
import { useContactModal } from "@/components/contact/ContactModalContext";

import { trackEvent } from "@/lib/analytics";
import { MAX_MESSAGE_LENGTH } from "@/lib/contact/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_EMAIL = "hola@agithecreator.com";

const TEXTAREA_PLACEHOLDER = `Pierdo mucho tiempo gestionando reservas

Necesito una web para mi negocio

Tengo demasiadas cosas separadas`;

const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

type ContactModalDialogProps = {
  open: boolean;
  onClose: () => void;
};

/** Una sola instancia en page.tsx (portal, oculto hasta openModal). */
export function ContactModal() {
  const { isOpen, closeModal } = useContactModal();
  return <ContactModalDialog open={isOpen} onClose={closeModal} />;
}

function ContactModalDialog({ open, onClose }: ContactModalDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const t = window.setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      const auto = root.querySelector<HTMLElement>("[data-autofocus]");
      (auto ?? root).focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSent(false);
      setLoading(false);
      setWebsite("");
      setEmailError("");
      setMessageError("");
      setSubmitError("");
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setName("");
    setEmail("");
    setMessage("");
    setWebsite("");
    setEmailError("");
    setMessageError("");
    setSubmitError("");
    setSent(false);
  };

  const validate = () => {
    let ok = true;
    const trimmedMessage = message.trim();

    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Introduce un email válido.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!trimmedMessage) {
      setMessageError("Cuéntame en pocas líneas qué te gustaría mejorar.");
      ok = false;
    } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setMessageError(`El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`);
      ok = false;
    } else {
      setMessageError("");
    }

    return ok;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
        }),
      });

      if (res.ok) {
        trackEvent("contact_form_submit", { method: "modal_form" });
        setSent(true);
      } else {
        setSubmitError("failed");
      }
    } catch {
      setSubmitError("failed");
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="contact-overlay"
          className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: MOTION_EASE }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative my-auto w-full max-h-[min(100dvh-2rem,720px)] max-w-[560px] overflow-y-auto rounded-2xl border border-[#d8d2c8] bg-[#F3F1EB] p-6 shadow-[0_25px_80px_-30px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.6)] outline-none sm:p-8"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: MOTION_EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.02] mix-blend-soft-light"
              style={{
                backgroundImage: NOISE_BG,
                backgroundSize: "180px 180px",
              }}
              aria-hidden
            />
            <CornerTicks />

            {sent ? (
              <div className="relative z-10 space-y-5 text-center">
                <h2
                  id={titleId}
                  className="text-xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-2xl"
                >
                  Mensaje enviado
                </h2>
                <p className="text-[15px] leading-relaxed text-zinc-600">
                  Lo revisaré y te responderé lo antes posible.
                </p>
                <button
                  type="button"
                  data-autofocus
                  onClick={handleClose}
                  className="mx-auto block rounded-lg border border-transparent px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="relative z-10">
                <header className="mb-6 space-y-2">
                  <h2
                    id={titleId}
                    className="text-xl font-semibold tracking-[-0.03em] text-zinc-900 sm:text-2xl"
                  >
                    Cuéntame qué tienes en mente
                  </h2>
                  <p className="text-[15px] leading-relaxed text-zinc-600">
                    Una idea, algo que quieras mejorar o algo que te está quitando tiempo.
                  </p>
                  <p className="text-sm text-zinc-500">Lo revisaré personalmente.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <input
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <div>
                    <label htmlFor="contact-name" className="sr-only">
                      Nombre
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      data-autofocus
                      className="w-full rounded-lg border border-[#d8d2c8] bg-white/70 px-3.5 py-2.5 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-zinc-400 transition-[border-color,box-shadow] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300/40"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                        if (submitError) setSubmitError("");
                      }}
                      placeholder="tu@email.com"
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? "contact-email-error" : undefined}
                      className="w-full rounded-lg border border-[#d8d2c8] bg-white/70 px-3.5 py-2.5 text-[15px] text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-zinc-400 transition-[border-color,box-shadow] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300/40"
                    />
                    {emailError ? (
                      <p id="contact-email-error" className="mt-1.5 text-xs text-red-600/90">
                        {emailError}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1.5 block text-sm font-medium text-zinc-800"
                    >
                      ¿Qué te gustaría mejorar?
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={message}
                      maxLength={MAX_MESSAGE_LENGTH}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (messageError) setMessageError("");
                        if (submitError) setSubmitError("");
                      }}
                      placeholder={TEXTAREA_PLACEHOLDER}
                      aria-invalid={messageError ? true : undefined}
                      aria-describedby={messageError ? "contact-message-error" : "contact-message-hint"}
                      className="w-full resize-y rounded-lg border border-[#d8d2c8] bg-white/70 px-3.5 py-2.5 text-[15px] leading-relaxed text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-zinc-400 transition-[border-color,box-shadow] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300/40"
                    />
                    <p id="contact-message-hint" className="mt-2 text-xs text-zinc-500">
                      No hace falta explicarlo perfecto.
                      <br />
                      Con dos líneas suele ser suficiente.
                    </p>
                    {messageError ? (
                      <p id="contact-message-error" className="mt-1 text-xs text-red-600/90">
                        {messageError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2 pt-1">
                    {submitError ? (
                      <p
                        role="alert"
                        className="rounded-lg border border-red-200/80 bg-red-50/60 px-3 py-2.5 text-center text-xs leading-relaxed text-red-800/90"
                      >
                        Algo ha fallado. Por favor, escríbeme directamente a{" "}
                        <a
                          href={`mailto:${FALLBACK_EMAIL}`}
                          className="font-medium underline underline-offset-2 hover:text-red-900"
                        >
                          {FALLBACK_EMAIL}
                        </a>
                        .
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={loading}
                      aria-busy={loading}
                      className="w-full rounded-lg bg-[#070b13] px-4 py-3 text-sm font-semibold text-[#F3F1EB] transition-transform duration-200 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Enviando…" : "Enviar mensaje"}
                    </button>
                    <p className="text-center text-xs text-zinc-500">
                      Respuesta directa  /  Sin intermediarios
                    </p>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
