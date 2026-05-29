"use client";

import {
  ChevronLeft,
  ChevronRight,
  Home,
  RotateCw,
} from "lucide-react";
import { Manrope, Newsreader } from "next/font/google";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { LuckyEasterEggModal } from "@/components/ui/LuckyEasterEggModal";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { trackEvent } from "@/lib/analytics";

const heroDisplay = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hero-display",
  display: "swap",
});

const heroUi = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hero-ui",
  display: "swap",
});

// -----------------------------------------------------------------------------
// PRESETS DE VENTANAS — edita top/left/width/height/rotate/z (px y grados).
// El artboard del monitor mide MONITOR_ARTBOARD_W × MONITOR_ARTBOARD_H.
// -----------------------------------------------------------------------------
export type HeroWindowPreset = {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
  z: number;
};

export const WINDOW_PRESETS = {
  google: { top: 10, left: 20, width: 385, height: 253, rotate: 0, z: 50 },
  requests: { top: 62, left: 410, width: 190, height: 170, rotate: 0, z: 52 },
  outlookRead: { top: 25, left: 610, width: 190, height: 170, rotate: 0, z: 53 },
  operations: { top: 285, left: 40, width: 210, height: 130, rotate: 0, z: 24 },
  excel: { top: 260, left: 230, width: 280, height: 180, rotate: 0, z: 26 },
  cmd: { top: 240, left: 520, width: 280, height: 180, rotate: 0, z: 40 },
} as const satisfies Record<string, HeroWindowPreset>;

export type HeroWindowId = keyof typeof WINDOW_PRESETS;

/** Pavo — posición respecto al contenedor `.hero-scene` (px). */
export const MASCOT_PRESET = {
  bottom: -30,
  left: -40,
  width: 215,
  z: 40,
} as const;

/** En móvil el pavo se separa del borde izquierdo (si no, queda cortado). */
export const MASCOT_MOBILE_LEFT = 12;

/** Gota de sudor — posición % dentro del contenedor del pavo. */
export const SWEAT_PRESET = {
  topPercent: 18,
  rightPercent: 38,
  width: 20,
  height: 24,
  rotate: 8,
} as const;

const OUTLOOK_CYCLE_MS = 1500;

const SHADOW_GOOGLE =
  "shadow-[0_18px_48px_-20px_rgba(15,23,42,0.28),0_8px_20px_-12px_rgba(15,23,42,0.14)]";
const SHADOW_SERVICES =
  "shadow-[0_20px_52px_-18px_rgba(15,23,42,0.32),0_10px_24px_-14px_rgba(15,23,42,0.18)]";
const SHADOW_CMD =
  "shadow-[0_24px_56px_-16px_rgba(0,0,0,0.5),0_12px_28px_-12px_rgba(0,0,0,0.35)]";
const SHADOW_LIGHT =
  "shadow-[0_16px_40px_-18px_rgba(15,23,42,0.22),0_6px_16px_-10px_rgba(15,23,42,0.12)]";

const CMD_PANEL = "rounded-sm border border-white/12 bg-[#0c1018]";

export const MONITOR_ARTBOARD_W = 880;
export const MONITOR_ARTBOARD_H = 500;

// Escala del monitor cuando el contenedor está "a tope" en desktop (≈ columna 646px / 880).
// El pavo y la gota se escalan con (scale / MASCOT_SCALE_REF), de modo que en desktop el
// factor vale 1 (todo idéntico a ahora) y en resoluciones menores el conjunto entero —pavo,
// gota, monitor y ventanas— se encoge manteniendo EXACTAMENTE las mismas proporciones.
export const MASCOT_SCALE_REF = 0.734;

const CMD_FEED_LINES = [
  "[OK] 18 correos enviados automáticamente.",
  "[INFO] Revisando tareas repetitivas...",
  "[OK] 4h de gestión evitadas hoy.",
  "[ERROR] Tarea manual detectada.",
  "[OK] Reserva confirmada sin intervención.",
  "[INFO] Analizando puntos donde se pierde tiempo...",
  "[ERROR] Datos duplicados detectados.",
  "[OK] Cliente añadido al sistema.",
  "[OK] Factura enviada automáticamente.",
  "[OK] Tiempo por pedido: 12min → 40s.",
  "[ERROR] Proceso manual innecesario encontrado.",
  "[OK] Formularios procesados solos.",
  "[OK] 37 tareas manuales evitadas.",
  "[OK] Sistema funcionando estable.",
] as const;

