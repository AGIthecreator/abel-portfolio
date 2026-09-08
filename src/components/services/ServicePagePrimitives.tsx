"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Manrope, Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useId, type ReactNode } from "react";
import { FadeIn } from "@/components/motion/FadeIn";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-svc-display",
  display: "swap",
});

const ui = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-svc-ui",
  display: "swap",
});

export const SECTION_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 48%, #0c121c 100%)";

/** Franjas editoriales de `/como-trabajamos` (gris · morado · violeta). */
export type ServiceStripeVariant = "down" | "up" | "close";

export function ServicePageStripes({
  variant,
  vignette = false,
}: {
  variant: ServiceStripeVariant;
  /** Viñeta suave del cierre de cómo-trabajamos. */
  vignette?: boolean;
}) {
  const paths =
    variant === "down"
      ? {
          gray: "polygon(0 0, 37% 0, 65% 100%, 0 100%)",
          purple: "polygon(0 0, 21% 0, 49% 100%, 0 100%)",
          accent: "polygon(18% 0, 21% 0, 49% 100%, 46% 100%)",
        }
      : variant === "up"
        ? {
            gray: "polygon(0 0, 65% 0, 37% 100%, 0 100%)",
            purple: "polygon(0 0, 49% 0, 21% 100%, 0 100%)",
            accent: "polygon(46% 0, 49% 0, 21% 100%, 18% 100%)",
          }
        : {
            gray: "polygon(0 0, 37% 0, 55% 100%, 0 100%)",
            purple: "polygon(0 0, 21% 0, 39% 100%, 0 100%)",
            accent: "polygon(18% 0, 21% 0, 39% 100%, 36% 100%)",
          };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 bg-[#12151f]"
        style={{ clipPath: paths.gray }}
      />
      <div
        className="absolute inset-0 bg-[#251c49]"
        style={{ clipPath: paths.purple }}
      />
      <div
        className="absolute inset-0 bg-[#3a2d6b]/55"
        style={{ clipPath: paths.accent }}
      />
      {vignette ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,transparent_58%,rgba(0,0,0,0.4)_100%)]" />
      ) : null}
    </div>
  );
}

const PRIMARY_CTA =
  "group relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[rgba(150,142,180,0.26)] bg-[linear-gradient(180deg,#34343b_0%,#1d1d22_44%,#141417_56%,#0b0b0d_100%)] px-5 py-2.5 text-[13px] font-semibold text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.55),0_6px_18px_-9px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-violet-400/45 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.55),0_10px_26px_-10px_rgba(124,58,237,0.45)]";

const SECONDARY_CTA =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-white/12 bg-transparent px-5 py-2.5 text-[13px] font-semibold text-zinc-300 transition-[border-color,color,background-color] duration-300 hover:border-white/22 hover:bg-white/3 hover:text-zinc-100";

export function ServicePageRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${ui.variable} relative overflow-x-clip bg-[#070b13] font-(family-name:--font-svc-ui) text-zinc-300`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-(family-name:--font-svc-ui) text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
      {children}
    </p>
  );
}

export function PrimaryCta({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={PRIMARY_CTA}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.55),transparent)] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export function SecondaryCta({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={SECONDARY_CTA}>
      {label}
    </Link>
  );
}

