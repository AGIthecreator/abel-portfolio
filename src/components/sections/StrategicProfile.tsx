"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { EvidenceTestimonialsGrid } from "@/components/sections/EvidenceTestimonials";

const DEEP_BLACK = "#070b13";

const EXCEL_COL_LABELS = ["A", "B", "C"] as const;
const EXCEL_FIELD_HEADERS = ["Nombre", "Email", "Teléfono"] as const;
/** 8 líneas: A/B/C + cabecera campos + 6 filas de datos */
const DATA_ROW_COUNT = 6;
const SHEET_GRID_ROWS = 8;
const LOOP_PAUSE_MS = 3800;
const ENGINE_FLASH_MS = 880;
const MANUAL_CHAR_MS = 92;
const MANUAL_CELL_PAUSE_MS = 280;
const COL_COMPLETE_PAUSE_MS = 420;

/** [fila][columna] — mismos datos en ambas tablas */
const SPREADSHEET_DATA: readonly (readonly [string, string, string])[] = [
  ["Ana G.", "ana@clinica.es", "+34 611 206 230"],
  ["Luis M.", "luis@tienda.es", "+34 622 114 488"],
  ["Elena V.", "elena@studio.es", "+34 633 552 210"],
  ["Jordi P.", "jordi@local.es", "+34 644 881 902"],
  ["Marta S.", "marta@shop.es", "+34 655 120 447"],
  ["Carlos R.", "carlos@gest.es", "+34 666 903 118"],
];

/** Columna A → B → C: escribe toda la columna en manual y rellena la misma en SST de un plumazo */
const TYPING_QUEUE = (() => {
  const queue: { col: number; dataRow: number; text: string }[] = [];
  for (let col = 0; col < EXCEL_FIELD_HEADERS.length; col++) {
    for (let dataRow = 0; dataRow < DATA_ROW_COUNT; dataRow++) {
      queue.push({ col, dataRow, text: SPREADSHEET_DATA[dataRow][col] });
    }
  }
  return queue;
})();

function emptyGrid() {
  return Array.from({ length: EXCEL_FIELD_HEADERS.length }, () =>
    Array.from({ length: DATA_ROW_COUNT }, () => ""),
  );
}

/** Fila de hoja: 0 = A/B/C, 1 = cabecera, 2..7 = datos */
function sheetRowToDataRow(sheetRow: number) {
  return sheetRow - 2;
}

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
      <div className="relative aspect-16/5.5 w-full min-h-44 translate-x-[4%] sm:min-h-50">
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
              <span className="h-[0.45em] w-[0.45em] min-h-1.25 min-w-1.25 rounded-full bg-[#c00]" />
              <span className="h-[0.45em] w-[0.45em] min-h-1.25 min-w-1.25 rounded-full bg-[#cc0]" />
              <span className="h-[0.45em] w-[0.45em] min-h-1.25 min-w-1.25 rounded-full bg-[#090]" />
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
                loading="lazy"
                sizes="(max-width: 640px) 160px, 280px"
                quality={70}
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

