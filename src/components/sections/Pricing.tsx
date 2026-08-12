"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { trackEvent } from "@/lib/analytics";
import {
  MAINTENANCE_OFFER,
  OFFER_EXTRAS,
  OFFER_GUARANTEE_NOTE,
  OFFER_INFRA_NOTE,
  OFFER_SCOPE_NOTE,
  OFFER_TIERS,
  type OfferTier,
} from "@/lib/data/offer";
import {
  PRICING_FAQ_GROUPS,
  TEMPLATES_CONTEXT,
} from "@/lib/commerce/copy";

const BONE = "#F3F1EB";
const MANIFESTO_BAR_GRAY = "#5a5f6b";
/** Panel abierto: mismo familia que el hueso, contraste suave */
const TIER_PANEL = "#EDEBE6";
const PLAN_NAME = "#2a2438";
const INK = "#070b13";

const FAQ_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 52%, #0c121c 100%)";

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

/**
 * Franjas diagonales a altura completa.
 * Misma pendiente que el hero (recorrido 18% de ancho por cada “alto de hero”),
 * para que secciones altas/bajas no cambien la inclinación visual.
 * `flip` espeja el corte para reenganchar con la sección anterior/siguiente.
 */
function DiagonalStripes({ flip = false }: { flip?: boolean }) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [bandHeight, setBandHeight] = useState(0);
  const [heroHeight, setHeroHeight] = useState(0);

  useEffect(() => {
    const hero = document.querySelector(".pricing-hero");
    if (!hero) return;
    const measure = () => setHeroHeight((hero as HTMLElement).offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const measure = () => setBandHeight(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ratio =
    heroHeight > 0 && bandHeight > 0 ? bandHeight / heroHeight : 1;
  const run = 18 * ratio;
  const clamp = (n: number) => Math.max(-5, Math.min(105, n));
  const fmt = (n: number) => clamp(n).toFixed(2);

  // Hero: 63→45, 79→61, 79–82→64–61. Flip: espejo 45→63, etc.
  const gray = flip
    ? `polygon(${fmt(45)}% 0, 100% 0, 100% 100%, ${fmt(45 + run)}% 100%)`
    : `polygon(${fmt(63)}% 0, 100% 0, 100% 100%, ${fmt(63 - run)}% 100%)`;
  const purple = flip
    ? `polygon(${fmt(61)}% 0, 100% 0, 100% 100%, ${fmt(61 + run)}% 100%)`
    : `polygon(${fmt(79)}% 0, 100% 0, 100% 100%, ${fmt(79 - run)}% 100%)`;
  const violet = flip
    ? `polygon(${fmt(61)}% 0, ${fmt(64)}% 0, ${fmt(64 + run)}% 100%, ${fmt(61 + run)}% 100%)`
    : `polygon(${fmt(79)}% 0, ${fmt(82)}% 0, ${fmt(82 - run)}% 100%, ${fmt(79 - run)}% 100%)`;

  return (
    <div
      ref={bandRef}
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: FAQ_SURFACE }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(80, 50, 200, 0.05), transparent 40%), radial-gradient(circle at 82% 82%, rgba(0, 200, 255, 0.03), transparent 38%)",
        }}
      />
    </>
  );
}

function AccentBar({ variant = "bone" }: { variant?: "bone" | "violet" }) {
  return (
    <div
      aria-hidden
      className="mt-3 flex h-1.5 w-[min(80%,14rem)] max-w-full overflow-hidden sm:mt-3.5 sm:h-2"
    >
      <span
        className={`h-full w-[80%] shrink-0 ${
          variant === "violet" ? "bg-violet-400/80" : ""
        }`}
        style={variant === "bone" ? { backgroundColor: MANIFESTO_BAR_GRAY } : undefined}
      />
      <span className="h-full w-[20%] shrink-0" style={{ backgroundColor: BONE }} />
    </div>
  );
}

function FeatureMark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center font-mono text-[13px] font-normal leading-none ${
        dark ? "text-[#3a2d6b]" : "text-violet-300/70"
      }`}
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
      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] leading-none transition-[transform,background-color,border-color,color] duration-300 ease-out ${
        isOpen
          ? "rotate-90 border-[#2a2438]/25 bg-[#2a2438] text-[#F3F1EB]"
          : "rotate-0 border-[#070b13]/12 bg-[#070b13]/4 text-[#2a2438]/70 group-hover:border-[#070b13]/20"
      }`}
    >
      &gt;
    </span>
  );
}

