"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";

/** Rejilla de filas de ValueCards: modo enfoque con :has (blur en hermanas) + animación reparto cartas */
const VALUE_ROW_GRID =
  "grid gap-4 sm:gap-5 lg:grid-cols-3 [grid-auto-rows:1fr] [&_article]:relative [&_article]:transition-[transform,opacity,filter,border-color,box-shadow] [&_article]:duration-300 [&_article]:ease-out [&:has(article:hover)_article:not(:hover)]:opacity-40 [&:has(article:hover)_article:not(:hover)]:blur-[2px]";

const ACCENT_GLOW =
  "opacity-[0.6] transition-all duration-300 ease-out group-hover:opacity-100 group-hover:filter-[drop-shadow(0_0_12px_rgba(52,211,153,0.48))]";

const BP_SVG_MOTION =
  "[&_path]:transition-all [&_path]:duration-300 [&_path]:ease-out [&_rect]:transition-all [&_rect]:duration-300 [&_rect]:ease-out [&_circle]:transition-all [&_circle]:duration-300 [&_circle]:ease-out [&_text]:transition-all [&_text]:duration-300 [&_text]:ease-out [&_tspan]:transition-all [&_tspan]:duration-300 [&_tspan]:ease-out";

const BP_GRID = "rgba(100,116,139,0.12)";

function tiltFromCardId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i) * (i + 3);
  return (s % 200) / 100 - 1;
}

const dealRowParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const dealRowItem: Variants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -44 : 44 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.32, 1] as const },
  },
};
/** Marcadores tipo plano: L de 2px en esquinas interiores del viewport del diagrama */
function BpCornerTicks() {
  return (
    <g stroke="#64748b" strokeWidth="0.65" fill="none" opacity="0.42" aria-hidden="true">
      <path d="M5 5h2M5 5v2" />
      <path d="M235 5h-2M235 5v2" />
      <path d="M5 51h2M5 51v-2" />
      <path d="M235 51h-2M235 51v-2" />
    </g>
  );
}

function useBlueprintGridPattern() {
  const raw = useId().replace(/:/g, "");
  const pid = `bp-grid-${raw}`;
  const fluoroFillId = `bp-fl-fill-${raw}`;
  const fluoroStrokeId = `bp-fl-stroke-${raw}`;
  const sigmaFillId = `bp-sigma-${raw}`;
  const GridDefs = (
    <defs>
      <pattern id={pid} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M10 0H0V10" fill="none" stroke={BP_GRID} strokeWidth="0.5" />
      </pattern>
      <radialGradient id={fluoroFillId} cx="32%" cy="26%" r="78%">
        <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.96" />
        <stop offset="42%" stopColor="#34d399" stopOpacity="0.84" />
        <stop offset="100%" stopColor="#064e3b" stopOpacity="0.38" />
      </radialGradient>
      <linearGradient id={fluoroStrokeId} x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="48%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>
      <radialGradient id={sigmaFillId} cx="38%" cy="32%" r="72%">
        <stop offset="0%" stopColor="#fecaca" stopOpacity="0.96" />
        <stop offset="50%" stopColor="#f87171" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#991b1b" stopOpacity="0.58" />
      </radialGradient>
    </defs>
  );
  return { pid, fluoroFillId, fluoroStrokeId, sigmaFillId, GridDefs };
}

function BpFiltro() {
  const { pid, fluoroFillId, fluoroStrokeId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <rect
        x="14"
        y="14"
        width="92"
        height="28"
        rx="2"
        fill="none"
        stroke={`url(#${fluoroStrokeId})`}
        className={ACCENT_GLOW}
        strokeWidth="0.85"
      />
      <path d="M22 26h78M22 32h60" className="stroke-slate-500/80" strokeWidth="0.75" opacity="0.35" strokeLinecap="round" />
      <text x="22" y="24" fill={`url(#${fluoroFillId})`} className={ACCENT_GLOW} fontSize="7" fontFamily="ui-monospace, monospace">
        A · visible
      </text>
      <rect x="134" y="14" width="92" height="28" rx="2" className="stroke-slate-500/70" strokeWidth="0.85" fill="none" strokeDasharray="3 2" opacity="0.45" />
      <text x="142" y="24" fill="#64748b" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.55">
        B · sin señal
      </text>
      <path d="M106 28h18" className="stroke-slate-500/60" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.5" />
      <BpCornerTicks />
    </svg>
  );
}

