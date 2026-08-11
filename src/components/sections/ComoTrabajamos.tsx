"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  HardHat,
  Lightbulb,
  MessageSquare,
  Rocket,
  Settings,
  Target,
} from "lucide-react";
import { Manrope, Newsreader } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { trackEvent } from "@/lib/analytics";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ct-display",
  display: "swap",
});

const ui = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ct-ui",
  display: "swap",
});

/** Mismo color de superficie alterna que la página principal (FAQ / Precios). */
const SECTION_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 48%, #0c121c 100%)";

const PROBLEM_ITEMS = [
  {
    title: "Copiar a la competencia",
    body: "Suele acabar tan bien como copiar en un examen sin saber la pregunta.",
  },
  {
    title: "Diseñar porque sí",
    body: "Que algo se vea bonito no significa que funcione.",
  },
  {
    title: "Hacer caso a tu cuñado",
    body: "Todos tenemos uno. Y todos saben de webs.",
  },
] as const;

const PROCESS_STEPS = [
  {
    n: "1",
    title: "Nos cuentas la idea.",
    body: "Qué haces. Qué quieres conseguir. Qué te gusta. Qué no encaja contigo.",
  },
  {
    n: "2",
    title: "Pensamos antes de tocar nada.",
    body: "Entendemos tu negocio, tu contexto y tus objetivos antes de tomar cualquier decisión.",
  },
  {
    n: "3",
    title: "Diseñamos con intención.",
    body: "Cada elemento tiene un propósito. Sin adornos innecesarios ni soluciones genéricas.",
  },
  {
    n: "4",
    title: "Construimos.",
    body: "Desarrollamos una web rápida, estable y preparada para crecer contigo.",
  },
  {
    n: "5",
    title: "Lanzamos.",
    body: "Revisamos, optimizamos y publicamos cuando todo está donde debe estar.",
  },
  {
    n: "6",
    title: "Seguimos ahí.",
    body: "Porque una buena web no es un proyecto que se entrega. Es una herramienta que evoluciona.",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "¿Por qué merece la pena invertir en una web profesional?",
    answer: [
      "En la mayoría de los casos, tu web es el primer contacto real que alguien tiene con tu negocio. Y esa primera impresión se forma en cuestión de segundos, mucho antes de que lean una sola línea.",
      "Una web cuidada transmite confianza y credibilidad de forma inmediata. Comunica que detrás hay un proyecto serio, que se preocupa por los detalles y por la experiencia de quien lo visita.",
      "Además, una web bien construida mejora tu visibilidad: se entiende mejor en el móvil, aparece mejor en los buscadores y guía a quien llega hacia lo que de verdad importa.",
      "Por eso una web profesional no es un simple escaparate bonito. Es una herramienta comercial que trabaja por ti todos los días, también cuando tú no estás delante.",
    ],
  },
  {
    question:
      "¿Qué diferencia hay entre una web profesional y una hecha por tu cuenta?",
    answer: [
      "Hoy es relativamente fácil montar una web por tu cuenta. La diferencia no está en conseguir publicar algo, sino en que ese algo funcione de verdad y genere resultados.",
      "Una web profesional cuida el diseño para que transmita la imagen adecuada, ordena la información para que se entienda a la primera y carga rápido para que nadie se marche antes de tiempo.",
      "También se construye pensando en el móvil desde el principio, donde hoy ocurre la mayor parte de las visitas, y se prepara para que los buscadores la entiendan y la muestren.",
      "Al final, la diferencia se nota justo donde importa: una proyecta sensación de improvisación y la otra transmite confianza.",
    ],
  },
  {
    question: "¿Cuánto tarda normalmente un proyecto?",
    answer: [
      "Depende del alcance del proyecto y de la información disponible desde el principio.",
      "Una web corporativa suele completarse en pocas semanas, mientras que los proyectos con más funcionalidades requieren algo más de tiempo de planificación y desarrollo.",
      "Lo que más suele influir no es la parte técnica, sino tener listos los textos, las imágenes y las decisiones necesarias para avanzar sin bloqueos.",
      "Nuestro objetivo siempre es trabajar de forma ágil, manteniendo la calidad y evitando retrasos innecesarios.",
    ],
  },
  {
    question: "¿La web estará preparada para posicionarse en Google?",
    answer: [
      "Sí. Desde el primer momento trabajamos los aspectos que sientan las bases del posicionamiento: una estructura SEO correcta, una buena velocidad de carga y una indexación adecuada para que Google pueda leer y entender la web.",
      "Eso sí, conviene aclarar una cosa: estar preparado para el SEO y aparecer en primera posición no son lo mismo.",
      "El posicionamiento depende de muchos factores, varios de ellos fuera de la propia web, y es un trabajo que se construye con el tiempo. Lo que sí dejamos hecho es una base sólida y bien planteada, lista para competir.",
    ],
  },
  {
    question: "¿Puedo gestionar la web por mi cuenta?",
    answer: [
      "Sí. Siempre que el proyecto lo permita, la web se prepara para que puedas gestionar los contenidos del día a día sin depender constantemente de nadie.",
      "Cambiar textos, actualizar imágenes, publicar novedades o modificar información básica son tareas que podrás hacer de forma sencilla.",
      "Y si en algún momento necesitas una mano con algo más complejo, seguiremos estando disponibles para ayudarte.",
    ],
  },
  {
    question: "¿Qué ocurre si ya tengo una web?",
    answer: [
      "Perfecto. En muchos casos, partir de una web que ya existe facilita buena parte del proceso.",
      "Lo primero es hacer una auditoría de lo que tienes para ver qué está funcionando bien y dónde se encuentran las oportunidades de mejora.",
      "A partir de ahí, modernizamos tu presencia digital aprovechando todo el contenido que merezca la pena conservar, sin necesidad de empezar siempre desde cero.",
    ],
  },
  {
    question: "¿Qué pasa después del lanzamiento?",
    answer: [
      "El lanzamiento no es el final del proyecto, sino el comienzo de una nueva etapa.",
      "Seguimos disponibles para darte soporte, resolver dudas e introducir mejoras a medida que tu negocio avanza y aparecen nuevas necesidades.",
      "Una web es algo vivo y debe evolucionar contigo. Nos gusta construir relaciones a largo plazo, no entregar un proyecto y desaparecer.",
    ],
  },
  {
    question: "¿Y si todavía no tengo claro lo que necesito?",
    answer: [
      "Es una situación mucho más habitual de lo que parece, y no pasa absolutamente nada.",
      "Mucha gente sabe que necesita mejorar su presencia digital, pero no tiene claro qué tipo de web necesita ni qué debería incluir.",
      "Precisamente para eso existe una primera fase de análisis y acompañamiento. No esperamos que llegues con todas las respuestas: nuestro trabajo consiste en ayudarte a encontrarlas.",
    ],
  },
] as const;

