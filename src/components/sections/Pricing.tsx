"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { trackEvent } from "@/lib/analytics";
import {
  MAINTENANCE_OFFER,
  OFFER_EXTRAS_LABELS,
  OFFER_GUARANTEE_NOTE,
  OFFER_INFRA_NOTE,
  OFFER_SCOPE_NOTE,
  PRICING_FAQ_GROUPS,
  PRODUCTS,
  TEMPLATES_CONTEXT,
  formatEurAmount,
  type Product,
  type ProductId,
} from "@/lib/commerce";

const BONE = "#F3F1EB";
const MANIFESTO_BAR_GRAY = "#5a5f6b";
const SECTION_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 52%, #0c121c 100%)";

const WEB_ORDER: ProductId[] = ["entrada", "profesional", "a-medida"];

const QUOTE_LINKS: Record<ProductId, { href: string; cta: string }> = {
  entrada: {
    href: "/presupuesto?servicio=entrada",
    cta: "Empezar con esta web",
  },
  profesional: {
    href: "/presupuesto?servicio=profesional",
    cta: "Preparar esta web",
  },
  "a-medida": {
    href: "/presupuesto?servicio=a-medida",
    cta: "Plantear el proyecto",
  },
  sistemas: {
    href: "/presupuesto?servicio=sistemas",
    cta: "Configurar un flujo",
  },
};

const TEMPLATE_DEMOS = [
  {
    name: "Comercio local",
    description: "Referencia visual para comercios y negocios de proximidad.",
    href: "https://commerce.agithecreator.com",
    image: "/templates/commerce.webp",
  },
  {
    name: "Clínica",
    description: "Referencia visual para consultas, clínicas y centros sanitarios.",
    href: "https://clinic.agithecreator.com",
    image: "/templates/clinic.webp",
  },
  {
    name: "Restaurante",
    description: "Referencia visual para restaurantes, cafeterías y hostelería.",
    href: "https://restaurant.agithecreator.com",
    image: "/templates/restaurant.webp",
  },
  {
    name: "Legal",
    description: "Referencia visual para despachos y profesionales jurídicos.",
    href: "https://legal.agithecreator.com",
    image: "/templates/legal.webp",
  },
] as const;

const ctaButtonClass =
  "inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md border border-[#F3F1EB]/15 bg-[#F3F1EB] px-8 py-3.5 text-[14px] font-semibold tracking-[-0.01em] text-[#070b13] shadow-[0_12px_40px_-18px_rgba(243,241,235,0.35)] transition-[background-color,transform,box-shadow,border-color] duration-300 hover:border-white/25 hover:bg-white hover:-translate-y-px hover:shadow-[0_16px_44px_-16px_rgba(243,241,235,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] sm:max-w-sm sm:px-10 sm:text-[15px]";

const ctaButtonPremiumClass =
  "group relative inline-flex min-h-14 w-full max-w-md items-center justify-center overflow-hidden rounded-md border border-violet-300/25 bg-[#F3F1EB] px-12 py-5 text-[15px] font-semibold tracking-[-0.015em] text-[#070b13] shadow-[0_20px_60px_-22px_rgba(243,241,235,0.5),0_0_0_1px_rgba(243,241,235,0.08)] transition-[background-color,transform,box-shadow,border-color] duration-300 hover:border-violet-300/40 hover:bg-white hover:-translate-y-1 hover:shadow-[0_28px_70px_-20px_rgba(243,241,235,0.55),0_0_40px_-12px_rgba(139,92,246,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] sm:min-h-16 sm:px-14 sm:text-[17px]";

/**
 * Franjas del resto del sitio: gris #12151f, morado #251c49 y violeta #3a2d6b.
 */
