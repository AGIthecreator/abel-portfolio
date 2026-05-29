"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { BeforeAfterBoard } from "@/components/sections/BeforeAfterBoard";

const DEEP_BLACK = "#070b13";

/**
 * Posición horizontal del mock iPhone sobre el chat (0–100).
 * 50 = centrado · 62 ≈ un 25% más a la derecha · sube/baja a tu gusto.
 */
const WA_IPHONE_LEFT_PERCENT = 71;

/** Copys — tono premium, sin repetir estructuras */
const COPY = {
  heroTitle: "La primera impresión ya no ocurre en la calle.",
  heroLead:
    "El escaparate de tu tienda sigue ahí. El digital suele llegar primero.",
  boardTitle: "Uno se acostumbra al caos más rápido de lo que debería.",
  boardBody:
    "Lo de la izquierda parece normal. Lo de la derecha es cómo debería funcionar.",
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.32, 1] as const },
  },
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

type WaBlock = { kind: "msg"; who: "client" | "business"; text: string; time: string };

const WA_SCRIPT: WaBlock[] = [
  { kind: "msg", who: "client", text: "Hola 🙂", time: "" },
  { kind: "msg", who: "client", text: "¿Seguís abiertos?", time: "11:04" },
  { kind: "msg", who: "business", text: "Buenos días!", time: "11:05" },
  { kind: "msg", who: "business", text: "Sí, claro.", time: "11:05" },
  { kind: "msg", who: "client", text: "Perfecto.", time: "" },
  { kind: "msg", who: "client", text: "Estoy mirando varias opciones.", time: "11:06" },
  { kind: "msg", who: "client", text: "¿Me puedes pasar información?", time: "11:07" },
  { kind: "msg", who: "client", text: "Y si tienes precios orientativos mejor.", time: "11:08" },
  { kind: "msg", who: "client", text: "Gracias 🙂", time: "11:24" },
  { kind: "msg", who: "client", text: "Hola?", time: "12:58" },
  { kind: "msg", who: "business", text: "Perdona. Estaba con un cliente.", time: "12:58" },
  { kind: "msg", who: "business", text: "Ahora te lo paso.", time: "12:59" },
  { kind: "msg", who: "client", text: "No te preocupes.", time: "13:02" },
  { kind: "msg", who: "client", text: "Ya lo he reservado en otro sitio.", time: "" },
];

const WA_PUNCHLINE = {
  line1: "No perdiste un cliente.",
  line2: "Llegaste tarde.",
} as const;

const EDITORIAL_FACTS = [
  {
    title: "Lo que se ve, se paga.",
    lines: ["La gente paga más tranquila cuando siente", "que está en buenas manos."],
    marginLeft: 0,
  },
  {
    title: "Tu competencia no necesita ser mejor.",
    lines: ["Solo necesita parecer más seria", "durante diez segundos."],
    marginLeft: 28,
  },
  {
    title: "Una web fea no pierde visitas.",
    lines: ["Pierde ventas."],
    marginLeft: 10,
  },
  {
    title: "Cuando todo depende de ti,",
    lines: ["tienes un cuello de botella.", "No un negocio."],
    marginLeft: 28,
  },
] as const;

function ReadTicks() {
  return (
    <span className="ml-1 inline-flex text-[#53bdeb]" aria-hidden>
      <svg width="12" height="9" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.2 0L5.6 6.4 3.2 4 0 7.2l5.6 5.6L16 2.4z" opacity="0.45" />
        <path d="M16 0L9.6 6.4 7.2 4 4 7.2l5.6 5.6L20.8 2.4z" transform="translate(-4.8)" />
      </svg>
    </span>
  );
}

