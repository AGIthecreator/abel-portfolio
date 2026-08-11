"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent, trackEventOnce } from "@/lib/analytics";
import {
  DIAGNOSTIC_BLOCKERS,
  DIAGNOSTIC_BUSINESS_TYPES,
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_SITUATIONS,
  DIAGNOSTIC_TIMELINES,
  getGoalsForProduct,
  isDiagnosticComplete,
  labelBlocker,
  labelBusinessType,
  labelGoal,
  labelSituation,
  labelTimeline,
  maintenanceChoiceLabel,
  type QuoteContact,
  type QuoteDiagnostic,
  type QuoteFlowPhase,
  type QuoteSnapshot,
} from "@/lib/commerce";
import { saveQuoteFlow, saveQuoteSnapshot } from "@/lib/commerce/snapshot";
import { formatEsMobileGrouped, normalizeEsMobileDigits } from "@/lib/commerce/quoteSchema";

const TOTAL_QUESTIONS = DIAGNOSTIC_QUESTIONS.length;

function formatPhoneEs(value: string): string {
  return formatEsMobileGrouped(value);
}

function phoneDigits(value: string | undefined): string {
  return normalizeEsMobileDigits(value ?? "");
}

function formatEur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-lg border px-4 py-3.5 text-left text-[14px] leading-snug transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
        selected
          ? "border-violet-400/45 bg-[#F3F1EB] text-[#070b13]"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function OtherField({
  value,
  onChange,
  visible,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  id: string;
}) {
  if (!visible) return null;
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Especifícalo en pocas palabras"
      maxLength={120}
      autoComplete="off"
      className="mt-3 w-full rounded-lg border border-white/15 bg-[#0c121c] px-4 py-3 text-[14px] text-[#F3F1EB] placeholder:text-zinc-600 focus:border-violet-400/40 focus:outline-none"
    />
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[14px] leading-snug text-zinc-300">
      <span className="text-zinc-500">{label}: </span>
      {value}
    </p>
  );
}

type QuoteLeadFlowProps = {
  snapshot: QuoteSnapshot;
  initialStep?: number;
  initialDiagnostic?: Partial<QuoteDiagnostic>;
  initialContact?: Partial<QuoteContact>;
  initialPhase?: Extract<
    QuoteFlowPhase,
    "diagnostic" | "contact" | "review" | "success" | "error"
  >;
  onExitToSummary: () => void;
  onRestartConfigure: () => void;
};