function DiagonalStripes({
  variant,
}: {
  variant: "hero" | "mirror" | "continue";
}) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [heroH, setHeroH] = useState(0);
  const [bandH, setBandH] = useState(0);
  const [mirrorH, setMirrorH] = useState(0);
  const [continueH, setContinueH] = useState(0);

  useLayoutEffect(() => {
    const hero = document.querySelector(".pricing-hero");
    if (!hero) return;
    const measure = () => setHeroH((hero as HTMLElement).offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const measure = () => setBandH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (variant === "hero") return;

    const measurePrev = () => {
      const self = bandRef.current;
      const all = Array.from(document.querySelectorAll<HTMLElement>("[data-pricing-stripe]"));
      const before = self
        ? all.filter(
            (el) =>
              el !== self &&
              !!(el.compareDocumentPosition(self) & Node.DOCUMENT_POSITION_FOLLOWING),
          )
        : all;
      const prevMirror = [...before].reverse().find((el) => el.dataset.pricingStripe === "mirror");
      const prevContinue = [...before].reverse().find((el) => el.dataset.pricingStripe === "continue");
      setMirrorH(prevMirror?.offsetHeight ?? 0);
      setContinueH(variant === "mirror" ? (prevContinue?.offsetHeight ?? 0) : 0);
    };

    measurePrev();
    const ro = new ResizeObserver(measurePrev);
    document.querySelectorAll("[data-pricing-stripe]").forEach((el) => ro.observe(el));
    const page = document.querySelector(".pricing-hero")?.parentElement;
    if (page) ro.observe(page);
    window.addEventListener("resize", measurePrev);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measurePrev);
    };
  }, [variant]);

  const hHero = Math.max(heroH, 1);
  const ratio = bandH > 0 ? bandH / hHero : 1;
  const ratioMirror = mirrorH > 0 ? mirrorH / hHero : 1;
  const ratioContinue = continueH > 0 ? continueH / hHero : 0;
  const run = Math.min(18 * ratio, 26);
  const runMirror = Math.min(18 * ratioMirror, 26);
  const runContinue = Math.min(18 * ratioContinue, 26);
  const clamp = (n: number) => Math.max(10, Math.min(90, n));
  const fmt = (n: number) => clamp(n).toFixed(2);

  let g0: number;
  let g1: number;
  if (variant === "hero") {
    g0 = 63;
    g1 = 63 - run;
  } else if (variant === "mirror") {
    g0 = continueH > 0 ? 45 + runMirror - runContinue : 45;
    g1 = g0 + run;
  } else {
    g0 = 45 + runMirror;
    g1 = g0 - run;
  }

  const shift = 16;
  const thin = 3;
  const gray = `polygon(${fmt(g0)}% 0, 100% 0, 100% 100%, ${fmt(g1)}% 100%)`;
  const purple = `polygon(${fmt(g0 + shift)}% 0, 100% 0, 100% 100%, ${fmt(g1 + shift)}% 100%)`;
  const violet = `polygon(${fmt(g0 + shift)}% 0, ${fmt(g0 + shift + thin)}% 0, ${fmt(g1 + shift + thin)}% 100%, ${fmt(g1 + shift)}% 100%)`;

  return (
    <div
      ref={bandRef}
      data-pricing-stripe={variant}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#12151f]" style={{ clipPath: gray }} />
      <div className="absolute inset-0 bg-[#251c49]" style={{ clipPath: purple }} />
      <div className="absolute inset-0 bg-[#3a2d6b]/55" style={{ clipPath: violet }} />
    </div>
  );
}

function SectionGradient() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: SECTION_SURFACE }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(80, 50, 200, 0.08), transparent 42%), radial-gradient(circle at 82% 80%, rgba(0, 200, 255, 0.04), transparent 38%)",
        }}
      />
    </>
  );
}

function AccentBar({ variant = "bone" }: { variant?: "bone" | "violet" }) {
  return (
    <div aria-hidden className="mt-3 flex h-1.5 w-[min(80%,14rem)] max-w-full overflow-hidden sm:mt-3.5 sm:h-2">
      <span
        className={`h-full w-[80%] shrink-0 ${variant === "violet" ? "bg-violet-400/80" : ""}`}
        style={variant === "bone" ? { backgroundColor: MANIFESTO_BAR_GRAY } : undefined}
      />
      <span className="h-full w-[20%] shrink-0" style={{ backgroundColor: BONE }} />
    </div>
  );
}

function webProducts(): Product[] {
  return WEB_ORDER.map((id) => PRODUCTS.find((product) => product.id === id)).filter(
    (product): product is Product => Boolean(product),
  );
}

