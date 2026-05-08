"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquareText,
  RotateCw,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
} from "react";

const MECHANICAL_TRANSITION = { type: "spring" as const, stiffness: 120, damping: 14 };

/** Google: ventana clara real. Servicios/CMD: sombras grandes y suaves */
const SHADOW_GOOGLE =
  "shadow-2xl shadow-[0_40px_100px_-28px_rgba(15,23,42,0.22),0_16px_40px_-20px_rgba(15,23,42,0.12)]";
const SHADOW_SERVICES =
  "shadow-2xl shadow-[0_48px_110px_-24px_rgba(15,23,42,0.28),0_20px_48px_-18px_rgba(15,23,42,0.16)]";
const SHADOW_CMD =
  "shadow-2xl shadow-[0_56px_120px_-22px_rgba(0,0,0,0.55),0_28px_64px_-16px_rgba(0,0,0,0.35)]";

const CMD_PANEL = "rounded-sm border border-white/15 bg-neutral-950";

const CMD_SCRIPT = [
  "> agi --limpiar-operativa",
  "> [OK] 40h de admin eliminadas.",
  "> [OK] Costes de terceros: 0€.",
  "> [INFO] Migración: 40min -> 2min.",
] as const;

const SERVICES_ROWS = [
  { name: "PucelaTicketing_Auth", mode: "Automático", state: "En ejecución", running: true },
  { name: "Shop_Migration_Engine", mode: "Manual", state: "En ejecución", running: true },
  { name: "CallGuard_Privacy", mode: "Deshabilitado", state: "Detenido", running: false },
  { name: "Aguarras_Core", mode: "Automático", state: "En ejecución", running: true },
  { name: "Cloudflare_Proxy", mode: "Manual", state: "En ejecución", running: true },
] as const;

const PROFILE_GITHUB_URL = "https://github.com/AGIthecreator";

// -----------------------------------------------------------------------------
// PRESETS ESCRITORIO — edita HERO_DESK_*_PARTS; el `shell` se arma solo.
// Todas las clases son literales en este archivo para que Tailwind las incluya en el CSS.
//
// ¿No ves cambios al guardar? Reinicia `npm run dev` o fuerza hard refresh (caché del navegador).
// -----------------------------------------------------------------------------

/** Ventana Google (z-10, base). */
export const HERO_DESK_GOOGLE_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-10",
  mobile: "left-1/2 -translate-x-1/2 w-[95%]",
  desktop: "lg:left-[15%] lg:-translate-x-[45%] lg:top-[-120px] lg:w-[720px]",
} as const;

/** Ventana Servicios (z-30, encima). */
export const HERO_DESK_SERVICES_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-20",
  mobile: "left-[5%] top-[100px] w-[85%]",
  desktop: "lg:left-[35%] lg:top-[0px] lg:w-[520px]",
} as const;

/** Ventana CMD (z-20). */
export const HERO_DESK_CMD_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-30",
  mobile: "right-[-2%] bottom-[-60px] w-[90%]",
  desktop: "lg:right-[-20px] lg:bottom-[-60px] lg:w-[650px]",
} as const;

/** Contenedor interior del escritorio (espacio antes del desborde del CMD por abajo). */
export const HERO_DESK_STAGE_PARTS = {
  base: "relative overflow-visible",
  spacing:
    "min-h-[460px] pb-44 pt-0 sm:min-h-[520px] sm:pb-48 lg:min-h-[560px] lg:pb-52",
} as const;

function joinDeskClasses(parts: readonly string[]) {
  return parts.join(" ");
}

/** API estable: `HERO_DESK_PRESETS.google.shell` (igual que antes). */
export const HERO_DESK_PRESETS = {
  google: {
    shell: joinDeskClasses([
      HERO_DESK_GOOGLE_PARTS.base,
      HERO_DESK_GOOGLE_PARTS.z,
      HERO_DESK_GOOGLE_PARTS.mobile,
      HERO_DESK_GOOGLE_PARTS.desktop,
    ]),
  },
  services: {
    shell: joinDeskClasses([
      HERO_DESK_SERVICES_PARTS.base,
      HERO_DESK_SERVICES_PARTS.z,
      HERO_DESK_SERVICES_PARTS.mobile,
      HERO_DESK_SERVICES_PARTS.desktop,
    ]),
  },
  cmd: {
    shell: joinDeskClasses([
      HERO_DESK_CMD_PARTS.base,
      HERO_DESK_CMD_PARTS.z,
      HERO_DESK_CMD_PARTS.mobile,
      HERO_DESK_CMD_PARTS.desktop,
    ]),
  },
} as const;

