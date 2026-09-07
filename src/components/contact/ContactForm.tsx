"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact/info";
import {
  MAX_COMPANY_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
} from "@/lib/contact/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT =
  "w-full rounded-xl border border-white/10 bg-[#101826] px-4 py-3 text-[16px] text-[#F3F1EB] outline-none placeholder:text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow] duration-200 focus:border-violet-300/40 focus:ring-2 focus:ring-violet-400/15";

type ContactFormProps = {
  source?: string;
};

export function ContactForm({ source = "page_form" }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);

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
      setMessageError("Escribe un mensaje breve.");
      ok = false;
    } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setMessageError(`Máximo ${MAX_MESSAGE_LENGTH} caracteres.`);
      ok = false;
    } else {
      setMessageError("");
    }

    return ok;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().slice(0, MAX_NAME_LENGTH),
          email: email.trim(),
          company: company.trim().slice(0, MAX_COMPANY_LENGTH),
          message: message.trim(),
          website,
        }),
      });

      if (res.ok) {
        trackEvent("contact_form_submit", { method: source });
        setSent(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-88 flex-col items-center justify-center px-2 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
          Enviado
        </p>
        <h3 className="mt-3 font-(family-name:--font-contact-display) text-[clamp(1.45rem,3vw,1.9rem)] font-medium tracking-[-0.03em] text-[#F3F1EB]">
          Mensaje recibido
        </h3>
        <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-relaxed text-zinc-400">
          Lo revisaré personalmente y te responderé lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-page-name"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"
          >
            Nombre
          </label>
          <input
            id="contact-page-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className={INPUT}
          />
        </div>
        <div>
          <label
            htmlFor="contact-page-email"
            className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"
          >
            Email
          </label>
          <input
            id="contact-page-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
              if (submitError) setSubmitError(false);
            }}
            placeholder="tu@email.com"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "contact-page-email-error" : undefined}
            className={INPUT}
          />
          {emailError ? (
            <p id="contact-page-email-error" className="mt-1.5 text-xs text-red-400/90">
              {emailError}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-page-company"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"
        >
          Negocio <span className="normal-case tracking-normal text-zinc-600">(opcional)</span>
        </label>
        <input
          id="contact-page-company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={MAX_COMPANY_LENGTH}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nombre del negocio"
          className={INPUT}
        />
      </div>

      <div>
        <label
          htmlFor="contact-page-message"
          className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"
        >
          Mensaje
        </label>
        <textarea
          id="contact-page-message"
          name="message"
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (messageError) setMessageError("");
            if (submitError) setSubmitError(false);
          }}
          placeholder="Cuéntame qué tienes en mente"
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? "contact-page-message-error" : undefined}
          className={`${INPUT} min-h-32 resize-y leading-relaxed`}
        />
        {messageError ? (
          <p id="contact-page-message-error" className="mt-1.5 text-xs text-red-400/90">
            {messageError}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-center text-xs leading-relaxed text-red-200/90"
        >
          Algo ha fallado. Escríbeme a{" "}
          <a
            href={CONTACT_MAILTO}
            className="font-medium underline underline-offset-2 hover:text-red-100"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="mt-1 w-full rounded-xl bg-[#F3F1EB] px-4 py-3.5 text-sm font-semibold tracking-[-0.01em] text-[#070b13] shadow-[0_12px_32px_-18px_rgba(243,241,235,0.55)] transition-[transform,opacity] duration-200 hover:-translate-y-px hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "Enviando…" : "Enviar mensaje"}
      </button>
      <p className="text-center text-[11px] tracking-wide text-zinc-500">
        Respuesta directa · Sin intermediarios
      </p>
    </form>
  );
}