function ArrowFlow() {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center px-1 sm:px-1.5" aria-hidden>
      <span className="mb-0.5 font-mono text-[7px] tracking-[0.2em] text-zinc-600 uppercase">sync</span>
      <svg className="h-4 w-8 text-zinc-300 sm:h-5 sm:w-9" viewBox="0 0 48 24" fill="none">
        <path d="M2 12h34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M32 7l8 5-8 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function useExcelComparison(active: boolean) {
  const [manual, setManual] = useState<string[][]>(emptyGrid);
  const [engine, setEngine] = useState<string[][]>(emptyGrid);
  const [cellIdx, setCellIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "column-burst" | "hold">("typing");
  const [flashCol, setFlashCol] = useState<number | null>(null);
  const [buttonPulse, setButtonPulse] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (active) setStarted(true);
  }, [active]);

  const running = started || active;
  const activeCell = phase === "typing" ? TYPING_QUEUE[cellIdx] : null;
  const isTyping = phase === "typing" && !!activeCell;

  useEffect(() => {
    if (!running || phase !== "typing") return;

    const target = TYPING_QUEUE[cellIdx];
    if (!target) {
      setPhase("hold");
      return;
    }

    const full = target.text;

    if (typed.length < full.length) {
      const t = setTimeout(() => setTyped(full.slice(0, typed.length + 1)), MANUAL_CHAR_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setManual((m) => {
        const next = m.map((col) => [...col]);
        next[target.col][target.dataRow] = full;
        return next;
      });
      setTyped("");

      const nextCell = TYPING_QUEUE[cellIdx + 1];
      const blockDone = !nextCell || nextCell.col !== target.col;

      if (blockDone) {
        setPhase("column-burst");
        setButtonPulse(true);
        setFlashCol(target.col);
        setEngine((e) => {
          const next = e.map((col) => [...col]);
          for (let r = 0; r < DATA_ROW_COUNT; r++) {
            next[target.col][r] = SPREADSHEET_DATA[r][target.col];
          }
          return next;
        });
      } else {
        setCellIdx((i) => i + 1);
      }
    }, MANUAL_CELL_PAUSE_MS);

    return () => clearTimeout(t);
  }, [running, phase, cellIdx, typed]);

  useEffect(() => {
    if (!running || phase !== "column-burst") return;

    const t = setTimeout(() => {
      setFlashCol(null);
      setButtonPulse(false);
      if (cellIdx >= TYPING_QUEUE.length - 1) {
        setPhase("hold");
      } else {
        setCellIdx((i) => i + 1);
        setPhase("typing");
      }
    }, ENGINE_FLASH_MS + COL_COMPLETE_PAUSE_MS);

    return () => clearTimeout(t);
  }, [running, phase, cellIdx]);

  useEffect(() => {
    if (!running || phase !== "hold") return;

    const t = setTimeout(() => {
      setManual(emptyGrid());
      setEngine(emptyGrid());
      setCellIdx(0);
      setTyped("");
      setFlashCol(null);
      setButtonPulse(false);
      setPhase("typing");
    }, LOOP_PAUSE_MS);

    return () => clearTimeout(t);
  }, [running, phase]);

  const getManualDisplay = (col: number, sheetRow: number) => {
    if (sheetRow === 0) return "";
    if (sheetRow === 1) return EXCEL_FIELD_HEADERS[col] ?? "";

    const dataRow = sheetRowToDataRow(sheetRow);
    if (dataRow < 0 || dataRow >= DATA_ROW_COUNT) return "";

    const committed = manual[col]?.[dataRow] ?? "";

    if (activeCell && activeCell.col === col && activeCell.dataRow === dataRow) {
      const full = activeCell.text;
      const showCursor = typed.length < full.length;
      return typed + (showCursor ? "|" : "");
    }

    return committed;
  };

  const getEngineDisplay = (col: number, sheetRow: number) => {
    if (sheetRow === 0) return "";
    if (sheetRow === 1) return EXCEL_FIELD_HEADERS[col] ?? "";

    const dataRow = sheetRowToDataRow(sheetRow);
    if (dataRow < 0 || dataRow >= DATA_ROW_COUNT) return "";

    return engine[col]?.[dataRow] ?? "";
  };

  const activeSheetRow =
    activeCell != null ? activeCell.dataRow + 2 : null;
  const activeColLetter = activeCell != null ? EXCEL_COL_LABELS[activeCell.col] : "A";
  const activeExcelRow = activeCell != null ? activeCell.dataRow + 2 : 1;

  return {
    getManualDisplay,
    getEngineDisplay,
    flashCol,
    buttonPulse,
    isTyping,
    isGlowing: flashCol !== null,
    activeSheetRow,
    activeCol: activeCell?.col ?? null,
    activeColLetter,
    activeExcelRow,
    formulaPreview: activeCell ? typed || activeCell.text : "",
  };
}

const SHEET_GRID_CLASS =
  "grid shrink-0 grid-cols-[26px_repeat(3,minmax(0,1fr))] grid-rows-[18px_repeat(7,22px)] text-[11px] leading-none tabular-nums sm:grid-cols-[28px_repeat(3,minmax(0,1fr))] sm:text-[11px]";