function IphoneNotificacionesCompleto() {
  return (
    <div className="relative w-16 sm:w-18" aria-hidden>
      <div className="relative w-full rounded-[16px] border-2 border-zinc-500/90 bg-zinc-950 p-0.5 shadow-[0_12px_28px_rgba(0,0,0,0.75)]">
        <div className="absolute top-1.5 left-1/2 z-10 h-2.5 w-8 -translate-x-1/2 rounded-full bg-black" />
        <div className="overflow-hidden rounded-[14px] bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-2 pb-0.5 pt-4 text-[6px] text-zinc-500">
            <span>12:47</span>
            <span className="tracking-[0.15em]">●●●</span>
          </div>
          <div className="space-y-0.5 px-1 pb-1.5">
            {[
              { t: "WhatsApp", c: "14 nuevos", hot: true },
              { t: "Cliente", c: "ahora", hot: true },
              { t: "Llamada perdida", c: "12:41", hot: false },
            ].map((n) => (
              <div
                key={n.t}
                className={`rounded px-1 py-0.5 ${n.hot ? "bg-red-950/90 ring-1 ring-red-500/35" : "bg-zinc-900/90"}`}
              >
                <p className="text-[6px] font-medium leading-tight text-zinc-100">{n.t}</p>
                <p className="text-[5px] text-zinc-500">{n.c}</p>
              </div>
            ))}
          </div>
        </div>
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
          14
        </span>
      </div>
    </div>
  );
}

