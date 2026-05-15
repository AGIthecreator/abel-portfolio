"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";

const OFF_WHITE = "#F3F1EB";
const DEEP_BLACK = "#070b13";

const EXCEL_ROW_COUNT = 5;
const EXCEL_COL_LABELS = ["A", "B", "C"] as const;
/** [columna][fila] — mismos campos en manual y motor */
const EXCEL_COL_DATA = [
  ["Nombre...", "Nombre2...", "Email...", "Teléfono...", "Fecha..."],
  ["Ana G.", "Luis M.", "info@...", "+346...", "15/05..."],
  ["Web", "Referido", "Lead", "Móvil", "OK"],
] as const;
const LOOP_PAUSE_MS = 3600;
const COL_BURST_MS = 950;

const CHECK_TASKS = [
  "Reserva confirmada",
  "Pago recibido",
  "Stock sincronizado",
  "Factura enviada",
  "CRM actualizado",
] as const;

const PEACE_LINES = ["Todo en su sitio.", "Sin mensajes de madrugada.", "Sin olvidos."] as const;
const PEACE_CLOSING = "Todo en el mismo sitio. Menos perseguir cosas, más trabajar tranquilo." as const;

/** Hero ventana Abel — espacio/arquitectura cálido (Unsplash) */
const BP_PERCEPCION_PREMIUM_IMG =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=82";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.32, 1] as const },
  },
};

/** Legibilidad sobre foto clara — título y cuerpo con halos distintos */
const HERO_TITLE_RELIEF =
  "[text-shadow:0_1px_0_rgb(255_255_255/1),0_0_1px_rgb(255_255_255/1),0_0_20px_rgb(255_255_255/0.85),0_2px_14px_rgb(250_249_245/0.95)]";
const HERO_BODY_RELIEF =
  "[text-shadow:0_1px_0_rgb(255_255_255/1),0_0_1px_rgb(255_255_255/1),0_0_18px_rgb(255_255_255/0.92),0_2px_10px_rgb(252_250_246/0.98),0_3px_20px_rgb(255_255_255/0.55)]";
const CARD_HERO =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#d8d2c8] bg-[#F3F1EB] p-4 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#cdc4b8] hover:shadow-[0_18px_44px_-14px_rgba(15,23,42,0.2)] sm:p-5";

/** Grano fino reutilizable (cards claras / oscuras) */
const CARD_GRAIN_NOISE =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;

const GRAIN_STYLE: React.CSSProperties = {
  backgroundColor: OFF_WHITE,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
};

