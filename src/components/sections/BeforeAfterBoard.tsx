"use client";

import { Patrick_Hand } from "next/font/google";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Pizarra editorial ANTES / AHORA — pieza embebible.
 * Pizarra verde clásica de aula, tiza blanca fina, división central imperfecta y
 * correcciones hechas a mano. Compacta, con aire real (espacios vacíos) y sensación
 * de objeto físico. NO es una card SaaS ni un checklist.
 */

/**
 * Fuente tipo tiza/Chalkboard. La auto-aloja next/font y se aplica con `.className`,
 * así funciona igual en todos los navegadores (no depende de fuentes del sistema ni
 * de variables CSS que puedan no resolverse).
 */
const chalk = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

type BeforeItem = {
  text: string;
  /** Si existe, la frase aparece tachada y reescrita encima. */
  correction?: string;
  /** Tipo de tachado a mano: línea horizontal o aspa (X). */
  strike?: "line" | "cross";
  /** Intensidad del emborronado (0–1) para romper la uniformidad. */
  smudge?: number;
  /** Forma del emborronado (0–2): cada una es una mancha orgánica distinta. */
  smudgeShape?: 0 | 1 | 2;
  tilt: number;
  shift: number;
};

const BEFORE: BeforeItem[] = [
  { text: "buscar mensajes perdidos", correction: "todo organizado", strike: "cross", smudge: 0.42, smudgeShape: 0, tilt: -1.8, shift: 4 },
  { text: "copiar datos a mano", correction: "entra solo", strike: "line", smudge: 0.26, smudgeShape: 1, tilt: 1.4, shift: -3 },
  { text: "responder siempre lo mismo", tilt: -1.1, shift: 7 },
  { text: "horarios desactualizados", tilt: 2.1, shift: -2 },
  { text: "te lo mando luego", correction: "enviado", strike: "cross", smudge: 0.34, smudgeShape: 2, tilt: -1.5, shift: 5 },
  { text: "notas sueltas", tilt: 1.9, shift: -6 },
  { text: "mensajes fuera de hora", tilt: -1.3, shift: 3 },
];

type AfterItem = { text: string; tilt: number; shift: number };

const AFTER: AfterItem[] = [
  { text: "reservas organizadas", tilt: 1.6, shift: -4 },
  { text: "formularios conectados", tilt: -1.9, shift: 5 },
  { text: "menos cosas pendientes", tilt: 1.2, shift: -2 },
  { text: "menos caos diario", tilt: -2.1, shift: 6 },
  { text: "todo funcionando mejor", tilt: 1.5, shift: -3 },
];

/** Textura de tiza / desgaste muy sutil sobre el verde. */
const CHALK_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Borde irregular tipo tiza sobre las letras (escrito a mano). */
const CHALK_FILTER = { filter: "url(#chalk-texture)" } as const;

const reveal = {
  hidden: { opacity: 0, y: 7 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.14 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.32, 1] as const },
  }),
};

const STRIKE_GRAD =
  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.82) 9%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.85) 91%, rgba(255,255,255,0) 100%)";