const PRIMARY_CTA =
  "group relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[rgba(150,142,180,0.26)] bg-[linear-gradient(180deg,#34343b_0%,#1d1d22_44%,#141417_56%,#0b0b0d_100%)] px-5 py-2.5 text-[13px] font-semibold text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.55),0_6px_18px_-9px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-violet-400/45 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.55),0_10px_26px_-10px_rgba(124,58,237,0.45)]";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-(family-name:--font-ct-ui) text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
      <span aria-hidden className="h-px w-6 bg-violet-300/40" />
      {children}
    </p>
  );
}

function PrimaryCta({
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

/** Imagen del setup con duotono: ~30% gris + ~70% violeta (guiño al hero principal). */
function SetupDuotone() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src="/como-trabajamos-setup.webp"
        alt="Setup de escritorio con un monitor mostrando una web limpia y bien diseñada."
        fill
        sizes="(max-width: 1023px) 100vw, 52vw"
        quality={85}
        priority
        className="object-cover object-center grayscale brightness-[0.92] contrast-[1.05]"
      />
      {/* Tinte duotono (multiply): corte vertical en seco — primer 30% gris (claro), resto violeta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "linear-gradient(90deg, #aab2c0 0%, #aab2c0 30%, #5b3bc4 30%, #5b3bc4 100%)",
        }}
      />
      {/* Realce violeta en luces (screen), mismo corte vertical en seco */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(90deg, rgba(120,130,150,0.10) 0%, rgba(120,130,150,0.10) 30%, rgba(124,92,255,0.28) 30%, rgba(124,92,255,0.28) 100%)",
        }}
      />
      {/* Fundido con el fondo oscuro en el borde izquierdo y arriba/abajo */}
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
        className="pointer-events-none absolute inset-0 lg:bg-[linear-gradient(to_bottom,#070b13_0%,transparent_12%,transparent_88%,#070b13_100%)]"
      />
      {/* Grano sutil */}
      <div
        aria-hidden
        className="pricing-hero-grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
      />
    </div>
  );
}