function CardGrain({ light }: { light?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-1 rounded-[inherit] opacity-[0.55] ${light ? "mix-blend-multiply" : "mix-blend-soft-light"}`}
      style={{
        backgroundImage: CARD_GRAIN_NOISE,
        backgroundSize: "256px 256px",
      }}
      aria-hidden
    />
  );
}

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

/** Fondo fijo al card — no se redimensiona con el contenido interno */
function CardBgImage({ src, objectPosition }: { src: string; objectPosition?: string }) {
  const pos = objectPosition ?? "72% 38%";
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, min(28rem, 45vw)"
          className="object-cover opacity-[0.68] saturate-[1.18] contrast-[1.08] sm:opacity-[0.74]"
          style={{ objectPosition: pos }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-linear-to-br from-[#F3F1EB]/28 via-[#F3F1EB]/18 to-[#ebe6dc]/22"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-[#F3F1EB]/55 via-transparent to-[#F3F1EB]/38"
        aria-hidden
      />
    </>
  );
}

/** Comparativa perceptiva — HTML + aspect ratio, texto con flex/em (nitidez) */
function BpPercepcion() {
  return (
    <motion.div
      className="relative mx-auto mt-auto w-full max-w-lg shrink-0"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      aria-hidden
    >
      <BpCornerTicksOverlay light />

      {/* Base tipográfica fluida para hijos — todo en em dentro de cada ventana */}
      <div className="relative aspect-16/5.5 w-full max-w-90 min-h-0 sm:max-w-none">
        {/* —— Web 2010 (atrás, queda bajo la superior) —— */}
        <motion.div
          className="absolute top-[5%] bottom-0 left-[0.5%] z-10 flex w-[43%] max-w-50 min-h-0 origin-bottom -rotate-[5deg] flex-col overflow-hidden rounded-sm border-2 border-[#808080] bg-[#c0c0c0] font-serif shadow-md"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <div className="flex min-h-0 flex-1 flex-col text-[clamp(0.5rem,2vw,0.6875rem)]">
            <div className="flex min-h-[1.65em] shrink-0 items-center justify-center bg-[#000080] px-[0.4em]">
              <span className="font-sans text-[0.72em] font-medium leading-none text-white">Internet Explorer</span>
            </div>
            <div className="flex min-h-[0.55em] shrink-0 items-center justify-center gap-[0.25em] bg-[#d4d4d4] py-[0.15em]">
              <span className="h-[0.45em] w-[0.45em] min-h-[5px] min-w-[5px] rounded-full bg-[#c00]" />
              <span className="h-[0.45em] w-[0.45em] min-h-[5px] min-w-[5px] rounded-full bg-[#cc0]" />
              <span className="h-[0.45em] w-[0.45em] min-h-[5px] min-w-[5px] rounded-full bg-[#090]" />
            </div>

            <div className="flex min-h-[1.75em] shrink-0 items-center justify-center bg-[#ff0] px-[0.45em]">
              <p className="text-center font-serif text-[1em] font-bold uppercase leading-none tracking-wide text-[#c00]">
                BIENVENIDO
              </p>
            </div>

            <nav
              aria-label="Menú ejemplo"
              className="flex min-h-[1.55em] shrink-0 flex-wrap items-center justify-center gap-x-[0.2em] gap-y-0 bg-[#ffffcc] px-[0.35em] text-[0.82em] leading-none text-[#000080] underline decoration-1 underline-offset-2"
            >
              <span>Inicio</span>
              <span className="select-none opacity-75" aria-hidden>
                ·
              </span>
              <span>Productos</span>
              <span className="select-none opacity-75" aria-hidden>
                ·
              </span>
              <span>Contacto</span>
            </nav>

            <div className="flex min-h-[2.35em] shrink-0 items-center justify-center gap-[0.35em] border-y border-[#999] bg-white px-[0.35em]">
              <div className="flex h-[1.85em] w-[1.85em] shrink-0 items-center justify-center border border-[#666] bg-[#ccc] font-mono text-[0.78em] font-bold leading-none text-zinc-900">
                ESL
              </div>
              <span className="truncate text-[0.84em] font-bold leading-none text-[#000080]">Empresa S.L.</span>
            </div>

            <div className="relative min-h-[2.85rem] w-full flex-1 overflow-hidden bg-[#ddd]">
              <Image
                src="/gestoria.png"
                alt=""
                fill
                sizes="140px"
                className="scale-[1.08] object-cover [image-rendering:crisp-edges]"
                style={{
                  filter: "saturate(2.5) contrast(0.55) hue-rotate(-18deg) blur(0.4px)",
                }}
              />
              {/* “Suciedad” CRT / submuestreo sutil */}
              <div
                className="pointer-events-none absolute inset-0 z-1 opacity-[0.22] mix-blend-multiply"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.12) 1px, rgba(0,0,0,0.12) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)",
                  backgroundSize: "100% 2px, 2px 100%",
                }}
                aria-hidden
              />
            </div>

            <div className="flex shrink-0 flex-col gap-[0.4em] bg-[#f4f4f4] px-[0.4em] py-[0.35em] text-[0.78em] leading-tight">
              <p className="text-center text-[#666]">Contador: 000427 visitas</p>
              <p className="text-center text-[#888]">Últ. actualización: 2008</p>
              <button
                type="button"
                className="flex min-h-[2em] w-full items-center justify-center border-[0.12em] border-black bg-[#0066cc] font-serif text-[0.92em] font-bold leading-none text-white"
              >
                ENTRAR
              </button>
            </div>
          </div>
        </motion.div>

        {/* —— Web Abel (delante) —— */}
        <motion.div
          className="absolute top-[1%] bottom-0 right-0 z-30 flex w-[59%] max-w-69 origin-bottom rotate-[1.25deg] flex-col overflow-hidden rounded-lg border border-zinc-400/25 bg-white font-sans shadow-[0_28px_52px_-14px_rgba(0,0,0,0.42),0_14px_32px_-8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.9)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ transformOrigin: "50% 100%" }}
        >
          <div className="flex min-h-0 flex-1 flex-col text-[clamp(0.52rem,2.1vw,0.6875rem)]">
            <div className="flex min-h-[2em] shrink-0 items-center justify-between gap-[0.55em] border-b border-[#e7e5e4] px-[0.95em] py-[0.35em]">
              <span className="text-[0.95em] font-semibold leading-none tracking-tight text-zinc-900">Tu Negocio</span>
              <div className="flex items-center gap-[0.42em] text-[0.74em] leading-none text-zinc-500">
                <span>Servicios</span>
                <span>Reservas</span>
                <span>Contacto</span>
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                src={BP_PERCEPCION_PREMIUM_IMG}
                alt=""
                fill
                sizes="(max-width:640px) 42vw, 320px"
                className="object-cover object-[50%_45%]"
                priority={false}
              />
              <div className="pointer-events-none absolute inset-0 z-1 bg-black/20" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-black/45 via-black/10 to-black/25"
                aria-hidden
              />
              <div className="absolute inset-x-0 top-0 z-3 flex justify-start px-[0.95em] pt-[0.62em]">
                <p className="max-w-[95%] font-sans text-[0.74em] font-semibold uppercase leading-snug tracking-tighter text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                  Estudio de ingeniería
                </p>
              </div>
              <div className="absolute inset-x-[0.55em] bottom-[0.5em] z-3 flex items-center justify-end gap-[0.35em]">
                <span className="inline-flex min-h-[1.7em] items-center justify-center rounded-md border border-white/10 bg-white/25 px-[0.5em] text-[0.67em] font-medium leading-none text-zinc-900 backdrop-blur-md">
                  ★ 4.9
                </span>
                <span className="inline-flex min-h-[1.7em] items-center justify-center rounded-md border border-white/10 bg-white/25 px-[0.5em] text-[0.67em] font-medium leading-none text-zinc-900 backdrop-blur-md">
                  Verificado
                </span>
              </div>
            </div>

            <div className="flex min-h-[2.35em] shrink-0 items-center justify-between gap-[0.5em] border-t border-[#e7e5e4] px-[0.95em] py-[0.4em]">
              <p className="text-[0.78em] leading-tight text-zinc-500">Reserva en 30 segundos</p>
              <button
                type="button"
                className="inline-flex min-h-[2.15em] min-w-[5.75em] shrink-0 items-center justify-center rounded-md bg-[#10b981] px-[0.85em] py-[0.5em] text-center text-[0.84em] font-bold leading-none text-white shadow-[0_6px_20px_-2px_rgba(16,185,129,0.55)] drop-shadow-[0_2px_10px_rgba(16,185,129,0.45)]"
              >
                Reservar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ArrowFlow({ prominent }: { prominent?: boolean }) {
  const wrapper = prominent ? "mx-3 h-7 w-12 sm:h-9 sm:w-14 text-zinc-200 sm:text-zinc-100" : "mx-2 h-6 w-10 sm:h-7 sm:w-12 text-zinc-400";
  const stroke = prominent ? "2.85" : "2";
  return (
    <svg className={`${wrapper} shrink-0`} viewBox="0 0 48 24" fill="none" aria-hidden>
      <path d="M2 12h36" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M34 6l8 6-8 6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sacos — flotando sobre el fondo (sin sombras ni bordes) */
function VisualAutoridad() {
  return (
    <div className="relative flex min-h-[100px] -translate-y-[25px] items-end justify-center pb-1" aria-hidden>
      <Image
        src="/sacodinero.png"
        alt=""
        width={200}
        height={200}
        className="relative z-10 h-10 w-auto object-contain -rotate-14 sm:h-11"
      />
      <ArrowFlow prominent />
      <div className="relative flex items-end">
        <Image
          src="/sacodinero.png"
          alt=""
          width={200}
          height={200}
          className="relative z-20 h-16 w-auto object-contain rotate-11 sm:h-17"
        />
        <Image
          src="/sacodinero.png"
          alt=""
          width={200}
          height={200}
          className="relative z-30 -ml-10 h-18 w-auto object-contain -rotate-7 sm:-ml-12 sm:h-20"
        />
      </div>
    </div>
  );
}

/** Móvil con notificaciones + panel CRM */
function VisualMotor() {
  return (
    <div className="relative grid min-h-[120px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 sm:gap-3" aria-hidden>
      <div className="flex flex-col items-center justify-end pb-1">
        <div className="relative w-[86px] rounded-[18px] border-[2.5px] border-zinc-600 bg-zinc-950 p-1 shadow-[0_12px_28px_rgba(0,0,0,0.55)] sm:w-[94px]">
          <div className="absolute top-1.5 left-1/2 z-10 h-3 w-10 -translate-x-1/2 rounded-full bg-black" />
          <div className="overflow-hidden rounded-[14px] bg-[#0a0a0a]">
            <div className="flex items-center justify-between px-2 pt-4 pb-1 text-[6px] text-zinc-500">
              <span>23:47</span>
              <span>●●●</span>
            </div>
            <div className="space-y-1 px-1.5 pb-2">
              {[
                { t: "Llamada perdida", c: "hace 2 min", hot: true },
                { t: "WhatsApp (14)", c: "ahora", hot: true },
                { t: "Cliente esperando", c: "23:41", hot: false },
              ].map((n) => (
                <div
                  key={n.t}
                  className={`rounded-md px-1.5 py-1 ${n.hot ? "bg-red-950/80 ring-1 ring-red-500/40" : "bg-zinc-900/80"}`}
                >
                  <p className="text-[6px] font-medium text-zinc-200">{n.t}</p>
                  <p className="text-[5px] text-zinc-500">{n.c}</p>
                </div>
              ))}
            </div>
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
            14
          </span>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-zinc-500">Sin sistema</p>
      </div>
      <div className="flex flex-col justify-end">
        <div className="overflow-hidden rounded-lg border border-emerald-500/25 bg-[#0a0f0a] shadow-[0_0_24px_rgba(16,185,129,0.12)]">
          <div className="border-b border-emerald-500/20 bg-emerald-950/40 px-2 py-1">
            <p className="text-[8px] font-semibold tracking-wide text-emerald-400">PANEL · AUTOMÁTICO</p>
          </div>
          <ul className="space-y-0.5 px-2 py-1.5">
            {["Cita 09:00 ✓", "Email enviado ✓", "Factura ✓", "Stock OK ✓"].map((line) => (
              <li key={line} className="flex items-center gap-1 text-[7px] text-emerald-300/90 sm:text-[8px]">
                <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {line}
              </li>
            ))}
          </ul>
          <p className="border-t border-emerald-500/15 px-2 py-1 text-[6px] text-emerald-600/80">Trabajando 24/7</p>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-emerald-600/70">Con sistema</p>
      </div>
    </div>
  );
}

function useExcelColumns(active: boolean) {
  const [manual, setManual] = useState<string[][]>(() =>
    EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")),
  );
  const [engine, setEngine] = useState<string[][]>(() =>
    EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")),
  );
  const [colIdx, setColIdx] = useState(0);
  const [rowIdx, setRowIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "burst" | "between" | "hold">("typing");
  const [flashCol, setFlashCol] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setManual(EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")));
      setEngine(EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")));
      setColIdx(0);
      setRowIdx(0);
      setTyped("");
      setPhase("typing");
      setFlashCol(null);
      return;
    }

    if (phase === "typing") {
      const full = EXCEL_COL_DATA[colIdx][rowIdx];
      if (typed.length < full.length) {
        const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), 78);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setManual((m) => {
          const next = m.map((col) => [...col]);
          next[colIdx][rowIdx] = full;
          return next;
        });
        setTyped("");
        if (rowIdx < EXCEL_ROW_COUNT - 1) {
          setRowIdx((r) => r + 1);
        } else {
          setPhase("burst");
          setFlashCol(colIdx);
        }
      }, 320);
      return () => clearTimeout(t);
    }

    if (phase === "burst") {
      setEngine((e) => {
        const next = e.map((col) => [...col]);
        next[colIdx] = [...EXCEL_COL_DATA[colIdx]];
        return next;
      });
      const t = setTimeout(() => {
        setFlashCol(null);
        if (colIdx < EXCEL_COL_LABELS.length - 1) {
          setPhase("between");
        } else {
          setPhase("hold");
        }
      }, COL_BURST_MS);
      return () => clearTimeout(t);
    }

    if (phase === "between") {
      const t = setTimeout(() => {
        setColIdx((c) => c + 1);
        setRowIdx(0);
        setPhase("typing");
      }, 420);
      return () => clearTimeout(t);
    }

    if (phase === "hold") {
      const t = setTimeout(() => {
        setManual(EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")));
        setEngine(EXCEL_COL_DATA.map(() => Array(EXCEL_ROW_COUNT).fill("")));
        setColIdx(0);
        setRowIdx(0);
        setTyped("");
        setPhase("typing");
      }, LOOP_PAUSE_MS);
      return () => clearTimeout(t);
    }
  }, [active, phase, colIdx, rowIdx, typed]);

  const getManualCell = (c: number, r: number) => {
    if (c < colIdx) return manual[c][r] ?? "";
    if (c > colIdx) return "";
    if (r < rowIdx) return manual[c][r] ?? "";
    if (r === rowIdx && phase === "typing") {
      if (!typed) return manual[c][r] ?? "";
      const full = EXCEL_COL_DATA[c][r];
      return typed + (typed.length < full.length ? "|" : "");
    }
    return manual[c][r] ?? "";
  };

  return { engine, colIdx, rowIdx, phase, flashCol, getManualCell };
}

function ExcelSheet({
  fileName,
  grid,
  mode,
  activeCol,
  activeRow,
  phase,
  flashCol,
}: {
  fileName: string;
  grid: string[][];
  mode: "manual" | "engine";
  activeCol?: number;
  activeRow?: number;
  phase?: string;
  flashCol?: number | null;
}) {
  const isEngine = mode === "engine";
  const flashing = isEngine && flashCol !== null && flashCol !== undefined;

  return (
    <div
      className={`relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border bg-white shadow-sm transition-colors duration-300 ${
        flashing ? "border-emerald-400 ring-1 ring-emerald-300/50" : "border-[#d6d0c4]"
      }`}
    >
      {flashing ? <div className="pointer-events-none absolute inset-0 z-10 animate-pulse bg-emerald-400/20" /> : null}
      <div
        className={`flex min-h-[26px] shrink-0 items-center px-2 sm:h-6 sm:min-h-0 ${isEngine ? "bg-[#1e3a2f]" : "bg-[#217346]"}`}
      >
        <span className="truncate text-[11px] font-medium text-white tabular-nums sm:text-[9px]">{fileName}</span>
      </div>
      <div className="grid grid-cols-[20px_repeat(3,minmax(0,1fr))] grid-rows-[18px_repeat(5,21px)] text-[12px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[15px_repeat(5,17px)] sm:text-[11px]">
        <div className="border-r border-b border-[#e2e8f0] bg-[#f1f5f9]" />
        {EXCEL_COL_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center border-r border-b border-[#e2e8f0] bg-[#f1f5f9] px-0.5 text-[10px] font-semibold tracking-tight text-[#64748b] sm:text-[8px] sm:font-medium"
          >
            {label}
          </div>
        ))}
        {Array.from({ length: EXCEL_ROW_COUNT }, (_, r) => (
          <div key={`row-${r}`} className="contents">
            <div className="flex items-center justify-center border-r border-b border-[#f1f5f9] bg-[#f8fafc] text-[10px] tabular-nums text-[#64748b] sm:text-[8px]">
              {r + 1}
            </div>
            {EXCEL_COL_LABELS.map((_, c) => {
              const val = grid[c]?.[r] ?? "";
              const isActive = !isEngine && phase === "typing" && activeCol === c && activeRow === r;
              const isEngineFill = isEngine && val.length > 0;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex h-[21px] items-center overflow-hidden border-r border-b border-[#f1f5f9] px-0.5 font-mono tracking-tight sm:h-[17px] ${
                    isActive
                      ? "bg-amber-50 text-zinc-900"
                      : isEngineFill
                        ? "bg-emerald-50/80 font-medium text-emerald-900"
                        : val
                          ? "text-zinc-800"
                          : "text-zinc-300"
                  }`}
                >
                  <span className="block w-full truncate">{val}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualExcel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.25 });
  const { engine, colIdx, rowIdx, phase, flashCol, getManualCell } = useExcelColumns(inView);

  const manualGrid = EXCEL_COL_LABELS.map((_, c) =>
    Array.from({ length: EXCEL_ROW_COUNT }, (_, r) => getManualCell(c, r)),
  );

  return (
    <div ref={ref} className="flex h-full w-full min-w-0 items-stretch gap-1.5 sm:gap-2" aria-hidden>
      <BpCornerTicksOverlay light />
      <ExcelSheet
        fileName="clientes.xlsx · manual"
        grid={manualGrid}
        mode="manual"
        activeCol={colIdx}
        activeRow={rowIdx}
        phase={phase}
      />
      <ArrowFlow />
      <ExcelSheet
        fileName="clientes.xlsx · SST_ENGINE"
        grid={engine}
        mode="engine"
        flashCol={flashCol}
        phase={phase}
      />
    </div>
  );
}
const WA_CHAOS = [
  { text: "¿Cómo va lo mío?", fromThem: true, time: "23:08" },
  { text: "Te lo pasé por ahí, búscalo", fromThem: false, time: "23:09" },
  { text: "¿Me lo vuelves a enviar?", fromThem: true, time: "23:52" },
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

function Row3Bento() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <motion.div ref={ref} className="mt-3 flex flex-col gap-3 sm:mt-4 md:flex-row md:items-stretch md:gap-3">
      <motion.div
        className="mx-auto flex w-full max-w-[310px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 shadow-[0_8px_28px_-10px_rgba(0,0,0,0.55)] md:mx-0 md:w-[295px] md:max-w-none"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        <div className="flex h-5 items-center justify-between bg-[#075e54] px-2.5 text-[8px] font-medium text-white/90">
          <span>23:52</span>
          <span className="flex items-center gap-1 opacity-80" aria-hidden>
            <span className="h-1 w-2 rounded-sm bg-white/70" />
            <span className="h-1 w-1 rounded-full bg-white/70" />
          </span>
        </div>
        <div className="flex h-10 items-center gap-2 border-b border-[#0a5c52] bg-[#075e54] px-2">
          <span className="text-white/75" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[11px] font-semibold text-white">
            C
          </div>
          <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">Cliente</p>
          <div className="flex shrink-0 items-center gap-2 text-white/70" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
        </div>
        <div className="relative flex min-h-[148px] flex-col gap-1 px-2 py-2" style={{ backgroundColor: "#ece5dd" }}>
          <BpCornerTicksOverlay />
          {WA_CHAOS.map((msg, i) => (
            <motion.div
              key={msg.text}
              className={`flex max-w-[88%] flex-col ${msg.fromThem ? "self-start" : "self-end items-end"}`}
              initial={{ opacity: 0, y: 4 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + i * 0.35 }}
            >
              <div
                className={`rounded-lg px-2 py-1 text-[10px] leading-snug shadow-sm ${
                  msg.fromThem ? "bg-white text-[#111b21]" : "bg-[#d9fdd3] text-[#111b21]"
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-px flex items-center text-[8px] text-[#667781]">
                {msg.time}
                {!msg.fromThem ? <ReadTicks /> : null}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex w-full shrink-0 items-center justify-center py-1 md:w-8 md:py-0">
        <p className="text-center font-mono text-[10px] font-bold tracking-[0.28em] text-zinc-200 uppercase [writing-mode:vertical-rl] rotate-180">
          ¿TE SUENA?
        </p>
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-[480px] shrink-0 overflow-hidden rounded-xl border border-[#d8d2c8] p-3 md:mx-0 md:min-w-[440px] md:max-w-none md:flex-[1.42]"
        style={GRAIN_STYLE}
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.08 }}
      >
        <BpCornerTicksOverlay light />
        <p className="text-[11px] font-semibold text-zinc-800">Checking realizado</p>
        <div className="mt-2 overflow-hidden rounded-md border border-zinc-300/50">
          {CHECK_TASKS.map((task, i) => (
            <motion.div
              key={task}
              className="flex items-center gap-2 border-b border-zinc-300/40 bg-white/45 px-2 py-1.5 text-[10px] text-zinc-700 last:border-b-0"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-700">
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
        className="flex min-h-[148px] min-w-0 flex-1 flex-col justify-center px-3 py-5 sm:px-5 md:flex-[1.58] md:min-w-[200px]"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        <div className="mx-auto w-full max-w-md pb-3 pt-1 text-center">
          <blockquote className="text-[13px] font-medium leading-[1.55] tracking-[-0.02em] text-[#eae6dc]/95 sm:text-[13.5px]">
            <p>{PEACE_LINES[0]}</p>
            <p className="mt-2 text-[12.5px] font-normal text-[#eae6dc]/82 sm:mt-2.5 sm:text-[13px]">{PEACE_LINES[1]}</p>
            <p className="mt-2 text-[13px] font-medium text-[#eae6dc]/90 sm:text-[13.5px]">{PEACE_LINES[2]}</p>
          </blockquote>
          <p className="mx-auto mt-5 max-w-88 text-[11px] italic leading-snug text-zinc-500 sm:mt-6 sm:text-[11.5px]">
            <span aria-hidden className="text-zinc-500/85 select-none">
              &lsquo;&nbsp;
            </span>
            {PEACE_CLOSING}
            <span aria-hidden className="text-zinc-500/85 select-none">
              &nbsp;&rsquo;
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TESTIMONIALS = [
  {
    src: "/testimonio1.PNG",
    name: "Laura Méndez",
    business: "Cafetería",
    quote: "Ahora las reservas entran solas y no tengo que estar pendiente del móvil.",
  },
  {
    src: "/testimonio2.PNG",
    name: "Jordi Planas",
    business: "Tienda",
    quote: "Antes me daba vergüenza enseñar mi web.",
  },
  {
    src: "/testimonio3.PNG",
    name: "Elena Vázquez",
    business: "Clínica",
    quote: "He dejado de perder tardes enteras organizando citas.",
  },
] as const;

function GoogleMapsBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-zinc-500" aria-label="Google Maps">
      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
        <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" fill="#fff" />
      </svg>
    </span>
  );
}

function HeroCard({
  title,
  body,
  diagram,
  bgImage,
  bgObjectPosition,
  diagramFixed = false,
  compact = false,
}: {
  title: string;
  body: string;
  diagram: ReactNode;
  bgImage?: string;
  /** object-position del fondo (ej. subir encuadre) */
  bgObjectPosition?: string;
  diagramFixed?: boolean;
  compact?: boolean;
}) {
  const titleRelief = bgImage ? HERO_TITLE_RELIEF : "";
  const bodyRelief = bgImage ? HERO_BODY_RELIEF : "";
  return (
    <article className={`w-full min-w-0 ${CARD_HERO}${compact ? " p-3! sm:p-4!" : ""}`}>
      {bgImage ? <CardBgImage src={bgImage} objectPosition={bgObjectPosition} /> : null}
      <CardGrain light />
      <BpCornerTicksOverlay light />
      <div className={`relative z-10 flex flex-1 flex-col ${diagramFixed ? "pb-[162px] sm:pb-[168px]" : ""}`}>
        <h3
          className={`font-semibold leading-snug tracking-[-0.03em] text-zinc-950 ${titleRelief} ${
            compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
          }`}
        >
          {title}
        </h3>
        <p
          className={`max-w-[92%] leading-relaxed text-[#1A1A1A] ${bodyRelief} ${
            bgImage
              ? "rounded-md border border-white/35 bg-white/40 px-2.5 py-2 shadow-[0_1px_14px_rgba(255,255,255,0.5)] backdrop-blur-[3px] sm:px-3"
              : ""
          } ${compact ? "mt-1 text-[12px] sm:text-[13px]" : "mt-1.5 text-[13px] sm:text-sm"}`}
        >
          {body}
        </p>
        {!diagramFixed ? (
          <div className={`relative mt-auto min-h-0 w-full shrink-0 ${compact ? "pt-1.5" : "pt-3"}`}>{diagram}</div>
        ) : null}
      </div>
      {diagramFixed ? (
        <div className="absolute inset-x-0 bottom-0 z-10 h-[158px] px-4 pb-4 sm:h-[162px] sm:px-5 sm:pb-5">
          {diagram}
        </div>
      ) : null}
    </article>
  );
}

/** Bloque oscuro sin card — encaja en el fondo de la sección */
function DarkOpenBlock({
  title,
  body,
  bodyClassName,
  children,
}: {
  title: string;
  body?: string;
  /** Clases extra para el párrafo (ej. énfasis en columna sacos) */
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className="relative z-10 flex min-h-full flex-1 flex-col pb-1">
        <h3 className="text-base font-medium leading-snug tracking-[-0.02em] text-zinc-50 sm:text-[1.05rem]">{title}</h3>
        {body ? (
          <p
            className={
              bodyClassName ??
              "mt-2 max-w-[96%] text-[12px] leading-relaxed text-zinc-400 sm:text-[13px]"
            }
          >
            {body}
          </p>
        ) : null}
        <div className="relative mt-auto w-full pt-3 sm:pt-4">{children}</div>
      </div>
    </div>
  );
}

function initialsFromName(name: string) {
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function TestimonialCard({
  src,
  name,
  business,
  quote,
}: {
  src: string;
  name: string;
  business: string;
  quote: string;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <figure className="relative flex min-h-0 flex-col items-center gap-2.5 overflow-hidden rounded-lg border border-white/10 bg-[#05080f] p-2.5 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.55)] sm:p-3">
      <CardGrain />
      <div className="relative z-10 flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/12 bg-zinc-900 shadow-inner">
        {imgOk ? (
          <Image
            src={src}
            alt=""
            width={64}
            height={64}
            className="h-full w-full object-cover object-[50%_35%]"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-mono text-xs text-zinc-500">
            {initialsFromName(name)}
          </span>
        )}
      </div>
      <blockquote className="relative z-10 line-clamp-4 min-h-11 text-[11px] leading-snug text-zinc-400 sm:min-h-12 sm:text-[11.5px]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="relative z-10 mt-auto flex w-full flex-col items-center gap-0.5 pt-0.5">
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
          <span className="text-[11.5px] font-medium text-zinc-200 sm:text-xs">{name}</span>
          <span className="text-[10px] text-zinc-500">· {business}</span>
          <GoogleMapsBadge />
          <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[7px] font-medium tracking-wide text-zinc-500 uppercase">
            Verificada
          </span>
        </div>
      </div>
    </figure>
  );
}

export function StrategicProfile() {
  return (
    <section id="perfil" className="relative z-0 -mt-6 w-full overflow-visible sm:-mt-10 lg:-mt-14">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
        <div
          className="relative w-full pt-14 pb-10 text-zinc-200 sm:pt-18 sm:pb-12 lg:pt-22"
          style={{ backgroundColor: DEEP_BLACK }}
        >
          <DotPattern />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-6xl">
              <h2 className="font-bold leading-[1.08] tracking-tighter text-zinc-50 text-[clamp(2rem,5vw,3.5rem)] lg:whitespace-nowrap">
                Tu primera impresión ya no ocurre en la calle.
              </h2>
              <p className="mt-2 text-base text-zinc-500 sm:text-lg">
                Tu escaparate sigue en la calle. El de tu competencia ya vive en el móvil de tus clientes.
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
                  bgImage="/programador.png"
                  bgObjectPosition="72% 52%"
                  title="El cliente te juzga antes de hablar contigo."
                  body="Buscan en Google. Ven tu web. Ven la del vecino. Si la tuya parece antigua, asumen que tu negocio también lo es."
                  diagram={<BpPercepcion />}
                />
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1">
                <DarkOpenBlock
                  title="La percepción cambia lo que la gente está dispuesta a pagar."
                  body="Cuando tu negocio se ve sólido, el precio necesita menos explicaciones."
                  bodyClassName="mt-2 max-w-[98%] text-[13px] font-medium leading-snug text-zinc-300/95 sm:text-[14px]"
                >
                  <VisualAutoridad />
                </DarkOpenBlock>
              </motion.div>
            </motion.div>

            {/* Fila 2 — misma proporción que fila 1: texto ancho cols 2–3 */}
            <motion.div
              className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="order-1 flex min-h-0 h-full lg:order-0 lg:col-span-1 lg:z-20">
                <DarkOpenBlock
                  title="Tu competencia no descansa. Tu sistema tampoco debería."
                  body="Mientras duermes, el sistema sigue trabajando."
                >
                  <VisualMotor />
                </DarkOpenBlock>
              </motion.div>
              <motion.div variants={fadeUp} className="order-2 flex min-h-0 h-full lg:order-0 lg:col-span-2 lg:col-start-2">
                <HeroCard
                  bgImage="/gestoria.png"
                  title="El trabajo manual es un coste que no deberías asumir."
                  body="Copiar datos a mano no hace crecer tu negocio. Un motor lo hace en segundos."
                  diagramFixed={true}
                  diagram={<VisualExcel />}
                />
              </motion.div>
            </motion.div>

            <FadeIn delay={0.04}>
              <Row3Bento />
            </FadeIn>

            <FadeIn delay={0.06} className="mt-4 sm:mt-5">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2">
                {TESTIMONIALS.map((t) => (
                  <TestimonialCard key={t.name} {...t} />
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