function BpAutoridad() {
  const { pid, fluoroStrokeId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <path d="M72 12h96v32H72z" className="stroke-slate-500/85" strokeWidth="0.85" fill="none" />
      <path d="M72 12l6 6M160 12l-6 6M72 44l6-6M160 44l-6-6" className="stroke-slate-500/70" strokeWidth="0.75" opacity="0.5" />
      <path d="M88 28h64" className="stroke-slate-500/50" strokeWidth="0.75" opacity="0.25" />
      <path d="M120 20v16" className="stroke-slate-500/70" strokeWidth="0.85" opacity="0.55" />
      <path
        d="M112 32l8 8 16-16"
        fill="none"
        stroke={`url(#${fluoroStrokeId})`}
        className={ACCENT_GLOW}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <BpCornerTicks />
    </svg>
  );
}

function BpPasiva() {
  const { pid, fluoroStrokeId, fluoroFillId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <rect x="28" y="16" width="52" height="24" rx="2" className="stroke-slate-500/80" strokeWidth="0.85" fill="none" />
      <path d="M36 26h36M36 32h28" className="stroke-slate-500/60" strokeWidth="0.7" opacity="0.3" />
      <path d="M80 28h24" className="stroke-slate-500/55" strokeWidth="0.75" strokeDasharray="2 2" />
      <rect
        x="112"
        y="12"
        width="100"
        height="32"
        rx="2"
        fill="none"
        stroke={`url(#${fluoroStrokeId})`}
        className={ACCENT_GLOW}
        strokeWidth="0.85"
      />
      <path d="M120 22h84M120 30h64M120 38h72" className="stroke-slate-500/55" strokeWidth="0.7" opacity="0.28" />
      <text x="120" y="18" fontSize="6.5" fontFamily="ui-monospace, monospace">
        <tspan fill="#64748b" opacity="0.65">
          &gt; pipeline
        </tspan>
        <tspan fill={`url(#${fluoroFillId})`} className={ACCENT_GLOW}>
          .on
        </tspan>
      </text>
      <BpCornerTicks />
    </svg>
  );
}

function BpImpuesto() {
  const { pid, fluoroFillId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <rect x="16" y="10" width="208" height="36" rx="2" className="stroke-slate-500/75" strokeWidth="0.75" fill="rgba(15,23,42,0.03)" />
      <text x="24" y="24" fill="#64748b" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.85">
        $ sync --manual
      </text>
      <text x="24" y="36" fill="#64748b" fontSize="8" fontFamily="ui-monospace, monospace" opacity="0.45">
        ··· copy → paste → error risk
      </text>
      <text x="168" y="40" fill={`url(#${fluoroFillId})`} className={ACCENT_GLOW} fontSize="7" fontFamily="ui-monospace, monospace">
        [auto]
      </text>
      <BpCornerTicks />
    </svg>
  );
}

function BpSync() {
  const { pid, fluoroStrokeId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <circle cx="52" cy="30" r="6" className="stroke-slate-500/80" strokeWidth="0.85" fill="none" />
      <circle cx="120" cy="30" r="6" fill="none" stroke={`url(#${fluoroStrokeId})`} className={ACCENT_GLOW} strokeWidth="0.85" />
      <circle cx="188" cy="30" r="6" className="stroke-slate-500/80" strokeWidth="0.85" fill="none" />
      <path d="M58 30h56M126 30h56" className="stroke-slate-500/55" strokeWidth="0.75" opacity="0.45" />
      <path d="M52 18v-4M120 18v-4M188 18v-4" className="stroke-slate-500/45" strokeWidth="0.6" opacity="0.35" />
      <text x="96" y="14" fill="#64748b" fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.55">
        bus 1:1
      </text>
      <BpCornerTicks />
    </svg>
  );
}