export const HERO_DESK_STAGE_CLASS = joinDeskClasses([
  HERO_DESK_STAGE_PARTS.base,
  HERO_DESK_STAGE_PARTS.spacing,
]);

const CursorCtx =
  createContext<{ rawX: ReturnType<typeof useMotionValue<number>>; rawY: ReturnType<typeof useMotionValue<number>> } | null>(
    null,
  );

function useProximityNudge(ref: RefObject<HTMLElement | null>, radiusPx = 86, gain = 4.5) {
  const cx = useContext(CursorCtx);
  const shiftX = useSpring(0, { stiffness: 300, damping: 26 });
  const shiftY = useSpring(0, { stiffness: 300, damping: 26 });

  useEffect(() => {
    if (!cx) return;
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const rx = cx.rawX.get();
      const ry = cx.rawY.get();
      const r = el.getBoundingClientRect();
      const mx = rx - (r.left + r.width / 2);
      const my = ry - (r.top + r.height / 2);
      const d = Math.hypot(mx, my);
      if (d > 1.5 && d < radiusPx) {
        const pull = ((radiusPx - d) / radiusPx) * gain;
        shiftX.set((mx / d) * pull);
        shiftY.set((my / d) * pull);
      } else if (d >= radiusPx || d <= 1.5) {
        shiftX.set(0);
        shiftY.set(0);
      }
    };
    const ua = cx.rawX.on("change", compute);
    const ub = cx.rawY.on("change", compute);
    return () => {
      ua();
      ub();
    };
  }, [cx, ref, radiusPx, gain, shiftX, shiftY]);

  return { shiftX, shiftY };
}

function MagneticCloseWrap({ children }: { children: ReactNode }) {
  const shell = useRef<HTMLDivElement>(null);
  const { shiftX, shiftY } = useProximityNudge(shell, 70, 3.6);
  return (
    <motion.div ref={shell} style={{ x: shiftX, y: shiftY }} className="inline-flex">
      {children}
    </motion.div>
  );
}

function MagneticLineWrap({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function HandGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 36"
      className="h-8 w-6.5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4 L13 19" />
      <path d="M9 13 L10 26 Q10.5 30 13.5 30 L19 29 Q21.5 28.5 22 26 L22 21" />
      <path d="M16 17 L17 26" opacity="0.85" />
      <path d="M19 16 L19.8 23.8" opacity="0.72" />
    </svg>
  );
}

function CursorHandLayer({ active, handScale = 1 }: { active: boolean; handScale?: number }) {
  const store = useContext(CursorCtx);
  const fallbackX = useMotionValue(-9999);
  const fallbackY = useMotionValue(-9999);
  const rawX = store?.rawX ?? fallbackX;
  const rawY = store?.rawY ?? fallbackY;
  const gx = useTransform(rawX, (v) => v - 10);
  const gy = useTransform(rawY, (v) => v - 8);

  if (!store || !active) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-130 origin-top-left mix-blend-difference"
      style={{ x: gx, y: gy, scale: handScale }}
    >
      <HandGlyph />
    </motion.div>
  );
}

function WinControlsDecorative({ variant }: { variant: "light" | "dark" | "chrome" }) {
  const line =
    variant === "dark" ? "border-white/20" : variant === "chrome" ? "border-neutral-400/65" : "border-white/30";
  const text = variant === "dark" ? "text-neutral-400" : "text-neutral-600";
  return (
    <div className={`flex items-center ${text}`}>
      <button type="button" tabIndex={-1} aria-label="Minimizar (decorativo)" className="flex h-7 w-9 items-center justify-center border border-transparent text-base leading-none hover:bg-black/5">
        -
      </button>
      <button type="button" tabIndex={-1} aria-label="Maximizar (decorativo)" className="flex h-7 w-9 items-center justify-center border border-transparent hover:bg-black/5">
        <span className={`inline-block h-2.5 w-2.5 border ${line}`} aria-hidden />
      </button>
      <MagneticCloseWrap>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar (decorativo)"
          className="hero-win-close flex h-7 w-10 items-center justify-center border border-transparent text-sm leading-none transition-[color,background-color,border-color,box-shadow] hover:border-red-400/55 hover:bg-red-500/20 hover:text-red-100 focus:outline-none"
        >
          ×
        </button>
      </MagneticCloseWrap>
    </div>
  );
}