function PriceBlock({
  amount,
  previous,
  from,
  perMonth,
  featured,
  align = "end",
  compact = false,
}: {
  amount: number;
  previous?: number;
  from?: boolean;
  perMonth?: boolean;
  featured?: boolean;
  align?: "start" | "end";
  compact?: boolean;
}) {
  const end = align === "end";
  return (
    <div className={end ? "text-left sm:text-right" : "text-left"}>
      {previous != null ? (
        <p className={`text-[13px] font-medium tabular-nums ${featured ? "text-red-600" : "text-red-400"}`}>
          <span className="sr-only">Precio anterior: </span>
          <span className="line-through decoration-current">{formatEurAmount(previous)}</span>
        </p>
      ) : (
        <p className="select-none text-[13px] text-transparent" aria-hidden>
          —
        </p>
      )}
      {from ? (
        <p
          className={`mt-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
            featured ? "text-[#070b13]/50" : "text-zinc-500"
          }`}
        >
          Desde
        </p>
      ) : null}
      <p className={`mt-1 flex flex-wrap items-baseline gap-x-2 ${end ? "sm:justify-end" : ""}`}>
        <span className="sr-only">Precio actual: </span>
        <span
          className={`font-serif font-normal tabular-nums tracking-[-0.04em] ${
            featured
              ? "text-[clamp(3.4rem,6vw,5.4rem)] leading-none text-[#070b13]"
              : compact
                ? "text-[clamp(2rem,4vw,2.5rem)] leading-none text-[#F3F1EB]"
                : "text-[clamp(2.6rem,5vw,3.6rem)] leading-none text-[#F3F1EB]"
          }`}
        >
          {formatEurAmount(amount).replace(" €", "")}
        </span>
        <span
          className={`font-serif text-[1.35rem] ${featured ? "text-[#070b13]" : "text-[#F3F1EB]"}`}
        >
          €{perMonth ? <span className="text-[0.95rem]">/mes</span> : null}
        </span>
      </p>
      <p
        className={`mt-1 font-mono text-[11px] uppercase tracking-[0.16em] ${
          featured ? "text-[#070b13]/55" : "text-zinc-500"
        }`}
      >
        + IVA
      </p>
    </div>
  );
}