function BpCuenta() {
  const { pid, fluoroFillId, sigmaFillId, GridDefs } = useBlueprintGridPattern();
  return (
    <svg className={`h-14 w-full ${BP_SVG_MOTION}`} viewBox="0 0 240 56" fill="none" aria-hidden="true">
      {GridDefs}
      <rect x="0" y="0" width="240" height="56" fill={`url(#${pid})`} opacity="0.35" />
      <path d="M32 42h176" className="stroke-slate-500/50" strokeWidth="0.75" opacity="0.35" />
      <path d="M32 42V18" className="stroke-slate-500/50" strokeWidth="0.75" opacity="0.35" />
      <rect x="52" y="32" width="14" height="10" className="fill-slate-500/25 transition-all duration-500 group-hover:fill-slate-500/35" />
      <rect x="74" y="26" width="14" height="16" className="fill-slate-500/35 transition-all duration-500 group-hover:fill-slate-500/40" />
      <rect x="96" y="22" width="14" height="20" className="fill-slate-500/45 transition-all duration-500 group-hover:fill-slate-500/50" />
      <rect
        x="118"
        y="18"
        width="14"
        height="24"
        fill={`url(#${fluoroFillId})`}
        className={ACCENT_GLOW}
      />
      <text x="150" y="26" fill="#64748b" fontSize="7" fontFamily="ui-monospace, monospace" opacity="0.7">
        4h/d
      </text>
      <text
        x="150"
        y="38"
        fill={`url(#${sigmaFillId})`}
        className="opacity-[0.6] text-[8px] font-medium transition-all duration-300 ease-out group-hover:opacity-100 group-hover:filter-[drop-shadow(0_0_14px_rgba(248,113,113,0.52))]"
        fontFamily="ui-monospace, monospace"
      >
        Σ −1.6k/m
      </text>
      <BpCornerTicks />
    </svg>
  );
}

type Row1Visual = "filtro" | "status" | "ventas";
type Row2Visual = "rituales" | "sync" | "cuenta";

function Row1Visual({ id }: { id: Row1Visual }) {
  switch (id) {
    case "filtro":
      return <BpFiltro />;
    case "status":
      return <BpAutoridad />;
    case "ventas":
      return <BpPasiva />;
    default:
      return null;
  }
}

function Row2Visual({ id }: { id: Row2Visual }) {
  switch (id) {
    case "rituales":
      return <BpImpuesto />;
    case "sync":
      return <BpSync />;
    case "cuenta":
      return <BpCuenta />;
    default:
      return null;
  }
}

const ROW_DIGITAL: { id: Row1Visual; tag: string; title: string; body: string }[] = [
  {
    id: "filtro",
    tag: "Filtro invisible",
    title: "Si te buscan y no estás, se van al de al lado.",
    body: "El cliente que te busca por Google y no te encuentra, acaba en el local de dos calles más abajo solo porque ellos sí tenían una web que daba confianza.",
  },
  {
    id: "status",
    tag: "Status de autoridad",
    title: "El diseño no es decoración, es confianza.",
    body: "Hoy todo entra por los ojos. Una web descuidada grita que tu negocio también lo está. Si te ves mejor que el resto, puedes permitirte cobrar más.",
  },
  {
    id: "ventas",
    tag: "Venta pasiva",
    title: "Tu negocio no debería cerrar al bajar la persiana.",
    body: "Un sistema que informa, resuelve dudas y acepta reservas mientras tú descansas o estás con un cliente. Eso es recuperar el control.",
  },
];

