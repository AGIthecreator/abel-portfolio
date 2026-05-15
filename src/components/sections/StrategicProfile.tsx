"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";

const OFF_WHITE = "#F3F1EB";
const DEEP_BLACK = "#070b13";

const CHECK_TASKS = [
  "Mensaje respondido",
  "Cita guardada",
  "Recordatorio enviado",
  "Ficha ordenada",
] as const;

const PEACE_LINES = ["Menos ruido.", "Más control.", "Mejor impresión."] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.32, 1] as const },
  },
};

const CARD_HERO =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#d8d2c8] bg-[#F3F1EB] p-4 shadow-[0_10px_34px_-18px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.68)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[#c9c2b6] sm:p-5";
const CARD_DARK =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/14 bg-[#0b1019] p-4 shadow-[0_12px_34px_-16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/22 sm:p-5";

const GRAIN_STYLE: React.CSSProperties = {
  backgroundColor: OFF_WHITE,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
};

/** Textura de escamas — distinta del grain del hero y del checking */
const PARCHMENT_BG: React.CSSProperties = {
  backgroundColor: "#E3D9C8",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48' viewBox='0 0 56 48'%3E%3Cdefs%3E%3Cpattern id='s' width='28' height='24' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 12c7-8 21-8 28 0s21 8 28 0v12c-7 8-21 8-28 0S7 20 0 12z' fill='none' stroke='%23a89578' stroke-width='0.55' opacity='0.38'/%3E%3Cpath d='M-14 0c7-8 21-8 28 0s21 8 28 0' fill='none' stroke='%23b8a48c' stroke-width='0.45' opacity='0.28' transform='translate(0 12)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23s)'/%3E%3C/svg%3E")`,
  backgroundSize: "56px 48px",
};

function DotPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 0.5px, transparent 0.5px)",
        backgroundSize: "18px 18px",
        opacity: 0.02,
      }}
      aria-hidden
    />
  );
}

function BpCornerTicksOverlay({ light = false }: { light?: boolean }) {
  const stroke = light ? "rgba(15,23,42,0.22)" : "rgba(100,116,139,0.4)";
  const tick = (pos: string) => (
    <svg className={`pointer-events-none absolute ${pos} z-20 h-3.5 w-3.5`} viewBox="0 0 12 12" aria-hidden>
      <path d="M1 1h3M1 1v3" stroke={stroke} strokeWidth="1" fill="none" />
    </svg>
  );
  return (
    <>
      {tick("left-1 top-1")}
      {tick("right-1 top-1 scale-x-[-1]")}
      {tick("left-1 bottom-1 scale-y-[-1]")}
      {tick("right-1 bottom-1 scale-[-1]")}
    </>
  );
}