function DetailLists({
  includes,
  excludes,
}: {
  includes: readonly string[];
  excludes: readonly string[];
}) {
  return (
    <div className="pl-10">
      <p
        className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: INK }}
      >
        Suele incluir
      </p>
      <ul className="flex flex-col gap-2">
        {includes.map((feature) => (
          <li
            key={feature}
            className="flex items-baseline gap-2 text-[13px] leading-relaxed"
            style={{ color: INK }}
          >
            <FeatureMark dark />
            <span className="opacity-80">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="my-4 h-px w-full bg-[#070b13]/12" />

      <p
        className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: INK }}
      >
        No incluye
      </p>
      <ul className="flex flex-col gap-2">
        {excludes.map((feature) => (
          <li
            key={feature}
            className="flex items-baseline gap-2 text-[13px] leading-relaxed"
            style={{ color: INK }}
          >
            <span
              className="inline-flex w-3 shrink-0 justify-center font-mono text-[12px] opacity-45"
              aria-hidden
            >
              ·
            </span>
            <span className="opacity-70">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfferTierBlock({
  tier,
  isOpen,
  onToggle,
  highlight,
}: {
  tier: OfferTier;
  isOpen: boolean;
  onToggle: () => void;
  highlight?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-[#F3F1EB] transition-[box-shadow,border-color] duration-300 ease-out ${
        highlight
          ? "border-violet-400/30 shadow-[0_8px_28px_-18px_rgba(42,36,56,0.4)] ring-1 ring-violet-400/15"
          : "border-[#070b13]/10 shadow-[0_3px_14px_-12px_rgba(7,11,19,0.25)]"
      } ${isOpen ? "shadow-[0_8px_28px_-16px_rgba(7,11,19,0.32)]" : "hover:border-[#070b13]/16"}`}
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
          <span className="flex flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-x-3">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className="text-[clamp(1.1rem,2.6vw,1.4rem)] font-semibold leading-tight tracking-[-0.02em]"
                style={{ color: PLAN_NAME }}
              >
                {tier.name}
              </span>
              {highlight ? (
                <span className="rounded-md bg-[#2a2438] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F3F1EB]">
                  Principal
                </span>
              ) : null}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-[#2a2438] sm:shrink-0 sm:text-[14px]">
              {tier.priceLabel}
            </span>
          </span>
          <span className="mt-2 block text-[12.5px] leading-snug text-[#070b13]/70 sm:text-[13px]">
            {tier.summary}
          </span>
          <span className="mt-1.5 block text-[11.5px] leading-snug text-[#070b13]/55 sm:text-[12px]">
            {tier.suitedFor}
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Detalle: ${tier.name}`}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-[#070b13]/12 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5"
              style={{ backgroundColor: TIER_PANEL }}
            >
              <DetailLists includes={tier.includes} excludes={tier.doesNotInclude} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

function MaintenanceCard({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <article
      data-maint-card
      className="overflow-hidden rounded-xl border border-[#070b13]/10 bg-[#F3F1EB] shadow-[0_3px_14px_-12px_rgba(7,11,19,0.25)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        data-maint-header
        className="group flex w-full items-start gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F1EB] sm:gap-3.5 sm:px-5 sm:py-4"
      >
        <TierChevron isOpen={isOpen} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-x-3">
            <span
              className="text-[clamp(1.1rem,2.6vw,1.4rem)] font-semibold leading-tight tracking-[-0.02em]"
              style={{ color: PLAN_NAME }}
            >
              {MAINTENANCE_OFFER.name}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-[#2a2438] sm:text-[14px]">
              {MAINTENANCE_OFFER.priceLabel}
            </span>
          </span>
          <span className="mt-2 block text-[12.5px] leading-snug text-[#070b13]/70 sm:text-[13px]">
            {MAINTENANCE_OFFER.summary}
          </span>
          <span className="mt-1.5 block text-[11.5px] leading-snug text-[#070b13]/55 sm:text-[12px]">
            Pulsa para ver qué suele incluir y qué queda fuera.
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label="Detalle del mantenimiento"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-[#070b13]/12 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5"
              style={{ backgroundColor: TIER_PANEL }}
            >
              <DetailLists
                includes={MAINTENANCE_OFFER.includes}
                excludes={MAINTENANCE_OFFER.doesNotInclude}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

/** Réplica abierta solo para medir alto real (bordes incluidos). */
function MaintenanceCardGhost() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#070b13]/10 bg-[#F3F1EB]">
      <div className="flex w-full items-start gap-3 px-4 py-3.5 sm:gap-3.5 sm:px-5 sm:py-4">
        <TierChevron isOpen />
        <span className="min-w-0 flex-1">
          <span className="flex flex-col gap-1.5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-x-3">
            <span
              className="text-[clamp(1.1rem,2.6vw,1.4rem)] font-semibold leading-tight tracking-[-0.02em]"
              style={{ color: PLAN_NAME }}
            >
              {MAINTENANCE_OFFER.name}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-[#2a2438] sm:text-[14px]">
              {MAINTENANCE_OFFER.priceLabel}
            </span>
          </span>
          <span className="mt-2 block text-[12.5px] leading-snug text-[#070b13]/70 sm:text-[13px]">
            {MAINTENANCE_OFFER.summary}
          </span>
          <span className="mt-1.5 block text-[11.5px] leading-snug text-[#070b13]/55 sm:text-[12px]">
            Pulsa para ver qué suele incluir y qué queda fuera.
          </span>
        </span>
      </div>
      <div
        className="border-t border-[#070b13]/12 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5"
        style={{ backgroundColor: TIER_PANEL }}
      >
        <DetailLists
          includes={MAINTENANCE_OFFER.includes}
          excludes={MAINTENANCE_OFFER.doesNotInclude}
        />
      </div>
    </article>
  );
}

/**
 * Desplegable de mantenimiento.
 * En desktop (lg+) reserva el alto de la tarjeta abierta para no mover las franjas.
 * En móvil el alto es natural: crece al abrir el acordeón.
 */
function MaintenanceSection() {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [cardSlotMinH, setCardSlotMinH] = useState<number | undefined>(undefined);
  const [reserveSlotHeight, setReserveSlotHeight] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setReserveSlotHeight(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const measureSlot = useCallback(() => {
    if (!reserveSlotHeight) return;
    const ghost = ghostRef.current;
    if (!ghost) return;
    const next = Math.ceil(ghost.getBoundingClientRect().height) + 2;
    setCardSlotMinH((prev) => (prev != null && Math.abs(prev - next) < 1 ? prev : next));
  }, [reserveSlotHeight]);

  useLayoutEffect(() => {
    if (!reserveSlotHeight) {
      setCardSlotMinH(undefined);
      return;
    }
    measureSlot();
    const ghost = ghostRef.current;
    if (!ghost) return;
    const ro = new ResizeObserver(() => measureSlot());
    ro.observe(ghost);
    window.addEventListener("resize", measureSlot);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureSlot);
    };
  }, [measureSlot, reserveSlotHeight]);

  useLayoutEffect(() => {
    if (!reserveSlotHeight || !isOpen) return;
    const calibrate = () => {
      const card = slotRef.current?.querySelector(
        "[data-maint-card]",
      ) as HTMLElement | null;
      if (!card) return;
      const h = Math.ceil(card.getBoundingClientRect().height) + 2;
      setCardSlotMinH((prev) => Math.max(prev ?? 0, h));
    };
    calibrate();
    const t = window.setTimeout(calibrate, 320);
    return () => window.clearTimeout(t);
  }, [isOpen, reserveSlotHeight]);

  return (
    <section
      className="relative z-10 -mt-px overflow-hidden bg-[#070b13]"
      aria-labelledby="pricing-maintenance-heading"
    >
      <DiagonalStripes flip />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <FadeIn>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10 xl:gap-12">
            <div className="self-start">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
                Después de publicar
              </p>
              <h2
                id="pricing-maintenance-heading"
                className="mt-3 font-serif text-[clamp(1.3rem,2.8vw,1.65rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
              >
                {MAINTENANCE_OFFER.name}
              </h2>
              <AccentBar variant="violet" />
              <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.75] text-zinc-300 sm:text-base">
                {MAINTENANCE_OFFER.summary}
              </p>
              <p className="mt-4 font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] text-[#F3F1EB]">
                {MAINTENANCE_OFFER.priceLabel}
              </p>
              <p className="mt-2 max-w-[42ch] text-[13px] leading-relaxed text-zinc-500 sm:text-[14px]">
                {MAINTENANCE_OFFER.priceNote}
              </p>
              <p className="mt-4 max-w-[42ch] text-[13px] leading-relaxed text-zinc-500 sm:text-[14px]">
                {MAINTENANCE_OFFER.scopeClarification}
              </p>
            </div>
            <div
              ref={slotRef}
              className="relative min-h-0 min-w-0 self-start overflow-hidden"
              style={
                reserveSlotHeight && cardSlotMinH != null
                  ? { height: cardSlotMinH }
                  : undefined
              }
            >
              <MaintenanceCard
                isOpen={isOpen}
                onToggle={() => setIsOpen((v) => !v)}
              />
              {reserveSlotHeight ? (
                <div
                  ref={ghostRef}
                  className="pointer-events-none invisible absolute left-0 top-0 -z-10 w-full"
                  aria-hidden
                >
                  <MaintenanceCardGhost />
                </div>
              ) : null}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
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

const ctaButtonClass =
  "inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md border border-[#F3F1EB]/15 bg-[#F3F1EB] px-8 py-3.5 text-[14px] font-semibold tracking-[-0.01em] text-[#070b13] shadow-[0_12px_40px_-18px_rgba(243,241,235,0.35)] transition-[background-color,transform,box-shadow,border-color] duration-300 hover:border-white/25 hover:bg-white hover:-translate-y-px hover:shadow-[0_16px_44px_-16px_rgba(243,241,235,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] sm:max-w-sm sm:px-10 sm:text-[15px]";

/** CTA final: más presencia, misma familia visual. */
const ctaButtonPremiumClass =
  "group relative inline-flex min-h-14 w-full max-w-md items-center justify-center overflow-hidden rounded-md border border-violet-300/25 bg-[#F3F1EB] px-12 py-5 text-[15px] font-semibold tracking-[-0.015em] text-[#070b13] shadow-[0_20px_60px_-22px_rgba(243,241,235,0.5),0_0_0_1px_rgba(243,241,235,0.08)] transition-[background-color,transform,box-shadow,border-color] duration-300 hover:border-violet-300/40 hover:bg-white hover:-translate-y-1 hover:shadow-[0_28px_70px_-20px_rgba(243,241,235,0.55),0_0_40px_-12px_rgba(139,92,246,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13] sm:min-h-16 sm:px-14 sm:text-[17px]";


export function Pricing() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => {
      const next = current === index ? null : index;
      if (next != null) {
        const tier = OFFER_TIERS[next];
        if (tier) trackEvent("pricing_product_view", { product: tier.id });
      }
      return next;
    });
  };

  const handlePrimaryCta = useCallback(() => {
    trackEvent("pricing_cta", { location: "precios", destination: "presupuesto" });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070b13] text-zinc-300">
      {/* 1. Hero: franja completa (sección corta) */}
      <section
        className="pricing-hero relative z-10 overflow-x-clip bg-[#070b13] px-4 pb-7 pt-[6.75rem] sm:px-6 sm:pb-10 sm:pt-28 lg:overflow-y-hidden lg:px-10 lg:pb-10 lg:pt-28"
        aria-labelledby="pricing-hero-heading"
      >
        <DiagonalStripes />

        <FadeIn className="relative z-10 mx-auto w-full max-w-6xl">
          <h1
            id="pricing-hero-heading"
            className="text-center font-serif text-[clamp(1.75rem,5.2vw,3.85rem)] font-normal leading-[1.08] tracking-[-0.038em] text-[#f2f0ec]"
          >
            <span className="block">Webs y sistemas{" "}</span>
            <span className="mt-1 block text-zinc-400">con alcance claro.</span>
          </h1>

          {/*
            Móvil/tablet: texto izquierda + pavo derecha, CTA debajo.
            Desktop: misma estructura con anclaje editorial.
          */}
          <div className="mx-auto mt-5 w-full max-w-184 sm:mt-6 lg:mt-3 lg:max-w-216 lg:-translate-y-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-3 gap-y-0 sm:gap-x-5 lg:gap-x-10">
              <div className="min-w-0 self-center text-left sm:self-end lg:-translate-y-2 xl:-translate-y-3">
                <p
                  className="max-w-[22ch] text-[clamp(0.95rem,2.8vw,1.35rem)] font-medium leading-[1.35] tracking-[-0.02em] text-zinc-200 sm:max-w-[36ch] lg:max-w-[44ch] lg:leading-[1.32]"
                  role="doc-subtitle"
                >
                  Desde una web sencilla hasta automatizaciones que quitan trabajo repetido.
                </p>

                <p className="mt-3 hidden max-w-[48ch] text-[15px] leading-[1.8] text-zinc-400 sm:mt-4 sm:block sm:text-base sm:leading-[1.85]">
                  Trabajo desde Valladolid con negocios de toda España. Los precios son
                  orientativos: el presupuesto se cierra cuando el alcance está claro.
                </p>

                <p className="mt-2.5 max-w-[22ch] text-[12.5px] italic leading-relaxed text-zinc-500 sm:mt-4 sm:max-w-[48ch] sm:text-[15px]">
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
                  sizes="(max-width: 639px) 132px, (max-width: 1023px) 200px, 448px"
                  className="pricing-hero-mascot h-auto w-[7.75rem] max-w-full object-contain object-bottom sm:w-[12.5rem] lg:w-92 lg:translate-y-4"
                />
              </div>

              <div className="col-span-2 mt-6 flex justify-center sm:mt-8 lg:mt-12">
                <Link
                  href="/presupuesto"
                  onClick={handlePrimaryCta}
                  className={ctaButtonClass}
                >
                  Configurar mi proyecto
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 2. Oferta: gradiente, sin franja; copy sticky */}
      <section
        className="relative z-10 -mt-px"
        aria-labelledby="pricing-offer-heading"
      >
        <SectionGradient />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="relative py-10 sm:py-14 lg:py-16">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[40fr_60fr] lg:gap-x-10 xl:gap-x-12">
              <FadeIn className="order-2 min-w-0 lg:order-1">
                <div className="pricing-offer-copy lg:sticky lg:top-28 lg:self-start">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
                    Qué puedes contratar
                  </p>
                  <h2
                    id="pricing-offer-heading"
                    className="mt-3 font-serif text-[clamp(1.3rem,2.8vw,1.65rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
                  >
                    Elige el alcance que encaja con lo que necesitas ahora.
                  </h2>
                  <div className="mt-5 space-y-3.5 text-[15px] leading-[1.75] text-zinc-300 sm:text-base sm:leading-[1.8]">
                    <p>
                      Entrada para proyectos acotados. Profesional como opción principal. A
                      medida cuando hace falta más lógica. Automatización cuando el proceso
                      debería moverse solo.
                    </p>
                    <p className="text-zinc-400">
                      Si crece el trabajo, crece el presupuesto, y se habla antes de hacerlo.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.05} className="order-1 min-w-0 lg:order-2">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  {OFFER_TIERS.map((tier, index) => (
                    <OfferTierBlock
                      key={tier.id}
                      tier={tier}
                      highlight={Boolean(tier.highlight)}
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

      <MaintenanceSection />

      {/* 4. Alcance: gradiente */}
      <section
        className="relative z-10 -mt-px"
        aria-labelledby="pricing-scope-heading"
      >
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
              <p className="text-[14px] leading-[1.7] text-zinc-500 sm:text-[15px]">
                {OFFER_INFRA_NOTE}
              </p>
              <p className="text-[14px] leading-[1.7] text-zinc-500 sm:text-[15px]">
                {OFFER_GUARANTEE_NOTE}
              </p>
            </div>

            <ul className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {OFFER_EXTRAS.map((extra) => (
                <li
                  key={extra.label}
                  className="border-l border-violet-400/25 pl-3 text-[13px] leading-snug text-zinc-400 sm:text-[14px]"
                >
                  {extra.label}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* 5. Referencias + plantillas: una sola sección, franja completa */}
      <section
        className="relative z-10 -mt-px overflow-hidden bg-[#070b13]"
        aria-labelledby="pricing-templates-heading"
      >
        <DiagonalStripes />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <FadeIn>
            <div className="w-fit max-w-full">
              <h2
                id="pricing-templates-heading"
                className="font-serif text-[clamp(1.2rem,2.6vw,1.5rem)] font-normal leading-[1.14] tracking-[-0.03em] text-[#F3F1EB]"
              >
                Referencias visuales por tipo de negocio
              </h2>
              <AccentBar variant="violet" />
            </div>
            <p className="mt-5 max-w-[40rem] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
              {TEMPLATES_CONTEXT}
            </p>
          </FadeIn>

          <FadeIn delay={0.04} className="mt-9 sm:mt-11">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-4">
              {TEMPLATE_DEMOS.map((demo) => (
                <TemplateDemoCard key={demo.name} {...demo} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 6. FAQ: corte del patrón de franjas (fondo limpio) */}
      <section
        className="relative z-10 -mt-px overflow-hidden bg-[#070b13]"
        aria-labelledby="pricing-faq-heading"
      >
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
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
                          onToggle={() =>
                            setOpenFaq((cur) => (cur === key ? null : key))
                          }
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

      {/* 7. CTA: reengancha espejo tras el corte del FAQ */}
      <section
        className="relative z-10 -mt-px overflow-hidden bg-[#070b13]"
        aria-labelledby="pricing-cta-heading"
      >
        <DiagonalStripes flip />
        <FadeIn className="relative z-10 mx-auto w-full max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <h2
            id="pricing-cta-heading"
            className="font-serif text-[clamp(1.5rem,3.8vw,2.1rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#F3F1EB]"
          >
            Configura lo que necesita tu negocio
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
            Elige el tipo de proyecto, añade lo que haga falta y verás un total orientativo
            antes de hablar del detalle.
          </p>
          <div className="mt-10 flex justify-center sm:mt-11">
            <Link
              href="/presupuesto"
              onClick={handlePrimaryCta}
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