const ROW_OPERATIVA: { id: Row2Visual; tag: string; title: string; body: string }[] = [
  {
    id: "rituales",
    tag: "El impuesto al trabajo manual",
    title: "Dejar de pagar con tu tiempo.",
    body: "Copiar y pegar datos o rellenar facturas a mano no es trabajar; es un impuesto de tiempo que estás pagando por no tener un sistema que lo haga por ti.",
  },
  {
    id: "sync",
    tag: "Sincronización",
    title: "Que todo hable el mismo idioma.",
    body: "Tu web, tu stock y tus facturas conectados. Cero errores, cero olvidos y cero correos repetidos diciendo lo mismo una y otra vez.",
  },
  {
    id: "cuenta",
    tag: "La cuenta de resultados",
    title: "Recuperar 4 horas al día.",
    body: "Ahorrar 80€ diarios en tiempo de gestión son 1.600€ al mes que se quedaban por el camino. No es magia, es ingeniería aplicada a tu caja.",
  },
];

const TESTIMONIALS: { src: string; name: string; business: string; quote: string }[] = [
  {
    src: "/testimonio1.PNG",
    name: "Laura M.",
    business: "Cafetería",
    quote: "Al principio me daba miedo que fuera un lío, pero qué va. Ahora me entran las reservas por Google y ni me entero. Me he quitado un peso de encima.",
  },
  {
    src: "/testimonio2.PNG",
    name: "Jordi P.",
    business: "Tienda",
    quote: "Lo que antes me llevaba toda la mañana con los Excels, ahora se hace solo. Es la mejor inversión que he hecho en años, así de claro.",
  },
  {
    src: "/testimonio3.PNG",
    name: "Elena V.",
    business: "Clínica",
    quote: "Ya no es solo el tiempo que ahorro, es la tranquilidad de saber que no se me escapa ningún cliente por no haber contestado a tiempo un formulario.",
  },
];

function ServiceRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-4 sm:gap-5 lg:grid-cols-3 ${className}`}>{children}</div>;
}

const VALUE_CARD_ARTICLE =
  "group strategic-paper-card relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#d8d2c8] bg-[#F3F1EB] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_#c9c2b8,inset_0_-4px_0_#ebe7e1,0_10px_28px_-22px_rgba(0,0,0,0.18)] transition-[transform,border-color,box-shadow,opacity,filter] duration-300 ease-out hover:z-20 hover:-translate-y-1 hover:scale-[1.03] hover:border-[#b5aca2] hover:shadow-2xl sm:p-6";

function LabeledServiceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group/row">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500/70 transition-[opacity,color,font-weight] duration-300 ease-out group-hover/row:font-bold group-hover/row:text-zinc-300 group-hover/row:opacity-100">
        {label}
      </p>
      {children}
    </div>
  );
}

function ValueCard({ visual, tag, title, body }: { visual: ReactNode; tag: string; title: string; body: string }) {
  return (
    <article className={VALUE_CARD_ARTICLE}>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex min-h-14 items-center justify-center rounded-lg border border-[#e4e0d8] bg-[#faf9f6]/90 px-2 py-2">
          {visual}
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">{tag}</p>
        <h3 className="mt-2 text-base font-semibold leading-snug tracking-[-0.02em] text-zinc-950 sm:text-[1.05rem]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-800">{body}</p>
      </div>
    </article>
  );
}

function initialsFromName(name: string) {
  const parts = name.replace(/\./g, "").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TestimonialCard({ src, name, business, quote }: { src: string; name: string; business: string; quote: string }) {
  const [imgOk, setImgOk] = useState(true);
  const initials = initialsFromName(name);

  return (
    <figure className="flex gap-4 rounded-xl border border-white/15 bg-[#0a0f1d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/15 bg-zinc-900">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element -- fallback local assets; onError swaps to initials
          <img
            src={src}
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover object-[50%_42%]"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium tracking-tight text-zinc-400 font-[ui-monospace,monospace]">
            {initials}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <blockquote className="text-sm leading-[1.65] text-zinc-400">&ldquo;{quote}&rdquo;</blockquote>
        <figcaption className="mt-3 text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">{name}</span>
          <span className="text-zinc-600"> · {business}</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function StrategicProfile() {
  return (
    <section id="perfil" className="relative z-0 w-full overflow-visible">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
        <div className="relative w-full bg-[#070b13] pb-8 pt-8 text-zinc-200 sm:pb-10 sm:pt-10 lg:pb-12 lg:pt-12">
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-soft-light"
            style={{
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 1) 0.42px, transparent 0.42px)",
              backgroundSize: "2px 2px",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-10 left-2 z-1 flex flex-col justify-between font-mono text-[7px] leading-none tracking-[0.28em] text-zinc-500/22 sm:left-4 lg:left-6 lg:text-[8px]"
            aria-hidden="true"
          >
            <span>01</span>
            <span>02</span>
            <span>03</span>
          </div>
          <div
            className="pointer-events-none absolute inset-y-10 right-2 z-1 flex flex-col justify-between font-mono text-[7px] leading-none tracking-[0.28em] text-zinc-500/22 sm:right-4 lg:right-6 lg:text-[8px]"
            aria-hidden="true"
          >
            <span>04</span>
            <span>05</span>
            <span>06</span>
          </div>          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-0 pt-0 sm:px-6 lg:px-10">
          <FadeIn className="max-w-6xl">
            <h2 className="text-3xl font-bold leading-[1.12] tracking-tighter text-zinc-50 sm:text-4xl lg:text-5xl">
              <span className="block">Tu primera impresión ya no ocurre en la calle.</span>
              <span className="block">Hoy el cliente decide desde una pantalla.</span>
            </h2>
            <div className="-mx-4 mt-4 max-w-[100vw] overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-5 sm:max-w-none sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              <p className="whitespace-nowrap text-base leading-relaxed text-zinc-500 sm:text-lg">
                Tu escaparate se limita al cristal de tu local, mientras tu competencia ya está en el bolsillo de tus clientes.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.04} className="mt-14 sm:mt-16 lg:mt-20">
            <LabeledServiceRow label="Cómo te ven tus clientes">
              <motion.div
                className={VALUE_ROW_GRID}
                variants={dealRowParent}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
              >
                {ROW_DIGITAL.map((item, i) => (
                  <motion.div key={item.id} variants={dealRowItem} custom={i} className="min-h-0">
                    <div style={{ transform: `rotate(${tiltFromCardId(item.id)}deg)` }} className="h-full">
                      <ValueCard
                        visual={<Row1Visual id={item.id} />}
                        tag={item.tag}
                        title={item.title}
                        body={item.body}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </LabeledServiceRow>
          </FadeIn>

          <FadeIn delay={0.06} className="mt-12 sm:mt-14 lg:mt-16">
            <LabeledServiceRow label="Que el negocio trabaje por ti">
              <motion.div
                className={VALUE_ROW_GRID}
                variants={dealRowParent}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.12 }}
              >
                {ROW_OPERATIVA.map((item, i) => (
                  <motion.div key={item.id} variants={dealRowItem} custom={i} className="min-h-0">
                    <div style={{ transform: `rotate(${tiltFromCardId(item.id)}deg)` }} className="h-full">
                      <ValueCard
                        visual={<Row2Visual id={item.id} />}
                        tag={item.tag}
                        title={item.title}
                        body={item.body}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </LabeledServiceRow>
          </FadeIn>
          <FadeIn delay={0.08} className="mt-14 sm:mt-16 lg:mt-20">
            <ServiceRow>
              {TESTIMONIALS.map((t) => (
                <TestimonialCard key={t.name} src={t.src} name={t.name} business={t.business} quote={t.quote} />
              ))}
            </ServiceRow>
          </FadeIn>
        </div>
        </div>
      </div>
    </section>
  );
}
