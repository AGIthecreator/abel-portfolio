"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useId, useState } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import Image from "next/image";
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

const TEMPLATE_DEMOS = [
  {
    name: "Comercio Local",
    description: "Plantilla preparada para comercios y negocios de proximidad.",
    href: "https://commerce.agithecreator.com",
    image: "/templates/commerce.webp",
  },
  {
    name: "Clínica",
    description: "Diseñada para consultas, clínicas y centros sanitarios.",
    href: "https://clinic.agithecreator.com",
    image: "/templates/clinic.webp",
  },
  {
    name: "Restaurante",
    description: "Pensada para restaurantes, cafeterías y hostelería.",
    href: "https://restaurant.agithecreator.com",
    image: "/templates/restaurant.webp",
  },
  {
    name: "Legal",
    description: "Creada para despachos y profesionales jurídicos.",
    href: "https://legal.agithecreator.com",
    image: "/templates/legal.webp",
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

function FeatureMark() {
  return (
    <span
      className="inline-flex shrink-0 items-center font-mono text-[13px] font-normal leading-none text-[#070b13]/45"
      aria-hidden
    >
      &gt;
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
        className="group flex w-full items-start gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F1EB] sm:gap-3.5 sm:px-5 sm:py-4"
      >
        <TierChevron isOpen={isOpen} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-x-3 gap-y-1">
            <span
              className="text-[clamp(1.2rem,2.8vw,1.45rem)] font-semibold leading-tight tracking-[-0.02em]"
              style={{ color: PLAN_NAME }}
            >
              {name}
            </span>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#070b13]/55 sm:text-[14px]">
              {price}
            </span>
          </span>
          <span className="mt-1.5 block text-[12px] leading-snug text-[#070b13]/40 sm:text-[13px]">
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

/** Barra editorial bajo el titular de plantillas (violeta + blanco). */
function TemplateHeadlineAccentBar() {
  return (
    <div
      aria-hidden
      className="mt-3 flex h-1.5 w-[80%] max-w-full overflow-hidden sm:mt-3.5 sm:h-2"
    >
      <span className="h-full w-[80%] shrink-0 bg-violet-400/80" />
      <span className="h-full w-[20%] shrink-0 bg-[#F3F1EB]" />
    </div>
  );
}

function TemplateDemoCard({
  name,
  description,
  href,
  image,
}: {
  name: string;
  description: string;
  href: string;
  image: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131b2a]"
    >
      <div className="relative aspect-16/10 overflow-hidden border border-white/8 bg-[#070b13] shadow-[0_18px_44px_-28px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] duration-400 ease-out group-hover:border-violet-400/20 group-hover:shadow-[0_22px_52px_-26px_rgba(80,50,200,0.22)]">
        <Image
          src={image}
          alt={`Vista previa de la plantilla ${name}`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover object-top saturate-[0.94] transition-[filter,transform] duration-500 ease-out group-hover:saturate-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0c121c] via-[#0c121c]/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 12% 18%, rgba(80, 50, 200, 0.12), transparent 48%), radial-gradient(circle at 88% 82%, rgba(0, 200, 255, 0.08), transparent 42%)",
          }}
        />
        <span
          aria-hidden
          className="absolute top-0 left-0 h-full w-px bg-linear-to-b from-violet-300/50 via-violet-400/15 to-cyan-300/25 opacity-70"
        />
      </div>

      <div className="mt-3.5 flex flex-1 flex-col gap-2 border-t border-white/6 pt-3.5 sm:mt-4 sm:pt-4">
        <h3 className="font-serif text-[1.05rem] font-normal leading-snug tracking-[-0.02em] text-[#F3F1EB] sm:text-[1.12rem]">
          {name}
        </h3>
        <p className="flex-1 text-[12px] leading-[1.65] text-zinc-500 sm:text-[13px] sm:leading-[1.7]">
          {description}
        </p>
        <span className="inline-flex items-center gap-2 pt-0.5 font-mono text-[11px] leading-none text-violet-200/55 transition-colors duration-200 group-hover:text-violet-200/90 sm:text-[12px]">
          <span aria-hidden className="text-zinc-600 transition-colors group-hover:text-violet-300/75">
            &gt;
          </span>
          Ver demo
        </span>
      </div>
    </a>
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
      {/* Hero — dos columnas, compacto */}
      <section
        className="relative z-10 bg-[#070b13] px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28 lg:px-10 lg:pb-12 lg:pt-32"
        aria-labelledby="pricing-hero-heading"
      >
        <FadeIn className="relative mx-auto w-full max-w-6xl">
          <h1
            id="pricing-hero-heading"
            className="text-center font-serif text-[clamp(2.35rem,6.5vw,3.85rem)] font-normal leading-[1.04] tracking-[-0.038em] text-[#f2f0ec]"
          >
            <span className="block">Lo importante</span>
            <span className="block">no es cuánto cuesta una web.</span>
          </h1>

          <div className="mx-auto mt-6 w-full max-w-184 sm:mt-8 lg:max-w-216">
            <div className="grid grid-cols-1 items-center gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8 lg:gap-y-0">
              <div className="min-w-0 text-left">
                <p
                  className="max-w-[44ch] text-[clamp(1.05rem,2.4vw,1.35rem)] font-medium leading-[1.32] tracking-[-0.02em] text-zinc-200"
                  role="doc-subtitle"
                >
                  Lo importante es construir algo que tenga sentido para quien lo va a usar.
                </p>

                <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.8] text-zinc-400 sm:text-base sm:leading-[1.85]">
                  Hay proyectos que pueden resolverse con algo sencillo y otros que necesitan más
                  trabajo detrás. Mi trabajo es explicarte qué tiene sentido para tu caso.
                </p>

                <p className="mt-4 max-w-[48ch] text-sm italic leading-relaxed text-zinc-500 sm:text-[15px]">
                  Sin extras raros. Sin costes sorpresa.
                </p>
              </div>

              <div className="flex w-fit shrink-0 justify-center self-center lg:justify-end">
                <Image
                  src="/logos/mascot-pricing.webp"
                  alt=""
                  width={640}
                  height={560}
                  quality={85}
                  priority
                  sizes="(max-width: 1023px) 400px, 448px"
                  className="h-auto w-[min(100%,25rem)] max-w-full object-contain object-center sm:w-84 lg:w-92"
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Precios — fondo más claro, dos columnas */}
      <section
        className="relative z-10"
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

            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[46fr_54fr] lg:items-center lg:gap-x-12 xl:gap-x-14">
              <FadeIn className="min-w-0 lg:pr-2 lg:py-2">
                <h2
                  id="pricing-editorial-heading"
                  className="font-serif text-[clamp(1.25rem,2.8vw,1.55rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
                >
                  Elegir quién va a construir una web también forma parte del proyecto.
                </h2>
                <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-zinc-300 sm:text-base sm:leading-[1.85]">
                  <p>
                    Hay páginas hechas para estar publicadas y otras pensadas para acompañar cómo
                    funciona un negocio de verdad.
                  </p>
                  <p>
                    Por eso prefiero trabajar pocos proyectos y construirlos bien, en lugar de
                    hacer diez iguales cambiando colores y un logo.
                  </p>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                  Si estás en Valladolid, podemos sentarnos y hablarlo tranquilamente.
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

      {/* Plantillas — alternativa secundaria, mismo bloque visual que precios */}
      <section
        className="relative z-10 border-t border-white/5"
        aria-labelledby="pricing-templates-heading"
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

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-12 sm:pb-14 lg:px-10 lg:pt-14 lg:pb-16">
          <FadeIn>
            <div className="w-fit max-w-full">
              <h2
                id="pricing-templates-heading"
                className="font-serif text-[clamp(1.25rem,2.8vw,1.55rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
              >
                ¿Necesitas algo más sencillo?
              </h2>
              <TemplateHeadlineAccentBar />
            </div>
            <p className="mt-5 max-w-[650px] text-[15px] leading-[1.8] sm:text-base sm:leading-[1.85]">
              <span className="text-violet-200/75">
                No todos los negocios necesitan una web hecha desde cero.
              </span>{" "}
              <span className="text-zinc-400">
                Si buscas una solución más rápida y económica, también dispongo de plantillas
                profesionales listas para adaptar a tu negocio.
              </span>
            </p>

            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-9 lg:mt-11 lg:grid-cols-4 lg:gap-x-4">
              {TEMPLATE_DEMOS.map((demo) => (
                <TemplateDemoCard key={demo.name} {...demo} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Manifiesto — mismo fondo plano que el hero */}
      <section
        className="relative z-10 overflow-hidden bg-[#070b13]"
        aria-labelledby="pricing-manifesto-heading"
      >
        <FadeIn className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
          <div className="relative text-center">
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

      {/* Claridad */}
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
          <h2
            id="pricing-clarity-heading"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
          >
            <span className="text-[#F3F1EB]">Los precios </span>
            <span className="text-violet-300/85">son orientativos.</span>
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
