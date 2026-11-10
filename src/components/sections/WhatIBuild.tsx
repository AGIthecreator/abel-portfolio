"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { COLLABORATORS, CONTACT_LOCATION, OPERATOR } from "@/lib/contact/info";

const SECTION_BG = "#070b13";

const AREAS = [
  {
    title: "Webs y presencia digital",
    body: "Una web que explique qué haces, transmita confianza y deje un siguiente paso. También rediseño o mejoro la que ya tienes.",
    href: "/desarrollo-web",
    label: "Ver desarrollo web",
  },
  {
    title: "Automatizaciones e integraciones",
    body: "Formularios, reservas, avisos y conexiones entre herramientas, cuando el proceso se repite y se puede describir.",
    href: "/automatizacion-de-procesos",
    label: "Ver automatización",
  },
  {
    title: "Sistemas y herramientas a medida",
    body: "Lógica propia y datos internos cuando una web o una herramienta genérica se quedan cortas.",
    href: "/desarrollo-web",
    label: "Ver cómo lo planteo",
  },
] as const;

const CRITERIA = [
  "Empiezo por lo que se atasca en el negocio, no por la herramienta de moda.",
  "Si una web clara resuelve el problema, no vendo una automatización.",
  "Si un flujo sencillo basta, no propongo un sistema propio ni inteligencia artificial.",
  "El mantenimiento entra cuando el proyecto lo necesita, no como un extra automático.",
] as const;

function DotPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.55) 0.5px, transparent 0.5px)",
        backgroundSize: "18px 18px",
        opacity: 0.025,
      }}
      aria-hidden
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
      {children}
    </p>
  );
}

function IdentityCut() {
  return (
    <div className="relative h-10" aria-hidden>
      <div
        className="absolute inset-0 bg-[#251c49]"
        style={{ clipPath: "polygon(28% 0, 100% 0, 100% 100%, 48% 100%)" }}
      />
      <div
        className="absolute inset-0 bg-[#3a2d6b]"
        style={{ clipPath: "polygon(62% 0, 100% 0, 100% 100%, 78% 100%)" }}
      />
    </div>
  );
}

