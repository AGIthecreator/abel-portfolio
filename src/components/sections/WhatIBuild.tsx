"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";

const SECTION_BG = "#070b13";
/** Hueso cálido — coherente con el resto de la web */
const BONE = "#F3F1EB";
/** Negro casi absoluto — banda del statement */
const NEAR_BLACK = "#030305";

/** Izquierda: lo que todos prometen (vacío, intercambiable). */
const PROMISES = [
  "Soluciones a medida",
  "Transformación digital",
  "Compromiso con la excelencia",
  "Optimización de procesos",
  "Presencia digital potente",
  "Ecosistema digital",
  "Metodologías ágiles",
  "Valor añadido",
  "Tecnología de última generación",
  "Sinergias digitales",
] as const;

/** Derecha: lo que de verdad mueve un negocio. */
const REALITY = [
  "Que aparezcas cuando te buscan.",
  "Que no se vayan a la competencia por esperar una respuesta.",
  "Que reservar sea más fácil que llamar.",
  "Que los clientes encuentren la información sin preguntarla.",
  "Que no acabes gestionando el negocio por WhatsApp.",
  "Que tu web trabaje incluso cuando tú no estás.",
  "Que tu negocio parezca tan profesional como realmente es.",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.32, 1] as const },
  },
};

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

/** Check fino. `muted` lo deja apagado (columna izquierda). */
function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      className={`mt-[3px] h-3.5 w-3.5 shrink-0 ${
        muted ? "text-zinc-600" : "text-violet-300/90"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={muted ? 1.5 : 2}
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <p
      className={`mb-6 text-[11px] font-medium uppercase leading-none sm:mb-7 ${
        muted
          ? "tracking-[0.28em] text-zinc-600"
          : "tracking-[0.26em] text-violet-300/90"
      }`}
    >
      {children}
    </p>
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
      className="relative -mt-6 scroll-mt-24 w-full overflow-x-clip overflow-y-visible pt-16 pb-20 sm:-mt-8 sm:pt-20 sm:pb-28"
      style={{ backgroundColor: SECTION_BG }}
      aria-label="¿Por qué hacerlo conmigo?"
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

      <DotPattern />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        {/* CABECERA */}
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-[clamp(1.7rem,5.2vw,2.9rem)] font-bold leading-[1.08] tracking-tight text-zinc-50">
            <span className="text-violet-300">¿Por qué</span> hacerlo conmigo?
          </h2>
          <p className="mx-auto mt-5 max-w-[24ch] text-balance font-serif text-[clamp(1.05rem,3vw,1.45rem)] font-normal leading-snug text-zinc-300 sm:max-w-none">
            Porque ya hay <span className="text-zinc-500">demasiadas webs</span>{" "}
            diciendo exactamente lo mismo.
          </p>
          <div
            className="mx-auto mt-8 h-px w-[clamp(120px,38%,300px)]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(167,139,250,0.5) 50%, transparent)",
            }}
            aria-hidden
          />
        </FadeIn>

        {/* COMPARATIVA — línea vertical fina al centro, mucho aire */}
        <motion.div
          className="relative mt-14 grid grid-cols-1 gap-y-12 sm:mt-20 sm:grid-cols-2 sm:gap-x-12 lg:gap-x-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {/* Línea vertical central (solo desktop) */}
          <div
            className="pointer-events-none absolute inset-y-1 left-1/2 hidden w-px -translate-x-1/2 sm:block"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(255,255,255,0.14) 12%, rgba(255,255,255,0.14) 88%, transparent)",
            }}
            aria-hidden
          />

          {/* IZQUIERDA — lo que suelen prometer (apagado) */}
          <motion.div variants={fadeUp} className="sm:pr-2 lg:pr-6">
            <Eyebrow muted>Lo que suelen prometer</Eyebrow>
            <ul className="space-y-3.5">
              {PROMISES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check muted />
                  <span className="text-[15px] leading-relaxed text-zinc-500 sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-[34ch] text-[13.5px] italic leading-relaxed text-zinc-600">
              Si has visitado varias webs antes de llegar aquí, probablemente ya
              has leído la mitad de esta lista unas cuantas veces.
            </p>
          </motion.div>

          {/* DERECHA — lo que realmente importa (hueso, más presencia) */}
          <motion.div variants={fadeUp} className="sm:pl-2 lg:pl-6">
            <Eyebrow>Lo que realmente importa</Eyebrow>
            <ul className="space-y-4">
              {REALITY.map((item, i) => {
                const highlight = i === REALITY.length - 1;
                return (
                  <li
                    key={item}
                    className={`flex items-start gap-3 ${highlight ? "mt-1.5" : ""}`}
                  >
                    <Check />
                    <span
                      className={`font-medium leading-relaxed ${
                        highlight
                          ? "text-[19px] font-semibold sm:text-[23px]"
                          : "text-[15.5px] sm:text-[17px]"
                      }`}
                      style={{ color: BONE }}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>

        {/* STATEMENT EDITORIAL — banda negra casi absoluta a todo el ancho de la PÁGINA */}
        <div className="relative left-1/2 mt-24 w-screen max-w-none -translate-x-1/2 sm:mt-32">
          <div className="py-5 sm:py-12" style={{ backgroundColor: NEAR_BLACK }}>
            <FadeIn className="mx-auto max-w-3xl px-5 text-center sm:px-6">
              <div className="relative inline-block px-7 py-6 sm:px-10">
                {/* Esquinas blancas discretas */}
                <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-white/25" />
                <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-white/25" />
                <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/25" />
                <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/25" />
                <p className="font-serif text-[clamp(1.45rem,4.6vw,2.5rem)] font-normal leading-[1.22] tracking-[-0.02em] text-balance">
                  <span className="block text-zinc-100">
                    No puedo prometer multiplicar todas tus ventas por diez.
                  </span>
                  <span className="mt-7 block text-zinc-500">
                    Tampoco hacerte millonario antes del viernes.
                  </span>
                  <span className="mt-7 block" style={{ color: BONE }}>
                    Lo que sí puedo hacer es que dentro de unos meses te
                    preguntes{" "}
                    <span className="text-violet-300">
                      por qué no lo hiciste antes
                    </span>
                  </span>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* CIERRE — calmado, sin presión */}
        <FadeIn className="mx-auto mt-24 max-w-xl text-center sm:mt-32">
          <div className="space-y-8">
            <p className="text-[clamp(1.1rem,3.4vw,1.5rem)] leading-snug tracking-[-0.01em]">
              <span className="text-zinc-100">¿Te he convencido?</span>{" "}
              <span className="text-zinc-500">Perfecto.</span>
            </p>
            <p className="text-[clamp(1.1rem,3.4vw,1.5rem)] leading-snug tracking-[-0.01em]">
              <span className="text-zinc-100">¿No te he convencido?</span>{" "}
              <span className="text-zinc-500">También lo entiendo.</span>
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-md space-y-5 text-[15px] leading-[1.75] text-zinc-400 sm:text-base">
            <p>
              Al final una web no se compra porque alguien escriba cuatro frases
              bonitas.
            </p>
            <p>Se compra cuando ves claro que puede ayudarte.</p>
          </div>

          <p className="mx-auto mt-12 max-w-md text-[clamp(1rem,2.8vw,1.15rem)] leading-relaxed text-zinc-200">
            No necesito decirte que hago “transformación digital”.
            <br />
            Necesito que dentro de seis meses sigas pensando:
            <br />
            <span className="font-semibold">“Menos mal que hice esto.”</span>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