/** Una raya de tiza que cruza el texto por el centro (se dibuja sola). `deg` = inclinación. */
function StrikeLine({
  active,
  delay,
  deg,
}: {
  active: boolean;
  delay: number;
  deg: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-[-5%] top-[calc(50%-1px)] block h-[2px] w-[110%] origin-center rounded-full"
      style={{ background: STRIKE_GRAD, filter: "blur(0.35px)", rotate: `${deg}deg` }}
      initial={{ scaleX: 0 }}
      animate={active ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    />
  );
}

/** Tachado a mano: línea diagonal o aspa (X) centrada sobre la frase. */
function HandStrike({
  active,
  delay,
  variant,
}: {
  active: boolean;
  delay: number;
  variant: "line" | "cross";
}) {
  if (variant === "cross") {
    return (
      <>
        <StrikeLine active={active} delay={delay} deg={13} />
        <StrikeLine active={active} delay={delay + 0.13} deg={-13} />
      </>
    );
  }
  return <StrikeLine active={active} delay={delay} deg={-8} />;
}

/**
 * Máscaras orgánicas (unión de varias manchas radiales). Sin lados ni esquinas:
 * todos los bordes se desvanecen a transparente, así parece un borrón irregular.
 */
const SMUDGE_SHAPES = [
  "radial-gradient(38% 60% at 26% 44%, #000, transparent 70%), radial-gradient(34% 50% at 58% 58%, #000, transparent 72%), radial-gradient(26% 42% at 80% 40%, #000, transparent 74%)",
  "radial-gradient(40% 56% at 34% 56%, #000, transparent 70%), radial-gradient(42% 48% at 62% 42%, #000, transparent 72%), radial-gradient(24% 44% at 84% 60%, #000, transparent 75%)",
  "radial-gradient(44% 58% at 30% 48%, #000, transparent 70%), radial-gradient(30% 50% at 56% 58%, #000, transparent 73%), radial-gradient(28% 40% at 82% 44%, #000, transparent 74%)",
] as const;

/**
 * Tiza a medio borrar: polvo de tiza suave dentro de una mancha orgánica.
 * `intensity` baja el impacto y `shape` da una forma distinta a cada borrón.
 */
function ErasedSmudge({
  intensity,
  shape,
  rotate,
}: {
  intensity: number;
  shape: 0 | 1 | 2;
  rotate: number;
}) {
  const mask = SMUDGE_SHAPES[shape];
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-x-[16%] -inset-y-[26%] z-1 block"
      style={{
        rotate: `${rotate}deg`,
        mixBlendMode: "screen",
        opacity: intensity,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      {/* Polvo de tiza (grano), tenue */}
      <span
        className="absolute inset-0 block"
        style={{
          backgroundImage: CHALK_GRAIN,
          backgroundSize: "60px 60px",
          opacity: 0.5,
          filter: "blur(0.5px) contrast(1.3)",
        }}
      />
      {/* Leve barrido de borrador (apenas perceptible) */}
      <span
        className="absolute inset-0 block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(92deg, rgba(255,255,255,0) 0 6px, rgba(255,255,255,0.05) 6px 8px, rgba(255,255,255,0) 8px 16px)",
          filter: "blur(1px)",
        }}
      />
    </span>
  );
}

/** Marca de tiza al inicio de cada línea (no un bullet perfecto). */
function ChalkTick() {
  return (
    <span
      aria-hidden
      className="mt-[0.6em] mr-[0.5em] inline-block h-[2px] w-[0.7em] shrink-0 -rotate-3 rounded-full opacity-60"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.8) 60%, rgba(255,255,255,0.2))",
        filter: "blur(0.3px)",
      }}
    />
  );
}

const LINE = "text-[clamp(0.85rem,2.2vw,1.3rem)] leading-[1.12]";