function DetailGroups({
  includes,
  conditions,
  featured,
}: {
  includes: readonly string[];
  conditions: readonly string[];
  featured?: boolean;
}) {
  const ink = featured ? "text-[#070b13]/80" : "text-zinc-400";
  const label = featured ? "text-[#070b13]/45" : "text-zinc-500";
  const rule = featured ? "border-[#070b13]/10" : "border-white/10";

  return (
    <div className={`mt-6 grid gap-6 border-t pt-5 sm:grid-cols-2 ${rule}`}>
      <div>
        <h4 className={`font-mono text-[10px] uppercase tracking-[0.16em] ${label}`}>
          Qué incluye este alcance
        </h4>
        <ul className={`mt-3 space-y-2 text-[14px] leading-relaxed ${ink}`}>
          {includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className={`font-mono text-[10px] uppercase tracking-[0.16em] ${label}`}>
          Condiciones
        </h4>
        <ul className={`mt-3 space-y-2 text-[14px] leading-relaxed ${ink}`}>
          {conditions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IncludeToggle({
  open,
  onToggle,
  controls,
  featured,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className={`mt-4 text-left text-[13px] underline decoration-transparent underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
        featured
          ? "text-[#070b13]/60 hover:text-[#070b13] hover:decoration-[#070b13]/30"
          : "text-zinc-500 hover:text-zinc-200 hover:decoration-white/30"
      }`}
    >
      {open ? "Ocultar detalle" : "Ver qué incluye"}
    </button>
  );
}

function WebOffer({
  product,
  open,
  onToggle,
}: {
  product: Product;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const featured = product.id === "profesional";
  const link = QUOTE_LINKS[product.id];

  const go = () => {
    trackEvent("pricing_cta", {
      location: "precios",
      destination: "presupuesto",
      product: product.id,
    });
  };

  return (
    <article
      className={
        featured
          ? "relative overflow-hidden rounded-2xl bg-[#F3F1EB] px-5 py-10 text-[#070b13] shadow-[0_24px_60px_-28px_rgba(42,36,56,0.65)] ring-1 ring-violet-400/30 sm:px-8 sm:py-12 lg:px-12 lg:py-14"
          : "relative overflow-hidden rounded-2xl border border-violet-400/20 bg-[#101624]/80 px-5 py-8 shadow-[0_18px_40px_-32px_rgba(80,50,200,0.45)] sm:px-7 sm:py-9"
      }
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${featured ? "bg-[#3a2d6b]" : "bg-violet-400/70"}`}
      />
      <div
        className={`grid items-start gap-8 lg:items-center ${
          featured ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.7fr)]" : "lg:grid-cols-[minmax(0,1fr)_16rem]"
        }`}
      >
        <div className="min-w-0">
          <h3
            className={`font-serif font-normal tracking-[-0.035em] ${
              featured
                ? "text-[clamp(2.1rem,4vw,3.15rem)] leading-[1.02] text-[#070b13]"
                : "text-[clamp(1.7rem,3vw,2.25rem)] leading-[1.08] text-[#F3F1EB]"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`mt-4 max-w-[38ch] text-[16px] leading-relaxed ${
              featured ? "text-[#070b13]/75" : "text-zinc-300"
            }`}
          >
            {product.summary}
          </p>
          <p
            className={`mt-3 max-w-[40ch] text-[14px] leading-relaxed ${
              featured ? "text-[#070b13]/55" : "text-zinc-500"
            }`}
          >
            {product.suitedFor}
          </p>
          <div className="mt-6 lg:hidden">
            <PriceBlock
              amount={product.publicFromEur}
              previous={product.previousPublicEur}
              from={product.priceIsFrom}
              featured={featured}
              align="start"
            />
            {product.priceIsFrom ? (
              <p className={`mt-3 text-[13px] leading-relaxed ${featured ? "text-[#070b13]/50" : "text-zinc-500"}`}>
                Punto de partida de este alcance.
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={link.href}
              onClick={go}
              className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 text-[14px] font-semibold tracking-[-0.01em] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ${
                featured
                  ? "bg-[#2a2438] text-[#F3F1EB] shadow-[0_12px_32px_-18px_rgba(42,36,56,0.7)] hover:bg-[#141a27]"
                  : "border border-[#F3F1EB]/15 bg-[#F3F1EB] text-[#070b13] shadow-[0_12px_40px_-18px_rgba(243,241,235,0.35)] hover:bg-white"
              }`}
            >
              {link.cta}
            </Link>
            <IncludeToggle
              open={open}
              onToggle={onToggle}
              controls={panelId}
              featured={featured}
            />
          </div>
        </div>
        <div className="hidden lg:block">
          <PriceBlock
            amount={product.publicFromEur}
            previous={product.previousPublicEur}
            from={product.priceIsFrom}
            featured={featured}
          />
          {product.priceIsFrom ? (
            <p
              className={`mt-3 text-[13px] leading-relaxed sm:text-right ${
                featured ? "text-[#070b13]/50" : "text-zinc-500"
              }`}
            >
              Punto de partida de este alcance.
            </p>
          ) : null}
        </div>
      </div>
      <div id={panelId} role="region" aria-label={`Qué incluye ${product.name}`} hidden={!open}>
        {open ? (
          <DetailGroups
            includes={product.publicDetail.includes}
            conditions={product.publicDetail.conditions}
            featured={featured}
          />
        ) : null}
      </div>
    </article>
  );
}

function ComplementOffer({
  kicker,
  name,
  summary,
  audience,
  amount,
  previous,
  from,
  perMonth,
  note,
  href,
  cta,
  includes,
  conditions,
  open,
  onToggle,
  productId,
}: {
  kicker: string;
  name: string;
  summary: string;
  audience: string;
  amount: number;
  previous?: number;
  from?: boolean;
  perMonth?: boolean;
  note?: string;
  href: string;
  cta: string;
  includes: readonly string[];
  conditions: readonly string[];
  open: boolean;
  onToggle: () => void;
  productId: string;
}) {
  const panelId = useId();

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101624]/55 px-5 py-8 sm:px-6">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-300/50 to-transparent" />
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">{kicker}</p>
      <h3 className="mt-3 font-serif text-[1.65rem] font-normal tracking-[-0.03em] text-[#F3F1EB]">
        {name}
      </h3>
      <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-zinc-300">{summary}</p>
      <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-zinc-500">{audience}</p>
      <div className="mt-6">
        <PriceBlock
          amount={amount}
          previous={previous}
          from={from}
          perMonth={perMonth}
          compact
          align="start"
        />
      </div>
      {note ? <p className="mt-3 max-w-[36ch] text-[13px] leading-relaxed text-zinc-500">{note}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={href}
          onClick={() =>
            trackEvent("pricing_cta", {
              location: "precios",
              destination: "presupuesto",
              product: productId,
            })
          }
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-violet-300/25 bg-[#F3F1EB] px-5 text-[14px] font-semibold text-[#070b13] shadow-[0_12px_40px_-18px_rgba(243,241,235,0.28)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
        >
          {cta}
        </Link>
        <IncludeToggle open={open} onToggle={onToggle} controls={panelId} />
      </div>
      <div id={panelId} role="region" aria-label={`Qué incluye ${name}`} hidden={!open}>
        {open ? <DetailGroups includes={includes} conditions={conditions} /> : null}
      </div>
    </article>
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
      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131b2a]"
    >
      <div className="relative aspect-16/10 overflow-hidden border border-white/8 bg-[#070b13] shadow-[0_14px_36px_-26px_rgba(0,0,0,0.85)] transition-[border-color,box-shadow] duration-400 ease-out group-hover:border-violet-400/20">
        <Image
          src={image}
          alt={`Vista previa de referencia: ${name}`}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover object-top saturate-[0.94] transition-[filter] duration-500 ease-out group-hover:saturate-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0c121c] via-[#0c121c]/25 to-transparent"
        />
      </div>
      <div className="mt-3.5 border-t border-white/6 pt-3.5">
        <h3 className="font-serif text-[1.05rem] font-normal leading-snug tracking-[-0.02em] text-[#F3F1EB] sm:text-[1.12rem]">
          {name}
        </h3>
        <p className="mt-2 text-[12px] leading-[1.65] text-zinc-500 sm:text-[13px]">{description}</p>
        <span className="mt-2 inline-flex items-center gap-2 font-mono text-[11px] text-violet-200/55 transition-colors group-hover:text-violet-200/90">
          <span aria-hidden className="text-zinc-600 group-hover:text-violet-300/75">
            &gt;
          </span>
          Ver referencia
        </span>
      </div>
    </a>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <article className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full items-center gap-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:py-3.5"
      >
        <span
          aria-hidden
          className={`flex size-6 shrink-0 items-center justify-center rounded-sm border border-white/10 font-mono text-[10px] text-zinc-500 transition-transform sm:size-7 ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          &gt;
        </span>
        <span className="text-[13.5px] font-medium text-zinc-100 sm:text-[15px]">{question}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Respuesta: ${question}`}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-[62ch] pb-3.5 pl-9 text-[13px] leading-[1.7] text-zinc-400 sm:pb-4 sm:pl-10 sm:text-[14px] sm:leading-[1.75]">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function Pricing() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const webs = webProducts();
  const sistemas = PRODUCTS.find((product) => product.id === "sistemas");

  const toggle = (id: string) => {
    setOpenId((current) => {
      const next = current === id ? null : id;
      if (next) trackEvent("pricing_product_view", { product: id });
      return next;
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070b13] text-zinc-300">
      <section
        className="pricing-hero relative z-10 overflow-x-clip bg-[#070b13] px-5 pb-7 pt-[6.75rem] sm:px-6 sm:pb-10 sm:pt-28 lg:overflow-y-hidden lg:px-10 lg:pb-10 lg:pt-28"
        aria-labelledby="pricing-hero-heading"
      >
        <DiagonalStripes variant="hero" />
        <div aria-hidden className="pricing-hero-grain pointer-events-none absolute inset-0 z-1 opacity-[0.045]" />
        <FadeIn className="relative z-10 mx-auto w-full max-w-6xl">
          <h1
            id="pricing-hero-heading"
            className="text-center font-serif text-[clamp(1.75rem,5.2vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.038em] text-[#f2f0ec]"
          >
            <span className="block">Webs y sistemas </span>
            <span className="mt-1 block text-zinc-400">con alcance claro.</span>
          </h1>
          <div className="mx-auto mt-5 w-full max-w-184 sm:mt-6 lg:mt-3 lg:max-w-216 lg:-translate-y-8">
            <div className="mx-auto grid w-fit max-w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 sm:gap-x-5 lg:gap-x-10">
              <div className="min-w-0 self-center text-left sm:self-end lg:-translate-y-2 xl:-translate-y-3">
                <p
                  className="max-w-[18ch] text-[clamp(0.95rem,2.8vw,1.35rem)] font-medium leading-[1.35] tracking-[-0.02em] text-zinc-200 sm:max-w-[36ch] lg:max-w-[44ch] lg:leading-[1.32]"
                  role="doc-subtitle"
                >
                  Desde una web sencilla hasta automatizaciones que quitan trabajo repetido.
                </p>
                <p className="mt-3 hidden max-w-[48ch] text-[15px] leading-[1.8] text-zinc-400 sm:mt-4 sm:block sm:text-base sm:leading-[1.85]">
                  Trabajo desde Valladolid con negocios de toda España. Los precios son orientativos: el presupuesto se cierra cuando el alcance está claro.
                </p>
                <p className="mt-2.5 max-w-[18ch] text-[12.5px] italic leading-relaxed text-zinc-500 sm:mt-4 sm:max-w-[48ch] sm:text-[15px]">
                  Sin humo. Sin “todo incluido” eterno.
                </p>
              </div>
              <div className="flex w-fit shrink-0 items-end justify-end self-end">
                <Image
                  src="/logos/mascot-pricing.webp"
                  alt=""
                  width={640}
                  height={560}
                  quality={85}
                  priority
                  sizes="(max-width: 639px) 160px, (max-width: 1023px) 200px, 448px"
                  className="pricing-hero-mascot h-auto w-[9.3rem] max-w-full object-contain object-bottom sm:w-[12.5rem] lg:w-92 lg:translate-y-4"
                />
              </div>
              <div className="col-span-2 mt-6 flex justify-center sm:mt-8 lg:mt-12">
                <Link
                  href="/presupuesto"
                  onClick={() =>
                    trackEvent("pricing_cta", {
                      location: "precios",
                      destination: "presupuesto",
                      product: "none",
                    })
                  }
                  className={ctaButtonClass}
                >
                  Configurar mi proyecto
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <section aria-labelledby="pricing-webs-heading" className="relative z-10 -mt-px">
        <SectionGradient />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h2 id="pricing-webs-heading" className="sr-only">
          Servicios web
        </h2>
        <div className="flex flex-col gap-4 sm:gap-5">
          {webs.map((product) => (
            <WebOffer
              key={product.id}
              product={product}
              open={openId === product.id}
              onToggle={() => toggle(product.id)}
            />
          ))}
        </div>
        </div>

      <section
        aria-labelledby="pricing-complements-heading"
        className="relative mx-auto mt-8 w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-10"
      >
        <h2
          id="pricing-complements-heading"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75"
        >
          Complementos
        </h2>
        <AccentBar />
        <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5">
          {sistemas ? (
            <ComplementOffer
              kicker="Automatización"
              name={sistemas.name}
              summary={sistemas.summary}
              audience={sistemas.suitedFor}
              amount={sistemas.publicFromEur}
              from={sistemas.priceIsFrom}
              note="El importe sube con las integraciones y el alcance."
              href={QUOTE_LINKS.sistemas.href}
              cta={QUOTE_LINKS.sistemas.cta}
              includes={sistemas.publicDetail.includes}
              conditions={sistemas.publicDetail.conditions}
              open={openId === sistemas.id}
              onToggle={() => toggle(sistemas.id)}
              productId={sistemas.id}
            />
          ) : null}
          <ComplementOffer
            kicker="Después de publicar"
            name={MAINTENANCE_OFFER.name}
            summary={MAINTENANCE_OFFER.summary}
            audience={MAINTENANCE_OFFER.audience}
            amount={MAINTENANCE_OFFER.priceFromEur}
            previous={MAINTENANCE_OFFER.previousPublicEur}
            perMonth
            note="Cuidado técnico. El desarrollo nuevo va aparte."
            href="/presupuesto?mantenimiento=si"
            cta="Incluir mantenimiento"
            includes={MAINTENANCE_OFFER.includes}
            conditions={[
              MAINTENANCE_OFFER.scopeClarification,
              MAINTENANCE_OFFER.priceNote,
            ]}
            open={openId === "mantenimiento"}
            onToggle={() => toggle("mantenimiento")}
            productId="mantenimiento"
          />
        </div>
      </section>

      </section>

      <section className="relative z-10 -mt-px" aria-labelledby="pricing-scope-heading">
        <SectionGradient />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <FadeIn>
            <h2
              id="pricing-scope-heading"
              className="font-serif text-[clamp(1.2rem,2.6vw,1.5rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
            >
              Alcance, extras e infraestructura
            </h2>
            <AccentBar />
            <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
              {OFFER_SCOPE_NOTE}
            </p>
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
              <p className="text-[14px] leading-[1.7] text-zinc-500 sm:text-[15px]">{OFFER_INFRA_NOTE}</p>
              <p className="text-[14px] leading-[1.7] text-zinc-500 sm:text-[15px]">{OFFER_GUARANTEE_NOTE}</p>
            </div>
            <ul className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {OFFER_EXTRAS_LABELS.map((label) => (
                <li
                  key={label}
                  className="border-l border-violet-400/25 pl-3 text-[13px] leading-snug text-zinc-400 sm:text-[14px]"
                >
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] text-zinc-500">
              Más contexto en{" "}
              <Link href="/desarrollo-web" className="text-zinc-300 underline decoration-violet-400/30 underline-offset-[3px] transition-colors hover:text-zinc-100">
                desarrollo web
              </Link>
              {" y "}
              <Link
                href="/automatizacion-de-procesos"
                className="text-zinc-300 underline decoration-violet-400/30 underline-offset-[3px] transition-colors hover:text-zinc-100"
              >
                automatización
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="relative z-10 -mt-px overflow-hidden bg-[#070b13]" aria-labelledby="pricing-templates-heading">
        <DiagonalStripes variant="continue" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <h2
            id="pricing-templates-heading"
            className="font-serif text-[clamp(1.2rem,2.6vw,1.5rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
          >
            Referencias visuales
          </h2>
          <AccentBar variant="violet" />
          <p className="mt-5 max-w-[40rem] text-[15px] leading-[1.75] text-zinc-400">{TEMPLATES_CONTEXT}</p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATE_DEMOS.map((demo) => (
              <TemplateDemoCard key={demo.name} {...demo} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-px overflow-hidden bg-[#070b13]" aria-labelledby="pricing-faq-heading">
        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 lg:py-16">
          <FadeIn>
          <h2
            id="pricing-faq-heading"
            className="font-serif text-[clamp(1.3rem,2.8vw,1.65rem)] font-normal tracking-[-0.03em] text-[#F3F1EB]"
          >
            Preguntas frecuentes
          </h2>
          <AccentBar />
          <div className="mt-8 space-y-8">
            {PRICING_FAQ_GROUPS.map((group) => (
              <div key={group.id}>
                <h3 className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300/65">
                  {group.title}
                </h3>
                <div className="border-t border-white/10">
                  {group.items.map((item) => {
                    const key = `${group.id}:${item.q}`;
                    return (
                      <FaqItem
                        key={key}
                        question={item.q}
                        answer={item.a}
                        isOpen={openFaq === key}
                        onToggle={() => setOpenFaq((current) => (current === key ? null : key))}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      <section className="relative z-10 -mt-px overflow-hidden bg-[#070b13]" aria-labelledby="pricing-cta-heading">
        <DiagonalStripes variant="mirror" />
        <FadeIn className="relative z-10 mx-auto w-full max-w-2xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <h2
            id="pricing-cta-heading"
            className="font-serif text-[clamp(1.5rem,3.8vw,2.1rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#F3F1EB]"
          >
            Configura lo que necesita tu negocio
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
            Elige el tipo de proyecto, añade lo que haga falta y verás un total orientativo antes de hablar del detalle.
          </p>
          <div className="mt-10 flex justify-center sm:mt-11">
            <Link
              href="/presupuesto"
              onClick={() =>
                trackEvent("pricing_cta", {
                  location: "precios",
                  destination: "presupuesto",
                  product: "none",
                })
              }
              className={ctaButtonPremiumClass}
            >
              <span className="relative z-10">Ver qué encaja con mi negocio</span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/35 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              />
            </Link>
          </div>
          <p className="mx-auto mt-5 text-xs text-zinc-600 sm:text-sm">
            Los precios del configurador son orientativos hasta confirmar el alcance.
          </p>
        </FadeIn>
      </section>
    </div>
  );
}