const OUTLOOK_EMAILS = [
  {
    subject: "Nueva reserva confirmada",
    preview: "María G. — Mañana 11:00",
    from: "Reservas automáticas",
    time: "09:14",
    body: "Buenos días,\n\nReserva confirmada sin que nadie tocara nada. Ni siquiera el café.\n\n— El sistema (trabajando más que nosotros)",
  },
  {
    subject: "Formulario web recibido",
    preview: "Presupuesto — Página contacto",
    from: "Web del negocio",
    time: "09:02",
    body: "Hola,\n\nAlguien pidió presupuesto a las 9 de la mañana. Ya está en tu lista. Tú sigue con el desayuno.\n\nPD: El formulario no se quejó.",
  },
  {
    subject: "Recordatorio de cita",
    preview: "Revisión trimestral",
    from: "Calendario conectado",
    time: "08:47",
    body: "Te recuerdo que mañana tienes revisión trimestral.\n\nYo sí me acuerdo. Tú aún no has abierto esto.",
  },
  {
    subject: "Factura enviada al cliente",
    preview: "Pedido #1842",
    from: "Facturación",
    time: "08:31",
    body: "Factura enviada, copiada y archivada.\n\nTres clics menos para ti hoy. De nada.",
  },
] as const;

/** Filas de la hoja: col. 0 = nº fila, cols. A–H = datos. */
const EXCEL_SHEET = [
  ["", "Cliente", "Concepto", "Cant.", "Importe", "Estado", "Fecha", "Notas"],
  ["1", "María G.", "Reserva", "1", "120 €", "Pagado", "12/03", ""],
  ["2", "Taller López", "Mantenimiento", "3", "340 €", "Pendiente", "12/03", "Revisar"],
  ["3", "Clínica Sol", "Suscripción", "1", "89 €", "Pagado", "11/03", ""],
  ["4", "Pedro R.", "Pedido web", "2", "56 €", "Enviado", "11/03", ""],
  ["5", "Ana M.", "Consulta", "1", "45 €", "Pagado", "11/03", ""],
] as const;

const EXCEL_COL_LABELS = ["", "A", "B", "C", "D", "E", "F", "G", "H"] as const;

function shuffleIndices(length: number): number[] {
  const a = Array.from({ length }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Escala uniforme de TODAS las ventanas (mantiene posiciones y proporciones). */
export const WINDOW_SCALE = 1.16;

function presetToStyle(preset: HeroWindowPreset): CSSProperties {
  return {
    top: preset.top,
    left: preset.left,
    width: preset.width,
    height: preset.height,
    zIndex: preset.z,
    transform: `rotate(${preset.rotate}deg) scale(${WINDOW_SCALE})`,
    transformOrigin: "top left",
  };
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

/** Outlook: un correo abierto cada vez, orden aleatorio (bandeja + lectura sincronizadas). */
function useOutlookMailCycle(reduceMotion: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const queueRef = useRef(shuffleIndices(OUTLOOK_EMAILS.length));
  const stepRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current >= queueRef.current.length) {
        queueRef.current = shuffleIndices(OUTLOOK_EMAILS.length);
        stepRef.current = 0;
      }
      setActiveIndex(queueRef.current[stepRef.current]);
    }, OUTLOOK_CYCLE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return activeIndex;
}

function useMonitorArtboardScale(containerRef: RefObject<HTMLDivElement | null>) {
  const [layout, setLayout] = useState({
    scale: 0.5,
    flowHeight: Math.ceil(MONITOR_ARTBOARD_H * 0.5),
    isMobile: false,
  });

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const available = el.clientWidth;
      const scale = Math.min(1, Math.max(0.28, (available - 4) / MONITOR_ARTBOARD_W));
      setLayout({
        scale,
        flowHeight: Math.ceil(MONITOR_ARTBOARD_H * scale),
        isMobile: window.innerWidth < 1024,
      });
    };
    update();
    const raf = requestAnimationFrame(update);
    const el = containerRef.current;
    const ro = el ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef]);

  return layout;
}

