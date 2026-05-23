"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { EvidenceTestimonialsGrid } from "@/components/sections/EvidenceTestimonials";

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

const MANIFIESTO_CLOSING = "Así debería sentirse un negocio.";

/**
 * Posición horizontal del mock iPhone sobre el chat (0–100).
 * 50 = centrado · 62 ≈ un 25% más a la derecha · sube/baja a tu gusto.
 */
const WA_IPHONE_LEFT_PERCENT = 71;

/** Copys — tono premium, sin repetir estructuras */
const COPY = {
  heroTitle: "Tu primera impresión ya no ocurre en la calle.",
  heroLead:
    "El escaparate físico sigue ahí. El que cuenta hoy se abre en el móvil de tu cliente.",
  row1Title: "La primera impresión ya no ocurre en la puerta.",
  row1Body:
    "Buscan. Comparan. Deciden. Si tu web parece vieja o transmite desorden, empiezas la conversación por detrás.",
  row2AsideTitle: "Tu negocio no debería apagarse contigo.",
  row2AsideBody:
    "Las preguntas llegan igual. Las reservas llegan igual. La diferencia está en si mañana te encuentras trabajo acumulado o trabajo hecho.",
  row2ExcelTitle: "El tiempo también se paga.",
  row2ExcelBody:
    "Copiar datos, buscar mensajes o repetir lo mismo veinte veces al día parece poco. Hasta que sumas todas las horas.",
} as const;

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