/** Comparativa web — obsoleta atrás/pequeña, premium delante */
function VisualPercepcion() {
  return (
    <motion.div
      className="relative mx-auto mt-auto h-[126px] w-full max-w-lg sm:h-[134px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      aria-hidden
    >
      <BpCornerTicksOverlay light />

      <motion.div
        className="absolute top-5 left-[3%] z-10 w-[38%] max-w-[155px] -rotate-3 overflow-hidden rounded-md border border-[#b9b0a2] bg-[#d8d0c2] shadow-[0_12px_28px_-18px_rgba(15,23,42,0.35)]"
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex h-4 items-center justify-between border-b border-[#b9b0a2] px-1.5">
          <span className="h-1.5 w-8 rounded-full bg-[#a9a092]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#a9a092]" />
        </div>
        <div className="space-y-1.5 px-2 py-2.5">
          <span className="block h-2 w-16 rounded bg-[#a99f90]" />
          <span className="block h-1.5 w-full rounded bg-[#c3b8a8]" />
          <span className="block h-1.5 w-[76%] rounded bg-[#c3b8a8]" />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-[#c8bdad] px-2 py-2">
          <span className="h-5 rounded bg-[#c2b6a6]" />
          <span className="h-5 rounded bg-[#c2b6a6]" />
          <span className="h-5 rounded bg-[#c2b6a6]" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-0 right-0 z-30 w-[61%] max-w-[275px] overflow-hidden rounded-lg border border-[#d7d1c8] bg-[#fbfaf7] shadow-[0_22px_42px_-18px_rgba(15,23,42,0.34)]"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12 }}
      >
        <div className="flex h-6 items-center justify-between border-b border-[#e8e3da] px-2.5">
          <span className="text-[8px] font-semibold leading-none tracking-tight text-zinc-900">Nombre del negocio</span>
          <div className="flex items-center gap-1.5 text-[6px] font-medium leading-none text-zinc-500" aria-hidden>
            <span>Inicio</span>
            <span>Servicios</span>
            <span>Reserva</span>
          </div>
        </div>
        <div className="relative h-[70px] overflow-hidden bg-[#111827] px-3 py-3 sm:h-[76px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(16,185,129,0.22),transparent_38%),linear-gradient(135deg,#111827,#0b1019)]" />
          <p className="relative text-[7px] font-medium tracking-[0.16em] text-emerald-200/85 uppercase">
            Presencia cuidada
          </p>
          <span className="relative mt-2 block h-2.5 w-24 rounded-full bg-white/88" />
          <span className="relative mt-1.5 block h-1.5 w-32 rounded-full bg-white/35" />
          <div className="absolute right-3 bottom-3 grid h-8 w-14 place-items-center rounded-md border border-white/15 bg-white/8">
            <span className="h-3 w-8 rounded-full bg-emerald-300/75" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-[#e7e5e4] px-2.5 py-2">
          <p className="text-[7px] text-zinc-500">Claro. Actual. Fácil de contactar.</p>
          <span className="shrink-0 rounded-md bg-emerald-700 px-2.5 py-1 text-[8px] font-semibold text-white">Reservar</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ArrowFlow() {
  return (
    <svg className="mx-2 h-6 w-10 shrink-0 text-zinc-400 sm:h-7 sm:w-12" viewBox="0 0 48 24" fill="none" aria-hidden>
      <path d="M2 12h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 6l8 6-8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Autoridad — el precio se entiende mejor cuando la presencia acompaña */
function VisualAutoridad() {
  return (
    <div className="relative mt-4 min-h-[94px]" aria-hidden>
      <div className="absolute left-0 top-1 w-[46%] rounded-lg border border-white/10 bg-white/[0.035] p-2.5">
        <p className="text-[9px] font-medium text-zinc-500">Antes</p>
        <p className="mt-1 text-[11px] leading-snug text-zinc-400">“¿Y si buscamos otro más barato?”</p>
      </div>
      <div className="absolute top-9 left-1/2 -translate-x-1/2 opacity-55">
        <ArrowFlow />
      </div>
      <div className="absolute right-0 top-0 w-[52%] rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-3 shadow-[0_18px_34px_-22px_rgba(16,185,129,0.65)]">
        <p className="text-[9px] font-medium text-emerald-300/70">Después</p>
        <p className="mt-1 text-[12px] font-medium leading-snug text-zinc-100">“Se nota que aquí cuidan las cosas.”</p>
        <span className="mt-2 block h-px w-full bg-linear-to-r from-emerald-300/45 to-transparent" />
      </div>
    </div>
  );
}

/** Reserva nocturna — sistema invisible, no dashboard */
function VisualMotor() {
  return (
    <div className="relative mt-4 min-h-[104px] overflow-hidden rounded-lg border border-white/10 bg-[#05080f] p-3" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[20px] leading-none tracking-[-0.05em] text-zinc-100">04:00</p>
          <p className="mt-1 text-[9px] text-zinc-500">El negocio está cerrado.</p>
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[8px] font-medium text-emerald-200">
          reserva recibida
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="rounded-md border border-white/9 bg-white/[0.035] p-2">
          <p className="text-[8px] font-medium text-zinc-400">Cliente</p>
          <p className="mt-1 text-[10px] text-zinc-200">Elige hora</p>
        </div>
        <svg className="h-5 w-5 text-emerald-300/55" viewBox="0 0 24 24" fill="none">
          <path d="M4 12h14M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="rounded-md border border-emerald-300/18 bg-emerald-300/[0.055] p-2">
          <p className="text-[8px] font-medium text-emerald-300/70">Sistema</p>
          <p className="mt-1 text-[10px] text-zinc-100">Confirma solo</p>
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-2 flex items-center gap-1.5 text-[8px] text-zinc-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
        Sin llamadas perdidas por la mañana
      </div>
    </div>
  );
}

function VisualExcel() {
  const steps = ["Web", "Reserva", "Agenda", "Aviso"] as const;

  return (
    <div className="relative h-full min-h-[130px] w-full overflow-hidden rounded-lg border border-[#d8d2c8] bg-[#fbfaf7] p-3" aria-hidden>
      <BpCornerTicksOverlay light />
      <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-[0.95fr_1.25fr]">
        <div className="flex flex-col justify-between rounded-md border border-[#ded8cf] bg-white/55 p-3">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">Presencia</p>
            <p className="mt-1.5 max-w-[180px] text-[15px] font-semibold leading-tight tracking-[-0.03em] text-zinc-900">
              Una web que ordena la decisión.
            </p>
          </div>
          <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-700 px-2.5 py-1 text-[9px] font-medium text-white">
            pedir cita
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`flex flex-col justify-between rounded-md border p-2 ${
                i === 0
                  ? "border-zinc-300 bg-white"
                  : i === steps.length - 1
                    ? "border-emerald-700/25 bg-emerald-50"
                    : "border-[#ded8cf] bg-white/60"
              }`}
            >
              <span className="text-[8px] font-medium text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-5 text-[9px] font-medium text-zinc-800">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute right-4 bottom-4 h-10 w-10 rounded-full border border-emerald-700/20 bg-emerald-700/10 blur-xl" />
    </div>
  );
}
function Row3Bento() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <motion.div
      ref={ref}
      className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 lg:grid-cols-[0.95fr_auto_1.15fr_0.9fr] lg:items-stretch"
    >
      <motion.div
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#05080f] p-3 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.7)]"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        <BpCornerTicksOverlay />
        <p className="text-[10px] font-medium tracking-[0.16em] text-zinc-500 uppercase">Antes</p>
        <p className="mt-2 text-[15px] font-medium leading-tight text-zinc-100">Demasiadas cosas abiertas a la vez.</p>
        <div className="mt-3 space-y-1.5">
          {["WhatsApps sin cerrar", "Reservas apuntadas a mano", "La web no explica bien"].map((line, i) => (
            <motion.div
              key={line}
              className="flex items-center gap-2 rounded-md border border-white/8 bg-white/[0.035] px-2 py-1.5 text-[10px] text-zinc-500"
              initial={{ opacity: 0, x: -6 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.07 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              {line}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center justify-center">
        <p className="rounded-full border border-white/10 px-3 py-1 text-center font-mono text-[9px] font-bold tracking-[0.22em] text-zinc-500 uppercase">
          Orden
        </p>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-xl border border-[#d8d2c8] p-3"
        style={GRAIN_STYLE}
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.08 }}
      >
        <BpCornerTicksOverlay light />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-500 uppercase">Después</p>
            <p className="mt-1 text-[15px] font-semibold leading-tight text-zinc-900">Una ruta clara para cada consulta.</p>
          </div>
          <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-[9px] font-medium text-white">en control</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CHECK_TASKS.map((task, i) => (
            <motion.div
              key={task}
              className="flex items-center gap-2 rounded-md border border-zinc-300/45 bg-white/45 px-2 py-2 text-[10px] text-zinc-700"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
              {task}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="flex min-h-[128px] min-w-0 flex-col items-center justify-center rounded-xl border border-[#c9bfae]/55 px-4 py-5 text-center"
        style={PARCHMENT_BG}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        <BpCornerTicksOverlay light />
        {PEACE_LINES.map((line, i) => (
          <p
            key={line}
            className={`max-w-[260px] text-[13px] leading-relaxed sm:text-[14px] ${
              i === 0 ? "font-medium text-zinc-800" : "mt-1.5 font-normal text-zinc-600"
            }`}
          >
            {line}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
}

const TESTIMONIALS = [
  {
    scene: "Cafetería",
    title: "Ya no parece una cafetería de barrio cualquiera.",
    quote: "La gente entra con otra sensación. Antes miraban el precio; ahora preguntan por reservar.",
  },
  {
    scene: "Clínica",
    title: "La primera llamada llega con menos dudas.",
    quote: "Cuando ven la web, ya entienden que está todo cuidado antes de venir.",
  },
  {
    scene: "Tienda local",
    title: "Menos mensajes sueltos, más orden.",
    quote: "Las consultas llegan más claras y no tengo que repetir lo mismo todo el día.",
  },
] as const;

function HeroCard({
  title,
  body,
  diagram,
  diagramFixed = false,
  compact = false,
}: {
  title: string;
  body: string;
  diagram: ReactNode;
  diagramFixed?: boolean;
  compact?: boolean;
}) {
  return (
    <article className={`${CARD_HERO}${compact ? " !p-3 sm:!p-4" : ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.5),rgba(243,241,235,0))]" />
      <BpCornerTicksOverlay light />
      <div className={`relative z-10 flex flex-1 flex-col ${diagramFixed ? "pb-[150px] sm:pb-[156px]" : ""}`}>
        <h3
          className={`font-semibold leading-snug tracking-[-0.03em] text-zinc-950 ${
            compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`max-w-[92%] leading-relaxed text-zinc-700 ${
            compact ? "mt-1 text-[12px] sm:text-[13px]" : "mt-1.5 text-[13px] sm:text-sm"
          }`}
        >
          {body}
        </p>
        {!diagramFixed ? (
          <div className={`relative mt-auto min-h-0 w-full shrink-0 ${compact ? "pt-2" : "pt-3"}`}>{diagram}</div>
        ) : null}
      </div>
      {diagramFixed ? (
        <div className="absolute inset-x-0 bottom-0 z-10 h-[146px] px-4 pb-4 sm:h-[152px] sm:px-5 sm:pb-5">
          {diagram}
        </div>
      ) : null}
    </article>
  );
}

/** Un solo bloque cerrado — sin burbujas anidadas */
function DarkClosedCard({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <article className={CARD_DARK}>
      <BpCornerTicksOverlay />
      <div className="relative z-10 flex flex-1 flex-col">
        <h3 className="text-base font-medium leading-snug tracking-[-0.02em] text-zinc-50 sm:text-[1.05rem]">{title}</h3>
        {body ? <p className="mt-1.5 max-w-[95%] text-[12px] leading-relaxed text-zinc-400">{body}</p> : null}
        <div className="relative mt-auto w-full">{children}</div>
      </div>
    </article>
  );
}

function TestimonialCard({
  scene,
  title,
  quote,
}: {
  scene: string;
  title: string;
  quote: string;
}) {
  return (
    <figure className="rounded-lg border border-white/10 bg-[#05080f] p-3 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/14 sm:p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-medium tracking-[0.16em] text-emerald-300/55 uppercase">{scene}</span>
        <span className="h-px flex-1 bg-linear-to-r from-white/12 to-transparent" />
      </div>
      <p className="mt-2 text-[13px] font-medium leading-snug text-zinc-200">{title}</p>
      <blockquote className="mt-1.5 text-[12px] leading-snug text-zinc-500">&ldquo;{quote}&rdquo;</blockquote>
    </figure>
  );
}

export function StrategicProfile() {
  return (
    <section id="perfil" className="relative z-0 -mt-6 w-full overflow-visible sm:-mt-10 lg:-mt-14">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
        <div
          className="relative w-full pt-12 pb-8 text-zinc-200 sm:pt-16 sm:pb-10 lg:pt-18"
          style={{ backgroundColor: DEEP_BLACK }}
        >
          <DotPattern />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-5xl">
              <h2 className="text-3xl font-bold leading-[1.08] tracking-tighter text-zinc-50 sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
                Haz que tu negocio parezca tan serio como el trabajo que haces.
              </h2>
              <p className="mt-2 text-base text-zinc-500 sm:text-lg">
                Antes de llamar, te miran en Google, en la web y en el móvil. Ahí se decide si confían o siguen buscando.
              </p>
            </FadeIn>

            {/* Fila 1 — altura independiente de la fila 2 */}
            <motion.div
              className="mt-6 grid grid-cols-1 items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-2">
                <HeroCard
                  compact
                  title="El cliente te juzga antes de hablar contigo."
                  body="Buscan en Google. Ven tu web. Ven la del vecino. Si la tuya parece antigua, asumen que tu negocio también lo es."
                  diagram={<VisualPercepcion />}
                />
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1">
                <DarkClosedCard
                  title="Tu negocio puede parecer más serio que el de al lado."
                  body="La calidad visual reduce dudas antes de que tengas que explicar nada."
                >
                  <VisualAutoridad />
                </DarkClosedCard>
              </motion.div>
            </motion.div>

            {/* Fila 2 */}
            <motion.div
              className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="order-2 flex h-full lg:order-0 lg:col-span-1 lg:z-20">
                <DarkClosedCard
                  title="Aunque cierres, la experiencia puede seguir cuidada."
                  body="Una reserva de madrugada no debería depender de mirar el móvil."
                >
                  <VisualMotor />
                </DarkClosedCard>
              </motion.div>
              <motion.div variants={fadeUp} className="order-1 flex h-full lg:order-0 lg:col-span-2 lg:col-start-2">
                <HeroCard
                  title="Primero se ve mejor. Luego funciona mejor."
                  body="Una web clara cambia cómo te perciben. Después, los sistemas hacen que las reservas, avisos y tareas no dependan de estar pendiente."
                  diagramFixed={true}
                  diagram={<VisualExcel />}
                />
              </motion.div>
            </motion.div>

            <FadeIn delay={0.04}>
              <Row3Bento />
            </FadeIn>

            <FadeIn delay={0.06} className="mt-4 sm:mt-5">
              <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                {TESTIMONIALS.map((t) => (
                  <TestimonialCard key={t.scene} {...t} />
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