function WinControlsDecorative({ variant }: { variant: "light" | "dark" | "chrome" }) {
  const line =
    variant === "dark" ? "border-white/20" : variant === "chrome" ? "border-neutral-400/65" : "border-white/30";
  const text = variant === "dark" ? "text-neutral-400" : "text-neutral-600";
  return (
    <div className={`flex items-center ${text}`}>
      <button type="button" tabIndex={-1} aria-hidden className="flex h-6 w-7 items-center justify-center text-sm leading-none">
        -
      </button>
      <button type="button" tabIndex={-1} aria-hidden className="flex h-6 w-7 items-center justify-center">
        <span className={`inline-block h-2 w-2 border ${line}`} />
      </button>
      <button type="button" tabIndex={-1} aria-hidden className="flex h-6 w-8 items-center justify-center text-xs leading-none">
        ×
      </button>
    </div>
  );
}

type TitleVariant = "light" | "dark" | "requests" | "operations";

function WindowsTitleBar({ title, variant }: { title: string; variant: TitleVariant }) {
  const bar =
    variant === "dark"
      ? "border-b border-white/10 bg-[#121820]"
      : variant === "requests"
        ? "border-b border-white/10 bg-[#161d2a]"
        : variant === "operations"
          ? "border-b border-white/10 bg-[#151c28]"
          : "border-b border-neutral-200/80 bg-white";
  const textClass =
    variant === "dark" || variant === "operations" || variant === "requests"
      ? "text-neutral-200/90"
      : "text-neutral-800";

  return (
    <div className={`flex h-7 shrink-0 items-center justify-between gap-2 px-2 ${bar}`}>
      <span className={`truncate pl-0.5 text-[10px] font-semibold tracking-tight ${textClass}`}>{title}</span>
      <WinControlsDecorative variant={variant === "dark" || variant === "operations" || variant === "requests" ? "dark" : "chrome"} />
    </div>
  );
}

function MonitorWindowFromPreset({
  windowId,
  children,
}: {
  windowId: HeroWindowId;
  children: ReactNode;
}) {
  const preset = WINDOW_PRESETS[windowId];
  return (
    <div className="hero-monitor-window absolute overflow-hidden" style={presetToStyle(preset)}>
      <div className="h-full min-h-0 w-full">{children}</div>
    </div>
  );
}

function CmdSyntaxLine({ text }: { text: string }) {
  const t = text.trimStart();
  if (t.startsWith("[OK]")) {
    return (
      <span>
        <span className="text-emerald-400/90">[OK]</span>
        <span className="text-emerald-100/75">{t.slice(4)}</span>
      </span>
    );
  }
  if (t.startsWith("[INFO]")) {
    return (
      <span>
        <span className="text-sky-400/90">[INFO]</span>
        <span className="text-sky-100/72">{t.slice(6)}</span>
      </span>
    );
  }
  if (t.startsWith("[ERROR]")) {
    return (
      <span>
        <span className="text-rose-400/80">[ERROR]</span>
        <span className="text-rose-100/68">{t.slice(7)}</span>
      </span>
    );
  }
  return <span className="text-neutral-400/85">{text}</span>;
}