function WindowsTitleBar({
  title,
  variant,
  children,
}: {
  title: string;
  variant: "light" | "gray" | "dark" | "services";
  children?: ReactNode;
}) {
  const bar =
    variant === "light"
      ? "border-b border-neutral-200/80 bg-white"
      : variant === "services"
        ? "border-b border-[#aab9cc] bg-[#c9d6e8]"
        : variant === "gray"
          ? "border-b border-white/12 bg-white/[0.06]"
          : "border-b border-white/12 bg-neutral-950/90";

  const textClass =
    variant === "dark" ? "text-neutral-200/95" : "text-neutral-800";

  const controlVariant = variant === "dark" ? "dark" : "chrome";

  return (
    <div className={`flex h-8 shrink-0 items-center justify-between gap-2 px-2 ${bar}`}>
      <span className={`truncate pl-1 text-[11px] font-semibold tracking-tight ${textClass}`}>{title}</span>
      <div className="flex shrink-0 items-center gap-0.5">
        {children ?? <WinControlsDecorative variant={controlVariant} />}
      </div>
    </div>
  );
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

function CmdSyntaxLine({ text }: { text: string }) {
  const t = text.trimStart();
  if (t.startsWith("> [OK]")) {
    const tail = t.slice("> [OK]".length);
    return (
      <span>
        <span className="text-neutral-500">&gt; </span>
        <span className="text-emerald-400">[OK]</span>
        <span className="text-emerald-200/88">{tail}</span>
      </span>
    );
  }
  if (t.startsWith("> [INFO]")) {
    const tail = t.slice("> [INFO]".length);
    return (
      <span>
        <span className="text-neutral-500">&gt; </span>
        <span className="text-sky-400">[INFO]</span>
        <span className="text-sky-200/90">{tail}</span>
      </span>
    );
  }
  if (t.startsWith("> ")) {
    return (
      <span>
        <span className="text-neutral-500">&gt; </span>
        <span className="text-cyan-300">{t.slice(2)}</span>
      </span>
    );
  }
  if (t.startsWith(">")) {
    return (
      <span>
        <span className="text-neutral-500">&gt;</span>
        <span className="text-cyan-300">{t.slice(1)}</span>
      </span>
    );
  }
  return <span className="text-neutral-400">{text}</span>;
}

function GoogleLogoMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex select-none items-end gap-[0.14em] font-medium leading-none ${className ?? ""}`}
      aria-hidden
    >
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

function AgiTabFavicon({ className }: { className?: string }) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-neutral-900 text-[7px] font-bold uppercase leading-none text-white ring-1 ring-neutral-600/70 ${className ?? ""}`}
      aria-hidden
    >
      <span className="bg-linear-to-br from-cyan-400/95 to-indigo-500/90 px-[3px] py-[4px]">AGI</span>
    </span>
  );
}