function ExcelWindowControls({ variant }: { variant: "classic" | "dark" }) {
  const btn =
    variant === "classic"
      ? "grid h-4 w-4 place-items-center text-[9px] leading-none text-white/90"
      : "grid h-4 w-4 place-items-center border border-slate-600/80 bg-slate-800/90 text-[9px] leading-none text-slate-400";

  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
      <span className={btn}>—</span>
      <span className={btn}>□</span>
      <span
        className={
          variant === "classic"
            ? "grid h-4 w-4 place-items-center bg-white/15 text-[9px] text-white"
            : "grid h-4 w-4 place-items-center border border-slate-600/80 bg-slate-700/90 text-[9px] text-slate-300"
        }
      >
        ×
      </span>
    </div>
  );
}

function SpreadsheetGrid({
  variant,
  getCell,
  activeSheetRow,
  activeCol,
  flashCol,
}: {
  variant: "classic" | "engine";
  getCell: (col: number, sheetRow: number) => string;
  activeSheetRow: number | null;
  activeCol: number | null;
  flashCol: number | null;
}) {
  const isClassic = variant === "classic";

  return (
    <div className={SHEET_GRID_CLASS}>
      {Array.from({ length: SHEET_GRID_ROWS }, (_, sheetRow) => {
        if (sheetRow === 0) {
          return (
            <div key={`${variant}-sr-0`} className="contents">
              <div
                className={
                  isClassic
                    ? "border-r border-b border-[#c5c5c5] bg-[#f0f0f0]"
                    : "border-r border-b border-slate-700/55 bg-slate-900/90"
                }
              />
              {EXCEL_COL_LABELS.map((label) => (
                <div
                  key={`${variant}-abc-${label}`}
                  className={
                    isClassic
                      ? "flex items-center justify-center border-r border-b border-[#c5c5c5] bg-[#f0f0f0] text-center text-[10px] text-[#333333]"
                      : "flex items-center justify-center border-r border-b border-slate-700/55 bg-slate-800/95 font-mono text-[9px] text-slate-500"
                  }
                >
                  {label}
                </div>
              ))}
            </div>
          );
        }

        const isFieldHeader = sheetRow === 1;

        return (
          <div key={`${variant}-sr-${sheetRow}`} className="contents">
            <div
              className={
                isClassic
                  ? "flex items-center justify-center border-r border-b border-[#d4d4d4] bg-[#f0f0f0] text-[10px] text-[#666666]"
                  : "flex items-center justify-center border-r border-b border-slate-700/45 bg-slate-900/75 font-mono text-[9px] text-slate-600"
              }
            >
              {sheetRow}
            </div>
            {EXCEL_COL_LABELS.map((_, col) => {
              const val = getCell(col, sheetRow);
              const isActive =
                !isFieldHeader && activeSheetRow === sheetRow && activeCol === col;
              const showCursor = isClassic && isActive && val.endsWith("|");
              const display = showCursor ? val.slice(0, -1) : val;
              const hasValue = display.length > 0;
              const colFlash = !isClassic && hasValue && !isFieldHeader && flashCol === col;

              const cellClass = isClassic
                ? isFieldHeader
                  ? "bg-[#fafafa] text-[10px] font-semibold text-[#333333]"
                  : isActive
                    ? "bg-white text-[#000000] outline outline-2 outline-[#217346] -outline-offset-2"
                    : "bg-white text-[#000000]"
                : isFieldHeader
                  ? "bg-slate-800/70 text-[9px] font-semibold text-slate-400"
                  : hasValue
                    ? colFlash
                      ? "excel-engine-flash text-slate-100"
                      : "bg-emerald-500/8 text-slate-200"
                    : "bg-[#0f172a] text-slate-700";

              return (
                <div
                  key={`${variant}-${sheetRow}-${col}`}
                  className={`relative flex min-h-0 items-center overflow-hidden border-r border-b px-1.5 ${
                    isClassic
                      ? "border-[#d4d4d4] font-[Segoe_UI,Calibri,system-ui,sans-serif]"
                      : "border-slate-700/40 font-mono"
                  } ${cellClass}`}
                >
                  <span className="block w-full truncate">{display}</span>
                  {showCursor ? (
                    <span
                      className="excel-manual-cursor ml-px inline-block h-3.5 w-px shrink-0 bg-[#217346]"
                      aria-hidden
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ClassicExcelSheet({
  getCell,
  activeSheetRow,
  activeCol,
  activeColLetter,
  activeExcelRow,
  formulaPreview,
}: {
  getCell: (col: number, sheetRow: number) => string;
  activeSheetRow: number | null;
  activeCol: number | null;
  activeColLetter: string;
  activeExcelRow: number;
  formulaPreview: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-[#a6a6a6] bg-[#f3f3f3] shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="flex h-7 shrink-0 items-center justify-between bg-[#217346] px-1">
        <div className="flex min-w-0 items-center gap-1.5 pl-1">
          <span className="grid h-3.5 w-3.5 shrink-0 place-items-center bg-white/20 text-[8px] font-bold text-white">
            ▣
          </span>
          <span className="truncate text-[10px] font-normal text-white">Excel</span>
          <span className="hidden truncate text-[10px] text-white/85 sm:inline">— clientes.xlsx</span>
        </div>
        <ExcelWindowControls variant="classic" />
      </div>

      <div className="flex h-5 shrink-0 items-stretch border-b border-[#d4d4d4] bg-[#f3f3f3]">
        <div className="flex w-9 shrink-0 items-center justify-center border-r border-[#d4d4d4] text-[9px] font-semibold text-[#444444]">
          {activeColLetter}
          {activeExcelRow}
        </div>
        <div className="flex w-7 shrink-0 items-center justify-center border-r border-[#d4d4d4] text-[9px] italic text-[#888888]">
          fx
        </div>
        <div className="flex min-w-0 flex-1 items-center bg-white px-2 text-[10px] text-[#222222]">
          <span className="truncate">{formulaPreview}</span>
        </div>
      </div>

      <div className="shrink-0 bg-white p-px">
        <SpreadsheetGrid
          variant="classic"
          getCell={getCell}
          activeSheetRow={activeSheetRow}
          activeCol={activeCol}
          flashCol={null}
        />
      </div>

      <div className="flex h-5 shrink-0 items-center border-t border-[#d4d4d4] bg-[#f3f3f3] px-1">
        <span className="rounded-sm border border-[#217346] bg-[#e8f5ee] px-2 py-px text-[9px] font-medium text-[#217346]">
          clientes
        </span>
        <span className="ml-2 text-[9px] text-[#888888]">+</span>
      </div>
    </div>
  );
}

function ModernEngineSheet({
  getCell,
  flashCol,
}: {
  getCell: (col: number, sheetRow: number) => string;
  flashCol: number | null;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border border-slate-700/60 bg-[#0f172a] shadow-[0_1px_0_rgba(0,0,0,0.2)]">
      <div className="flex h-7 shrink-0 items-center justify-between gap-1 border-b border-slate-700/70 bg-[#0f172a] px-1">
        <div className="flex min-w-0 items-center gap-1 pl-1">
          <span className="min-w-0 truncate font-mono text-[10px] text-slate-400">
            clientes.xlsx · SST_ENGINE
          </span>
          <span className="hidden shrink-0 rounded border border-emerald-500/35 bg-emerald-500/10 px-1 py-px font-mono text-[7px] font-bold tracking-[0.08em] text-emerald-400 sm:inline">
            [ AUTOMAIZACIÓN AGI ]
          </span>
        </div>
        <ExcelWindowControls variant="dark" />
      </div>

      <div className="flex h-5 shrink-0 items-stretch border-b border-slate-700/60 bg-[#0c1220]">
        <div className="flex w-9 shrink-0 items-center justify-center border-r border-slate-700/50 font-mono text-[9px] text-slate-500">
          A1
        </div>
        <div className="flex w-7 shrink-0 items-center justify-center border-r border-slate-700/50 font-mono text-[9px] italic text-slate-600">
          fx
        </div>
        <div className="flex min-w-0 flex-1 items-center px-2 font-mono text-[10px] text-slate-600">
          <span className="truncate opacity-60">=SST_FILL()</span>
        </div>
      </div>

      <div className="shrink-0 p-px">
        <SpreadsheetGrid
          variant="engine"
          getCell={getCell}
          activeSheetRow={null}
          activeCol={null}
          flashCol={flashCol}
        />
      </div>

      <div className="flex h-5 shrink-0 items-center border-t border-slate-700/60 bg-[#0c1220] px-1">
        <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-px font-mono text-[9px] text-emerald-400/90">
          clientes
        </span>
        <span className="ml-2 font-mono text-[9px] text-slate-600">+</span>
      </div>
    </div>
  );
}

function TypingIndicator({ visible }: { visible: boolean }) {
  if (!visible) {
    return <div className="mt-2 h-5" aria-hidden />;
  }

  return (
    <div className="mt-2 flex h-5 items-center gap-1.5 text-[10px] text-zinc-500" aria-live="polite">
      <span className="inline-flex gap-0.5">
        <span className="excel-typing-dot animation-delay-0">·</span>
        <span className="excel-typing-dot animation-delay-1">·</span>
        <span className="excel-typing-dot animation-delay-2">·</span>
      </span>
      <span className="italic">Escribiendo...</span>
    </div>
  );
}

function OneClickButton({ pulse }: { pulse: boolean }) {
  return (
    <div className="mt-2 flex h-[22px] items-center justify-center">
      <motion.button
        type="button"
        tabIndex={-1}
        className="min-w-18 border border-[#707070] bg-[linear-gradient(180deg,#fdfdfd_0%,#e8e8e8_55%,#dcdcdc_100%)] px-3 py-0.5 font-[Segoe_UI,Tahoma,sans-serif] text-[11px] leading-tight text-[#1a1a1a] shadow-[inset_0_1px_0_#fff,inset_0_-1px_0_#c8c8c8,0_1px_0_rgba(0,0,0,0.06)]"
        animate={pulse ? { scale: [1, 0.94, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        1 clic
      </motion.button>
    </div>
  );
}

function VisualExcel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const {
    getManualDisplay,
    getEngineDisplay,
    flashCol,
    buttonPulse,
    isTyping,
    isGlowing,
    activeSheetRow,
    activeCol,
    activeColLetter,
    activeExcelRow,
    formulaPreview,
  } = useExcelComparison(inView);

  return (
    <div ref={ref} className="relative mx-auto w-full min-w-0 max-w-[min(100%,640px)]" aria-hidden>
      <div className="relative flex w-full min-w-0 items-start justify-center gap-0.5 sm:gap-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          {isGlowing ? (
            <div
              className="pointer-events-none absolute top-[38%] left-1/2 z-0 h-[92%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-red-500/8 blur-2xl"
              aria-hidden
            />
          ) : null}
          <div className="relative z-1">
            <ClassicExcelSheet
              getCell={getManualDisplay}
              activeSheetRow={activeSheetRow}
              activeCol={activeCol}
              activeColLetter={activeColLetter}
              activeExcelRow={activeExcelRow}
              formulaPreview={formulaPreview}
            />
          </div>
          <TypingIndicator visible={isTyping} />
        </div>

        <div className="flex shrink-0 self-center pb-7 sm:pb-8">
          <ArrowFlow />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          {isGlowing ? (
            <div
              className="pointer-events-none absolute top-[38%] left-1/2 z-0 h-[92%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-emerald-500/6 blur-2xl"
              aria-hidden
            />
          ) : null}
          <div className="relative z-1">
            <ModernEngineSheet getCell={getEngineDisplay} flashCol={flashCol} />
          </div>
          <OneClickButton pulse={buttonPulse} />
        </div>
      </div>

      <p className="mt-2.5 text-center font-mono text-[9px] font-bold tracking-[0.28em] text-zinc-400 uppercase sm:mt-3 sm:text-[10px]">
        ¿TE SUENA?
      </p>

      <style jsx>{`
        .excel-manual-cursor {
          animation: excel-cursor-blink 1.05s step-end infinite;
        }
        @keyframes excel-cursor-blink {
          0%,
          45% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
        .excel-typing-dot {
          animation: excel-typing-bounce 1.2s ease-in-out infinite;
        }
        .animation-delay-0 {
          animation-delay: 0ms;
        }
        .animation-delay-1 {
          animation-delay: 160ms;
        }
        .animation-delay-2 {
          animation-delay: 320ms;
        }
        @keyframes excel-typing-bounce {
          0%,
          60%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
        :global(.excel-engine-flash) {
          animation: excel-engine-cell-flash 0.88s ease-out forwards;
        }
        @keyframes excel-engine-cell-flash {
          0% {
            background-color: rgba(16, 185, 129, 0.45);
          }
          100% {
            background-color: rgba(16, 185, 129, 0.08);
          }
        }
      `}</style>
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

            <FadeIn delay={0.04} className="mt-12 sm:mt-14 lg:mt-16">
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