function GoogleLogoMark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex select-none items-end gap-[0.12em] font-medium leading-none ${className ?? ""}`} aria-hidden>
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

function GoogleHomeWindow() {
  const [task, setTask] = useState("");
  const [luckyOpen, setLuckyOpen] = useState(false);
  const taskId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent("Diagnóstico de operativa");
    const body = encodeURIComponent(`Tarea manual que más tiempo quita:\n${task}`);
    window.location.href = `mailto:contacto@agithecreator.com?subject=${subject}&body=${body}`;
  };

  const navIconBtn = "flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-600";

  return (
    <>
      <LuckyEasterEggModal open={luckyOpen} onClose={() => setLuckyOpen(false)} />
      <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-neutral-300/90 bg-white ${SHADOW_GOOGLE}`}>
        <div className="flex h-7 items-center gap-1 border-b border-[#c5c9d0] bg-[#dee1e6] pl-1.5 pr-1">
          <div className="flex w-28 min-w-0 max-w-[55%] items-center gap-1 rounded-t-md border border-b-0 border-[#b5bac1] bg-white px-1.5 py-1">
            <span className="relative h-3 w-3 shrink-0 rounded-full bg-[conic-gradient(#ea4335,#fbbc05,#34a853,#4285f4,#ea4335)] ring-1 ring-neutral-300/70">
              <span className="absolute inset-[2.5px] rounded-full bg-[#4285f4]" />
            </span>
            <span className="truncate text-[9px] font-medium text-neutral-800">Google</span>
            <span className="ml-auto shrink-0 text-[10px] leading-none text-neutral-400">×</span>
          </div>
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[12px] leading-none text-neutral-500" aria-hidden>
            +
          </span>
          <div className="min-w-0 flex-1" />
          <WinControlsDecorative variant="chrome" />
        </div>
        <div className="flex items-center gap-1 border-b border-neutral-200 bg-white px-1.5 py-1">
          <span className={navIconBtn} aria-hidden>
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
          <span className={navIconBtn} aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <span className={navIconBtn} aria-hidden>
            <RotateCw className="h-3 w-3" />
          </span>
          <span className={navIconBtn} aria-hidden>
            <Home className="h-3.5 w-3.5" />
          </span>
          <div className="flex min-w-0 flex-1 items-center rounded border border-neutral-200 bg-[#f6f8fa] px-2 py-0.5">
            <span className="truncate font-mono text-[8px] text-neutral-600">agithecreator.com</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white px-3 pb-3 pt-2.5">
          <div className="mb-2 flex justify-center">
            <GoogleLogoMark className="text-[1.45rem]" />
          </div>
          <p className="mb-2 text-center text-[10px] font-medium leading-snug text-neutral-800">
            ¿Te encuentran cuando te buscan?
          </p>
          <label htmlFor={taskId} className="sr-only">
            Tarea manual
          </label>
          <input
            id={taskId}
            name="task"
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Qué te quita más tiempo..."
            autoComplete="off"
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-[10px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#1a73e8]/70 focus:ring-1 focus:ring-[#1a73e8]/20"
          />
          <button
            type="submit"
            className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded bg-[#1a73e8] px-2 py-1.5 text-[10px] font-medium text-white hover:bg-[#1558b0]"
          >
            Revisar visibilidad
          </button>
          <button
            type="button"
            onClick={() => setLuckyOpen(true)}
            className="mt-1.5 w-full cursor-pointer text-center text-[8px] text-[#70757a] underline decoration-neutral-300/60 underline-offset-2"
          >
            Voy a tener suerte
          </button>
        </form>
      </div>
    </>
  );
}

const CMD_MAX_LINES = 28;
const CMD_TYPE_MS = 36;
const CMD_LINE_PAUSE_MS = 400;
const CMD_LOOP_GAP_MS = 2600;

type CmdLineRow = { id: string; text: string };