/** Panel derecho: colores a sangre (como Cómo trabajamos) + imagen opcional contenida. */
function HeroDuotoneImage({
  src,
  alt,
  fit = "default",
}: {
  src?: string;
  alt?: string;
  /** default: contain con margen · padded: más aire arriba/abajo · cover: a sangre */
  fit?: "default" | "padded" | "cover";
}) {
  const frameClass =
    fit === "cover"
      ? "absolute inset-0"
      : fit === "padded"
        ? "absolute top-[14%] bottom-[14%] left-[8%] right-[10%] sm:top-[15%] sm:bottom-[15%] sm:left-[9%] sm:right-[11%] lg:top-[16%] lg:bottom-[16%] lg:left-[10%] lg:right-[12%]"
        : "absolute inset-[4%] sm:inset-[5%] lg:inset-[5%_6%_5%_8%]";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Base gris para que el multiply se lea en todo el panel, no solo sobre la foto */}
      <div className="absolute inset-0 bg-[#6e7480]" />

      {src ? (
        <div className={frameClass}>
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes="(max-width: 1023px) 100vw, 45vw"
            quality={85}
            priority
            className={
              fit === "cover"
                ? "object-cover object-center grayscale brightness-[0.92] contrast-[1.05]"
                : "object-contain object-center grayscale brightness-[0.92] contrast-[1.05]"
            }
            style={
              fit === "padded"
                ? {
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)",
                    WebkitMaskComposite: "source-in",
                    maskComposite: "intersect",
                  }
                : undefined
            }
          />
        </div>
      ) : null}

      {/* Tinte duotono a sangre del panel (no anclado al tamaño de la imagen) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "linear-gradient(90deg, #aab2c0 0%, #aab2c0 30%, #5b3bc4 30%, #5b3bc4 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(90deg, rgba(120,130,150,0.10) 0%, rgba(120,130,150,0.10) 30%, rgba(124,92,255,0.28) 30%, rgba(124,92,255,0.28) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #070b13 0%, rgba(7,11,19,0.45) 13%, transparent 32%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:bg-[linear-gradient(to_bottom,#070b13_0%,transparent_14%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pricing-hero-grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
      />
    </div>
  );
}

export function ServiceHero({
  eyebrow,
  headingId,
  title,
  titleAccent,
  lead,
  leadExtra,
  primary,
  secondary,
  image,
}: {
  eyebrow: string;
  headingId: string;
  title: ReactNode;
  titleAccent?: ReactNode;
  lead: ReactNode;
  /** Segundo párrafo solo visible en desktop (como Cómo trabajamos). */
  leadExtra?: ReactNode;
  primary: { label: string; href: string; onClick?: () => void };
  secondary: { label: string; href: string; onClick?: () => void };
  /** Si falta la imagen, queda el panel duotono listo para añadirla después. */
  image?: {
    src: string;
    alt: string;
    /** @deprecated Usa fit: "cover". */
    roomy?: boolean;
    fit?: "default" | "padded" | "cover";
  };
}) {
  const imageFit = image?.fit ?? (image?.roomy ? "cover" : "default");
  return (
    <>
    <section
      className="ct-hero relative isolate w-full overflow-x-clip overflow-y-hidden bg-[#070b13] pt-21 pb-0 sm:pt-24 lg:pt-20"
      aria-labelledby={headingId}
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-[#070b13]" />
        <div
          className="hero-editorial-grain absolute inset-0 opacity-[0.26]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.5) 0.4px, transparent 0.4px)",
            backgroundSize: "2px 2px",
            mixBlendMode: "soft-light",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,transparent_56%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      <div
        className="absolute inset-y-0 right-0 z-0 hidden w-[50%] lg:block"
        aria-hidden
      >
        <HeroDuotoneImage
          src={image?.src}
          alt={image?.alt}
          fit={imageFit}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-330 items-center px-5 sm:px-8 lg:min-h-[52vh] lg:px-10">
        <div className="grid w-full items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="ct-hero-copy max-w-136 py-6 sm:py-10 lg:py-12">
            <FadeIn>
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1
                id={headingId}
                className="mt-4 font-(family-name:--font-svc-display) text-[clamp(1.65rem,4.6vw,2.85rem)] font-medium leading-[1.07] tracking-[-0.015em] text-neutral-50 sm:mt-5"
              >
                <span className="block">{title}</span>
                {titleAccent ? (
                  <span className="block text-zinc-400">{titleAccent}</span>
                ) : null}
              </h1>
              <div className="mt-5 max-w-[44ch] space-y-3 text-[15px] leading-[1.7] text-neutral-400/95 sm:mt-6 sm:space-y-3.5">
                {lead}
                {leadExtra ? (
                  <div className="ct-hero-extra-copy hidden lg:block">
                    {leadExtra}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center">
                <PrimaryCta {...primary} />
                <SecondaryCta {...secondary} />
              </div>
            </FadeIn>
          </div>
          <div aria-hidden className="hidden lg:block" />
        </div>
      </div>

      {image ? (
        <div
          className={`ct-hero-mobile-image relative z-10 w-full lg:hidden ${
            imageFit === "cover"
              ? "h-65 sm:h-80"
              : imageFit === "padded"
                ? "h-70 sm:h-85"
                : "h-55 sm:h-70"
          }`}
          aria-hidden
        >
          <HeroDuotoneImage src={image.src} alt="" fit={imageFit} />
        </div>
      ) : (
        <div
          className="ct-hero-mobile-image relative z-10 h-35 w-full sm:h-45 lg:hidden"
          aria-hidden
        >
          <HeroDuotoneImage />
        </div>
      )}
    </section>
    <div className="page-hero-seam" aria-hidden />
    </>
  );
}

export function ServiceSection({
  id,
  eyebrow,
  title,
  lead,
  children,
  surface = false,
  stripes,
  framed = false,
  framedWide = false,
  className = "",
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  surface?: boolean;
  /** Franjas de cómo-trabajamos. En secciones pares (fondo oscuro limpio), no usar. */
  stripes?: Exclude<ServiceStripeVariant, "close">;
  /** Banda negra + copy centrado + esquinas en L (statement del home). */
  framed?: boolean;
  /** Marco más ancho (p. ej. diagramas en una sola línea). */
  framedWide?: boolean;
  className?: string;
}) {
  const sectionStyle = surface
    ? { background: SECTION_SURFACE }
    : framed
      ? { backgroundColor: "#030305" }
      : undefined;

  const body = (
    <>
      <FadeIn className={framed ? "text-center" : undefined}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2
          id={id}
          className={`font-(family-name:--font-svc-display) text-[clamp(1.55rem,3.8vw,2.35rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50 ${
            eyebrow ? "mt-4 sm:mt-5" : ""
          } ${framed ? "mx-auto max-w-[22ch] text-balance" : "max-w-[22ch]"}`}
        >
          {title}
        </h2>
        {lead ? (
          <div
            className={`mt-5 space-y-3 text-[15px] leading-[1.75] text-zinc-400 sm:text-base ${
              framed ? "mx-auto max-w-[48ch]" : "max-w-[56ch]"
            }`}
          >
            {lead}
          </div>
        ) : null}
      </FadeIn>
      {children ? (
        <FadeIn
          delay={0.05}
          className={`mt-10 sm:mt-12 ${framed ? "flex flex-col items-center" : ""}`}
        >
          {children}
        </FadeIn>
      ) : null}
    </>
  );

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      aria-labelledby={id}
      style={sectionStyle}
    >
      {stripes ? <ServicePageStripes variant={stripes} /> : null}
      <div
        className={`relative z-10 mx-auto w-full px-5 sm:px-8 lg:px-10 ${
          framed
            ? "py-10 sm:py-12 lg:py-14"
            : "py-16 sm:py-20 lg:py-24"
        } ${
          framed
            ? framedWide
              ? "max-w-5xl"
              : "max-w-3xl"
            : "max-w-270"
        }`}
      >
        {framed ? (
          <div
            className={`relative mx-auto w-full px-7 py-6 sm:px-10 sm:py-8 ${
              framedWide ? "max-w-5xl" : "max-w-2xl"
            }`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-white/25"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-white/25"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/25"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/25"
            />
            {body}
          </div>
        ) : (
          body
        )}
      </div>
    </section>
  );
}

export function ServiceFaq({
  headingId,
  title,
  lead,
  items,
  openIndex,
  onToggle,
}: {
  headingId: string;
  title: ReactNode;
  lead: string;
  items: readonly { question: string; answer: readonly string[] }[];
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <section
      className="relative overflow-x-clip"
      aria-labelledby={headingId}
      style={{ background: SECTION_SURFACE }}
    >
      <div className="relative z-10 mx-auto w-full max-w-240 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <FadeIn>
          <Eyebrow>Antes de empezar</Eyebrow>
          <h2
            id={headingId}
            className="mt-4 max-w-[22ch] font-(family-name:--font-svc-display) text-[clamp(1.55rem,3.8vw,2.35rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50 sm:mt-5"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
            {lead}
          </p>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-10 sm:mt-12">
          <div className="border-t border-white/10">
            {items.map((item, i) => (
              <FaqDisclosure
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => onToggle(i)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FaqDisclosure({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: readonly string[];
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
        className="group flex w-full items-start gap-4 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 sm:gap-6 sm:py-7"
      >
        <h3
          className={`min-w-0 flex-1 text-[clamp(1.05rem,2vw,1.35rem)] font-semibold leading-tight tracking-[-0.015em] transition-colors duration-300 ${
            isOpen
              ? "text-violet-300"
              : "text-violet-400 group-hover:text-violet-300"
          }`}
        >
          {question}
        </h3>
        <span
          aria-hidden
          className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/12 text-violet-300/80 transition-[transform,background-color,border-color] duration-300 ease-out group-hover:border-violet-400/40 group-hover:bg-white/5 sm:size-9 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDown className="size-4 sm:size-4.5" strokeWidth={2} />
        </span>
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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="max-w-[68ch] space-y-4 pb-7 pr-8 text-[15px] leading-[1.8] text-zinc-300 sm:pb-8 sm:text-base">
              {answer.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function ServiceClosing({
  headingId,
  title,
  body,
  primary,
  secondary,
  stripes,
}: {
  headingId: string;
  title: ReactNode;
  body: ReactNode;
  primary: { label: string; href: string; onClick?: () => void };
  secondary?: { label: string; href: string; onClick?: () => void };
  stripes?: ServiceStripeVariant;
}) {
  return (
    <section
      className="relative overflow-hidden border-t border-white/5 bg-[#070b13]"
      aria-labelledby={headingId}
    >
      {stripes ? (
        <ServicePageStripes variant={stripes} vignette />
      ) : (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(124,58,237,0.12),transparent_60%)]" />
        </div>
      )}
      <FadeIn className="relative z-10 mx-auto w-full max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
        <h2
          id={headingId}
          className="font-(family-name:--font-svc-display) text-[clamp(1.7rem,4.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50"
        >
          {title}
        </h2>
        <div className="mx-auto mt-6 max-w-[46ch] space-y-3 text-[15px] leading-[1.8] text-zinc-400 sm:text-base">
          {body}
        </div>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCta {...primary} />
          {secondary ? <SecondaryCta {...secondary} /> : null}
        </div>
      </FadeIn>
    </section>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] transition-colors hover:text-white hover:decoration-violet-300/60"
    >
      {children}
    </Link>
  );
}