function BeforeColumn({ active }: { active: boolean }) {
  return (
    <ul className="flex flex-col gap-[clamp(0.6rem,1.7vw,1rem)]">
      {BEFORE.map((item, i) => (
        <motion.li
          key={item.text}
          custom={i}
          variants={reveal}
          initial="hidden"
          animate={active ? "show" : "hidden"}
          className="flex items-start"
          style={{ rotate: `${item.tilt}deg`, marginLeft: item.shift }}
        >
          <ChalkTick />
          <div className="min-w-0">
            {item.correction ? (
              <motion.span
                className={`mb-[0.1em] block text-white ${LINE}`}
                style={{ textShadow: "0 0 6px rgba(255,255,255,0.12)", ...CHALK_FILTER }}
                initial={{ opacity: 0, y: 4 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.45 }}
              >
                <span className="mr-1 text-white/55">↳</span>
                {item.correction}
              </motion.span>
            ) : null}
            <span
              className={`relative inline-block ${LINE}`}
              style={{
                color: item.correction ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.86)",
                textShadow: "0 0 5px rgba(255,255,255,0.08)",
                filter: item.correction
                  ? "url(#chalk-texture) blur(0.45px)"
                  : "url(#chalk-texture)",
              }}
            >
              <span className="relative z-0">{item.text}</span>
              {item.correction ? (
                <>
                  <ErasedSmudge
                    intensity={item.smudge ?? 0.4}
                    shape={item.smudgeShape ?? 0}
                    rotate={i % 2 === 0 ? -2 : 1.6}
                  />
                  <HandStrike
                    active={active}
                    delay={0.4 + i * 0.08}
                    variant={item.strike ?? "line"}
                  />
                </>
              ) : null}
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function AfterColumn({ active }: { active: boolean }) {
  return (
    <ul className="flex flex-col gap-[clamp(0.75rem,2.2vw,1.3rem)]">
      {AFTER.map((item, i) => (
        <motion.li
          key={item.text}
          custom={i}
          variants={reveal}
          initial="hidden"
          animate={active ? "show" : "hidden"}
          className="flex items-start"
          style={{ rotate: `${item.tilt}deg`, marginLeft: item.shift }}
        >
          <ChalkTick />
          <span
            className={`text-white/90 ${LINE}`}
            style={{ textShadow: "0 0 6px rgba(255,255,255,0.12)", ...CHALK_FILTER }}
          >
            {item.text}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

/** Línea vertical central de tiza: torcida, grosor irregular, no una línea CSS perfecta. */
function ChalkDivider({ active }: { active: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-12 -translate-x-1/2 sm:block"
      aria-hidden
    >
      <svg className="h-full w-full" viewBox="0 0 48 400" preserveAspectRatio="none" fill="none">
        <defs>
          <filter id="chalk-rough-board">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={5} />
          </filter>
        </defs>
        <g filter="url(#chalk-rough-board)">
          <motion.path
            d="M25 8 C 22 90, 28 150, 23 210 C 19 270, 27 330, 24 392"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={2.1}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 0.05 }}
          />
          <motion.path
            d="M24 16 C 27 80, 21 160, 25 220 C 29 280, 22 340, 24 386"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth={1}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.12 }}
          />
        </g>
      </svg>
    </div>
  );
}

export function BeforeAfterBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div className={`${chalk.className} mx-auto w-full max-w-[540px]`} ref={ref}>
      {/* Filtro de textura de tiza para las letras (bordes irregulares, escrito a mano) */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden focusable="false">
        <filter id="chalk-texture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.78 0.92" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* Marco de madera — sensación de objeto físico real */}
      <div
        className="relative rounded-[12px] p-[9px] sm:p-[11px]"
        style={{
          background:
            "linear-gradient(150deg, #5a4226 0%, #432f1b 45%, #38271680 60%, #4a3320 100%)",
          boxShadow:
            "0 28px 52px -26px rgba(0,0,0,0.85), 0 10px 24px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 4px rgba(0,0,0,0.45)",
        }}
      >
        {/* Superficie de la pizarra */}
        <div
          className="relative overflow-hidden rounded-[6px]"
          style={{
            background:
              "radial-gradient(120% 90% at 38% 26%, #3d4d42 0%, #354539 42%, #2c3a30 72%, #26322a 100%)",
            boxShadow:
              "inset 0 2px 10px rgba(0,0,0,0.5), inset 0 -1px 6px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.35)",
          }}
        >
          {/* Textura de tiza / desgaste */}
          <div
            className="pointer-events-none absolute inset-0 z-0 mix-blend-soft-light"
            style={{ backgroundImage: CHALK_GRAIN, backgroundSize: "200px 200px", opacity: 0.07 }}
            aria-hidden
          />
          {/* Borrones / desgaste muy discreto */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(38% 24% at 74% 22%, rgba(255,255,255,0.05), transparent 70%), radial-gradient(32% 22% at 20% 82%, rgba(255,255,255,0.04), transparent 70%)",
            }}
            aria-hidden
          />
          {/* Iluminación suave superior */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 22%, rgba(0,0,0,0.18) 100%)",
            }}
            aria-hidden
          />

          <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8">
            {/* Títulos superiores — mucho aire */}
            <div className="mb-6 grid grid-cols-2 items-end gap-6 sm:mb-8">
              <motion.h3
                className="text-[clamp(1.3rem,4.4vw,2rem)] font-medium leading-none tracking-wide text-white/95"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.14)", rotate: "-1.6deg", ...CHALK_FILTER }}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                Antes
              </motion.h3>
              <motion.h3
                className="pl-3 text-[clamp(1.3rem,4.4vw,2rem)] font-medium leading-none tracking-wide text-white/95 sm:pl-5"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.14)", rotate: "1.3deg", ...CHALK_FILTER }}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                Ahora
              </motion.h3>
            </div>

            {/* Cuerpo a dos columnas con división central de tiza */}
            <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
              <ChalkDivider active={inView} />
              <div className="pr-1 sm:pr-5">
                <BeforeColumn active={inView} />
              </div>
              <div className="pl-2 sm:pl-5">
                <AfterColumn active={inView} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeforeAfterBoard;