function GoogleHomeWindow({
  onFormTextFieldHover,
  onSubmitCtaHover,
}: {
  onFormTextFieldHover: (v: boolean) => void;
  onSubmitCtaHover: (v: boolean) => void;
}) {
  const [task, setTask] = useState("");
  const [email, setEmail] = useState("");
  const taskId = useId();
  const emailId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent("Diagnóstico de operativa");
    const body = encodeURIComponent(
      `Tarea manual que más tiempo quita:\n${task}\n\nEmail: ${email}`,
    );
    window.location.href = `mailto:contacto@agithecreator.com?subject=${subject}&body=${body}`;
  };

  const navIconBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-200/80";

  return (
    <div className={HERO_DESK_PRESETS.google.shell}>
      <div className={`flex flex-col overflow-hidden rounded-md border border-neutral-300/95 bg-white ${SHADOW_GOOGLE}`}>
        <div className="flex h-9 items-end gap-0.5 border-b border-[#c5c9d0] bg-[#dee1e6] px-1.5 pt-1">
          <div className="flex min-w-0 max-w-[46%] flex-1 items-center gap-2 rounded-t border border-b-0 border-[#b5bac1] bg-white px-2.5 py-2 shadow-[0_-1px_0_0_white]">
            <span className="relative h-3.5 w-3.5 shrink-0 rounded-full bg-[conic-gradient(#ea4335_0deg,#fbbc05_90deg,#34a853_180deg,#4285f4_270deg,#ea4335_360deg)] ring-1 ring-neutral-300/75">
              <span className="absolute inset-[3.1px] rounded-full bg-[#4285f4]" />
            </span>
            <span className="truncate text-[11px] font-medium text-neutral-800">Google</span>
          </div>
          <div className="flex min-w-0 max-w-[46%] items-center gap-2 rounded-t border border-b-0 border-transparent bg-[#e7eaef] px-2.5 py-1.5 text-[11px] text-neutral-600">
            <AgiTabFavicon className="h-3.5 w-3.5" />
            <span className="truncate">agithecreator.com</span>
          </div>
          <span className="mb-0.5 shrink-0 px-0.5 text-lg leading-none text-neutral-500">+</span>
          <div className="mb-0.5 ml-auto shrink-0">
            <WinControlsDecorative variant="chrome" />
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-neutral-200 bg-white px-2 py-1.5">
          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" tabIndex={-1} className={navIconBtn} title="Atrás (decorativo)" aria-hidden>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" tabIndex={-1} className={navIconBtn} title="Adelante (decorativo)" aria-hidden>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button type="button" tabIndex={-1} className={navIconBtn} title="Recargar (decorativo)" aria-hidden>
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button type="button" tabIndex={-1} className={navIconBtn} title="Inicio (decorativo)" aria-hidden>
              <Home className="h-4 w-4" />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-[#f6f8fa] px-2.5 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="truncate font-mono text-[10px] text-neutral-700 sm:text-[11px]" lang="en">
              https://agithecreator.com/diagnostico
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="hero-google-form flex flex-col bg-white px-4 pb-7 pt-5 font-[family-name:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] sm:px-7 sm:pb-9 sm:pt-6"
        >
          <div className="mb-5 flex justify-center">
            <GoogleLogoMark className="text-[2.25rem] sm:text-[2.6rem]" />
          </div>

          <h2 className="mb-4 max-w-xs text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
            Diagnóstico de operativa
          </h2>

          <div
            className="max-w-xs space-y-4"
            onPointerEnter={() => onFormTextFieldHover(true)}
            onPointerLeave={() => onFormTextFieldHover(false)}
          >
            <div>
              <label htmlFor={taskId} className="mb-1.5 block text-sm text-neutral-800">
                ¿Qué tarea manual te quita más tiempo?
              </label>
              <input
                id={taskId}
                name="task"
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Ej: Facturación, migración de datos..."
                autoComplete="off"
                className="w-full max-w-xs cursor-text rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-neutral-400 focus:border-[#1a73e8]/80 focus:ring-2 focus:ring-[#1a73e8]/20"
              />
            </div>
            <div>
              <label htmlFor={emailId} className="mb-1.5 block text-sm text-neutral-800">
                Tu email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                className="w-full max-w-xs cursor-text rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none placeholder:text-neutral-400 focus:border-[#1a73e8]/80 focus:ring-2 focus:ring-[#1a73e8]/20"
              />
            </div>
          </div>

          <div className="mt-6 flex max-w-xs flex-wrap items-center gap-2">
            <button
              type="submit"
              onPointerEnter={() => onSubmitCtaHover(true)}
              onPointerLeave={() => onSubmitCtaHover(false)}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1558b0]"
            >
              <span>Enviar diagnóstico</span>
              <span className="text-base leading-none" aria-hidden>
                &gt;
              </span>
            </button>
            <a
              href={PROFILE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-100"
            >
              Voy a tener suerte
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServicesMscWindow() {
  return (
    <div className={HERO_DESK_PRESETS.services.shell}>
      <div className={`flex h-full min-h-[300px] flex-col overflow-hidden rounded-md border border-[#aab9cc]/90 bg-[#d7e2ee] sm:min-h-[320px] ${SHADOW_SERVICES}`}>
        <div className="flex h-7 shrink-0 items-center gap-4 border-b border-[#9eaebf] bg-[#c9d6e8] px-2 text-[10px] font-medium text-neutral-800 sm:h-8 sm:text-[11px]">
          <span className="px-1 py-0.5 hover:bg-black/5">Archivo</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Acción</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Ver</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Ayuda</span>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[100px] shrink-0 flex-col border-r border-[#aab9cc] bg-[#c9d6e8] py-3 pl-2 pr-1 text-[10px] font-semibold leading-snug text-neutral-800 sm:w-[118px] sm:text-[11px]">
            <span className="mb-2 border-b border-[#aab9cc]/80 pb-2 text-neutral-900">Servicios (locales)</span>
            <span className="rounded bg-[#b8cae0]/70 px-1.5 py-1 font-medium ring-1 ring-[#aab9cc]/90">Este equipo</span>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <WindowsTitleBar title="Servicios" variant="services" />
            <div className="min-h-0 flex-1 overflow-auto border-t border-[#aab9cc] bg-[#e4edf6]">
              <table className="w-full border-collapse text-left text-[10px] text-neutral-800 sm:text-[11px]">
                <thead className="sticky top-0 z-1 bg-[#cddae9] text-[9px] font-semibold uppercase tracking-wide text-neutral-600">
                  <tr>
                    <th className="border-b border-[#aab9cc] px-2 py-2 font-semibold">Nombre</th>
                    <th className="border-b border-[#aab9cc] px-2 py-2 font-semibold">Inicio</th>
                    <th className="border-b border-[#aab9cc] px-2 py-2 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES_ROWS.map((row, i) => (
                    <tr key={row.name} className={i % 2 === 0 ? "bg-[#edf3f9]" : "bg-[#e4edf6]"}>
                      <td className="border-b border-[#c5d3e4] px-2 py-2 align-top font-semibold text-neutral-900">
                        <span
                          className="mr-1 inline-block h-3 w-3 shrink-0 align-middle bg-[#4b6b8a]/25 ring-1 ring-[#8aa0b8]/50"
                          aria-hidden
                        />
                        {row.name}
                      </td>
                      <td className="border-b border-[#c5d3e4] px-2 py-2 align-top text-neutral-700">{row.mode}</td>
                      <td className={`border-b border-[#c5d3e4] px-2 py-2 align-top font-semibold ${row.running ? "text-emerald-800" : "text-neutral-600"}`}>
                        {row.state}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CMD_MAX_LINES = 12;
const CMD_TYPE_MS = 42;
const CMD_LINE_PAUSE_MS = 520;
const CMD_LOOP_GAP_MS = 2600;

type CmdLineRow = { id: string; text: string };

function CmdTypingWindow({ reduceMotion }: { reduceMotion: boolean }) {
  const [lines, setLines] = useState<CmdLineRow[]>([]);
  const [currentChars, setCurrentChars] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, currentChars]);

  useEffect(() => {
    if (reduceMotion) {
      setLines(CMD_SCRIPT.map((text, i) => ({ id: `s-${i}`, text })));
      setCurrentChars("");
      return;
    }

    let lineIdx = 0;
    let charIdx = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const push = (text: string) => {
      keyRef.current += 1;
      const id = `c-${keyRef.current}`;
      setLines((prev) => {
        const next = [...prev, { id, text }];
        return next.length > CMD_MAX_LINES ? next.slice(-CMD_MAX_LINES) : next;
      });
    };

    const step = () => {
      if (cancelled) return;
      const full = CMD_SCRIPT[lineIdx % CMD_SCRIPT.length];
      if (charIdx < full.length) {
        charIdx += 1;
        setCurrentChars(full.slice(0, charIdx));
        timeoutId = setTimeout(step, CMD_TYPE_MS);
      } else {
        push(full);
        setCurrentChars("");
        charIdx = 0;
        lineIdx += 1;
        timeoutId =
          lineIdx % CMD_SCRIPT.length === 0
            ? setTimeout(step, CMD_LOOP_GAP_MS)
            : setTimeout(step, CMD_LINE_PAUSE_MS);
      }
    };

    timeoutId = setTimeout(step, 550);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  return (
    <div className={HERO_DESK_PRESETS.cmd.shell}>
      <div className={`flex flex-col overflow-hidden rounded-md ${CMD_PANEL} ${SHADOW_CMD}`}>
      <WindowsTitleBar title="Símbolo del sistema — cmd.exe" variant="dark">
        <WinControlsDecorative variant="dark" />
      </WindowsTitleBar>

      <div
        ref={scrollRef}
        className="hero-cmd-body h-[260px] overflow-y-auto border-t border-white/10 bg-black p-3.5 font-mono text-[10px] leading-relaxed sm:h-[300px] sm:p-4 sm:text-[11px]"
      >
        <MagneticLineWrap>
          <p className="mb-1 text-neutral-500">Microsoft Windows [Versión 10.0.19045]</p>
        </MagneticLineWrap>
        <MagneticLineWrap>
          <p className="mb-2 text-neutral-500">(c) Microsoft Corporation.</p>
        </MagneticLineWrap>
        <div className="space-y-1">
          {lines.map((row) => (
            <MagneticLineWrap key={row.id}>
              <p className="wrap-break-word">
                <CmdSyntaxLine text={row.text} />
              </p>
            </MagneticLineWrap>
          ))}
          {currentChars.length > 0 && (
            <MagneticLineWrap>
              <p className="wrap-break-word">
                <CmdSyntaxLine text={currentChars} />
              </p>
            </MagneticLineWrap>
          )}
          <p>
            <span className="text-neutral-500">C:\Users\ABEL&gt;</span>{" "}
            <span className="inline-block h-3 w-1.5 animate-pulse align-middle bg-cyan-400/90" aria-hidden />
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

function DeskStackTilt({ reduceMotion, children }: { reduceMotion: boolean; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const sx = useSpring(tiltX, { stiffness: 420, damping: 38 });
  const sy = useSpring(tiltY, { stiffness: 420, damping: 38 });

  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const onMove = (e: React.MouseEvent) => {
    if (reduceMotion) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(nx * 5.5);
    tiltX.set(-ny * 4.5);
  };

  return (
    <div
      ref={wrapRef}
      className={[reduceMotion ? "" : "perspective-distant", "relative"].join(" ")}
      onMouseMove={onMove}
      onMouseLeave={() => reset()}
      style={
        reduceMotion
          ? undefined
          : { perspectiveOrigin: "50% 40%" }
      }
    >
      <motion.div
        className="relative transform-gpu will-change-transform"
        style={
          reduceMotion
            ? { transformStyle: "preserve-3d" }
            : {
                rotateX: sx,
                rotateY: sy,
                transformStyle: "preserve-3d",
              }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

function EngineerDeskStack({
  reduceMotion,
  onFormTextFieldHover,
  onSubmitCtaHover,
  onWindowsHover,
  onWindowsMove,
}: {
  reduceMotion: boolean;
  onFormTextFieldHover: (v: boolean) => void;
  onSubmitCtaHover: (v: boolean) => void;
  onWindowsHover: (v: boolean) => void;
  onWindowsMove: (event: ReactMouseEvent) => void;
}) {
  return (
    <div
      className="relative mx-auto w-full overflow-visible"
      onMouseEnter={() => onWindowsHover(true)}
      onMouseLeave={() => {
        onWindowsHover(false);
        onFormTextFieldHover(false);
        onSubmitCtaHover(false);
      }}
      onMouseMove={onWindowsMove}
    >
      <DeskStackTilt reduceMotion={reduceMotion}>
        <div className={HERO_DESK_STAGE_CLASS}>
          <GoogleHomeWindow onFormTextFieldHover={onFormTextFieldHover} onSubmitCtaHover={onSubmitCtaHover} />
          <CmdTypingWindow reduceMotion={reduceMotion} />
          <ServicesMscWindow />
        </div>
      </DeskStackTilt>
    </div>
  );
}

export function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  const [cursorHero, setCursorHero] = useState(false);
  const [formTextFieldHover, setFormTextFieldHover] = useState(false);
  const [submitCtaHover, setSubmitCtaHover] = useState(false);

  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const cursorApi = useMemo(() => ({ rawX, rawY }), [rawX, rawY]);
  const useCustomPointer = cursorHero && !reduceMotion && !formTextFieldHover;
  const handScale = submitCtaHover ? 1.1 : 1;

  const onHeroMove = (e: ReactMouseEvent) => {
    rawX.set(e.clientX);
    rawY.set(e.clientY);
  };

  return (
    <CursorCtx.Provider value={cursorApi}>
      <section
        className={`hero-engineer relative isolate min-h-[56vh] w-full overflow-visible bg-[#04060d] pb-10 pt-5 sm:min-h-[60vh] sm:pb-12 sm:pt-6 lg:min-h-[62vh] lg:pb-14 lg:pt-8 ${useCustomPointer ? "cursor-none" : ""}`}
      >
        <CursorHandLayer active={useCustomPointer} handScale={handScale} />

        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-tech-grid absolute inset-0" />
          <div className="hero-tech-glow absolute inset-0" />
          <div className="hero-grain hero-grain-fine absolute inset-0 opacity-[0.02]" />
          <div className="hero-tech-fade absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1580px] min-h-0 flex-1 items-center overflow-visible px-5 sm:px-8 lg:px-12">
          <div className="grid w-full items-center gap-10 overflow-visible lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={MECHANICAL_TRANSITION}
              className="space-y-5 lg:max-w-xl lg:pr-4 xl:max-w-2xl xl:pr-10"
            >
              <p className="inline-flex w-fit border border-white/15 bg-white/4.5 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.13em] text-neutral-400 sm:text-[9px] sm:tracking-[0.14em]">
                AGI // DISEÑO DE PRODUCTO Y DESARROLLO FULL STACK
              </p>

              <h1 className="max-w-4xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-[#f2f0ec] sm:text-4xl sm:leading-[1.06] md:text-5xl lg:text-6xl lg:leading-[1.04] xl:text-7xl">
                Desarrollo el software que te quita el trabajo aburrido y te ahorra las cuotas mensuales.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
                Mientras otros te venden suscripciones, yo te construyo tecnología propia. Sistemas que cobran, mueven datos y
                funcionan solos. Sin parches y sin depender de nadie.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="mailto:contacto@agithecreator.com?subject=Diagnosticar%20mi%20caso"
                  className="inline-flex items-center gap-2 border border-white/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#05070f] transition-colors hover:bg-neutral-100"
                >
                  <MessageSquareText className="h-4 w-4 shrink-0" aria-hidden />
                  Diagnosticar mi caso
                </a>
                <a
                  href="#proyectos"
                  className="inline-flex items-center gap-2 border border-white/18 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
                >
                  Ver lo que he montado
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </div>
            </motion.div>

            <div className="relative z-6 -mb-32 overflow-visible sm:-mb-36 lg:-mb-44 xl:-mb-46">
              <div
                className="pointer-events-none absolute left-[42%] top-[38%] z-0 h-[min(120%,520px)] w-[min(140%,760px)] max-w-none -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_68%_52%_at_50%_48%,rgba(56,189,248,0.12),transparent_68%)] opacity-90 sm:left-1/2 sm:top-[40%] lg:h-[540px] lg:w-[820px]"
                aria-hidden
              />
              <div className="relative z-1">
                <EngineerDeskStack
                  reduceMotion={reduceMotion}
                  onFormTextFieldHover={setFormTextFieldHover}
                  onSubmitCtaHover={setSubmitCtaHover}
                  onWindowsHover={setCursorHero}
                  onWindowsMove={onHeroMove}
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-tech-grid {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            opacity: 1;
          }
          .hero-tech-glow {
            background: radial-gradient(ellipse 92% 74% at 70% 42%, rgba(56, 189, 248, 0.065), transparent 58%);
          }
          .hero-grain-fine {
            background-image: radial-gradient(rgba(255, 255, 255, 1) 0.42px, transparent 0.42px);
            background-size: 2px 2px;
            mix-blend-mode: soft-light;
          }
          .hero-tech-fade {
            background: linear-gradient(to bottom, transparent 0%, transparent 54%, rgba(0, 0, 0, 1) 100%);
          }
          .hero-engineer .hero-win-close:hover {
            border-color: rgba(248, 113, 113, 0.45);
            background-color: rgba(239, 68, 68, 0.16);
            color: rgb(254, 226, 226);
            box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.12);
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-cmd-body .animate-pulse {
              animation: none !important;
              opacity: 0.92;
            }
          }
        `}</style>
      </section>
    </CursorCtx.Provider>
  );
}
