"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { FadeIn } from "@/components/motion/FadeIn";
import { trackEvent } from "@/lib/analytics";

const BONE = "#F3F1EB";
/** Gris de la barra del manifiesto (sustituye el casi negro del FAQ en este fondo) */
const MANIFESTO_BAR_GRAY = "#5a5f6b";
/** Panel desplegable: entre hueso y gris, legible */
const TIER_PANEL = "#D8D6D0";
const PLAN_NAME = "#2a2438";

const FAQ_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 48%, #0c121c 100%)";

const PRICING_TIERS = [
  {
    name: "Presencia",
    price: "Desde 390€ + IVA",
    summary: "Para negocios que necesitan empezar a aparecer.",
    features: [
      "responsive",
      "WhatsApp",
      "formulario",
      "SEO básico",
      "analytics",
    ],
  },
  {
    name: "Movimiento",
    price: "Desde 690€ + IVA",
    summary: "Para negocios que ya reciben clientes y quieren organizar mejor todo.",
    features: [
      "más secciones",
      "formularios avanzados",
      "integraciones",
      "estructura SEO fuerte",
    ],
  },
  {
    name: "Sistema",
    price: "Desde 1200€ + IVA",
    summary: "Para proyectos construidos alrededor del negocio.",
    features: [
      "diseño a medida",
      "automatizaciones",
      "procesos internos",
      "escalabilidad",
    ],
  },
] as const;

/** Barra bajo el titular del manifiesto: 80% del ancho del título; 80% casi negro + 20% hueso (como FAQ). */
function ManifestoHeadlineAccentBar() {
  return (
    <div
      aria-hidden
      className="mx-auto mt-2.5 flex h-2 w-[80%] max-w-full overflow-hidden sm:mt-3 sm:h-2.5"
    >
      <span
        className="h-full w-[80%] shrink-0"
        style={{ backgroundColor: MANIFESTO_BAR_GRAY }}
      />
      <span className="h-full w-[20%] shrink-0" style={{ backgroundColor: BONE }} />
    </div>
  );
}

/** Corchetes al tamaño del +, no tipográficos grandes */
function FeatureMark() {
  return (
    <span
      className="inline-flex shrink-0 items-center font-mono text-[13px] font-normal leading-none tracking-tight text-[#070b13]/45"
      aria-hidden
    >
      <span>[</span>
      <span>+</span>
      <span>]</span>
    </span>
  );
}

function TierChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm border border-[#070b13]/10 bg-[#070b13]/3 font-mono text-[11px] leading-none text-[#4a3f5c] transition-[transform,background-color] duration-300 ease-out group-hover:border-[#070b13]/14 ${
        isOpen ? "rotate-90 bg-[#070b13]/6" : "rotate-0"
      }`}
    >
      &gt;
    </span>
  );
}

function PricingTierBlock({
  name,
  price,
  summary,
  features,
  isOpen,
  onToggle,
}: {
  name: string;
  price: string;
  summary: string;
  features: readonly string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <article
      className={`overflow-hidden rounded-lg border border-[#070b13]/10 bg-[#F3F1EB] transition-[box-shadow,transform] duration-300 ease-out ${
        isOpen
          ? "shadow-[0_8px_28px_-18px_rgba(7,11,19,0.3)]"
          : "shadow-[0_4px_18px_-14px_rgba(7,11,19,0.22)] hover:-translate-y-px hover:shadow-[0_8px_24px_-14px_rgba(7,11,19,0.28)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F1EB] sm:gap-3.5 sm:px-5 sm:py-4.5"
      >
        <TierChevron isOpen={isOpen} />
        <span className="min-w-0 flex-1 space-y-1">
          <span
            className="block text-[clamp(1.2rem,2.8vw,1.45rem)] font-semibold leading-tight tracking-[-0.02em]"
            style={{ color: PLAN_NAME }}
          >
            {name}
          </span>
          <span className="block text-[13px] font-medium tabular-nums text-[#070b13]/55">
            {price}
          </span>
          <span className="block text-[12px] leading-snug text-[#070b13]/40 sm:text-[13px]">
            {summary}
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Incluye: ${name}`}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-[#070b13]/10 px-4 pb-4 pt-2 sm:px-5 sm:pb-4.5"
              style={{ backgroundColor: TIER_PANEL }}
            >
              <ul className="flex flex-col gap-2.5 pl-10">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-baseline gap-2 text-[13px] leading-relaxed text-[#070b13]/72"
                  >
                    <FeatureMark />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

const ctaButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[#F3F1EB] px-7 py-3.5 text-sm font-semibold text-[#070b13] shadow-[0_8px_32px_-16px_rgba(243,241,235,0.2)] transition-[background-color,transform,opacity] duration-200 hover:bg-[#F3F1EB]/90 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]";

export function Pricing() {
  const { openModal } = useContactModal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const handlePrimaryCta = useCallback(() => {
    trackEvent("pricing_cta_click", { location: "precios" });
    openModal();
  }, [openModal]);

  return (
    <div className="relative min-h-screen bg-[#070b13] text-zinc-300">
      {/* Hero original — fondo web, sin CTA */}
      <section
        className="relative z-10 bg-[#070b13] px-4 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:px-10 lg:pb-16 lg:pt-36"
        aria-labelledby="pricing-hero-heading"
      >
        <FadeIn className="relative mx-auto w-full max-w-3xl lg:max-w-4xl">
          <h1
            id="pricing-hero-heading"
            className="font-serif text-[clamp(2rem,5.2vw,2.85rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#f2f0ec]"
          >
            Cada negocio empieza desde un punto distinto.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.8] text-zinc-400 sm:text-base sm:leading-[1.85]">
            Una cafetería no necesita lo mismo que una clínica, un taller o una tienda. Hay
            proyectos que necesitan algo sencillo y otros algo construido alrededor de cómo
            funciona el negocio.
          </p>
          <aside
            className="mt-8 max-w-[48ch] rounded-sm border border-violet-500/12 bg-violet-500/3 px-4 py-3.5 shadow-[0_8px_32px_-24px_rgba(80,50,200,0.35)] sm:px-5 sm:py-4"
            aria-label="Presencial en Valladolid"
          >
            <p className="text-[14px] leading-[1.65] text-zinc-400 sm:text-[15px] sm:leading-[1.7]">
              Si estás en Valladolid, podemos sentarnos y hablarlo tranquilamente.
            </p>
          </aside>
        </FadeIn>
      </section>

      {/* Precios — fondo más claro, dos columnas */}
      <section
        className="relative z-10 overflow-x-clip border-t border-white/5"
        aria-labelledby="pricing-editorial-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: FAQ_SURFACE }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 18% 20%, rgba(80, 50, 200, 0.06), transparent 42%), radial-gradient(circle at 82% 78%, rgba(0, 200, 255, 0.04), transparent 40%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="relative py-12 sm:py-14 lg:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 hidden h-full w-px bg-white/8 lg:block"
              style={{ left: "calc(46% + 0.125rem)" }}
            />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[46fr_54fr] lg:gap-x-12 xl:gap-x-14">
              <FadeIn className="min-w-0 lg:pr-2">
                <h1
                  id="pricing-editorial-heading"
                  className="text-[clamp(1.25rem,2.8vw,1.55rem)] font-medium leading-tight tracking-[-0.02em] text-zinc-100"
                >
                  Lo importante no es cuánto vale crear una página web.
                </h1>
                <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-zinc-400 sm:text-base sm:leading-[1.85]">
                  <p>
                    Lo importante es construir algo que tenga sentido para quien lo va a usar.
                  </p>
                  <p>
                    Hay negocios que necesitan empezar con algo sencillo y otros que necesitan
                    algo más construido alrededor de cómo trabajan cada día.
                  </p>
                  <p>
                    Prefiero explicar qué merece la pena antes que llenar un presupuesto con
                    cosas que probablemente nunca vas a necesitar.
                  </p>
                </div>
                <p className="mt-6 text-sm italic leading-relaxed text-zinc-500 sm:text-[15px]">
                  Sin extras raros. Sin costes sorpresa.
                </p>
              </FadeIn>

              <FadeIn delay={0.06} className="min-w-0">
                <div className="flex flex-col gap-3">
                  {PRICING_TIERS.map((tier, index) => (
                    <PricingTierBlock
                      key={tier.name}
                      name={tier.name}
                      price={tier.price}
                      summary={tier.summary}
                      features={tier.features}
                      isOpen={openIndex === index}
                      onToggle={() => handleToggle(index)}
                    />
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Manifiesto — como antes, sin rectángulo contenedor; fondo web */}
      <section
        className="relative z-10 overflow-hidden border-t border-white/4 bg-[#070b13]"
        aria-labelledby="pricing-manifesto-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              linear-gradient(165deg,
                rgba(45, 32, 82, 0.14) 0%,
                rgba(28, 42, 78, 0.1) 32%,
                rgba(10, 14, 22, 0.95) 68%,
                #070b13 100%
              )
            `,
          }}
        />

        <FadeIn className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
          <div className="relative text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 h-44 w-[min(100%,26rem)] -translate-x-1/2 rounded-full blur-[80px]"
              style={{ background: "rgba(100, 70, 180, 0.12)" }}
            />

            <div className="relative mx-auto w-fit max-w-full">
              <h2
                id="pricing-manifesto-heading"
                className="font-serif text-[clamp(1.65rem,4.5vw,2.25rem)] font-normal leading-[1.18] tracking-[-0.03em]"
              >
                <span className="text-zinc-500">No todo </span>
                <span className="text-[#F3F1EB]/72">tiene sentido para todos.</span>
              </h2>
              <ManifestoHeadlineAccentBar />
            </div>

            <div className="relative mx-auto mt-10 max-w-[48ch] space-y-6 text-[15px] leading-[1.85] sm:text-base sm:leading-[1.9]">
              <p>
                <span className="text-violet-200/75">
                  Hay proyectos que pueden resolverse con algo sencillo
                </span>
                <span className="text-zinc-400">
                  {" "}
                  y otros necesitan más trabajo detrás.
                </span>
              </p>
              <p>
                <span className="text-violet-200/75">
                  Mi trabajo consiste en explicarte qué tiene sentido para tu caso
                </span>
                <span className="text-zinc-500">
                  {" "}
                  y construir algo que puedas mantener y hacer crecer con el tiempo.
                </span>
              </p>
            </div>
          </div>

          <div className="relative mt-10 flex justify-center sm:mt-12">
            <button type="button" onClick={handlePrimaryCta} className={ctaButtonClass}>
              Hablemos de tu proyecto
            </button>
          </div>
        </FadeIn>
      </section>

      {/* Claridad — fondo más claro; negrita + cursiva */}
      <section
        className="relative z-10 overflow-x-clip border-t border-white/5"
        aria-labelledby="pricing-clarity-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: FAQ_SURFACE }}
        />

        <FadeIn className="relative mx-auto w-full max-w-xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-200">
            Los precios son orientativos.
          </p>
          <h2 id="pricing-clarity-heading" className="sr-only">
            Aclaración sobre precios
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[14px] leading-[1.75] text-zinc-400 sm:text-[15px] sm:leading-[1.8]">
            Cada negocio funciona de forma distinta. Algunos proyectos necesitan menos trabajo
            detrás y otros algo más construido a medida.
          </p>
          <p className="mx-auto mt-4 max-w-[40ch] text-[14px] leading-[1.75] text-zinc-400 sm:text-[15px]">
            Si veo que algo puede resolverse de una forma más sencilla, te lo diré.
          </p>
          <p className="mx-auto mt-8 text-xs italic leading-relaxed text-zinc-700 sm:text-sm">
            Sin extras raros. Sin costes sorpresa.
          </p>
        </FadeIn>
      </section>
    </div>
  );
}