export function WhatIBuild() {
  // Para que la diagonal ARRANQUE exactamente donde termina la de StrategicProfile,
  // medimos: el hero (define la pendiente, 18% por cada alto de hero), la banda real
  // de StrategicProfile (de ahí salen sus X de salida) y esta propia banda.
  const [heroHeight, setHeroHeight] = useState<number | null>(null);
  const [stratBandHeight, setStratBandHeight] = useState<number | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const [bandHeight, setBandHeight] = useState<number | null>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-editorial");
    if (!hero) return;
    const measure = () => setHeroHeight(hero.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let ro: ResizeObserver | null = null;
    let raf = 0;
    const attach = () => {
      const el = document.getElementById("strategic-diagonal-band");
      if (!el) {
        raf = requestAnimationFrame(attach);
        return;
      }
      const measure = () => setStratBandHeight(el.offsetHeight || null);
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(el);
    };
    attach();
    return () => {
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const measure = () => setBandHeight(el.clientHeight || null);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Misma fórmula que StrategicProfile (greyBottom = 45 + 18·ratio). Sus X de SALIDA
  // (abajo) son el ARRANQUE (arriba) de esta sección. Desde ahí, reflejamos la
  // pendiente hacia la izquierda (igual que el hero) y dejamos que las diagonales
  // sigan su curso hasta donde alcancen dentro de la sección.
  const ratioStrat = heroHeight && stratBandHeight ? stratBandHeight / heroHeight : 1.5;
  const ratioSelf = heroHeight && bandHeight ? bandHeight / heroHeight : 2.4;

  const topGrey = 45 + 18 * ratioStrat;
  const topVioletEdge = 61 + 18 * ratioStrat;
  const topLightRight = 64 + 18 * ratioStrat;

  const fmt = (n: number) => n.toFixed(2);
  const greyTop = fmt(topGrey);
  const greyBottom = fmt(topGrey - 18 * ratioSelf);
  const violetTop = fmt(topVioletEdge);
  const violetBottom = fmt(topVioletEdge - 18 * ratioSelf);
  const lightTopLeft = fmt(topVioletEdge);
  const lightTopRight = fmt(topLightRight);
  const lightBottomLeft = fmt(topVioletEdge - 18 * ratioSelf);
  const lightBottomRight = fmt(topLightRight - 18 * ratioSelf);

  return (
    <section
      id="entregables"
      className="relative scroll-mt-24 w-full overflow-x-clip overflow-y-visible pt-16 pb-20 sm:pt-20 sm:pb-28"
      style={{ backgroundColor: SECTION_BG }}
      aria-labelledby="entregables-heading"
    >
      {/* Fondo diagonal (desktop) — CONTINÚA la diagonal de StrategicProfile.
          Arranca EXACTAMENTE en las X donde aquélla termina (mismas anchuras de panel)
          y refleja la pendiente del hero hacia la izquierda. Sin degradados: las
          diagonales siguen su curso hasta donde alcancen dentro de la sección.
          inset-0 → arranca en el borde superior, pegado al strip (sin hueco). */}
      <div
        ref={bandRef}
        className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-[#12151f]"
          style={{
            clipPath: `polygon(${greyTop}% 0, 100% 0, 100% 100%, ${greyBottom}% 100%)`,
          }}
        />
        <div
          className="absolute inset-0 bg-[#251c49]"
          style={{
            clipPath: `polygon(${violetTop}% 0, 100% 0, 100% 100%, ${violetBottom}% 100%)`,
          }}
        />
        <div
          className="absolute inset-0 bg-[#3a2d6b]/55"
          style={{
            clipPath: `polygon(${lightTopLeft}% 0, ${lightTopRight}% 0, ${lightBottomRight}% 100%, ${lightBottomLeft}% 100%)`,
          }}
        />
      </div>

      {/* Móvil/tablet: franjas a altura completa, lado derecho, geometría fija. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-[#12151f]"
          style={{ clipPath: "polygon(28% 0, 100% 0, 100% 100%, 55% 100%)" }}
        />
        <div
          className="absolute inset-0 bg-[#251c49]"
          style={{ clipPath: "polygon(43% 0, 100% 0, 100% 100%, 70% 100%)" }}
        />
        <div
          className="absolute inset-0 bg-[#3a2d6b]/55"
          style={{ clipPath: "polygon(43% 0, 46% 0, 73% 100%, 70% 100%)" }}
        />
      </div>

      <DotPattern />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        <FadeIn className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
          <div>
            <SectionLabel>{OPERATOR.fullName}</SectionLabel>
            <h2
              id="entregables-heading"
              className="mt-4 max-w-[18ch] font-serif text-[clamp(1.85rem,4.6vw,3.15rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#F3F1EB]"
            >
              Detrás de AGI hay quien analiza, diseña y desarrolla.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
              Soy {OPERATOR.fullName}, fundador y desarrollador de AGI TheCreator.
              El estudio sigue siendo la marca. El trabajo lo hago yo, en directo,
              con negocios de toda España.
            </p>
          </div>
          {/* Retrato: sustituir este bloque por una fotografía real de Abel cuando exista. */}
          <div className="relative w-full overflow-hidden border border-white/10 bg-[#12151f]">
            <div className="flex items-center gap-4 px-5 py-5 sm:gap-5 sm:px-6">
              <Image
                src="/logos/NavbarAGI.webp"
                alt="AGI TheCreator"
                width={167}
                height={56}
                className="h-14 w-auto shrink-0"
              />
              <div className="min-w-0 border-l border-white/10 pl-4 sm:pl-5">
                <p className="text-[14px] font-medium leading-snug text-[#F3F1EB]">
                  {OPERATOR.fullName}
                </p>
                <p className="mt-1 text-[12px] text-zinc-400">Fundador y desarrollador</p>
                <p className="mt-2.5 text-[12px] leading-relaxed text-zinc-400">{CONTACT_LOCATION}</p>
              </div>
            </div>
            <IdentityCut />
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <SectionLabel>Quién soy y cómo trabajo</SectionLabel>
            <h3 className="mt-3 font-serif text-[clamp(1.35rem,2.4vw,1.75rem)] font-normal tracking-[-0.02em] text-[#F3F1EB]">
              Primero el problema. Después la herramienta.
            </h3>
          </div>
          <div className="space-y-4 text-[15px] leading-[1.75] text-zinc-400">
            <p>
              Desarrollo webs, rediseños, automatizaciones, integraciones y
              sistemas a medida. Hablo contigo, cierro el alcance y escribo el
              código. No hay un equipo detrás del nombre.
            </p>
            <p>
              Prefiero entender qué se atasca antes de elegir una tecnología.
              Si el problema se resuelve con una página clara, me quedo ahí.
              La automatización y la inteligencia artificial entran cuando el
              proceso lo pide, no para adornar la propuesta.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <SectionLabel>Qué puedo construir</SectionLabel>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {AREAS.map((area) => (
              <li key={area.title} className="border border-white/10 bg-[#12151f] p-5">
                <h3 className="font-serif text-[1.2rem] font-normal tracking-[-0.02em] text-[#F3F1EB]">
                  {area.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-zinc-400">{area.body}</p>
                <Link
                  href={area.href}
                  className="mt-5 inline-flex text-[13px] text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] transition-colors hover:text-white"
                >
                  {area.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <SectionLabel>Cómo entiendo un proyecto</SectionLabel>
            <h3 className="mt-3 font-serif text-[clamp(1.35rem,2.4vw,1.75rem)] font-normal tracking-[-0.02em] text-[#F3F1EB]">
              No instalo una solución genérica y ya.
            </h3>
            <p className="mt-4 text-[15px] leading-[1.75] text-zinc-400">
              El recorrido de un encargo, con sus fases, está en{" "}
              <Link href="/como-trabajamos" className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
                cómo trabajamos
              </Link>
              . Aquí está el criterio con el que decido.
            </p>
          </div>
          <ul className="space-y-3">
            {CRITERIA.map((item) => (
              <li key={item} className="border-l border-violet-400/40 pl-4 text-[14px] leading-[1.7] text-zinc-300">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <SectionLabel>Colaboración</SectionLabel>
          <div className="mt-6 grid items-end gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
            <p className="max-w-[48ch] text-[15px] leading-[1.75] text-zinc-400">
              Cuando un proyecto pide diseño gráfico, colaboro con Aitor Martínez
              Rollán, de{" "}
              <a
                href={COLLABORATORS[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white"
              >
                {COLLABORATORS[0].studio}
              </a>
              . Entra en ese encargo. No es cofundador de AGI ni forma parte de un
              equipo fijo.
            </p>
            <div className="relative w-full overflow-hidden border border-white/10 bg-[#12151f]">
              <div className="flex items-center gap-4 px-5 py-5 sm:gap-5 sm:px-6">
                <a
                  href={COLLABORATORS[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-violet-400/50"
                >
                  <Image
                    src="/logos/rollan-studio.png"
                    alt={`${COLLABORATORS[0].studio} — web de Aitor Martínez Rollán`}
                    width={839}
                    height={395}
                    className="h-12 w-auto brightness-[2.4] contrast-[1.05]"
                  />
                </a>
                <div className="min-w-0 border-l border-white/10 pl-4 sm:pl-5">
                  <p className="text-[14px] font-medium leading-snug text-[#F3F1EB]">
                    Aitor Martínez Rollán
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-400">{COLLABORATORS[0].role}</p>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-zinc-400">{COLLABORATORS[0].studio}</p>
                </div>
              </div>
              <IdentityCut />
            </div>
          </div>
        </div>

        <FadeIn className="mt-16 border-t border-white/10 pt-10">
          <p className="max-w-[46ch] font-serif text-[clamp(1.35rem,2.6vw,1.8rem)] font-normal leading-[1.2] tracking-[-0.02em] text-[#F3F1EB]">
            Si encaja, el siguiente paso es concreto.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
            <Link href="/como-trabajamos" className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
              Cómo trabajamos
            </Link>
            <Link href="/desarrollo-web" className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
              Desarrollo web
            </Link>
            <Link href="/automatizacion-de-procesos" className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
              Automatización
            </Link>
            <Link href="/presupuesto" className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
              Preparar presupuesto
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
