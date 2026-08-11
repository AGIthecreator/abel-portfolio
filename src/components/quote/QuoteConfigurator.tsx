"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { QuoteLeadFlow } from "@/components/quote/QuoteLeadFlow";
import { trackEvent, trackEventOnce } from "@/lib/analytics";
import {
  EMPTY_FLOW_STATE,
  LINE_ITEMS,
  MAINTENANCE_OFFER,
  PRODUCTS,
  QUOTE_PAGE,
  buildQuoteSnapshot,
  calculateQuote,
  clearQuoteSession,
  displayExtraPriceEur,
  getExtrasForProduct,
  loadQuoteFlow,
  loadQuoteSnapshot,
  packValueNoteFor,
  saveQuoteFlow,
  saveQuoteSnapshot,
  type MaintenanceChoice,
  type ProductId,
  type QuoteFlowPhase,
  type QuoteInput,
  type QuoteSnapshot,
} from "@/lib/commerce";

const STEPS = [
  { id: "product", label: "Producto" },
  { id: "extras", label: "Opciones" },
  { id: "maintenance", label: "Mantenimiento" },
  { id: "summary", label: "Resumen" },
] as const;

function formatEur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ChipButton({
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
      className={`rounded-lg border px-4 py-3 text-left text-[14px] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
        selected
          ? "border-violet-400/45 bg-[#F3F1EB] text-[#070b13]"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function QuoteSummaryPanel({
  result,
  productName,
}: {
  result: ReturnType<typeof calculateQuote>;
  productName: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c121c] p-5 text-left">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/75">
        Resumen orientativo
      </p>
      <p className="mt-3 font-serif text-[1.2rem] text-[#F3F1EB]">
        {productName ?? "Elige un producto"}
      </p>
      {result.packPriceEur != null ? (
        <p className="mt-2 text-[13px] text-zinc-400">
          Pack: {formatEur(result.packPriceEur)}
        </p>
      ) : result.productId === "sistemas" ? (
        <p className="mt-2 text-[13px] text-zinc-400">
          {result.extrasTotalEur > 0
            ? "Precio según módulos seleccionados"
            : "Elige al menos un módulo para orientar el precio"}
        </p>
      ) : null}
      {result.bundleValueEur > 0 && result.packPriceEur != null ? (
        <p className="mt-1 text-[12px] text-zinc-500">
          Valor orientativo de partidas: {formatEur(result.bundleValueEur)}
        </p>
      ) : null}
      {result.extrasTotalEur > 0 ? (
        <p className="mt-1 text-[13px] text-zinc-400">
          Extras: {formatEur(result.extrasTotalEur)}
        </p>
      ) : null}
      <div className="my-4 h-px bg-white/10" />
      <p className="text-[13px] text-zinc-400">
        Subtotal: {formatEur(result.subtotalEur)}
      </p>
      <p className="text-[13px] text-zinc-400">
        IVA ({Math.round(result.vatRate * 100)} %): {formatEur(result.vatEur)}
      </p>
      <p className="mt-2 font-serif text-[1.45rem] text-[#F3F1EB]">
        {formatEur(result.totalEur)}
      </p>
      {result.maintenanceMonthlyEur != null ? (
        <p className="mt-2 text-[12px] text-zinc-500">
          + Mantenimiento {formatEur(result.maintenanceMonthlyEur)}/mes
        </p>
      ) : null}
      <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
        Orientativo hasta confirmar el alcance.
      </p>
    </div>
  );
}

type LeadPhase = Extract<
  QuoteFlowPhase,
  "diagnostic" | "contact" | "review" | "success" | "error"
>;

export function QuoteConfigurator() {
  const reduceMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [productId, setProductId] = useState<ProductId | null>(null);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [maintenance, setMaintenance] = useState<MaintenanceChoice>("later");
  const [started, setStarted] = useState(false);
  const [leadSnapshot, setLeadSnapshot] = useState<QuoteSnapshot | null>(null);
  const [leadPhase, setLeadPhase] = useState<LeadPhase | null>(null);
  const [leadStep, setLeadStep] = useState(0);
  const [leadDiagnostic, setLeadDiagnostic] = useState({});
  const [leadContact, setLeadContact] = useState({});

  const step = STEPS[stepIndex];

  const input: QuoteInput = useMemo(
    () => ({
      productId,
      extras,
      maintenance,
    }),
    [productId, extras, maintenance],
  );

  const result = useMemo(() => calculateQuote(input), [input]);

  useEffect(() => {
    const snap = loadQuoteSnapshot();
    const flow = loadQuoteFlow();
    const leadPhases: LeadPhase[] = [
      "diagnostic",
      "contact",
      "review",
      "success",
      "error",
    ];

    if (snap?.input.productId && leadPhases.includes(flow.phase as LeadPhase)) {
      setLeadSnapshot(snap);
      setLeadPhase(flow.phase as LeadPhase);
      setLeadStep(flow.diagnosticStep);
      setLeadDiagnostic(flow.diagnostic);
      setLeadContact(flow.contact);
      setProductId(snap.input.productId);
      setExtras(snap.input.extras);
      setMaintenance(snap.input.maintenance);
      setStepIndex(STEPS.length - 1);
    } else if (snap?.input.productId && flow.phase === "configure") {
      setProductId(snap.input.productId);
      setExtras(snap.input.extras);
      setMaintenance(snap.input.maintenance);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!started && hydrated) {
      setStarted(true);
      trackEventOnce("quote_started", "quote_started", { location: "presupuesto" });
    }
  }, [started, hydrated]);

  const product = PRODUCTS.find((p) => p.id === productId) ?? null;
  const extraIds = productId ? getExtrasForProduct(productId) : [];

  const canContinue = useMemo(() => {
    switch (step.id) {
      case "product":
        return Boolean(productId);
      case "extras":
        if (!productId) return false;
        if (productId === "sistemas") {
          return Object.values(extras).some((q) => q > 0);
        }
        return true;
      case "maintenance":
        return true;
      case "summary":
        return true;
      default:
        return false;
    }
  }, [step.id, productId, extras]);

  const persistConfigureSnapshot = useCallback(() => {
    if (!productId) return null;
    const snapshot = buildQuoteSnapshot(input, result);
    saveQuoteSnapshot(snapshot);
    return snapshot;
  }, [productId, input, result]);

  const goNext = useCallback(() => {
    if (stepIndex >= STEPS.length - 1) return;
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    if (STEPS[next]?.id === "summary") {
      trackEvent("quote_completed", {
        product: productId ?? "none",
        subtotal: result.subtotalEur,
      });
      persistConfigureSnapshot();
      saveQuoteFlow({ ...EMPTY_FLOW_STATE, phase: "configure" });
    }
    setStepIndex(next);
  }, [stepIndex, productId, result.subtotalEur, persistConfigureSnapshot]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const selectProduct = (id: ProductId) => {
    setProductId(id);
    setExtras({});
    trackEvent("quote_product_selected", { product: id });
  };

  const toggleExtra = (id: string) => {
    setExtras((prev) => {
      const nextQty = (prev[id] ?? 0) > 0 ? 0 : 1;
      trackEvent(nextQty > 0 ? "quote_option_added" : "quote_option_removed", {
        option: id,
      });
      return { ...prev, [id]: nextQty };
    });
  };

  const setMaint = (choice: MaintenanceChoice) => {
    setMaintenance(choice);
    trackEvent("quote_maintenance_selected", { choice });
  };

  const startDiagnostic = () => {
    const snapshot = persistConfigureSnapshot();
    if (!snapshot) return;
    setLeadSnapshot(snapshot);
    setLeadPhase("diagnostic");
    setLeadStep(0);
    setLeadDiagnostic({});
    setLeadContact({});
    saveQuoteFlow({
      phase: "diagnostic",
      diagnosticStep: 0,
      diagnostic: {},
      contact: {},
    });
  };

  const exitLeadToSummary = () => {
    setLeadPhase(null);
    setLeadSnapshot(null);
    saveQuoteFlow({ ...EMPTY_FLOW_STATE, phase: "configure" });
    setStepIndex(STEPS.length - 1);
  };

  const restartConfigure = () => {
    clearQuoteSession();
    setLeadPhase(null);
    setLeadSnapshot(null);
    setStepIndex(0);
    setProductId(null);
    setExtras({});
    setMaintenance("later");
  };

  if (!hydrated) {
    return (
      <div className="relative min-h-screen bg-[#070b13] text-zinc-300">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-[5.25rem] sm:px-6 sm:pt-24">
          <p className="font-mono text-[10px] text-zinc-600">Cargando…</p>
        </div>
      </div>
    );
  }

  if (leadPhase && leadSnapshot) {
    return (
      <div className="relative min-h-screen overflow-x-clip bg-[#070b13] text-zinc-300">
        <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-[5.25rem] sm:px-6 sm:pt-24 lg:px-10 lg:pt-28">
          <FadeIn>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
              {leadPhase === "success"
                ? "Enviado"
                : leadPhase === "diagnostic"
                  ? "Diagnóstico"
                  : "Proyecto"}
            </p>
            <h1 className="mt-3 font-serif text-[clamp(1.5rem,3.5vw,2.25rem)] font-normal leading-[1.1] tracking-[-0.03em] text-[#F3F1EB]">
              {leadPhase === "success"
                ? "Proyecto enviado"
                : leadPhase === "contact"
                  ? "Casi listo"
                  : leadPhase === "review" || leadPhase === "error"
                    ? "Revisión"
                    : "Vamos a entender tu proyecto"}
            </h1>
            {leadPhase === "diagnostic" ? (
              <p className="mt-3 max-w-[48ch] text-[14px] leading-relaxed text-zinc-500">
                Partimos de {leadSnapshot.result.productName ?? "tu configuración"}. Cinco
                preguntas cortas. Los datos de contacto van al final.
              </p>
            ) : null}
          </FadeIn>
          <QuoteLeadFlow
            snapshot={leadSnapshot}
            initialPhase={leadPhase}
            initialStep={leadStep}
            initialDiagnostic={leadDiagnostic}
            initialContact={leadContact}
            onExitToSummary={exitLeadToSummary}
            onRestartConfigure={restartConfigure}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070b13] text-zinc-300">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-[5.25rem] sm:px-6 sm:pb-32 sm:pt-24 lg:px-10 lg:pt-28">
        <FadeIn>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
            Configurador
          </p>
          <h1 className="mt-3 font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#F3F1EB]">
            {QUOTE_PAGE.hero}
          </h1>
          <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.75] text-zinc-400">
            {QUOTE_PAGE.subtitle}
          </p>
        </FadeIn>

        <div className="mt-8 flex flex-wrap gap-2" aria-label="Progreso">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                i === stepIndex
                  ? "bg-[#F3F1EB] text-[#070b13]"
                  : i < stepIndex
                    ? "bg-violet-400/20 text-violet-200/80"
                    : "bg-white/5 text-zinc-600"
              }`}
            >
              {i + 1}. {s.label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {step.id === "product" && (
                  <section aria-labelledby="step-product">
                    <h2 id="step-product" className="font-serif text-[1.35rem] text-[#F3F1EB]">
                      Vamos a ver qué tipo de proyecto encaja contigo
                    </h2>
                    <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-zinc-500">
                      Elige un punto de partida. No es una compra: es la base para montar una
                      propuesta orientativa alrededor de tu negocio.
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectProduct(p.id)}
                          className={`rounded-xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
                            productId === p.id
                              ? "border-violet-400/40 bg-[#F3F1EB] text-[#070b13]"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-semibold tracking-[-0.02em]">{p.name}</span>
                            {p.highlight ? (
                              <span
                                className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${
                                  productId === p.id
                                    ? "bg-[#2a2438] text-[#F3F1EB]"
                                    : "bg-[#F3F1EB]/10 text-[#F3F1EB]/70"
                                }`}
                              >
                                Principal
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={`mt-2 block text-[13px] ${
                              productId === p.id ? "text-[#070b13]/65" : "text-zinc-500"
                            }`}
                          >
                            {p.priceLabel}
                          </span>
                          <span
                            className={`mt-2 block text-[12.5px] leading-snug ${
                              productId === p.id ? "text-[#070b13]/55" : "text-zinc-500"
                            }`}
                          >
                            {p.summary}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {step.id === "extras" && product && (
                  <section aria-labelledby="step-extras">
                    <h2 id="step-extras" className="font-serif text-[1.35rem] text-[#F3F1EB]">
                      Opciones para {product.name}
                    </h2>
                    <p className="mt-2 max-w-[52ch] text-[14px] text-zinc-500">
                      Añade solo lo que necesites. Puedes quitar opciones en cualquier momento.
                    </p>
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {extraIds.map((id) => {
                        const item = LINE_ITEMS[id];
                        if (!item || item.priceEur == null) return null;
                        const selected = (extras[id] ?? 0) > 0;
                        const displayPrice = displayExtraPriceEur(item);
                        const usesMin =
                          item.minEur != null &&
                          displayPrice != null &&
                          item.priceEur * 1 < item.minEur;
                        return (
                          <li key={id}>
                            <button
                              type="button"
                              onClick={() => toggleExtra(id)}
                              className={`flex w-full items-start justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
                                selected
                                  ? "border-violet-400/40 bg-[#F3F1EB] text-[#070b13]"
                                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/18"
                              }`}
                            >
                              <span>
                                <span className="block text-[14px] font-medium">{item.name}</span>
                                <span
                                  className={`mt-1 block text-[12px] leading-snug ${
                                    selected ? "text-[#070b13]/55" : "text-zinc-500"
                                  }`}
                                >
                                  {item.description}
                                </span>
                              </span>
                              <span
                                className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                                  selected ? "text-[#2a2438]" : "text-zinc-400"
                                }`}
                              >
                                +{formatEur(displayPrice)}
                                {usesMin
                                  ? " mín."
                                  : item.unit === "flujo"
                                    ? "/flujo"
                                    : item.unit === "seccion"
                                      ? "/sección"
                                      : item.unit === "mes"
                                        ? "/mes"
                                        : item.unit === "elemento"
                                          ? "/lote"
                                          : ""}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {result.warnings.map((w) => (
                      <p
                        key={w.code}
                        className="mt-4 rounded-lg border border-violet-400/25 bg-violet-400/10 px-4 py-3 text-[13px] leading-relaxed text-violet-100/90"
                      >
                        {w.message}
                        {w.suggestedProductId ? (
                          <>
                            {" "}
                            <button
                              type="button"
                              className="underline underline-offset-2"
                              onClick={() => {
                                selectProduct(w.suggestedProductId!);
                                setStepIndex(0);
                              }}
                            >
                              Cambiar producto
                            </button>
                          </>
                        ) : null}
                      </p>
                    ))}
                  </section>
                )}

                {step.id === "maintenance" && (
                  <section aria-labelledby="step-maint">
                    <h2 id="step-maint" className="font-serif text-[1.35rem] text-[#F3F1EB]">
                      ¿Quieres que nos encarguemos también del mantenimiento?
                    </h2>
                    <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-zinc-400">
                      {MAINTENANCE_OFFER.summary} {MAINTENANCE_OFFER.priceLabel}.
                    </p>
                    <p className="mt-2 max-w-[52ch] text-[13px] text-zinc-500">
                      {MAINTENANCE_OFFER.scopeClarification}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {(
                        [
                          ["yes", "Sí"],
                          ["no", "Ahora no"],
                          ["later", "Lo hablamos después"],
                        ] as const
                      ).map(([value, label]) => (
                        <ChipButton
                          key={value}
                          selected={maintenance === value}
                          onClick={() => setMaint(value)}
                        >
                          {label}
                        </ChipButton>
                      ))}
                    </div>
                  </section>
                )}

                {step.id === "summary" && (
                  <section aria-labelledby="step-summary">
                    <h2 id="step-summary" className="font-serif text-[1.35rem] text-[#F3F1EB]">
                      Resumen de tu orientación
                    </h2>
                    <div className="mt-5 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[15px] text-zinc-200">
                        <span className="text-zinc-500">Producto: </span>
                        {result.productName}
                      </p>
                      {result.packPriceEur != null ? (
                        <p className="text-[14px] text-zinc-400">
                          Precio del pack: {formatEur(result.packPriceEur)}
                        </p>
                      ) : null}
                      {result.bundleValueEur > 0 && result.packPriceEur != null ? (
                        <div>
                          <p className="text-[14px] text-zinc-400">
                            Valor orientativo de partidas: {formatEur(result.bundleValueEur)}
                          </p>
                          <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">
                            {packValueNoteFor(result.bundleValueEur, result.packPriceEur)}
                          </p>
                        </div>
                      ) : null}
                      <ul className="space-y-1.5 border-t border-white/10 pt-4">
                        {result.lines
                          .filter((l) => l.kind === "extra" || l.kind === "note")
                          .map((l) => (
                            <li
                              key={l.id}
                              className="flex justify-between gap-3 text-[13px] text-zinc-400"
                            >
                              <span>{l.name}</span>
                              <span className="tabular-nums">{formatEur(l.lineTotalEur)}</span>
                            </li>
                          ))}
                      </ul>
                      <div className="border-t border-white/10 pt-4 text-[14px] text-zinc-300">
                        <p>Subtotal: {formatEur(result.subtotalEur)}</p>
                        <p className="mt-1">
                          IVA ({Math.round(result.vatRate * 100)} %): {formatEur(result.vatEur)}
                        </p>
                        <p className="mt-3 font-serif text-[1.5rem] text-[#F3F1EB]">
                          Total: {formatEur(result.totalEur)}
                        </p>
                        {result.maintenanceMonthlyEur != null ? (
                          <p className="mt-2 text-[13px] text-zinc-500">
                            Mantenimiento: {formatEur(result.maintenanceMonthlyEur)}/mes
                          </p>
                        ) : (
                          <p className="mt-2 text-[13px] text-zinc-600">
                            Mantenimiento: no añadido ahora
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-dashed border-white/15 px-5 py-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                        Siguiente paso
                      </p>
                      <h3 className="mt-2 font-serif text-[1.15rem] text-[#F3F1EB]">
                        Entender el contexto
                      </h3>
                      <p className="mt-2 max-w-[48ch] text-[14px] leading-relaxed text-zinc-500">
                        Cinco preguntas para saber qué te frena de verdad. Después, cómo
                        contactarte.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={startDiagnostic}
                          className="inline-flex min-h-11 items-center rounded-md bg-[#F3F1EB] px-5 text-sm font-semibold text-[#070b13]"
                        >
                          Empezar diagnóstico
                        </button>
                        <Link
                          href="/precios"
                          className="inline-flex min-h-11 items-center rounded-md border border-white/15 px-5 text-sm text-zinc-300 transition-colors hover:border-white/25 hover:text-[#F3F1EB]"
                        >
                          Volver a precios
                        </Link>
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 hidden items-center justify-between gap-4 sm:flex">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="min-h-11 rounded-md border border-white/12 px-5 text-sm text-zinc-400 transition-colors enabled:hover:border-white/25 enabled:hover:text-zinc-200 disabled:opacity-30"
              >
                {QUOTE_PAGE.ctaBack}
              </button>
              {step.id !== "summary" ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue}
                  className="min-h-11 rounded-md bg-[#F3F1EB] px-6 text-sm font-semibold text-[#070b13] transition-opacity disabled:opacity-35"
                >
                  {QUOTE_PAGE.ctaContinue}
                </button>
              ) : null}
            </div>
          </div>

          <aside className="sticky top-24 hidden lg:block">
            <QuoteSummaryPanel result={result} productName={result.productName} />
            <p className="mt-4 text-[12px] leading-relaxed text-zinc-600">
              <Link href="/precios" className="text-zinc-500 underline-offset-2 hover:underline">
                Ver precios
              </Link>
            </p>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b13]/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
              {QUOTE_PAGE.stickyTotal}
            </p>
            <p className="truncate font-serif text-[1.15rem] text-[#F3F1EB]">
              {formatEur(result.totalEur)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="min-h-11 rounded-md border border-white/15 px-3 text-sm text-zinc-300"
              >
                Atrás
              </button>
            ) : null}
            {step.id !== "summary" ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="min-h-11 rounded-md bg-[#F3F1EB] px-4 text-sm font-semibold text-[#070b13] disabled:opacity-35"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={startDiagnostic}
                className="inline-flex min-h-11 items-center rounded-md bg-[#F3F1EB] px-4 text-sm font-semibold text-[#070b13]"
              >
                Empezar diagnóstico
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