function ActivityFeedWindow({ reduceMotion }: { reduceMotion: boolean }) {
  const [lines, setLines] = useState<CmdLineRow[]>([]);
  const [currentChars, setCurrentChars] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(0);
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);

  const pushCompleteLine = useCallback((text: string) => {
    keyRef.current += 1;
    setLines((prev) => {
      const next = [...prev, { id: `c-${keyRef.current}`, text }];
      return next.length > CMD_MAX_LINES ? next.slice(-CMD_MAX_LINES) : next;
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [lines, currentChars, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setLines(CMD_FEED_LINES.map((text, i) => ({ id: `s-${i}`, text })));
      setCurrentChars("");
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const step = () => {
      if (cancelled) return;
      const full = CMD_FEED_LINES[lineIdxRef.current % CMD_FEED_LINES.length];
      if (charIdxRef.current < full.length) {
        charIdxRef.current += 1;
        setCurrentChars(full.slice(0, charIdxRef.current));
        timeoutId = setTimeout(step, CMD_TYPE_MS);
      } else {
        pushCompleteLine(full);
        setCurrentChars("");
        charIdxRef.current = 0;
        lineIdxRef.current += 1;
        const wrapped =
          lineIdxRef.current % CMD_FEED_LINES.length === 0 && lineIdxRef.current >= CMD_FEED_LINES.length;
        timeoutId = setTimeout(step, wrapped ? CMD_LOOP_GAP_MS : CMD_LINE_PAUSE_MS);
      }
    };
    timeoutId = setTimeout(step, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reduceMotion, pushCompleteLine]);

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md ${CMD_PANEL} ${SHADOW_CMD}`}>
      <WindowsTitleBar title="Actividad del sistema" variant="dark" />
      <div
        ref={scrollRef}
        className="hero-cmd-body min-h-0 flex-1 overflow-y-auto border-t border-white/8 bg-[#080c12] p-2.5 font-mono text-[9px] leading-relaxed"
      >
        <div className="space-y-0.5">
          {lines.map((row) => (
            <p key={row.id} className="wrap-break-word">
              <CmdSyntaxLine text={row.text} />
            </p>
          ))}
          {currentChars.length > 0 && (
            <p className="wrap-break-word">
              <CmdSyntaxLine text={currentChars} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OutlookInboxWindow({
  activeIndex,
}: {
  activeIndex: number;
}) {
  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[#3b3a39] bg-[#1b1a19] shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${SHADOW_CMD}`}>
      <div className="flex h-7 shrink-0 items-center justify-between gap-2 border-b border-[#3b3a39] bg-[#2b2a29] px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#0a84ff] text-[7px] font-bold text-white">
            O
          </span>
          <span className="truncate text-[10px] font-semibold text-neutral-100">Outlook</span>
        </div>
        <WinControlsDecorative variant="dark" />
      </div>
      <div className="shrink-0 border-b border-[#3b3a39] bg-[#252423] px-2 py-0.5">
        <p className="text-[8px] font-semibold text-[#4aa3e0]">Bandeja de entrada</p>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-[#2d2c2b] overflow-hidden bg-[#1b1a19]">
        {OUTLOOK_EMAILS.map((mail, i) => {
          const lit = i === activeIndex;
          return (
            <li
              key={mail.subject}
              className={`relative px-2 py-1 transition-colors duration-400 ${
                lit ? "bg-[#0e3a5c] shadow-[inset_3px_0_0_0_#0a84ff]" : "bg-transparent"
              }`}
            >
              <div className="flex items-start gap-1.5 pl-0.5">
                {!lit && (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0a84ff]" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[8.5px] leading-tight ${
                      lit ? "font-semibold text-white" : "font-medium text-neutral-200"
                    }`}
                  >
                    {mail.subject}
                  </p>
                  <p className={`truncate text-[7.5px] ${lit ? "text-neutral-300" : "text-neutral-400"}`}>
                    {mail.preview}
                  </p>
                </div>
                <span className="shrink-0 text-[7px] text-neutral-500">{mail.time}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OutlookReadWindow({ activeIndex }: { activeIndex: number }) {
  const mail = OUTLOOK_EMAILS[activeIndex];

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[#c8c6c4] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] ${SHADOW_LIGHT}`}>
      <div className="shrink-0 border-b border-[#edebe9] bg-[#faf9f8] px-2 py-1">
        <p className="truncate text-[9px] font-semibold text-neutral-900">{mail.subject}</p>
        <p className="truncate text-[7.5px] text-neutral-600">
          De: <span className="text-neutral-800">{mail.from}</span>
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-2 py-1.5">
        <p className="whitespace-pre-line text-[8px] leading-relaxed text-neutral-700">{mail.body}</p>
      </div>
    </div>
  );
}

const OPS_PROGRESS_MAX = 87;
const OPS_PROGRESS_STEP_MS = 130;

function OperationsPanelWindow({ reduceMotion }: { reduceMotion: boolean }) {
  const [progress, setProgress] = useState(14);
  const [errorFlash, setErrorFlash] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setProgress(86);
      return;
    }
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setProgress((p) => {
        const next = p + 2;
        if (next >= OPS_PROGRESS_MAX) {
          pausedRef.current = true;
          setErrorFlash(true);
          window.setTimeout(() => {
            setErrorFlash(false);
            pausedRef.current = false;
            setProgress(14);
          }, 850);
          return OPS_PROGRESS_MAX;
        }
        return next;
      });
    }, OPS_PROGRESS_STEP_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-white/10 bg-[#101622] ${SHADOW_CMD}`}>
      <WindowsTitleBar title="Panel de operaciones" variant="operations" />
      <div className="min-h-0 flex-1 space-y-2 overflow-hidden px-2.5 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[8px] text-neutral-400">Tareas completadas hoy</span>
          <span className="text-[10px] font-semibold text-violet-200/90">
            37 <span className="text-[8px] font-normal text-emerald-400/80">+12%</span>
          </span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[8px] text-neutral-400">
            <span>Procesos automatizados</span>
            <span className={errorFlash ? "text-rose-400/90" : "text-violet-200/80"}>
              {errorFlash ? "[ERROR] 87%" : `${progress}%`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-150 ease-out ${
                errorFlash ? "bg-rose-500/70" : "bg-violet-400/55"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {errorFlash && (
            <p className="mt-0.5 text-[7px] text-rose-400/80">Tarea manual detectada — reiniciando…</p>
          )}
        </div>
        <p className="text-[8px] text-neutral-400">
          Tiempo ahorrado: <span className="font-medium text-violet-200/85">4h 27m</span>
        </p>
      </div>
    </div>
  );
}

function ExcelSheetWindow() {
  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[#a6a6a6] bg-[#f0f0f0] ${SHADOW_LIGHT}`}>
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-[#d4d4d4] bg-[#217346] px-2">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-[8px] font-bold text-white">X</span>
          <span className="truncate text-[9px] font-semibold text-white">Ventas_marzo.xlsx</span>
        </div>
        <WinControlsDecorative variant="chrome" />
      </div>
      <div className="shrink-0 border-b border-[#d4d4d4] bg-white px-1.5 py-0.5">
        <div className="flex items-center gap-1 text-[7px] text-neutral-600">
          <span className="font-semibold text-neutral-800">fx</span>
          <span className="truncate text-neutral-500">=SUM(E2:E5)</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-white">
        <table className="min-w-full border-collapse text-[7px]">
          <thead>
            <tr>
              {EXCEL_COL_LABELS.map((col) => (
                <th
                  key={col}
                  className="border border-[#d4d4d4] bg-[#f3f3f3] px-1 py-0.5 text-center font-semibold text-neutral-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EXCEL_SHEET.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`whitespace-nowrap border border-[#e0e0e0] px-1 py-0.5 ${
                      ri === 0
                        ? "bg-[#f3f3f3] font-semibold text-neutral-700"
                        : ci === 0
                          ? "bg-[#f9f9f9] text-center text-neutral-500"
                          : "text-neutral-900"
                    } ${ri === 2 && ci === 5 ? "bg-[#fff8e6] text-[#9a6700]" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MascotSweatDrop() {
  const { topPercent, rightPercent, width, height, rotate } = SWEAT_PRESET;
  return (
    <svg
      className="hero-sweat-drop pointer-events-none absolute"
      style={{
        top: `${topPercent}%`,
        right: `${rightPercent}%`,
        width,
        height,
        transform: `rotate(${rotate}deg)`,
      }}
      viewBox="0 0 24 28"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2.5C12 2.5 5.5 11 5.5 17.5C5.5 22.2 8.4 25.5 12 25.5C15.6 25.5 18.5 22.2 18.5 17.5C18.5 11 12 2.5 12 2.5Z"
        fill="url(#hero-sweat-body)"
        stroke="#5a9ec4"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <ellipse cx="12" cy="19" rx="5.2" ry="5.8" fill="url(#hero-sweat-shine)" />
      <ellipse cx="9.5" cy="16" rx="1.8" ry="2.2" fill="rgba(255,255,255,0.55)" />
      <defs>
        <linearGradient id="hero-sweat-body" x1="12" y1="2" x2="12" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b8e4f8" />
          <stop offset="0.45" stopColor="#7ec8e8" />
          <stop offset="1" stopColor="#4a9ec4" />
        </linearGradient>
        <radialGradient
          id="hero-sweat-shine"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 19) scale(6 7)"
        >
          <stop stopColor="rgba(255,255,255,0.35)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function HeroMonitorScene({ reduceMotion }: { reduceMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, flowHeight, isMobile } = useMonitorArtboardScale(containerRef);
  const outlookActiveIndex = useOutlookMailCycle(reduceMotion);

  // Factor del conjunto pavo + gota: 1 en desktop, proporcional en pantallas menores.
  const groupScale = Math.min(1, scale / MASCOT_SCALE_REF);
  // En móvil el pavo se separa del borde para no cortarse; en desktop, valor del preset.
  const mascotLeft = isMobile ? MASCOT_MOBILE_LEFT : MASCOT_PRESET.left * groupScale;

  return (
    <div className="hero-scene relative mx-auto w-full max-w-[min(100%,460px)] select-none lg:max-w-[min(100%,700px)]" aria-hidden>
      <div className="relative w-full" style={{ height: flowHeight + Math.round(56 * groupScale) }}>
        <div
          ref={containerRef}
          className="absolute inset-x-0 top-0 mx-auto w-full max-w-full"
          style={{ height: flowHeight }}
        >
          <div className="relative mx-auto h-full w-full max-w-full">
            <div className="relative h-full w-full rounded-xl border border-white/10 bg-[#0a0e14] p-1 shadow-[0_28px_64px_-32px_rgba(0,0,0,0.7)] sm:rounded-2xl sm:p-1.5">
              <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/6 bg-[#060910] sm:rounded-xl">
                {/* Fondo de escritorio oscuro tipo Windows 10 */}
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/monitor-wallpaper.png')" }}
                />
                <div className="hero-monitor-glow pointer-events-none absolute inset-0 z-50 bg-[radial-gradient(ellipse_75%_50%_at_50%_35%,rgba(139,92,246,0.08),transparent_65%)]" />
                <div
                  className="hero-monitor-canvas absolute left-1/2 top-0 origin-top"
                  style={{
                    width: MONITOR_ARTBOARD_W,
                    height: MONITOR_ARTBOARD_H,
                    transform: `translateX(-50%) scale(${scale}) translateZ(0)`,
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                  }}
                >
                  <div className="relative" style={{ width: MONITOR_ARTBOARD_W, height: MONITOR_ARTBOARD_H }}>
                    {(Object.keys(WINDOW_PRESETS) as HeroWindowId[]).map((id) => (
                      <MonitorWindowFromPreset key={id} windowId={id}>
                        {id === "google" && <GoogleHomeWindow />}
                        {id === "requests" && <OutlookInboxWindow activeIndex={outlookActiveIndex} />}
                        {id === "outlookRead" && <OutlookReadWindow activeIndex={outlookActiveIndex} />}
                        {id === "operations" && <OperationsPanelWindow reduceMotion={reduceMotion} />}
                        {id === "excel" && <ExcelSheetWindow />}
                        {id === "cmd" && <ActivityFeedWindow reduceMotion={reduceMotion} />}
                      </MonitorWindowFromPreset>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute origin-bottom-left"
          style={{
            bottom: MASCOT_PRESET.bottom * groupScale,
            left: mascotLeft,
            width: MASCOT_PRESET.width,
            zIndex: MASCOT_PRESET.z,
            transform: `scale(${groupScale})`,
          }}
        >
          <div className="relative">
            <Image
              src="/logos/mascot_computer-hero.webp"
              alt=""
              width={MASCOT_PRESET.width}
              height={Math.round(MASCOT_PRESET.width * 0.8)}
              quality={88}
              priority
              sizes="(max-width: 1023px) 40vw, 215px"
              className="h-auto w-full object-contain object-bottom drop-shadow-[0_14px_32px_rgba(0,0,0,0.5)]"
            />
            <MascotSweatDrop />
          </div>
        </div>
      </div>
    </div>
  );
}

function scrollToPerfil() {
  document.getElementById("perfil")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const { openModal } = useContactModal();
  const reduceMotion = usePrefersReducedMotion();

  const handlePrimaryCta = () => {
    trackEvent("hero_cta_click", { location: "hero", action: "ver_mejoras" });
    scrollToPerfil();
  };

  const handleSecondaryCta = () => {
    trackEvent("hero_cta_click", { location: "hero", action: "cuentame" });
    openModal();
  };

  return (
    <section
      className={`${heroDisplay.variable} ${heroUi.variable} hero-editorial relative isolate z-30 w-full overflow-hidden bg-[#070b13] pt-24 pb-5 sm:pt-28 sm:pb-7 lg:pt-20 lg:pb-8`}
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-[#070b13]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_68%_at_68%_36%,rgba(124,58,237,0.1),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_14%_78%,rgba(139,92,246,0.05),transparent_55%)]" />
        <div className="hero-editorial-grain absolute inset-0 opacity-[0.32]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_44%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1320px] min-h-0 items-center px-5 py-4 sm:px-8 sm:py-5 lg:max-h-[78vh] lg:px-10 lg:py-6">
        <div className="grid w-full min-w-0 items-center gap-7 max-lg:gap-6 lg:grid-cols-[46%_54%] lg:gap-9 xl:gap-11">
          <div className="hero-copy-enter relative z-20 max-w-[min(100%,540px)] space-y-4 lg:space-y-4.5">
            <p className="font-(family-name:--font-hero-ui) inline-flex w-fit border border-white/11 bg-white/3 px-2.5 py-1 text-[7.5px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:text-[8px]">
              Diseño web y automatización para negocios en Valladolid
            </p>

            <h1 className="m-0 font-(family-name:--font-hero-display) text-[clamp(1.95rem,5.4vw,3.05rem)] font-medium leading-[1.2] tracking-[-0.012em] text-neutral-50">
              <span className="block">Tu negocio ya tiene</span>
              <span className="mt-1.5 block">suficiente trabajo encima.</span>
              <span className="mt-3 block text-[0.92em] font-normal leading-[1.22] text-neutral-300/92">
                Nosotros hacemos que las cosas{" "}
                <span className="text-violet-300/95 italic">funcionen solas.</span>
              </span>
            </h1>

            <p className="max-w-136 font-(family-name:--font-hero-ui) text-[clamp(0.92rem,1.4vw,1.02rem)] font-normal leading-[1.55] text-neutral-400/95">
              Más presencia online, menos tareas repetitivas y herramientas que siguen funcionando cuando tú
              estás con otras cosas — sin añadir más líos al día a día.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="font-(family-name:--font-hero-ui) inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-violet-400/35 bg-violet-600/90 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-violet-500"
              >
                Ver qué podría mejorar en mi negocio
              </button>
              <button
                type="button"
                onClick={handleSecondaryCta}
                className="font-(family-name:--font-hero-ui) inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-white/14 bg-white/4 px-4 py-2.5 text-[13px] font-medium text-neutral-200/90 transition-colors hover:border-white/24 hover:bg-white/7"
              >
                Cuéntame cómo trabajas hoy
              </button>
            </div>

            <p className="font-(family-name:--font-hero-ui) text-[12px] leading-relaxed text-neutral-500/88">
              Porque bastante tienes ya con llevar un negocio.
            </p>
          </div>

          <div className="relative z-10 w-full min-w-0">
            <HeroMonitorScene reduceMotion={reduceMotion} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-editorial-grain {
          background-image: radial-gradient(rgba(255, 255, 255, 0.5) 0.4px, transparent 0.4px);
          background-size: 2px 2px;
          mix-blend-mode: soft-light;
        }
        .hero-monitor-canvas {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        .hero-monitor-glow {
          opacity: 0.6;
          animation: hero-monitor-glow 9s ease-in-out infinite;
        }
        @keyframes hero-monitor-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        .hero-sweat-drop {
          animation: hero-sweat-slide 3.4s ease-in-out infinite;
        }
        @keyframes hero-sweat-slide {
          0%,
          100% {
            opacity: 0.82;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(2px);
          }
        }
        @keyframes hero-copy-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-copy-enter {
          animation: hero-copy-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .hero-cmd-body {
          scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-monitor-frame,
          .hero-sweat-drop,
          .hero-copy-enter {
            animation: none;
          }
          .hero-cmd-body {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </section>
  );
}