export function QuoteLeadFlow({
  snapshot,
  initialStep = 0,
  initialDiagnostic = {},
  initialContact = {},
  initialPhase = "diagnostic",
  onExitToSummary,
  onRestartConfigure,
}: QuoteLeadFlowProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(initialPhase);
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), TOTAL_QUESTIONS - 1));
  const [diagnostic, setDiagnostic] = useState<Partial<QuoteDiagnostic>>(initialDiagnostic);
  const [contact, setContact] = useState<Partial<QuoteContact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    consent: false,
    ...initialContact,
  });
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfEmailed, setPdfEmailed] = useState(false);
  const submitLockRef = useRef(false);

  const productId = snapshot.input.productId;
  const goals = useMemo(() => getGoalsForProduct(productId), [productId]);
  const questionMeta = DIAGNOSTIC_QUESTIONS[step];
  const questionKey = questionMeta.key;

  const optionsForStep = useMemo(() => {
    if (step === 1) return goals;
    if (step === 0) return DIAGNOSTIC_BUSINESS_TYPES;
    if (step === 2) return DIAGNOSTIC_SITUATIONS;
    if (step === 3) return DIAGNOSTIC_BLOCKERS;
    return DIAGNOSTIC_TIMELINES;
  }, [step, goals]);

  const selectedId = diagnostic[questionKey] as string | undefined;
  const otherKey =
    questionKey === "timeline"
      ? null
      : (`${questionKey}Other` as
          | "businessTypeOther"
          | "goalOther"
          | "currentSituationOther"
          | "blockerOther");

  const persist = useCallback(
    (
      nextPhase: QuoteFlowPhase,
      nextStep: number,
      nextDiag: Partial<QuoteDiagnostic>,
      nextContact: Partial<QuoteContact>,
      snap?: QuoteSnapshot,
    ) => {
      saveQuoteFlow({
        phase: nextPhase,
        diagnosticStep: nextStep,
        diagnostic: nextDiag,
        contact: nextContact,
      });
      if (snap) saveQuoteSnapshot(snap);
    },
    [],
  );

  useEffect(() => {
    if (phase === "success") return;
    trackEventOnce("diagnostic_started", "diagnostic_started", {
      product: productId ?? "none",
    });
  }, [phase, productId]);

  useEffect(() => {
    if (!diagnostic.goal) return;
    if (goals.some((g) => g.id === diagnostic.goal)) return;
    setDiagnostic((d) => ({ ...d, goal: undefined, goalOther: undefined }));
  }, [goals, diagnostic.goal]);

  useEffect(() => {
    persist(phase, step, diagnostic, contact);
  }, [phase, step, diagnostic, contact, persist]);

  // Vista de pregunta (para embudo de abandono) — una vez por step+pregunta en la sesión
  useEffect(() => {
    if (phase !== "diagnostic") return;
    trackEventOnce(
      "diagnostic_question_viewed",
      `diagnostic_question_viewed:${step}:${questionKey}`,
      {
        step: step + 1,
        question: questionKey,
        product: productId ?? "none",
      },
    );
  }, [phase, step, questionKey, productId]);

  const canContinueQuestion = useMemo(() => {
    if (!selectedId) return false;
    if (selectedId === "otro" && otherKey) {
      const other = diagnostic[otherKey];
      return Boolean(typeof other === "string" && other.trim());
    }
    return true;
  }, [selectedId, otherKey, diagnostic]);

  const selectOption = (id: string) => {
    setDiagnostic((d) => {
      const next: Partial<QuoteDiagnostic> = { ...d, [questionKey]: id };
      if (otherKey && id !== "otro") {
        next[otherKey] = undefined;
      }
      return next;
    });
  };

  const goNextQuestion = () => {
    if (!canContinueQuestion || !selectedId) return;
    trackEvent("diagnostic_question_answered", {
      step: step + 1,
      question: questionKey,
      answer: selectedId,
    });
    if (step >= TOTAL_QUESTIONS - 1) {
      trackEvent("diagnostic_completed", {
        product: productId ?? "none",
        questions: TOTAL_QUESTIONS,
      });
      setPhase("contact");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (phase === "review") {
      setPhase("contact");
      return;
    }
    if (phase === "contact") {
      setPhase("diagnostic");
      setStep(TOTAL_QUESTIONS - 1);
      return;
    }
    if (phase === "diagnostic" && step === 0) {
      onExitToSummary();
      return;
    }
    if (phase === "diagnostic") {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const validateContact = (): boolean => {
    const errors: Record<string, string> = {};
    if (!contact.name?.trim()) errors.name = "Indica tu nombre";
    if (!contact.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = "Email no válido";
    }
    if (phoneDigits(contact.phone).length !== 9) {
      errors.phone = "Teléfono de 9 dígitos";
    }
    if (!contact.consent) errors.consent = "Necesario para poder contactarte";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToReview = () => {
    if (!validateContact()) return;
    if (!isDiagnosticComplete(diagnostic)) {
      setPhase("diagnostic");
      setStep(0);
      return;
    }
    const nextSnap: QuoteSnapshot = {
      ...snapshot,
      diagnostic: diagnostic as QuoteDiagnostic,
      contact: {
        name: contact.name!.trim(),
        email: contact.email!.trim(),
        phone: contact.phone!.trim(),
        company: contact.company?.trim() || undefined,
        consent: true,
      },
      timestamp: new Date().toISOString(),
    };
    saveQuoteSnapshot(nextSnap);
    setPhase("review");
  };

  const submit = async () => {
    if (submitLockRef.current || submitting) return;
    if (!isDiagnosticComplete(diagnostic) || !contact.name || !contact.email || !contact.phone) {
      setPhase("contact");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const payload = {
        quote: {
          input: {
            productId: snapshot.input.productId,
            extras: snapshot.input.extras,
            maintenance: snapshot.input.maintenance,
          },
        },
        diagnostic: diagnostic as QuoteDiagnostic,
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          company: contact.company?.trim() || undefined,
          consent: true as const,
        },
        timestamp: new Date().toISOString(),
        website,
      };

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setPhase("error");
        return;
      }

      let pdfAttached = false;
      try {
        const data = (await res.json()) as { pdfAttached?: boolean };
        pdfAttached = Boolean(data.pdfAttached);
      } catch {
        pdfAttached = false;
      }
      setPdfEmailed(pdfAttached);

      trackEvent("quote_submitted", {
        product: productId ?? "none",
        maintenance: snapshot.input.maintenance,
        pdf_emailed: pdfAttached,
      });

      const doneSnap: QuoteSnapshot = {
        ...snapshot,
        diagnostic: diagnostic as QuoteDiagnostic,
        contact: payload.contact,
        timestamp: payload.timestamp,
      };
      saveQuoteSnapshot(doneSnap);
      setPhase("success");
    } catch {
      setPhase("error");
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const downloadPdf = async () => {
    if (pdfLoading) return;
    if (!isDiagnosticComplete(diagnostic) || !contact.name || !contact.email || !contact.phone) {
      setPdfError("Faltan datos para generar el presupuesto.");
      return;
    }
    setPdfLoading(true);
    setPdfError("");
    try {
      const res = await fetch("/api/quote/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: {
            input: {
              productId: snapshot.input.productId,
              extras: snapshot.input.extras,
              maintenance: snapshot.input.maintenance,
            },
          },
          diagnostic: diagnostic as QuoteDiagnostic,
          contact: {
            name: contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
            company: contact.company?.trim() || undefined,
            consent: true,
          },
          quoteId: snapshot.id,
          timestamp: snapshot.timestamp || new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        setPdfError("No se ha podido descargar el presupuesto. Inténtalo de nuevo.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "presupuesto-agi.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent("quote_pdf_downloaded", {
        product: productId ?? "none",
      });
    } catch {
      setPdfError("No se ha podido descargar el presupuesto. Inténtalo de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  };

  const progressLabel = `${String(step + 1).padStart(2, "0")} / ${String(TOTAL_QUESTIONS).padStart(2, "0")}`;
  const extraLines = snapshot.result.lines.filter((l) => l.kind === "extra");

  if (phase === "success") {
    return (
      <div className="mx-auto w-full max-w-xl px-1 py-6 sm:py-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
          Enviado
        </p>
        <h2 className="mt-3 font-serif text-[clamp(1.75rem,4vw,2.4rem)] text-[#F3F1EB]">
          Proyecto enviado correctamente.
        </h2>
        <p className="mt-4 text-[15px] leading-[1.75] text-zinc-400">
          Ya tengo la información de tu proyecto. Ahora toca revisarlo con calma y hablar contigo.
        </p>
        {pdfEmailed ? (
          <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">
            También te hemos enviado una copia del presupuesto orientativo por email.
          </p>
        ) : null}

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="font-serif text-[1.1rem] text-[#F3F1EB]">Presupuesto</p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
            {pdfEmailed
              ? "Si lo necesitas, también puedes descargarlo aquí."
              : "Descarga el presupuesto orientativo con el desglose del proyecto."}
          </p>
          <button
            type="button"
            onClick={() => void downloadPdf()}
            disabled={pdfLoading}
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#F3F1EB] px-5 text-sm font-semibold text-[#070b13] disabled:opacity-50"
          >
            {pdfLoading ? "Generando…" : "Descargar presupuesto"}
          </button>
          {pdfError ? (
            <p className="mt-3 text-[12px] text-violet-300" role="alert">
              {pdfError}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/precios"
            className="inline-flex min-h-11 items-center rounded-md border border-white/15 px-5 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:text-[#F3F1EB]"
          >
            Volver a precios
          </Link>
          <button
            type="button"
            onClick={onRestartConfigure}
            className="inline-flex min-h-11 items-center rounded-md border border-white/15 px-5 text-sm text-zinc-300"
          >
            Nuevo presupuesto
          </button>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto w-full max-w-xl px-1 py-6 sm:py-10" role="alert">
        <h2 className="font-serif text-[clamp(1.5rem,3.5vw,2rem)] text-[#F3F1EB]">
          No ha podido enviarse todavía.
        </h2>
        <p className="mt-4 text-[15px] leading-[1.75] text-zinc-400">
          Tu información sigue aquí. Inténtalo de nuevo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-md bg-[#F3F1EB] px-5 text-sm font-semibold text-[#070b13] disabled:opacity-50"
          >
            {submitting ? "Reintentando…" : "Reintentar"}
          </button>
          <button
            type="button"
            onClick={() => setPhase("review")}
            className="inline-flex min-h-11 items-center rounded-md border border-white/15 px-5 text-sm text-zinc-300"
          >
            Revisar resumen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-1 pb-28 pt-2 lg:pb-8">
      {phase === "diagnostic" ? (
        <p
          className="font-mono text-[11px] tabular-nums tracking-[0.14em] text-zinc-500"
          aria-live="polite"
        >
          {progressLabel}
        </p>
      ) : (
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
          {phase === "contact" ? "Contacto" : "Revisión"}
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${step}`}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {phase === "diagnostic" && (
            <section aria-labelledby="diagnostic-question-title">
              <h2
                id="diagnostic-question-title"
                className="font-serif text-[clamp(1.4rem,3.2vw,1.85rem)] leading-[1.15] text-[#F3F1EB]"
              >
                {questionMeta.title}
              </h2>
              <div
                className={`mt-6 grid grid-cols-1 gap-2.5 ${
                  step <= 1 ? "sm:grid-cols-2" : ""
                }`}
                role="group"
                aria-label={questionMeta.title}
              >
                {optionsForStep.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    selected={selectedId === opt.id}
                    onClick={() => selectOption(opt.id)}
                  >
                    {opt.label}
                  </OptionButton>
                ))}
              </div>
              {otherKey ? (
                <OtherField
                  id={`diag-other-${questionKey}`}
                  visible={selectedId === "otro"}
                  value={(diagnostic[otherKey] as string | undefined) ?? ""}
                  onChange={(v) =>
                    setDiagnostic((d) => ({
                      ...d,
                      [otherKey]: v,
                    }))
                  }
                />
              ) : null}
            </section>
          )}

          {phase === "contact" && (
            <section aria-labelledby="contact-title">
              <h2
                id="contact-title"
                className="font-serif text-[clamp(1.35rem,3vw,1.75rem)] text-[#F3F1EB]"
              >
                Perfecto. Ya tengo una idea bastante clara.
              </h2>
              <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-zinc-400">
                Déjame tus datos para poder hablar del proyecto contigo. Solo lo necesario
                para contactarte.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-zinc-500">Nombre</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={contact.name ?? ""}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-[#0c121c] px-4 py-3 text-[14px] text-[#F3F1EB] focus:border-violet-400/40 focus:outline-none"
                  />
                  {fieldErrors.name ? (
                    <span className="mt-1 block text-[12px] text-violet-300">{fieldErrors.name}</span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-zinc-500">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={contact.email ?? ""}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-[#0c121c] px-4 py-3 text-[14px] text-[#F3F1EB] focus:border-violet-400/40 focus:outline-none"
                  />
                  {fieldErrors.email ? (
                    <span className="mt-1 block text-[12px] text-violet-300">{fieldErrors.email}</span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-zinc-500">
                    Teléfono / WhatsApp
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={11}
                    placeholder="600 000 000"
                    value={contact.phone ?? ""}
                    onChange={(e) =>
                      setContact((c) => ({
                        ...c,
                        phone: formatPhoneEs(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#0c121c] px-4 py-3 text-[14px] tabular-nums text-[#F3F1EB] focus:border-violet-400/40 focus:outline-none"
                  />
                  {fieldErrors.phone ? (
                    <span className="mt-1 block text-[12px] text-violet-300">{fieldErrors.phone}</span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] text-zinc-500">
                    Empresa <span className="text-zinc-600">(opcional)</span>
                  </span>
                  <input
                    type="text"
                    autoComplete="organization"
                    value={contact.company ?? ""}
                    onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-[#0c121c] px-4 py-3 text-[14px] text-[#F3F1EB] focus:border-violet-400/40 focus:outline-none"
                  />
                </label>
                <label className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
                <label className="flex items-start gap-3 text-[13px] leading-relaxed text-zinc-400">
                  <input
                    type="checkbox"
                    checked={Boolean(contact.consent)}
                    onChange={(e) =>
                      setContact((c) => ({ ...c, consent: e.target.checked }))
                    }
                    className="mt-1 size-4 shrink-0 rounded border-white/20 bg-[#0c121c] accent-violet-400"
                  />
                  <span>
                    Acepto que me contactéis sobre este proyecto. Más info en la{" "}
                    <Link
                      href="/privacy"
                      className="text-zinc-300 underline-offset-2 hover:underline"
                    >
                      política de privacidad
                    </Link>
                    .
                  </span>
                </label>
                {fieldErrors.consent ? (
                  <span className="text-[12px] text-violet-300">{fieldErrors.consent}</span>
                ) : null}
              </div>
            </section>
          )}

          {phase === "review" && isDiagnosticComplete(diagnostic) && (
            <section aria-labelledby="review-title">
              <h2
                id="review-title"
                className="font-serif text-[clamp(1.35rem,3vw,1.75rem)] text-[#F3F1EB]"
              >
                Esto es lo que vamos a estudiar
              </h2>
              <p className="mt-2 text-[14px] text-zinc-500">
                Revisa que encaje. Luego lo mando y lo miramos juntos.
              </p>

              <div className="mt-6 space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300/70">
                    Proyecto
                  </p>
                  <ReviewRow
                    label="Producto"
                    value={snapshot.result.productName ?? "-"}
                  />
                  {extraLines.length > 0 ? (
                    <div className="pt-1">
                      <p className="text-[13px] text-zinc-500">Extras</p>
                      <ul className="mt-1 space-y-1">
                        {extraLines.map((l) => (
                          <li
                            key={l.id}
                            className="flex justify-between gap-3 text-[13px] text-zinc-400"
                          >
                            <span>{l.name}</span>
                            <span className="tabular-nums">{formatEur(l.lineTotalEur)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ReviewRow label="Extras" value="Ninguno" />
                  )}
                  <ReviewRow
                    label="Mantenimiento"
                    value={
                      snapshot.input.maintenance === "yes" &&
                      snapshot.result.maintenanceMonthlyEur != null
                        ? `${formatEur(snapshot.result.maintenanceMonthlyEur)}/mes + IVA`
                        : maintenanceChoiceLabel(
                            snapshot.input.maintenance,
                            snapshot.result.maintenanceMonthlyEur,
                          )
                    }
                  />
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300/70">
                    Desglose
                  </p>
                  {snapshot.result.packPriceEur != null ? (
                    <ReviewRow
                      label="Pack"
                      value={formatEur(snapshot.result.packPriceEur)}
                    />
                  ) : null}
                  {snapshot.result.extrasTotalEur > 0 ? (
                    <ReviewRow
                      label="Extras"
                      value={formatEur(snapshot.result.extrasTotalEur)}
                    />
                  ) : null}
                  <ReviewRow
                    label="Subtotal"
                    value={formatEur(snapshot.result.subtotalEur)}
                  />
                  <ReviewRow
                    label={`IVA (${Math.round(snapshot.result.vatRate * 100)} %)`}
                    value={formatEur(snapshot.result.vatEur)}
                  />
                  <ReviewRow
                    label="Total"
                    value={formatEur(snapshot.result.totalEur)}
                  />
                  {snapshot.result.maintenanceMonthlyEur != null ? (
                    <p className="pt-1 text-[13px] text-zinc-500">
                      Mantenimiento aparte:{" "}
                      {formatEur(snapshot.result.maintenanceMonthlyEur)}
                      /mes + IVA
                    </p>
                  ) : null}
                  <p className="pt-1 text-[12px] text-zinc-600">
                    Orientativo hasta confirmar el alcance.
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300/70">
                    Diagnóstico
                  </p>
                  <ReviewRow label="Negocio" value={labelBusinessType(diagnostic)} />
                  <ReviewRow label="Objetivo" value={labelGoal(diagnostic)} />
                  <ReviewRow label="Situación" value={labelSituation(diagnostic)} />
                  <ReviewRow label="Lo que más frena" value={labelBlocker(diagnostic)} />
                  <ReviewRow label="Plazo" value={labelTimeline(diagnostic)} />
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-300/70">
                    Contacto
                  </p>
                  <ReviewRow label="Nombre" value={contact.name?.trim() || "-"} />
                  <ReviewRow label="Email" value={contact.email?.trim() || "-"} />
                  <ReviewRow label="Teléfono" value={contact.phone?.trim() || "-"} />
                  {contact.company?.trim() ? (
                    <ReviewRow label="Empresa" value={contact.company.trim()} />
                  ) : null}
                </div>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 hidden items-center justify-between gap-4 lg:flex">
        <button
          type="button"
          onClick={goBack}
          className="min-h-11 rounded-md border border-white/12 px-5 text-sm text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-200"
        >
          Atrás
        </button>
        {phase === "diagnostic" ? (
          <button
            type="button"
            onClick={goNextQuestion}
            disabled={!canContinueQuestion}
            className="min-h-11 rounded-md bg-[#F3F1EB] px-6 text-sm font-semibold text-[#070b13] disabled:opacity-35"
          >
            Continuar
          </button>
        ) : null}
        {phase === "contact" ? (
          <button
            type="button"
            onClick={goToReview}
            className="min-h-11 rounded-md bg-[#F3F1EB] px-6 text-sm font-semibold text-[#070b13]"
          >
            Continuar
          </button>
        ) : null}
        {phase === "review" ? (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            className="min-h-11 rounded-md bg-[#F3F1EB] px-6 text-sm font-semibold text-[#070b13] disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Enviar proyecto"}
          </button>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b13]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            className="min-h-11 rounded-md border border-white/15 px-3 text-sm text-zinc-300"
          >
            Atrás
          </button>
          {phase === "diagnostic" ? (
            <button
              type="button"
              onClick={goNextQuestion}
              disabled={!canContinueQuestion}
              className="min-h-11 rounded-md bg-[#F3F1EB] px-4 text-sm font-semibold text-[#070b13] disabled:opacity-35"
            >
              Continuar
            </button>
          ) : null}
          {phase === "contact" ? (
            <button
              type="button"
              onClick={goToReview}
              className="min-h-11 rounded-md bg-[#F3F1EB] px-4 text-sm font-semibold text-[#070b13]"
            >
              Continuar
            </button>
          ) : null}
          {phase === "review" ? (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="min-h-11 rounded-md bg-[#F3F1EB] px-4 text-sm font-semibold text-[#070b13] disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Enviar proyecto"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