function FloatingBlock({
  title,
  body,
  bodyClassName,
  titleClassName,
  centered,
  children,
}: {
  title: string;
  body?: string;
  bodyClassName?: string;
  titleClassName?: string;
  centered?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex h-full min-h-0 w-full flex-col ${centered ? "items-center text-center" : ""}`}>
      <h3
        className={
          titleClassName ??
          `text-xl font-semibold leading-[1.15] tracking-[-0.03em] text-white sm:text-2xl lg:text-[1.65rem] ${centered ? "max-w-[34ch]" : ""}`
        }
      >
        {title}
      </h3>
      {body ? (
        <p
          className={
            bodyClassName ??
            `mt-2.5 text-[13px] leading-relaxed text-zinc-500 sm:text-sm ${centered ? "max-w-[38ch]" : "max-w-[95%]"}`
          }
        >
          {body}
        </p>
      ) : null}
      <div
        className={`relative min-h-0 w-full flex-1 ${centered ? "mt-4 flex justify-center sm:mt-5" : "mt-5 sm:mt-6"}`}
      >
        {children}
      </div>
    </div>
  );
}

const MANIFIESTO_LINES = [
  { text: "Todo en su sitio.", indentRem: -3.5 },
  { text: "Sin prisas.", indentRem: 8.5 },
  { text: "Sin olvidos.", indentRem:-1.5 },
] as const;

function ManifiestoAguarras() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-2xl px-2 py-8 sm:py-10"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.32, 1] }}
    >
      <motion.div className="relative flex min-h-56 w-full items-center justify-center sm:min-h-64">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.06),transparent_55%)] sm:w-104"
          aria-hidden
        />
        <motion.div className="relative z-10 mx-auto w-fit max-w-[min(100%,24rem)] space-y-3.5 sm:max-w-104 sm:space-y-7">
        {MANIFIESTO_LINES.map((line, i) => (
          <motion.p
            key={line.text}
            className="manifesto-line whitespace-nowrap text-left font-sans text-[clamp(1.45rem,3vw,2.35rem)] font-light leading-[1.15] tracking-[-0.04em] text-zinc-50/95"
            style={{ marginLeft: `${line.indentRem}rem` }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            {line.text}
          </motion.p>
        ))}
          <p className="mx-auto mt-6 max-w-[22ch] text-center text-[12px] leading-relaxed text-white/35 italic sm:mt-8">
            {MANIFIESTO_CLOSING}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Comparativa perceptiva — HTML + aspect ratio, texto con flex/em (nitidez) */
function BpPercepcion() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl shrink-0"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      aria-hidden
    >
      <div className="relative aspect-16/5.5 w-full min-h-44 sm:min-h-50">
        {/* —— Web 2010 (atrás, queda bajo la superior) —— */}
        <motion.div
          className="absolute top-[14%] bottom-[6%] left-0 z-10 flex w-[32%] max-w-40 min-h-0 origin-bottom -rotate-12 flex-col overflow-hidden rounded-sm border-2 border-zinc-600/70 bg-[#9a9a9a] font-serif opacity-[0.88] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.7)] grayscale-[0.45] brightness-90"
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

            <div className="relative min-h-11.4 w-full flex-1 overflow-hidden bg-[#ddd]">
              <Image
                src="/gestoria.webp"
                alt=""
                fill
                sizes="(max-width: 640px) 160px, 280px"
                quality={92}
                className="scale-[1.08] object-cover [image-rendering:crisp-edges]"
                style={{
                  filter: "saturate(2.5) contrast(0.55) hue-rotate(-18deg) blur(0.4px)",
                }}
              />
              {/* “Suciedad” CRT / submuestreo sutil */}
              <div
                className="pointer-events-none absolute inset-0 z-1 opacity-22 mix-blend-multiply"
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
              <span
                aria-hidden
                className="flex min-h-[2em] w-full items-center justify-center border-[0.12em] border-black bg-[#0066cc] font-serif text-[0.92em] font-bold leading-none text-white"
              >
                ENTRAR
              </span>
            </div>
          </div>
        </motion.div>

        {/* —— Web premium: solapa ~30 % de la antigua —— */}
        <motion.div
          className="absolute top-0 bottom-[1%] left-[22%] z-40 flex w-[72%] min-h-0 origin-bottom rotate-2 flex-col overflow-hidden rounded-lg border border-white/20 bg-white font-sans shadow-[0_32px_64px_-16px_rgba(0,0,0,0.92)] ring-1 ring-white/10"
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
                className="object-cover object-[50%_45%] saturate-[1.12] contrast-[1.05]"
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
              <span
                aria-hidden
                className="inline-flex min-h-[2.15em] min-w-[5.75em] shrink-0 items-center justify-center rounded-md bg-[#10b981] px-[0.85em] py-[0.5em] text-center text-[0.84em] font-bold leading-none text-white shadow-[0_6px_20px_-2px_rgba(16,185,129,0.55)] drop-shadow-[0_2px_10px_rgba(16,185,129,0.45)]"
              >
                Reservar
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ArrowFlow({ prominent }: { prominent?: boolean }) {
  const wrapper = prominent ? "mx-2 h-4 w-7 text-zinc-200 sm:h-5 sm:w-8" : "mx-1.5 h-3.5 w-6 text-zinc-400 sm:h-4 sm:w-7";
  const stroke = prominent ? "2" : "1.6";
  return (
    <svg className={`${wrapper} shrink-0`} viewBox="0 0 48 24" fill="none" aria-hidden>
      <path d="M2 12h36" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path d="M34 6l8 6-8 6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (active) setStarted(true);
  }, [active]);

  const running = started || active;

  useEffect(() => {
    if (!running) return;

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
  }, [running, phase, colIdx, rowIdx, typed]);

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
  large,
}: {
  fileName: string;
  grid: string[][];
  mode: "manual" | "engine";
  activeCol?: number;
  activeRow?: number;
  phase?: string;
  flashCol?: number | null;
  large?: boolean;
}) {
  const isEngine = mode === "engine";
  const bursting = flashCol !== null && flashCol !== undefined && phase === "burst";
  const manualFlashing = !isEngine && bursting;
  const engineFlashing = isEngine && bursting;

  return (
    <motion.div
      className={`relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border backdrop-blur-sm transition-all duration-300 shadow-xl shadow-black/50 ${
        manualFlashing
          ? "border-white/12"
          : engineFlashing
            ? "border-emerald-500/20"
            : isEngine
              ? "border-emerald-500/25 bg-[#0a1210]/90"
              : "border-white/12 bg-white/6"
      }`}
    >
      <div
        className={`relative z-10 flex min-h-6.5 shrink-0 items-center px-2 sm:h-6 sm:min-h-0 ${
          isEngine ? "bg-emerald-950/80" : "bg-[#217346]/90"
        }`}
      >
        <span
          className={`truncate font-medium text-white tabular-nums ${large ? "text-[12px] sm:text-[11px]" : "text-[11px] sm:text-[9px]"}`}
        >
          {fileName}
        </span>
        {engineFlashing ? (
          <span className="ml-auto text-[8px] font-bold tracking-wider text-emerald-300 uppercase">Procesado</span>
        ) : null}
        {manualFlashing ? (
          <span className="ml-auto text-[8px] font-bold tracking-wider text-red-300 uppercase">Manual</span>
        ) : null}
      </div>
      <div
        className={`relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] leading-none antialiased tabular-nums ${
          large
            ? "grid-rows-[16px_repeat(5,28px)] text-[14px] sm:grid-cols-[26px_repeat(3,minmax(0,1fr))] sm:grid-rows-[14px_repeat(5,26px)] sm:text-[13px]"
            : "grid-rows-[14px_repeat(5,22px)] text-[13px] sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]"
        }`}
      >
        <div className="border-r border-b border-white/10 bg-white/5" />
        {EXCEL_COL_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center border-r border-b border-white/10 bg-white/5 px-0.5 text-[10px] font-semibold tracking-tight text-zinc-400 sm:text-[8px] sm:font-medium"
          >
            {label}
          </div>
        ))}
        {Array.from({ length: EXCEL_ROW_COUNT }, (_, r) => (
          <div key={`row-${r}`} className="contents">
            <div className="flex items-center justify-center border-r border-b border-white/8 bg-white/3 text-[10px] tabular-nums text-zinc-500 sm:text-[8px]">
              {r + 1}
            </div>
            {EXCEL_COL_LABELS.map((_, c) => {
              const val = grid[c]?.[r] ?? "";
              const isActive = !isEngine && phase === "typing" && activeCol === c && activeRow === r;
              const isEngineFill = isEngine && val.length > 0;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex min-h-0 items-center overflow-hidden border-r border-b border-white/8 px-1 font-mono tracking-tight ${
                    isActive
                      ? "bg-amber-400/20 text-amber-50 ring-1 ring-inset ring-amber-400/50"
                      : isEngineFill
                        ? "bg-emerald-500/15 font-medium text-emerald-200"
                        : val
                          ? "bg-white/4 text-zinc-200"
                          : "text-zinc-600"
                  }`}
                >
                  <span className="block w-full truncate">{val}</span>
                  {isActive ? (
                    <span
                      className="absolute right-0.5 top-1/2 h-3 w-px -translate-y-1/2 animate-pulse bg-amber-300"
                      aria-hidden
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function VisualExcel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const { engine, colIdx, rowIdx, phase, flashCol, getManualCell } = useExcelColumns(inView);

  const manualGrid = EXCEL_COL_LABELS.map((_, c) =>
    Array.from({ length: EXCEL_ROW_COUNT }, (_, r) => getManualCell(c, r)),
  );
  const isGlowing = flashCol !== null && phase === "burst";

  return (
    <div ref={ref} className="relative w-full min-w-0" aria-hidden>
      <div className="relative flex flex-col items-center gap-2 sm:gap-2.5">
        <div className="relative flex w-full min-w-0 max-w-[min(100%,560px)] items-stretch justify-center gap-1 sm:gap-1.5">
          <div className="relative min-w-0 flex-[1.08]">
            {isGlowing ? (
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[122%] w-[126%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-red-500/8 blur-2xl"
                aria-hidden
              />
            ) : null}
            <div className="relative z-1">
              <ExcelSheet
                fileName="clientes.xlsx · manual"
                grid={manualGrid}
                mode="manual"
                activeCol={colIdx}
                activeRow={rowIdx}
                phase={phase}
                flashCol={flashCol}
                large
              />
            </div>
          </div>
          <ArrowFlow prominent />
          <div className="relative min-w-0 flex-[1.08]">
            {isGlowing ? (
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[122%] w-[126%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-emerald-500/6 blur-2xl"
                aria-hidden
              />
            ) : null}
            <div className="relative z-1">
            <ExcelSheet
              fileName="clientes.xlsx · SST_ENGINE"
              grid={engine}
              mode="engine"
              flashCol={flashCol}
              phase={phase}
              large
            />
            </div>
          </div>
        </div>
        <p className="shrink-0 text-center font-mono text-[9px] font-bold tracking-[0.28em] text-zinc-400 uppercase sm:text-[10px]">
          ¿TE SUENA?
        </p>
      </div>
    </div>
  );
}

type WaBlock = { kind: "msg"; who: "client" | "business"; text: string; time: string };

const WA_SCRIPT: WaBlock[] = [
  { kind: "msg", who: "client", text: "Hola, ¿seguís abiertos?", time: "11:04" },
  { kind: "msg", who: "business", text: "Sí, claro 🙂", time: "11:05" },
  { kind: "msg", who: "client", text: "Perfecto. ¿Cuánto cuesta?", time: "11:06" },
  { kind: "msg", who: "business", text: "Depende de lo que necesites.", time: "11:07" },
  { kind: "msg", who: "client", text: "¿Me puedes pasar información?", time: "11:24" },
  { kind: "msg", who: "client", text: "Hola?", time: "12:41" },
  { kind: "msg", who: "business", text: "Perdona, estaba con un cliente.", time: "12:58" },
  {
    kind: "msg",
    who: "client",
    text: "No te preocupes. Ya lo he reservado en otro sitio.",
    time: "13:07",
  },
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
              className="flex flex-col gap-1 px-2 py-2 sm:gap-1.5 sm:px-2.5 sm:py-2.5"
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
                      <span className="mt-0.5 flex items-center text-[9px] tabular-nums text-[#667781]">
                        {block.time}
                        {!isClient ? <ReadTicks /> : null}
                      </span>
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
          className="max-w-60 border-l border-white/8 pl-4 sm:max-w-65 sm:pl-5 lg:max-w-none"
          style={{ marginLeft: Math.min(fact.marginLeft, 16) }}
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
  return (
    <section id="perfil" className="relative z-0 -mt-6 scroll-mt-24 w-full overflow-visible sm:-mt-10 lg:-mt-14">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
        <div
          className="relative w-full pt-14 pb-10 text-zinc-200 sm:pt-18 sm:pb-12 lg:pt-22"
          style={{ backgroundColor: DEEP_BLACK }}
        >
          <DotPattern />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mx-auto min-w-0 max-w-4xl text-center">
              <p className="text-balance font-bold leading-[1.12] tracking-tighter text-zinc-50 text-[clamp(1.35rem,3.8vw,3rem)] lg:whitespace-nowrap">
                {COPY.heroTitle}
              </p>
              <p className="mx-auto mt-3 max-w-[34ch] text-pretty text-[15px] leading-[1.55] text-zinc-500 sm:max-w-2xl sm:text-base sm:leading-relaxed md:max-w-none md:text-lg lg:whitespace-nowrap">
                {COPY.heroLead}
              </p>
            </FadeIn>

            <motion.div
              className="mt-9 grid grid-cols-1 gap-10 sm:mt-10 lg:mt-11 lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:gap-y-0 xl:gap-x-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.08 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              <motion.div
                variants={fadeUp}
                className="order-2 flex min-w-0 flex-col lg:order-1 lg:col-span-3 lg:col-start-1 lg:row-start-1 lg:pr-1 xl:pr-2"
              >
                <div className="mb-3 lg:mb-4">
                  <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-white sm:text-xl">
                    {COPY.row2AsideTitle}
                  </h3>
                  <p className="mt-2 max-w-[95%] text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                    {COPY.row2AsideBody}
                  </p>
                </div>
                <WhatsAppCaosIntegrado />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="order-1 mx-auto flex w-full min-w-0 max-w-140 flex-col gap-8 lg:order-2 lg:col-span-6 lg:col-start-4 lg:row-start-1 lg:gap-7 xl:max-w-145 xl:gap-8"
              >
                <FloatingBlock title={COPY.row1Title} body={COPY.row1Body} centered>
                  <BpPercepcion />
                </FloatingBlock>
                <FloatingBlock title={COPY.row2ExcelTitle} body={COPY.row2ExcelBody} centered>
                  <VisualExcel />
                </FloatingBlock>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="order-3 min-w-0 lg:order-3 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:pl-1 xl:pl-0"
              >
                <EditorialFactsColumn />
              </motion.div>
            </motion.div>

            <FadeIn delay={0.04}>
              <ManifiestoAguarras />
            </FadeIn>

            <FadeIn delay={0.05} className="mt-4 sm:mt-5">
              <EvidenceTestimonialsGrid />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
