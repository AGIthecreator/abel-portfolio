"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.32, 1] as const },
  },
};

const CARD_HERO =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#d8d2c8] bg-[#F3F1EB] p-4 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#c9c2b6] hover:shadow-[0_14px_48px_-14px_rgba(15,23,42,0.18)] sm:p-5";
const CARD_DARK =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/14 bg-[#0b1019] p-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/22 sm:p-5";

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

/** Fondo fijo al card — no se redimensiona con el contenido interno */
function CardBgImage({ src }: { src: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[72%_38%] opacity-[0.68] saturate-[1.18] contrast-[1.08] sm:opacity-[0.74]"
          draggable={false}
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

/** Comparativa web — obsoleta atrás/pequeña, premium delante */
function VisualPercepcion() {
  return (
    <motion.div
      className="relative mx-auto mt-auto h-[132px] w-full max-w-lg sm:h-[140px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      aria-hidden
    >
      <BpCornerTicksOverlay light />

      {/* Web obsoleta — pequeña, atrás */}
      <motion.div
        className="absolute top-3 left-[2%] z-10 w-[38%] max-w-[150px] scale-[0.92] -rotate-6 overflow-hidden rounded border-2 border-[#808080] bg-[#c0c0c0] shadow-md"
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <motion.div className="flex h-4 items-center justify-center bg-[#000080] px-1">
          <span className="text-[5px] leading-none text-white">Internet Explorer</span>
        </motion.div>
        <div className="flex h-3.5 items-center justify-center gap-1 bg-[#d4d4d4]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c00]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#cc0]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#090]" />
        </div>
        <div className="flex h-4 items-center justify-center bg-[#ff0]">
          <span className="animate-pulse text-[5px] font-bold leading-none text-[#c00]">★ BIENVENIDO ★</span>
        </div>
        <div className="flex h-4 items-center justify-center bg-[#ffffcc] px-0.5">
          <span className="text-center text-[5px] leading-none text-[#000080] underline decoration-1">
            Inicio · Productos · Contacto
          </span>
        </div>
        <div className="flex h-7 items-center justify-center gap-1 border-y border-[#999] bg-white px-1">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-[#666] bg-[#ccc] font-mono text-[4px] font-bold leading-none">
            ESL
          </div>
          <span
            className="truncate text-[7px] font-bold leading-none text-[#000080]"
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            Empresa S.L.
          </span>
        </div>
        <div className="relative h-9 overflow-hidden bg-[#eee]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gestoria.png"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "saturate(2.5) contrast(0.55) hue-rotate(-18deg)" }}
            draggable={false}
          />
        </div>
        <div className="space-y-0.5 bg-[#f4f4f4] px-1 py-0.5">
          <p className="text-center text-[4px] text-[#666]">Contador: 000427 visitas</p>
          <p className="text-center text-[4px] text-[#888]">Últ. actualización: 2008</p>
          <button type="button" className="w-full border-2 border-[#000] bg-[#0066cc] py-px text-[6px] font-bold text-white">
            ENTRAR
          </button>
        </div>
      </motion.div>

      {/* Web actual — grande, delante */}
      <motion.div
        className="absolute top-0 right-0 z-30 w-[58%] max-w-[260px] rotate-[1.5deg] overflow-hidden rounded-lg border border-[#d6d3d1] bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.22)]"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12 }}
      >
        <div className="flex h-6 items-center justify-between border-b border-[#e7e5e4] bg-white px-2.5">
          <span className="text-[8px] font-semibold leading-none tracking-tight text-zinc-800">Tu Negocio</span>
          <div className="flex items-center gap-1.5 text-[6px] font-medium leading-none text-zinc-500">
            <span>Servicios</span>
            <span>Reservas</span>
            <span>Contacto</span>
          </div>
        </div>
        <div className="relative h-[72px] overflow-hidden sm:h-[78px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gestoria.png" alt="" className="h-full w-full object-cover object-[48%_28%]" draggable={false} />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900/55 via-zinc-900/10 to-transparent" />
          <p className="absolute top-2 left-2 text-[7px] font-medium tracking-[0.12em] text-white/95 uppercase">
            Profesional · Confiable
          </p>
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <span className="rounded bg-white/90 px-1 py-px text-[5px] font-medium leading-none text-zinc-700">★ 4.9</span>
            <span className="rounded bg-emerald-600/90 px-1 py-px text-[5px] font-medium leading-none text-white">Verificado</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-[#e7e5e4] px-2.5 py-2">
          <p className="text-[7px] text-zinc-500">Reserva en 30 segundos</p>
          <button type="button" className="shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-[8px] font-semibold text-white">
            Reservar
          </button>
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

/** Sacos — profundidad y solape */
function VisualAutoridad() {
  return (
    <div className="relative mt-3 flex min-h-[100px] items-end justify-center pb-1" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sacodinero.png"
        alt=""
        className="relative z-10 h-10 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] -rotate-14 sm:h-11"
        draggable={false}
      />
      <ArrowFlow />
      <div className="relative flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sacodinero.png"
          alt=""
          className="relative z-20 h-16 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] rotate-11 sm:h-[4.25rem]"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sacodinero.png"
          alt=""
          className="relative z-30 -ml-10 h-[4.5rem] w-auto object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)] -rotate-7 sm:-ml-12 sm:h-20"
          draggable={false}
        />
      </div>
    </div>
  );
}

/** Móvil con notificaciones + panel CRM */
function VisualMotor() {
  return (
    <div className="relative mt-3 grid min-h-[120px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 sm:gap-3" aria-hidden>
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
      <div className={`flex h-6 shrink-0 items-center px-2 ${isEngine ? "bg-[#1e3a2f]" : "bg-[#217346]"}`}>
        <span className="truncate text-[9px] font-medium text-white">{fileName}</span>
      </div>
      <div className="grid grid-cols-[18px_repeat(3,minmax(0,1fr))] grid-rows-[15px_repeat(5,17px)] text-[10px] leading-none sm:text-[11px]">
        <div className="border-r border-b border-[#e2e8f0] bg-[#f1f5f9]" />
        {EXCEL_COL_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center border-r border-b border-[#e2e8f0] bg-[#f1f5f9] px-0.5 text-[8px] font-medium text-[#64748b]"
          >
            {label}
          </div>
        ))}
        {Array.from({ length: EXCEL_ROW_COUNT }, (_, r) => (
          <div key={`row-${r}`} className="contents">
            <div className="flex items-center justify-center border-r border-b border-[#f1f5f9] bg-[#f8fafc] text-[8px] text-[#64748b]">
              {r + 1}
            </div>
            {EXCEL_COL_LABELS.map((_, c) => {
              const val = grid[c]?.[r] ?? "";
              const isActive = !isEngine && phase === "typing" && activeCol === c && activeRow === r;
              const isEngineFill = isEngine && val.length > 0;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex h-[17px] items-center overflow-hidden border-r border-b border-[#f1f5f9] px-0.5 font-mono ${
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
    <motion.div
      ref={ref}
      className="mt-3 flex flex-col gap-3 sm:mt-4 md:flex-row md:items-stretch md:gap-3"
    >
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
        className="flex min-h-[148px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl border border-[#c9bfae]/55 px-4 py-5 text-center md:flex-[1.58] md:min-w-[300px]"
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
  diagramFixed = false,
  compact = false,
}: {
  title: string;
  body: string;
  diagram: ReactNode;
  bgImage?: string;
  diagramFixed?: boolean;
  compact?: boolean;
}) {
  return (
    <article className={`${CARD_HERO}${compact ? " !p-3 sm:!p-4" : ""}`}>
      {bgImage ? <CardBgImage src={bgImage} /> : null}
      <BpCornerTicksOverlay light />
      <div className={`relative z-10 flex flex-1 flex-col ${diagramFixed ? "pb-[162px] sm:pb-[168px]" : ""}`}>
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
        <div className="absolute inset-x-0 bottom-0 z-10 h-[158px] px-4 pb-4 sm:h-[162px] sm:px-5 sm:pb-5">
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
    <figure className="flex items-start gap-3 rounded-lg border border-white/10 bg-[#05080f] p-3 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-white/14 sm:p-3.5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/12 bg-zinc-900 sm:h-14 sm:w-14">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={56}
            height={56}
            className="h-full w-full object-cover object-[50%_35%]"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-zinc-500">
            {initialsFromName(name)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-[12px] font-medium text-zinc-300">{name}</span>
          <span className="text-[10px] text-zinc-600">· {business}</span>
          <GoogleMapsBadge />
          <span className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[7px] font-medium tracking-wide text-zinc-500 uppercase">
            Verificada
          </span>
        </div>
        <blockquote className="mt-1.5 line-clamp-3 text-[12px] leading-snug text-zinc-400">&ldquo;{quote}&rdquo;</blockquote>
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
              <h2 className="text-3xl font-bold leading-[1.08] tracking-tighter text-zinc-50 sm:text-4xl lg:whitespace-nowrap lg:text-[2.65rem] xl:text-5xl">
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
                  title="El cliente te juzga antes de hablar contigo."
                  body="Buscan en Google. Ven tu web. Ven la del vecino. Si la tuya parece antigua, asumen que tu negocio también lo es."
                  diagram={<VisualPercepcion />}
                />
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1">
                <DarkClosedCard
                  title="Si te ves mejor, puedes permitirte cobrar más."
                  body="La calidad visual evita tener que justificar tu precio."
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
                  title="Tu competencia no descansa. Tu sistema tampoco debería."
                  body="Mientras duermes, el sistema sigue trabajando."
                >
                  <VisualMotor />
                </DarkClosedCard>
              </motion.div>
              <motion.div variants={fadeUp} className="order-1 flex h-full lg:order-0 lg:col-span-2 lg:col-start-2">
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
              <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
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
