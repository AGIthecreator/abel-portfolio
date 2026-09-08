"use client";

import { Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { FadeIn } from "@/components/motion/FadeIn";
import { trackEvent } from "@/lib/analytics";
import {
  COLLABORATORS,
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_MAILTO,
  OPERATOR,
  formatWhatsAppDisplay,
  getWhatsAppHref,
  getWhatsAppNumber,
} from "@/lib/contact/info";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-contact-display",
  display: "swap",
});

const PRIMARY_CTA =
  "inline-flex w-full items-center justify-center rounded-lg bg-[#F3F1EB] px-5 py-2.5 text-sm font-semibold text-[#070b13] no-underline transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 sm:w-auto";

const PAGE_WORDS = [
  {
    text: "Automatizaciones",
    className:
      "left-[6%] top-[4%] hidden -rotate-6 text-[clamp(1.7rem,4.6vw,3.15rem)] italic text-violet-300/9 lg:block",
    drift: true,
  },
  {
    text: "Diseño Web",
    className:
      "right-[13%] top-[12%] hidden rotate-[8deg] text-[clamp(2.05rem,5.4vw,3.7rem)] text-[#F3F1EB]/8 lg:block",
  },
  {
    text: "Sistemas",
    className:
      "left-[14%] top-[29%] hidden rotate-[5deg] text-[clamp(2.3rem,6.2vw,4.2rem)] text-cyan-200/8 lg:block",
  },
  {
    text: "Negocios",
    className:
      "right-[5%] top-[38%] hidden -rotate-[7deg] text-[clamp(1.55rem,4.2vw,2.85rem)] text-violet-400/9 lg:block",
  },
  {
    text: "A medida",
    className:
      "left-[5%] top-[54%] hidden -rotate-[4deg] text-[clamp(1.85rem,5vw,3.4rem)] text-[#F3F1EB]/8 lg:block",
  },
  {
    text: "Personalización",
    className:
      "right-[12%] top-[61%] hidden rotate-[6deg] text-[clamp(1.45rem,3.9vw,2.65rem)] text-violet-300/8 lg:block",
  },
  {
    text: "SEO",
    className:
      "left-[15%] top-[78%] hidden rotate-[12deg] text-[clamp(2.15rem,5.8vw,3.9rem)] text-cyan-200/7 lg:block",
  },
  {
    text: "Optimización",
    className:
      "right-[7%] top-[88%] hidden -rotate-[5deg] text-[clamp(1.65rem,4.5vw,3.05rem)] text-[#F3F1EB]/8 lg:block",
  },
] as const;

function Hairline({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(167,139,250,0.45), rgba(255,255,255,0.12) 42%, transparent)",
      }}
      aria-hidden
    />
  );
}

function CraftWord({
  text,
  className,
  drift = false,
}: {
  text: string;
  className: string;
  drift?: boolean;
}) {
  return (
    <p
      aria-hidden
      className={`pointer-events-none absolute select-none font-(family-name:--font-contact-display) font-medium leading-none tracking-[-0.06em] ${className}`}
    >
      <span className={drift ? "contact-word-drift inline-block" : undefined}>{text}</span>
    </p>
  );
}