function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const chatRef = useRef<HTMLDivElement>(null);

  // Al cargar, dejamos el chat desplazado al FINAL (último mensaje a la vista).
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto w-full max-w-62 sm:max-w-67"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      aria-hidden
    >
      <div className="relative pt-6 sm:pt-7">
        <div
          className="wa-chaos-iphone pointer-events-none absolute top-0 z-20 -translate-x-1/2"
          style={{ left: `${WA_IPHONE_LEFT_PERCENT}%` }}
        >
          <IphoneNotificacionesCompleto />
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_48px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
          <div className="relative z-10 flex flex-col bg-[#075e54]">
            <div className="flex h-5 items-center justify-between px-2.5 pt-2 text-[9px] font-medium text-white/90">
              <span>12:47</span>
              <span className="flex gap-0.5 opacity-90">
                <span className="h-1 w-2.5 rounded-sm bg-white/80" />
                <span className="h-1 w-2.5 rounded-sm bg-white/50" />
              </span>
            </div>
            <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-[#0a5c52] px-2">
              <svg className="h-3.5 w-3.5 shrink-0 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[10px] font-semibold text-white">
                C
              </div>
              <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">Cliente</p>
            </div>
            <div
              ref={chatRef}
              className="flex h-[460px] flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-2 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.25)_transparent] sm:gap-1.5 sm:px-2.5 sm:py-2.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20"
              style={{ backgroundColor: "#ece5dd" }}
            >
              {WA_SCRIPT.map((block, i) => {
                const isClient = block.who === "client";
                const showLabel = i === 0 || block.who !== WA_SCRIPT[i - 1].who;

                return (
                  <motion.div
                    key={`msg-${i}-${block.text.slice(0, 12)}`}
                    className={`flex max-w-[92%] flex-col ${showLabel ? "" : "-mt-1"} ${isClient ? "self-start" : "self-end items-end"}`}
                    initial={{ opacity: 0, y: 2 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.02 + i * 0.025 }}
                  >
                    {showLabel ? (
                      <span className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#667781]">
                        {isClient ? "Cliente" : "Negocio"}
                      </span>
                    ) : null}
                    <div
                      className={`rounded-lg px-2 py-1 text-[11px] leading-snug text-[#111b21] shadow-sm sm:text-[12px] ${
                        isClient ? "bg-white" : "bg-[#d9fdd3]"
                      }`}
                    >
                      {block.text}
                    </div>
                    {block.time ? (
                      <span className="mt-0.5 flex items-center text-[9px] tabular-nums text-[#667781]">
                        {block.time}
                        {!isClient ? <ReadTicks /> : null}
                      </span>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-white/6 pt-4 text-center sm:mt-5 sm:pt-5">
          <p className="text-[clamp(0.95rem,2.2vw,1.2rem)] font-normal italic leading-[1.2] tracking-[-0.02em] text-zinc-500">
            {WA_PUNCHLINE.line1}
          </p>
          <p className="mt-1 text-[clamp(0.95rem,2.2vw,1.2rem)] font-normal italic leading-[1.2] tracking-[-0.02em] text-zinc-500">
            {WA_PUNCHLINE.line2}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function EditorialFactsColumn() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <motion.div ref={ref} className="flex flex-col gap-12 py-2 sm:gap-14 lg:gap-16 lg:py-4">
      {EDITORIAL_FACTS.map((fact, i) => (
        <motion.article
          key={fact.title}
          className={`max-w-60 border-white/8 sm:max-w-65 lg:ml-0 lg:mr-0 lg:max-w-none lg:border-l lg:border-r-0 lg:pr-0 lg:pl-5 lg:text-left ${
            i % 2 === 1
              ? "ml-auto border-r pr-4 text-right sm:pr-5"
              : "mr-auto border-l pl-4 text-left sm:pl-5"
          }`}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.32, 1] }}
        >
          <h4 className="text-[clamp(1.35rem,2.8vw,2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50/95">
            {fact.title}
          </h4>
          {fact.lines.length > 0 ? (
            <div className="mt-3 space-y-0.5">
              {fact.lines.map((line) => (
                <p key={line} className="text-[14px] leading-[1.7] text-zinc-500">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </motion.article>
      ))}
    </motion.div>
  );
}

export function StrategicProfile() {
  // Medimos la altura real del hero para que la diagonal tenga EXACTAMENTE su misma
  // inclinación (mismo ancho 100vw + misma altura → mismo ángulo).
  const [heroHeight, setHeroHeight] = useState<number | null>(null);
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
    const el = bandRef.current;
    if (!el) return;
    const measure = () => setBandHeight(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // La diagonal del hero recorre 18% de ancho a lo largo de su altura. Extrapolamos
  // ese MISMO ángulo a lo alto de la banda (ratio = altoBanda / altoHero), de modo que
  // los 3 colores siguen la misma diagonal hasta donde llegue la sección (sin tramo vertical).
  const ratio = heroHeight && bandHeight ? bandHeight / heroHeight : 1;
  const greyBottom = (45 + 18 * ratio).toFixed(2);
  const violetBottom = (61 + 18 * ratio).toFixed(2);
  const lightLeftBottom = (61 + 18 * ratio).toFixed(2);
  const lightRightBottom = (64 + 18 * ratio).toFixed(2);

  return (
    <section id="perfil" className="relative z-0 -mt-6 scroll-mt-24 w-full overflow-visible sm:-mt-10 lg:-mt-14">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
        <div
          className="relative w-full overflow-hidden pt-14 pb-10 text-zinc-200 sm:pt-18 sm:pb-12 lg:pt-22"
          style={{ backgroundColor: DEEP_BLACK }}
        >
          {/* Fondo: misma composición diagonal del hero pero en espejo ("\").
              - `top-14` compensa el -mt-14 de la sección → el vértice (45%) cae justo
                en la costura, bajo la franja, alineado con el del hero.
              - El punto inferior de cada color se extrapola con la MISMA pendiente del
                hero (ratio alto), así la diagonal continúa recta hasta el fondo de la
                sección, sin tramo vertical.
              Clips invertidos verticalmente respecto al hero + los mismos 3 colores. */}
          <div
            ref={bandRef}
            className="pointer-events-none absolute inset-x-0 top-14 bottom-0 z-0 hidden lg:block"
            aria-hidden
          >
            {/* Panel gris suave */}
            <div
              className="absolute inset-0 bg-[#12151f]"
              style={{ clipPath: `polygon(45% 0, 100% 0, 100% 100%, ${greyBottom}% 100%)` }}
            />
            {/* Bloque violeta superpuesto (misma inclinación) */}
            <div
              className="absolute inset-0 bg-[#251c49]"
              style={{ clipPath: `polygon(61% 0, 100% 0, 100% 100%, ${violetBottom}% 100%)` }}
            />
            {/* Banda violeta más clara (acento de profundidad, misma inclinación) */}
            <div
              className="absolute inset-0 bg-[#3a2d6b]/55"
              style={{ clipPath: `polygon(61% 0, 64% 0, ${lightRightBottom}% 100%, ${lightLeftBottom}% 100%)` }}
            />
          </div>

          {/* Fondo para móvil/tablet (la diagonal solo existe en lg). Lavado violeta
              suave en diagonal para que no quede un negro plano. */}
          <div
            className="pointer-events-none absolute inset-0 z-0 lg:hidden"
            style={{
              background:
                "linear-gradient(158deg, #0a0e18 0%, #110d22 42%, #1c1540 68%, #0a0d16 100%)",
            }}
            aria-hidden
          />

          <DotPattern />

          <div className="relative z-10 isolate mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mx-auto min-w-0 max-w-4xl text-center">
              <p className="text-balance font-bold leading-[1.12] tracking-tighter text-zinc-50 text-[clamp(1.35rem,3.8vw,3rem)] lg:whitespace-nowrap">
                {COPY.heroTitle}
              </p>
              <p className="mx-auto mt-3 max-w-[34ch] text-pretty text-[15px] leading-[1.55] text-zinc-500 sm:max-w-2xl sm:text-base sm:leading-relaxed md:max-w-none md:text-lg lg:whitespace-nowrap">
                {COPY.heroLead}
              </p>
              {/* Línea plateada fina, más estrecha que el h1 */}
              <div
                className="mx-auto mt-5 h-px w-[clamp(140px,42%,380px)]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(228,228,231,0.55) 28%, rgba(212,212,216,0.85) 50%, rgba(228,228,231,0.55) 72%, transparent 100%)",
                }}
                aria-hidden
              />
            </FadeIn>

            <motion.div
              className="mt-9 grid grid-cols-1 gap-10 sm:mt-10 lg:mt-11 lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:gap-y-0 xl:gap-x-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.08 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              <motion.div
                variants={fadeUp}
                className="order-2 flex min-w-0 flex-col lg:order-1 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pr-1 xl:pr-2"
              >
                <div className="mb-3 text-center lg:mb-4 lg:text-left">
                  <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-white sm:text-xl">
                    <span className="block -translate-x-2 lg:translate-x-0">
                      Las reservas no saben
                    </span>
                    <span className="block translate-x-4 lg:translate-x-0">
                      que hoy era tu día libre.
                    </span>
                    <span className="block -translate-x-4 lg:translate-x-0">
                      Los mensajes tampoco.
                    </span>
                  </h3>
                  <p className="mx-auto mt-3 max-w-[95%] -translate-x-3 text-[13px] leading-relaxed text-zinc-500 sm:text-sm lg:mx-0 lg:translate-x-0">
                    La pregunta no es si van a llegar clientes.
                  </p>
                  <p className="mx-auto mt-2 max-w-[95%] translate-x-4 text-[13px] leading-relaxed text-zinc-500 sm:text-sm lg:mx-0 lg:translate-x-0">
                    La pregunta es qué ocurre cuando llegan.
                  </p>
                </div>
                <WhatsAppCaosIntegrado />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="order-1 mx-auto flex w-full min-w-0 max-w-140 flex-col items-center text-center lg:order-2 lg:col-span-6 lg:col-start-4 lg:row-start-1"
              >
                <h3 className="max-w-[28ch] text-xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-2xl lg:text-[1.65rem]">
                  <span className="text-zinc-500">Uno</span> se acostumbra al caos más{" "}
                  <span className="text-zinc-500">rápido</span> de lo que debería.
                </h3>
                <p className="mt-2.5 max-w-[38ch] text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                  {COPY.boardBody}
                </p>
                <div className="mt-6 w-full sm:mt-7">
                  <BeforeAfterBoard />
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="order-3 min-w-0 lg:order-3 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:pl-1 xl:pl-0"
              >
                <EditorialFactsColumn />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