const TIMELINE_VB_W = 234;
const TIMELINE_VB_H = 324;
const TIMELINE_R_FILL = 27;
const TIMELINE_R_RING = 30.5;

/** Pasos del recorrido en zig-zag: posición (x,y) en el viewBox y lado del número. */
const TIMELINE_STEPS = [
  { Icon: MessageSquare, x: 86, y: 32, side: "left" as const },
  { Icon: Lightbulb, x: 172, y: 84, side: "right" as const },
  { Icon: Settings, x: 86, y: 136, side: "left" as const },
  { Icon: HardHat, x: 172, y: 188, side: "right" as const },
  { Icon: Rocket, x: 86, y: 240, side: "left" as const },
  { Icon: Target, x: 172, y: 292, side: "right" as const },
];

/** Recorrido del proceso reconstruido como vector: nítido a cualquier tamaño,
    transparencia real y huecos de números correctos (sustituye a la imagen rasterizada). */
function ProcessTimeline() {
  return (
    <div
      className="relative mx-auto aspect-234/324 w-full max-w-[540px]"
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${TIMELINE_VB_W} ${TIMELINE_VB_H}`}
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Conectores punteados (se dibujan debajo de los círculos) */}
        {TIMELINE_STEPS.slice(0, -1).map((s, i) => {
          const next = TIMELINE_STEPS[i + 1];
          return (
            <line
              key={`conn-${i}`}
              x1={s.x}
              y1={s.y}
              x2={next.x}
              y2={next.y}
              stroke="#6f4fb8"
              strokeWidth={4.2}
              strokeLinecap="round"
              strokeDasharray="0 13"
            />
          );
        })}
        {/* Círculos (anillo morado + relleno oscuro) y número en lavanda */}
        {TIMELINE_STEPS.map((s, i) => (
          <g key={`node-${i}`}>
            <circle cx={s.x} cy={s.y} r={TIMELINE_R_RING} fill="#7c4dd6" />
            <circle cx={s.x} cy={s.y} r={TIMELINE_R_FILL} fill="#1b2030" />
            <text
              x={
                s.side === "left"
                  ? s.x - TIMELINE_R_RING - 15
                  : s.x + TIMELINE_R_RING + 15
              }
              y={s.y}
              textAnchor={s.side === "left" ? "end" : "start"}
              dominantBaseline="central"
              fill="#b9a3e6"
              fontSize={22}
              style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700 }}
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>

      {/* Iconos (vector) centrados en cada círculo */}
      {TIMELINE_STEPS.map((s, i) => {
        const Icon = s.Icon;
        return (
          <span
            key={`icon-${i}`}
            className="absolute flex aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white"
            style={{
              left: `${(s.x / TIMELINE_VB_W) * 100}%`,
              top: `${(s.y / TIMELINE_VB_H) * 100}%`,
            }}
          >
            <Icon className="h-full w-full" strokeWidth={1.6} />
          </span>
        );
      })}
    </div>
  );
}

/** Desplegable editorial: pregunta (violeta) + flecha; la respuesta se expande
    con texto cómodo de lectura. Compacto cuando está cerrado. */
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
          className={`min-w-0 flex-1 text-[clamp(1.125rem,2.2vw,1.5rem)] font-semibold leading-tight tracking-[-0.015em] transition-colors duration-300 ${
            isOpen ? "text-violet-300" : "text-violet-400 group-hover:text-violet-300"
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
          <ChevronDown className="size-4 sm:size-[18px]" strokeWidth={2} />
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
            <div className="max-w-[68ch] space-y-4 pb-7 pr-8 text-[clamp(1rem,1.05vw,1.125rem)] leading-[1.8] text-zinc-300 sm:pb-8">
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

export function ComoTrabajamos() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCta = useCallback((location: string) => {
    trackEvent("como_trabajamos_cta_click", { location });
  }, []);

  return (
    <div
      className={`${display.variable} ${ui.variable} relative overflow-x-clip bg-[#070b13] font-(family-name:--font-ct-ui) text-zinc-300`}
    >
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section
        className="ct-hero relative isolate w-full overflow-x-clip overflow-y-hidden bg-[#070b13] pt-[5.25rem] pb-0 sm:pt-24 lg:pt-20"
        aria-labelledby="ct-hero-heading"
      >
        {/* Fondo como el hero principal: grano editorial + viñeta */}
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

        {/* Imagen del setup a sangre (derecha, desktop) */}
        <div className="absolute inset-y-0 right-0 z-0 hidden w-[50%] lg:block" aria-hidden>
          <SetupDuotone />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1320px] items-center px-5 sm:px-8 lg:min-h-[70vh] lg:px-10">
          <div className="grid w-full items-center gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="ct-hero-copy max-w-136 py-8 sm:py-14 lg:py-20">
              <Eyebrow>Cómo trabajamos</Eyebrow>

              <h1
                id="ct-hero-heading"
                className="mt-4 font-(family-name:--font-ct-display) text-[clamp(1.65rem,4.6vw,2.85rem)] font-medium leading-[1.07] tracking-[-0.015em] text-neutral-50 sm:mt-5"
              >
                <span className="block">No necesitas saber de webs.</span>
                <span className="block text-zinc-400">
                  Necesitas saber{" "}
                  <span className="text-violet-300/95 italic">qué va a pasar.</span>
                </span>
              </h1>

              <div className="mt-5 max-w-[44ch] space-y-3 text-[15px] leading-[1.7] text-neutral-400/95 sm:mt-6 sm:space-y-3.5">
                <p>Diseñar una web no debería sentirse como contratar magia negra.</p>
                <p className="ct-hero-extra-copy hidden lg:block">
                  Te explico el proceso desde el principio para que siempre sepas qué
                  estamos haciendo y por qué.
                </p>
              </div>

              <div className="mt-6 sm:mt-7">
                <PrimaryCta
                  label="Cuéntame tu proyecto"
                  href="/presupuesto"
                  onClick={() => handleCta("hero")}
                />
              </div>
            </div>

            <div aria-hidden className="hidden lg:block" />
          </div>
        </div>

        {/* Imagen del setup a sangre (móvil, debajo del texto) */}
        <div
          className="ct-hero-mobile-image relative z-10 h-[200px] w-full sm:h-[300px] lg:hidden"
          aria-hidden
        >
          <SetupDuotone />
        </div>
      </section>

      {/* ─────────── SECCIÓN 2 · Dónde empiezan los problemas (3 franjas) ─────────── */}
      <section
        className="relative overflow-hidden bg-[#070b13]"
        aria-labelledby="ct-problems-heading"
      >

        {/* Misma composición que el hero principal, espejada hacia la izquierda y
            descendiendo a la derecha. Colores y proporciones EXACTOS del hero:
            de izq. a der. → morado (#251c49) · violeta fina (#3a2d6b/55) · gris (#12151f). */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Panel gris (base, el más ancho) */}
          <div
            className="absolute inset-0 bg-[#12151f]"
            style={{ clipPath: "polygon(0 0, 37% 0, 65% 100%, 0 100%)" }}
          />
          {/* Bloque morado superpuesto (misma inclinación) */}
          <div
            className="absolute inset-0 bg-[#251c49]"
            style={{ clipPath: "polygon(0 0, 21% 0, 49% 100%, 0 100%)" }}
          />
          {/* Banda violeta más clara (fina, la del medio) */}
          <div
            className="absolute inset-0 bg-[#3a2d6b]/55"
            style={{ clipPath: "polygon(18% 0, 21% 0, 49% 100%, 46% 100%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <FadeIn className="max-w-2xl">
            <Eyebrow>El error más común</Eyebrow>
            <h2
              id="ct-problems-heading"
              className="mt-5 font-(family-name:--font-ct-display) text-[clamp(1.7rem,4.2vw,2.6rem)] font-medium leading-[1.1] tracking-[-0.02em] text-neutral-50"
            >
              La mayoría de problemas empiezan aquí.
            </h2>
            <div className="mt-5 max-w-[54ch] space-y-3 text-[15px] leading-[1.8] text-zinc-400 sm:text-base">
              <p>
                No por falta de diseño.{" "}
                <span className="text-zinc-200">Por falta de dirección.</span>
              </p>
              <p>
                Diseñar una web sin saber qué quieres conseguir es como decorar una
                tienda antes de decidir qué vas a vender dentro.
              </p>
            </div>
          </FadeIn>

          {/* Textos en escalera (sin cards, sin numeración) */}
          <div className="mt-14 flex flex-col gap-10 sm:mt-16 sm:gap-12">
            {PROBLEM_ITEMS.map((item, i) => (
              <FadeIn
                key={item.title}
                delay={i * 0.08}
                className={
                  i === 1
                    ? "lg:ml-[36%]"
                    : i === 2
                      ? "lg:ml-[60%]"
                      : "lg:ml-[12%]"
                }
              >
                <div className="max-w-[40ch] border-l-2 border-violet-400/35 pl-5 sm:pl-6">
                  <h3 className="font-(family-name:--font-ct-display) text-[1.35rem] font-medium tracking-[-0.015em] text-zinc-50 sm:text-[1.55rem]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-[1.7] text-zinc-400 sm:text-base">
                    {item.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SECCIÓN PRINCIPAL · El proceso (imagen a sangre izq. + texto der.) ───────── */}
      {/* -mt-px: solapa 1px sobre la sección anterior para eliminar el hueco de
          subpíxel que dejaba ver el fondo oscuro como una línea horizontal. */}
      <section
        className="relative -mt-px overflow-hidden"
        aria-labelledby="ct-process-heading"
      >
        {/* Fondo: oscuro del hero (igual que la sección anterior) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#070b13]" />

        {/* Franjas en ESPEJO vertical respecto a la sección 2 (mismo recurso que la
            página principal en la costura): donde cada color de la sección anterior
            termina en su borde inferior (gris 65%, morado 49%, violeta 46–49%), aquí
            empieza en el borde superior y desciende en sentido opuesto hasta el borde
            inferior (gris 37%, morado 21%, violeta 18–21%), que enlaza con la sección
            de cierre. Mismos colores y proporciones del hero principal. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Panel gris (base) */}
          <div
            className="absolute inset-0 bg-[#12151f]"
            style={{ clipPath: "polygon(0 0, 65% 0, 37% 100%, 0 100%)" }}
          />
          {/* Bloque morado superpuesto */}
          <div
            className="absolute inset-0 bg-[#251c49]"
            style={{ clipPath: "polygon(0 0, 49% 0, 21% 100%, 0 100%)" }}
          />
          {/* Banda violeta fina (acento) */}
          <div
            className="absolute inset-0 bg-[#3a2d6b]/55"
            style={{ clipPath: "polygon(46% 0, 49% 0, 21% 100%, 18% 100%)" }}
          />
        </div>

        {/* Recorrido del proceso (vector) a la izquierda (desktop), alineado a la derecha de su columna para acercarlo al texto */}
        <div className="absolute inset-y-0 left-0 z-0 hidden w-[38%] items-center justify-end px-3 lg:flex" aria-hidden>
          <ProcessTimeline />
        </div>

        {/* Recorrido del proceso (vector) (móvil, arriba) */}
        <div className="relative z-10 w-full px-8 py-8 lg:hidden" aria-hidden>
          <ProcessTimeline />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr]">
            <div aria-hidden className="hidden lg:block" />

            <div className="min-w-0 py-16 sm:py-20 lg:py-24 lg:pl-8 xl:pl-10">
              <FadeIn>
                <Eyebrow>El proceso, paso a paso</Eyebrow>
                <h2
                  id="ct-process-heading"
                  className="mt-5 font-(family-name:--font-ct-display) text-[clamp(1.8rem,4.4vw,2.8rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50"
                >
                  Así construimos cada proyecto.
                </h2>
                <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.8] text-zinc-400 sm:text-base">
                  No hace falta que entiendas de webs. Solo que entiendas el plan. Te
                  acompaño en cada paso y te lo explico todo sin tecnicismos.
                </p>
              </FadeIn>

              <ol className="mt-10 space-y-8 sm:mt-12 sm:space-y-9">
                {PROCESS_STEPS.map((step, i) => (
                  <FadeIn key={step.n} delay={i * 0.04}>
                    <li>
                      <h3 className="font-(family-name:--font-ct-display) text-[1.2rem] font-medium tracking-[-0.015em] text-zinc-50 sm:text-[1.4rem]">
                        {step.n}
                        <span aria-hidden className="mx-2 text-violet-300/50">
                          ·
                        </span>
                        {step.title}
                      </h3>
                      <div className="relative mt-3 ml-5 overflow-hidden rounded-md bg-[#5b3bc4]/12 py-3.5 pl-6 pr-4 sm:ml-6 sm:py-4 sm:pl-7">
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-[3px] bg-[#7c5cff]"
                        />
                        <p className="max-w-[52ch] text-[14.5px] leading-[1.7] text-zinc-300 sm:text-[15px]">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  </FadeIn>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── PREGUNTAS FRECUENTES ───────────────────────── */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="ct-faq-heading"
        style={{ background: SECTION_SURFACE }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 18% 20%, rgba(80,50,200,0.08), transparent 42%), radial-gradient(circle at 82% 78%, rgba(0,200,255,0.05), transparent 40%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[960px] px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <FadeIn>
            <Eyebrow>Antes de empezar</Eyebrow>
            <h2
              id="ct-faq-heading"
              className="mt-5 max-w-[20ch] font-(family-name:--font-ct-display) text-[clamp(1.85rem,4.6vw,2.9rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50"
            >
              <span className="text-zinc-400">Preguntas frecuentes</span> sobre diseño de páginas web.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[15px] leading-[1.8] text-zinc-400 sm:text-base">
              Las dudas más habituales antes de iniciar un proyecto web.
            </p>
          </FadeIn>

          <FadeIn delay={0.06} className="mt-12 sm:mt-14">
            <div className="border-t border-white/10">
              {FAQ_ITEMS.map((item, i) => (
                <FaqDisclosure
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq((cur) => (cur === i ? null : i))}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ───────────────────────── CIERRE ───────────────────────── */}
      <section
        className="relative overflow-hidden border-t border-white/5 bg-[#070b13]"
        aria-labelledby="ct-close-heading"
      >
        {/* Mismas franjas que la sección 2, continuando el espejo desde el borde
            inferior de «Así construimos cada proyecto» (gris 37% · morado 21% ·
            violeta 18–21%) y descendiendo. Mismos colores y proporciones exactos. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Panel gris (base, el más ancho) */}
          <div
            className="absolute inset-0 bg-[#12151f]"
            style={{ clipPath: "polygon(0 0, 37% 0, 55% 100%, 0 100%)" }}
          />
          {/* Bloque morado superpuesto */}
          <div
            className="absolute inset-0 bg-[#251c49]"
            style={{ clipPath: "polygon(0 0, 21% 0, 39% 100%, 0 100%)" }}
          />
          {/* Banda violeta más clara (fina, la del medio) */}
          <div
            className="absolute inset-0 bg-[#3a2d6b]/55"
            style={{ clipPath: "polygon(18% 0, 21% 0, 39% 100%, 36% 100%)" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_120%_at_50%_50%,transparent_58%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        <FadeIn className="relative z-10 mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <h2
            id="ct-close-heading"
            className="font-(family-name:--font-ct-display) text-[clamp(1.9rem,5vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-neutral-50"
          >
            Ahora ya sabes <span className="text-violet-300">cómo trabajamos.</span>
          </h2>

          <div className="mx-auto mt-7 max-w-[46ch] space-y-3 text-[15px] leading-[1.8] text-zinc-400 sm:text-base">
            <p>La parte difícil es decidir si seguimos hablando.</p>
            <p className="text-zinc-200">
              La buena noticia es que eso solo requiere un mensaje.
            </p>
          </div>

          <div className="mt-9 flex justify-center">
            <PrimaryCta
              label="Cuéntame tu proyecto"
              href="/presupuesto"
              onClick={() => handleCta("cierre")}
            />
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