function PersonBlock({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-(family-name:--font-contact-display) text-[1.55rem] font-medium tracking-[-0.03em] text-[#F3F1EB] sm:text-[1.7rem]">
          {name}
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {role}
        </span>
      </p>
      <div className="mt-3 space-y-2 text-[15px] leading-[1.8] text-zinc-400 sm:text-[16px]">
        {children}
      </div>
    </div>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ContactPageContent() {
  const whatsappNumber = getWhatsAppNumber();
  const whatsappHref = getWhatsAppHref();
  const whatsappDisplay = formatWhatsAppDisplay(whatsappNumber);

  return (
    <div
      className={`${display.variable} relative min-h-screen overflow-x-clip bg-[#070b13] text-zinc-300`}
    >
      {/* 1. Hero: aire extra para que Contacto/Directo no se cubran con el titular y el pavo */}
      <section className="contact-hero relative isolate pt-[7.5rem] pb-8 sm:pt-32 sm:pb-12 lg:pt-28 lg:pb-14">
        {/* Fondo + marco: una sola capa inferior; marcas y copy van por encima */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.32]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.5) 0.4px, transparent 0.4px)",
              backgroundSize: "2px 2px",
              mixBlendMode: "soft-light",
            }}
          />
          <div className="contact-hero-wash absolute inset-0" />
          <div className="contact-hero-sheen absolute inset-0" />
          <div className="contact-hero-floor absolute inset-x-0 bottom-0 h-[42%]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,transparent_58%,rgba(0,0,0,0.38)_100%)]" />

          {/* Marco editorial: L arriba-derecha + L abajo-izquierda.
              Insets por breakpoint (sin scale/translate: en móvil descuadraban). */}
          <div className="contact-hero-frame" aria-hidden>
            <span className="contact-hero-frame__tr" />
            <span className="contact-hero-frame__bl" />
          </div>
        </div>

        <div className="contact-hero-crops z-[2]" aria-hidden>
          <span className="contact-hero-crop contact-hero-crop--tl" />
          <span className="contact-hero-crop contact-hero-crop--tr" />
          <span className="contact-hero-crop contact-hero-crop--bl" />
          <span className="contact-hero-crop contact-hero-crop--br" />
        </div>

        <p
          aria-hidden
          className="contact-hero-mark pointer-events-none absolute left-[4%] top-[6.75rem] z-20 w-max max-w-[92vw] select-none font-(family-name:--font-contact-display) text-[clamp(3.15rem,17vw,13.5rem)] font-medium italic leading-[0.8] tracking-[-0.06em] text-violet-200/9 sm:left-[5%] sm:top-28 lg:top-24"
        >
          Contacto
        </p>
        <p
          aria-hidden
          className="contact-hero-mark pointer-events-none absolute right-[8%] bottom-3 z-20 w-max max-w-[92vw] select-none text-right font-(family-name:--font-contact-display) text-[clamp(3.15rem,17vw,13.5rem)] font-medium italic leading-[0.8] tracking-[-0.06em] text-cyan-100/8 sm:right-[12%] sm:bottom-6 lg:bottom-8"
        >
          Directo
        </p>

        <div className="contact-hero-copy relative z-20 mx-auto flex w-full max-w-5xl items-end justify-center px-5 pt-8 pb-10 sm:px-8 sm:pt-16 sm:pb-20 lg:px-10 lg:pt-20 lg:pb-28">
          <FadeIn className="flex w-full flex-col items-center lg:flex-row lg:items-end lg:justify-center lg:gap-10 xl:gap-14">
            <div className="max-w-xl text-center lg:text-left">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                Contacto
              </p>
              <h1 className="mt-5 font-(family-name:--font-contact-display) text-[clamp(2.05rem,7.2vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.035em] text-[#F3F1EB]">
                <span className="block">¿Hablamos?</span>
                <span className="mt-1 block italic text-violet-300/95">Te respondo yo.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-[40ch] text-[16px] leading-[1.75] text-zinc-400 lg:mx-0 sm:text-[17px] sm:leading-[1.8]">
                Si quieres plantear una idea, resolver una duda o hablar de una web o un
                sistema para tu negocio, escríbeme directamente.
              </p>
            </div>
            <div className="relative mt-8 hidden shrink-0 lg:mt-0 lg:block">
              <div
                aria-hidden
                className="pointer-events-none absolute top-[58%] left-1/2 h-40 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/16 blur-3xl"
              />
              <Image
                src="/logos/mascot-modal-hero.webp"
                alt=""
                width={195}
                height={193}
                priority
                quality={90}
                sizes="208px"
                className="relative h-auto w-52 object-contain object-bottom"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="contact-hero-seam" aria-hidden />

      {/* Cuerpo: tres franjas + palabras de oficio repartidas */}
      <div className="relative">
        <div
          className="site-stripes site-stripes--from-hero pointer-events-none absolute inset-0 z-0 hidden lg:block"
          aria-hidden
        >
          <div className="site-stripes__gray" />
          <div className="site-stripes__purple" />
          <div className="site-stripes__accent" />
        </div>
        <div
          className="site-stripes site-stripes--from-hero-mobile pointer-events-none absolute inset-0 z-0 opacity-70 lg:hidden"
          aria-hidden
        >
          <div className="site-stripes__gray" />
          <div className="site-stripes__purple" />
          <div className="site-stripes__accent" />
        </div>
        <div
          className="contact-body-wash pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-full max-w-5xl lg:block"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-1" aria-hidden>
          {PAGE_WORDS.map((word) => (
            <CraftWord
              key={word.text}
              text={word.text}
              className={word.className}
              drift={"drift" in word && word.drift}
            />
          ))}
        </div>

        {/* 2. Canales */}
        <section
          className="relative z-10 px-5 pt-14 sm:px-8 sm:pt-16 lg:px-10"
          aria-labelledby="contact-direct-heading"
        >
          <FadeIn className="mx-auto w-full max-w-3xl">
            <h2 id="contact-direct-heading" className="sr-only">
              Formas de contacto directo
            </h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              <li className="flex min-w-0 flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Email
                </span>
                <a
                  href={CONTACT_MAILTO}
                  onClick={() =>
                    trackEvent("contact_direct_email", { location: "contacto" })
                  }
                  className="min-w-0 max-w-full break-all font-(family-name:--font-contact-display) text-[1.15rem] font-medium tracking-[-0.02em] text-[#F3F1EB] underline-offset-[6px] transition-colors hover:text-white hover:underline sm:break-normal sm:text-[1.35rem]"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              {whatsappHref ? (
                <li className="flex min-w-0 flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    WhatsApp
                  </span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("contact_direct_whatsapp", { location: "contacto" })
                    }
                    className="inline-flex min-w-0 max-w-full items-center gap-2 font-(family-name:--font-contact-display) text-[1.15rem] font-medium tracking-[-0.02em] text-[#F3F1EB] underline-offset-[6px] transition-colors hover:text-white hover:underline sm:text-[1.35rem]"
                  >
                    <WhatsAppGlyph className="h-4 w-4 shrink-0 text-zinc-400" />
                    {whatsappDisplay || "Abrir WhatsApp"}
                  </a>
                </li>
              ) : null}
              <li className="flex min-w-0 flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Ubicación
                </span>
                <span className="font-(family-name:--font-contact-display) text-[1.2rem] font-medium tracking-[-0.02em] text-zinc-300 sm:text-[1.35rem]">
                  {CONTACT_LOCATION}
                </span>
              </li>
            </ul>
            <p className="mt-5 max-w-[48ch] text-[14px] leading-relaxed text-zinc-500 sm:text-[15px]">
              Normalmente respondo en menos de 24 horas laborables. Sin formularios
              interminables ni intermediarios.
            </p>
          </FadeIn>
        </section>

        {/* 3. Formulario */}
        <section
          className="relative z-10 px-5 py-16 sm:px-8 sm:py-20 lg:px-10"
          aria-labelledby="contact-form-heading"
        >
          <Hairline className="mx-auto mb-14 max-w-3xl sm:mb-16" />
          <div className="mx-auto grid w-full min-w-0 max-w-3xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-14">
            <FadeIn className="min-w-0">
              <h2
                id="contact-form-heading"
                className="font-(family-name:--font-contact-display) text-[clamp(1.45rem,5.5vw,2.1rem)] font-medium leading-[1.12] tracking-[-0.03em] text-[#F3F1EB]"
              >
                Cuéntame qué tienes en mente
              </h2>
              <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.8] text-zinc-400 sm:text-[16px]">
                Para dudas, colaboraciones o un mensaje general. Si ya quieres poner
                algo en marcha, el diagnóstico es el camino más directo.
              </p>
              <Link
                href="/presupuesto"
                onClick={() =>
                  trackEvent("contact_cta_presupuesto", { location: "contacto" })
                }
                className={`${PRIMARY_CTA} mt-8`}
              >
                Empezar diagnóstico
              </Link>
            </FadeIn>
            <FadeIn className="min-w-0" delay={0.05}>
              <ContactForm source="page_form" />
            </FadeIn>
          </div>
        </section>

        {/* 4. Quién está detrás */}
        <section
          className="relative z-10 px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10"
          aria-labelledby="contact-about-heading"
        >
          <Hairline className="mx-auto mb-14 max-w-3xl sm:mb-16" />
          <FadeIn className="mx-auto max-w-3xl">
            <h2
              id="contact-about-heading"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80"
            >
              Quién está detrás
            </h2>
            <p className="mt-4 font-(family-name:--font-contact-display) text-[clamp(1.45rem,3.2vw,1.9rem)] font-medium leading-[1.2] tracking-[-0.025em] text-[#F3F1EB]">
              Un estudio independiente
              <span className="block text-zinc-400">de Valladolid.</span>
            </p>

            <div className="mt-10 space-y-12">
              <PersonBlock name={OPERATOR.firstName} role={OPERATOR.role}>
                <p>{OPERATOR.note}</p>
                <p className="w-full text-[10px] italic leading-[1.5] text-white/25 sm:text-[11px]">
                  {OPERATOR.tools}
                </p>
              </PersonBlock>

              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Colaboradores
                </p>
                <ul className="mt-6 space-y-8">
                  {COLLABORATORS.map((person) => (
                    <li key={person.href}>
                      <PersonBlock name={person.firstName} role={person.role}>
                        <p>
                          {person.note}
                          <br />
                          Trabaja desde{" "}
                          <a
                            href={person.href}
                            target="_blank"
                            rel="noopener"
                            className="text-[#F3F1EB] underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-white/70"
                          >
                            {person.studio}
                          </a>
                          .
                        </p>
                      </PersonBlock>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* 5. Cierre */}
        <section
          className="relative z-10 px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10"
          aria-labelledby="contact-close-heading"
        >
          <Hairline className="mx-auto mb-12 max-w-3xl sm:mb-14" />
          <FadeIn className="mx-auto max-w-3xl text-center">
            <h2
              id="contact-close-heading"
              className="font-(family-name:--font-contact-display) text-[clamp(1.35rem,3.2vw,1.75rem)] font-medium italic tracking-[-0.03em] text-zinc-500"
            >
              Si te encaja, hablamos.
            </h2>
          </FadeIn>
        </section>
      </div>
    </div>
  );
}
