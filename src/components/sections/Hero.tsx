
"use client";

import {
  ChevronLeft,
  ChevronRight,
  Home,
  RotateCw,
} from "lucide-react";
import Image from "next/image";

import { LuckyEasterEggModal } from "@/components/ui/LuckyEasterEggModal";
import {
  useEffect,
  useId,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { trackEvent } from "@/lib/analytics";

/** Google: ventana clara real. Servicios/CMD: sombras grandes y suaves */
const SHADOW_GOOGLE =
  "shadow-2xl shadow-[0_40px_100px_-28px_rgba(15,23,42,0.22),0_16px_40px_-20px_rgba(15,23,42,0.12)]";
const SHADOW_SERVICES =
  "shadow-2xl shadow-[0_48px_110px_-24px_rgba(15,23,42,0.28),0_20px_48px_-18px_rgba(15,23,42,0.16)]";
const SHADOW_CMD =
  "shadow-2xl shadow-[0_56px_120px_-22px_rgba(0,0,0,0.55),0_28px_64px_-16px_rgba(0,0,0,0.35)]";

const CMD_PANEL = "rounded-sm border border-white/15 bg-neutral-950";

/** Secuencia CMD en bucle: mezcla [OK] / [ERROR] / [INFO] / comandos para ritmo variado. */
const CMD_FEED_LINES = [
  "> [OK] 18 correos enviados automáticamente.",
  "> [INFO] Revisando tareas repetitivas...",
  "> agi --reducir-tiempo-operativo",
  "> [OK] 4h de gestión evitadas hoy.",
  "> [ERROR] Datos duplicados detectados.",
  "> [OK] Reserva confirmada sin intervención.",
  "> [INFO] Analizando puntos donde se pierde tiempo...",
  "> agi --eliminar-tareas-manuales",
  "> [OK] Datos duplicados eliminados.",
  "> [ERROR] Proceso manual innecesario encontrado.",
  "> [OK] Cliente añadido al CRM.",
  "> agi --conectar-sistemas",
  "> [OK] Factura enviada automáticamente.",
  "> [OK] Tiempo por pedido: 12min -> 40s.",
  "> [OK] 37 tareas manuales evitadas.",
  "> [OK] Sincronización completada.",
  "> [OK] Formularios procesados solos.",
  "> [OK] Costes externos reducidos.",
  "> [OK] Sistema funcionando estable.",
  "> [INFO] Sistema estable desde hace 14 días."
] as const;

const CMD_DIAGNOSTIC_BURST = [
  "> agi --analizar-operativa",
  "> [INFO] Detectando tareas repetidas...",
  "> [OK] Posible ahorro detectado.",
  "> [OK] Formularios automatizables.",
  "> [OK] Correos automáticos disponibles.",
  "> sistema listo",
] as const;

const SERVICES_ROWS = [
  { name: "Ahorro_47h_Mes.exe", mode: "Automático", state: "En ejecución", running: true },
  { name: "Facturas_A_Mano.exe", mode: "Manual", state: "Deshabilitado", running: false },
  { name: "Clientes_AutoSync.exe", mode: "Automático", state: "En ejecución", running: true },
  { name: "Archivos_Duplicados.exe", mode: "Manual", state: "Detenido", running: false },
  { name: "Emails_Que_Salen_Solos.exe", mode: "Automático", state: "En ejecución", running: true },
  { name: "Reservas_Automaticas.exe", mode: "Automático", state: "En ejecución", running: true },
] as const;

// -----------------------------------------------------------------------------
// PRESETS ESCRITORIO — edita HERO_DESK_*_PARTS; el `shell` se arma solo.
// Todas las clases son literales en este archivo para que Tailwind las incluya en el CSS.
//
// ¿No ves cambios al guardar? Reinicia `npm run dev` o fuerza hard refresh (caché del navegador).
// -----------------------------------------------------------------------------

/** Ventana Google (z-10). Escritorio: lg:absolute + posiciones originales. */
export const HERO_DESK_GOOGLE_PARTS = {
  base: "hero-desk-window overflow-visible lg:absolute",
  z: "z-10",
  desktop: "lg:left-[15%] lg:-translate-x-[45%] lg:top-[-140px] lg:w-[720px]",
} as const;

/** Ventana Servicios (z-20). */
export const HERO_DESK_SERVICES_PARTS = {
  base: "hero-desk-window overflow-visible lg:absolute",
  z: "z-20",
  desktop: "lg:left-[35%] lg:top-[-20px] lg:w-[520px]",
} as const;

/** Ventana CMD (z-50): por encima de la franja. */
export const HERO_DESK_CMD_PARTS = {
  base: "hero-desk-window overflow-visible lg:absolute",
  z: "z-50",
  desktop: "lg:right-[-20px] lg:bottom-[-45px] lg:w-[650px]",
} as const;

/**
 * Móvil/tablet: mismas posiciones % y px que escritorio, dentro de un artboard fijo
 * que luego se escala al ancho del contenedor (no al % del viewport estrecho).
 */
export const HERO_DESK_MOBILE_GOOGLE_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-10",
  position: "left-[29%] -translate-x-[40%] top-[-125px] w-[680px]",
} as const;

export const HERO_DESK_MOBILE_SERVICES_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-20",
  position: "left-[44%] top-[-10px] w-[510px]",
} as const;

export const HERO_DESK_MOBILE_CMD_PARTS = {
  base: "hero-desk-window absolute overflow-visible",
  z: "z-50",
  position: "right-[162px] bottom-[0px] w-[500px]",
} as const;

function joinDeskClasses(parts: readonly string[]) {
  return parts.join(" ");
}

/** Stage escritorio (sin cambios respecto al diseño original). */
export const HERO_DESK_STAGE_DESKTOP_CLASS =
  "relative overflow-visible lg:block lg:min-h-[560px] lg:pb-52 lg:pt-0";

/** Ancho lógico del mazo (proporciones de escritorio); solo &lt;lg. */
const HERO_DESK_ARTBOARD_W = 980;
/** min-h 560 + pb móvil */
const HERO_DESK_ARTBOARD_H = 768;
/** Sangrado inferior del CMD hacia la franja StripSystemStatus. */
const HERO_DESK_MOBILE_STRIP_OVERLAP = 48;

/** Contenedor interno del mazo (pb-52 ancla el bottom del CMD). */
export const HERO_DESK_SCALE_INNER = "relative min-h-[560px] w-full pb-52";

/** Móvil: menos padding inferior para acercar el CMD a la franja de logos. */
export const HERO_DESK_MOBILE_INNER = "relative min-h-[560px] w-full pb-40";

type HeroStatsMatplotlibPanelProps = {
  variant: "efficiency" | "inefficiency";
  className?: string;
};

/** Móvil hero: altura explícita (no compartir con FAQ). Escritorio: contenedor min-h + imagen h-full. */
const HERO_MASCOT_MOBILE_IMG =
  "max-lg:h-44 max-lg:max-h-44 max-lg:w-auto max-lg:max-w-[min(40vw,13.75rem)]";

/** Fila 1 (pierde horas): mascota recortada (`mascot_computer-hero.webp`, sin márgenes transparentes). */
function HeroHeadlineMascot({ className }: { className?: string }) {
  return (
    <div
      className={`relative z-30 flex w-fit max-w-full shrink-0 min-h-0 flex-col justify-center self-center max-lg:min-h-0 ${className ?? ""}`}
      aria-hidden
    >
      <div className="pointer-events-none relative flex w-fit max-w-full items-center justify-center overflow-hidden max-lg:min-h-0 min-h-20 sm:min-h-23 lg:min-h-25">
        <Image
          src="/logos/mascot_computer-hero.webp"
          alt=""
          width={236}
          height={189}
          quality={85}
          sizes="(max-width: 1023px) 176px, 236px"
          className={`h-full max-h-full w-auto object-contain object-center lg:max-w-full ${HERO_MASCOT_MOBILE_IMG}`}
        />
      </div>
    </div>
  );
}

/**
 * Recorte de `public/hero_stats.webp` (dos paneles en un solo asset: izq. eficiencia, der. ineficiencia).
 * Fila 2 (recupere): eficiencia.
 */
function HeroStatsMatplotlibPanel({ variant, className }: HeroStatsMatplotlibPanelProps) {
  const isGain = variant === "efficiency";
  return (
    <div
      className={`relative z-30 flex min-h-0 min-w-0 flex-col border border-white/9 bg-[#070910] px-1.5 pb-1 pt-1.5 max-lg:w-42 max-lg:shrink-0 lg:flex-1 ${className ?? ""}`}
      aria-hidden
    >
      <div className="pointer-events-none relative w-full flex-1 overflow-hidden rounded-sm bg-[#04060d] max-lg:min-h-16 max-lg:sm:min-h-18 min-h-20 sm:min-h-23 lg:min-h-25">
        <Image
          src="/hero_stats.webp"
          alt=""
          width={2965}
          height={1047}
          quality={80}
          priority={isGain}
          fetchPriority={isGain ? "high" : "low"}
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 38vw, 320px"
          className={`absolute top-0 h-full max-w-none object-cover ${isGain ? "left-0 w-[200%] object-left" : "right-0 left-auto w-[200%] object-right"}`}
        />
      </div>
      <p className="mt-1 text-[9px] leading-tight text-neutral-400 sm:text-[10px]">
        {isGain ? "Menos horas, más margen." : "Más horas manuales, menos resultado."}
      </p>
    </div>
  );
}
/** API estable: `HERO_DESK_PRESETS.google.shell` (igual que antes). */
export const HERO_DESK_PRESETS = {
  google: {
    shell: joinDeskClasses([
      HERO_DESK_GOOGLE_PARTS.base,
      HERO_DESK_GOOGLE_PARTS.z,
      HERO_DESK_GOOGLE_PARTS.desktop,
    ]),
  },
  services: {
    shell: joinDeskClasses([
      HERO_DESK_SERVICES_PARTS.base,
      HERO_DESK_SERVICES_PARTS.z,
      HERO_DESK_SERVICES_PARTS.desktop,
    ]),
  },
  cmd: {
    shell: joinDeskClasses([
      HERO_DESK_CMD_PARTS.base,
      HERO_DESK_CMD_PARTS.z,
      HERO_DESK_CMD_PARTS.desktop,
    ]),
  },
} as const;

export const HERO_DESK_MOBILE_PRESETS = {
  google: {
    shell: joinDeskClasses([
      HERO_DESK_MOBILE_GOOGLE_PARTS.base,
      HERO_DESK_MOBILE_GOOGLE_PARTS.z,
      HERO_DESK_MOBILE_GOOGLE_PARTS.position,
    ]),
  },
  services: {
    shell: joinDeskClasses([
      HERO_DESK_MOBILE_SERVICES_PARTS.base,
      HERO_DESK_MOBILE_SERVICES_PARTS.z,
      HERO_DESK_MOBILE_SERVICES_PARTS.position,
    ]),
  },
  cmd: {
    shell: joinDeskClasses([
      HERO_DESK_MOBILE_CMD_PARTS.base,
      HERO_DESK_MOBILE_CMD_PARTS.z,
      HERO_DESK_MOBILE_CMD_PARTS.position,
    ]),
  },
} as const;

function MagneticCloseWrap({ children }: { children: ReactNode }) {
  return <span className="inline-flex">{children}</span>;
}

function MagneticLineWrap({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
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
          ? "border-b border-white/12 bg-white/6"
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

/** Coincide con Tailwind `max-lg` (viewport &lt; 1024px). */
function useBelowLg() {
  const [belowLg, setBelowLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setBelowLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return belowLg;
}

/** Escala el artboard al ancho del contenedor; mantiene la misma distribución que escritorio. */
function useHeroDeskArtboardScale(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const totalH = HERO_DESK_ARTBOARD_H;

  const [layout, setLayout] = useState({
    scale: 0.4,
    flowHeight: Math.ceil(totalH * 0.4),
    topInset: 88,
  });

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const el = containerRef.current;
      if (!el) return;

      const available = el.clientWidth;
      const scale = Math.min(0.82, Math.max(0.3, (available - 8) / HERO_DESK_ARTBOARD_W));
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const shortLandscape = window.matchMedia(
        "(max-width: 1023px) and (orientation: landscape) and (max-height: 520px)",
      ).matches;
      const topInset = portrait
        ? Math.round(100 * scale)
        : shortLandscape
          ? Math.round(36 * scale)
          : Math.round(48 * scale);
      const stripPull = Math.round(HERO_DESK_MOBILE_STRIP_OVERLAP * scale);
      setLayout({
        scale,
        flowHeight: Math.ceil(totalH * scale) + topInset - stripPull,
        topInset,
      });
    };

    update();
    const raf = requestAnimationFrame(update);

    const el = containerRef.current;
    const ro = el ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [containerRef, enabled, totalH]);

  return layout;
}

function CmdSyntaxLine({ text }: { text: string }) {
  const t = text.trimStart();
  if (t.startsWith("> [OK]")) {
    const tail = t.slice("> [OK]".length);
    return (
      <span>
        <span className="text-neutral-400">&gt; </span>
        <span className="text-emerald-400">[OK]</span>
        <span className="text-emerald-200/88">{tail}</span>
      </span>
    );
  }
  if (t.startsWith("> [INFO]")) {
    const tail = t.slice("> [INFO]".length);
    return (
      <span>
        <span className="text-neutral-400">&gt; </span>
        <span className="text-sky-400">[INFO]</span>
        <span className="text-sky-200/90">{tail}</span>
      </span>
    );
  }
  if (t.startsWith("> [ERROR]")) {
    const tail = t.slice("> [ERROR]".length);
    return (
      <span>
        <span className="text-neutral-400">&gt; </span>
        <span className="text-rose-400">[ERROR]</span>
        <span className="text-rose-200/88">{tail}</span>
      </span>
    );
  }
  if (t.startsWith("> ")) {
    return (
      <span>
        <span className="text-neutral-400">&gt; </span>
        <span className="text-cyan-300">{t.slice(2)}</span>
      </span>
    );
  }
  if (t.startsWith(">")) {
    return (
      <span>
        <span className="text-neutral-400">&gt;</span>
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

/** Título visible en pestaña (alineado con keywords/meta del sitio). */
const AGI_BROWSER_TAB_TITLE = "Diseño web y Automatización";

function AgiTabFavicon({ className }: { className?: string }) {
  return (
    <Image
      src="/favicon.ico"
      alt=""
      width={16}
      height={16}
      className={`shrink-0 rounded-sm ${className ?? "h-3.5 w-3.5"}`}
      aria-hidden
    />
  );
}

function GoogleHomeWindow() {
  const belowLg = useBelowLg();
  const shell = belowLg ? HERO_DESK_MOBILE_PRESETS.google.shell : HERO_DESK_PRESETS.google.shell;
  const [task, setTask] = useState("");
  const [email, setEmail] = useState("");
  const [luckyOpen, setLuckyOpen] = useState(false);
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
    <div className={shell}>
      <LuckyEasterEggModal open={luckyOpen} onClose={() => setLuckyOpen(false)} />
      <div className={`flex flex-col overflow-hidden rounded-md border border-neutral-300/95 bg-white ${SHADOW_GOOGLE}`}>
        <div className="flex h-9 items-center gap-1 border-b border-[#c5c9d0] bg-[#dee1e6] px-1.5">
          <div className="flex min-w-0 w-[74%] max-w-136 items-end gap-0.5 self-end pr-1.5">
            <div className="flex min-w-0 flex-1 basis-0 items-center gap-1.5 rounded-t border border-b-0 border-[#b5bac1] bg-white px-2 py-2 shadow-[0_-1px_0_0_white]">
              <span className="relative h-3.5 w-3.5 shrink-0 rounded-full bg-[conic-gradient(#ea4335_0deg,#fbbc05_90deg,#34a853_180deg,#4285f4_270deg,#ea4335_360deg)] ring-1 ring-neutral-300/75">
                <span className="absolute inset-[3.1px] rounded-full bg-[#4285f4]" />
              </span>
              <span className="min-w-0 truncate text-[11px] font-medium text-neutral-800">Google</span>
            </div>
            <div className="flex min-w-0 flex-1 basis-0 items-center gap-1 rounded-t border border-b-0 border-transparent bg-[#e7eaef] px-2 py-1.5 text-[11px] text-neutral-600">
              <AgiTabFavicon />
              <span className="max-w-21 min-w-0 shrink truncate">agithecreator.com</span>
              <span className="h-3 w-px shrink-0 bg-neutral-400/60" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[10px] leading-tight text-neutral-500 sm:text-[11px]">
                {AGI_BROWSER_TAB_TITLE}
              </span>
            </div>
          </div>
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none text-neutral-500"
            aria-hidden
          >
            +
          </span>
          <div className="ml-auto flex shrink-0 items-center pl-1.5">
            <WinControlsDecorative variant="chrome" />
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-neutral-200 bg-white px-2 py-1.5">
          <div className="flex shrink-0 items-center gap-0.5">
            <span className={navIconBtn} title="Atrás (decorativo)" aria-hidden>
              <ChevronLeft className="h-4 w-4" />
            </span>
            <span className={navIconBtn} title="Adelante (decorativo)" aria-hidden>
              <ChevronRight className="h-4 w-4" />
            </span>
            <span className={navIconBtn} title="Recargar (decorativo)" aria-hidden>
              <RotateCw className="h-3.5 w-3.5" />
            </span>
            <span className={navIconBtn} title="Inicio (decorativo)" aria-hidden>
              <Home className="h-4 w-4" />
            </span>
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

          <div className="max-w-xs space-y-4">
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

          <div className="mt-6 flex max-w-xs flex-col gap-3">
            <button
              type="submit"
              className="inline-flex w-full min-h-10.5 cursor-pointer items-center justify-center gap-1 rounded-md bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1558b0]"
            >
              <span>Enviar diagnóstico</span>
              <span className="text-base leading-none" aria-hidden>
                &gt;
              </span>
            </button>
            <button
              type="button"
              onClick={() => setLuckyOpen(true)}
              className="cursor-pointer self-center text-center text-[12px] font-normal leading-tight text-[#70757a] underline decoration-neutral-300/70 decoration-1 underline-offset-[3px] transition-colors hover:text-[#3c4043] hover:decoration-neutral-400"
            >
              Voy a tener suerte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServicesMscWindow() {
  const belowLg = useBelowLg();
  const shell = belowLg ? HERO_DESK_MOBILE_PRESETS.services.shell : HERO_DESK_PRESETS.services.shell;

  return (
    <div className={shell}>
      <div className={`flex h-full min-h-57.5 flex-col overflow-hidden rounded-md border border-[#aab9cc]/90 bg-[#d7e2ee] sm:min-h-67.5 lg:min-h-75 xl:min-h-80 ${SHADOW_SERVICES}`}>
        <div className="flex h-7 shrink-0 items-center gap-4 border-b border-[#9eaebf] bg-[#c9d6e8] px-2 text-[10px] font-medium text-neutral-800 sm:h-8 sm:text-[11px]">
          <span className="px-1 py-0.5 hover:bg-black/5">Archivo</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Acción</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Ver</span>
          <span className="px-1 py-0.5 hover:bg-black/5">Ayuda</span>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="flex w-25 shrink-0 flex-col border-r border-[#aab9cc] bg-[#c9d6e8] py-3 pl-2 pr-1 text-[10px] font-semibold leading-snug text-neutral-800 sm:w-29.5 sm:text-[11px]">
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

const CMD_MAX_LINES = 48;
/** Velocidad escritura carácter a carácter (ms por carácter). */
const CMD_TYPE_MS = 44;
/** Pausa al terminar una línea completa antes de la siguiente. */
const CMD_LINE_PAUSE_MS = 480;
/** Pausa al cerrar un ciclo completo del guion antes de repetir. */
const CMD_LOOP_GAP_MS = 3000;
const CMD_DIAGNOSTIC_LINE_MS = 320;

type CmdLineRow = { id: string; text: string };

function CmdTypingWindow({
  reduceMotion,
  diagnosticHover,
}: {
  reduceMotion: boolean;
  diagnosticHover: boolean;
}) {
  const belowLg = useBelowLg();
  const shell = belowLg ? HERO_DESK_MOBILE_PRESETS.cmd.shell : HERO_DESK_PRESETS.cmd.shell;
  const [lines, setLines] = useState<CmdLineRow[]>([]);
  const [currentChars, setCurrentChars] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(0);
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);
  const diagGenRef = useRef(0);
  const diagnosticHoverRef = useRef(false);

  useEffect(() => {
    diagnosticHoverRef.current = diagnosticHover;
  }, [diagnosticHover]);

  const pushCompleteLine = useCallback((text: string) => {
    keyRef.current += 1;
    const id = `c-${keyRef.current}`;
    setLines((prev) => {
      const next = [...prev, { id, text }];
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
      if (diagnosticHoverRef.current) {
        timeoutId = setTimeout(step, 100);
        return;
      }
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
        const wrappedCycle =
          lineIdxRef.current % CMD_FEED_LINES.length === 0 && lineIdxRef.current >= CMD_FEED_LINES.length;
        timeoutId = setTimeout(step, wrappedCycle ? CMD_LOOP_GAP_MS : CMD_LINE_PAUSE_MS);
      }
    };

    timeoutId = setTimeout(step, 550);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reduceMotion, pushCompleteLine]);

  useEffect(() => {
    if (reduceMotion || !diagnosticHover) return;
    diagGenRef.current += 1;
    const gen = diagGenRef.current;
    const timers = CMD_DIAGNOSTIC_BURST.map((text, i) =>
      setTimeout(() => {
        if (diagGenRef.current !== gen) return;
        pushCompleteLine(text);
      }, CMD_DIAGNOSTIC_LINE_MS * i),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [diagnosticHover, reduceMotion, pushCompleteLine]);

  return (
    <div className={shell}>
      <div className={`flex flex-col overflow-hidden rounded-md ${CMD_PANEL} ${SHADOW_CMD}`}>
        <WindowsTitleBar title="Símbolo del sistema — cmd.exe" variant="dark">
          <WinControlsDecorative variant="dark" />
        </WindowsTitleBar>

        <div
          ref={scrollRef}
          className="hero-cmd-body h-65 overflow-y-auto border-t border-white/10 bg-black p-3.5 font-mono text-[10px] leading-relaxed sm:h-75 sm:p-4 sm:text-[11px]"
        >
          <MagneticLineWrap>
            <p className="mb-1 text-neutral-400">Microsoft Windows [Versión 10.0.19045]</p>
          </MagneticLineWrap>
          <MagneticLineWrap>
            <p className="mb-2 text-neutral-400">(c) Microsoft Corporation.</p>
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
              <span className="text-neutral-400">C:\Users\AGITHECREATOR&gt;</span>{" "}
              <span className="inline-block h-3 w-1.5 animate-pulse align-middle bg-cyan-400/90" aria-hidden />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EngineerDeskStack({
  reduceMotion,
  diagnosticHover,
}: {
  reduceMotion: boolean;
  diagnosticHover: boolean;
}) {
  const belowLg = useBelowLg();
  const float = belowLg && !reduceMotion;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, flowHeight, topInset } = useHeroDeskArtboardScale(containerRef, belowLg);

  const deskWindows = (
    <>
      <GoogleHomeWindow />
      <CmdTypingWindow reduceMotion={reduceMotion} diagnosticHover={diagnosticHover} />
      <ServicesMscWindow />
    </>
  );

  if (!belowLg) {
    return (
      <div className="relative mx-auto w-full overflow-visible">
        <div className={HERO_DESK_STAGE_DESKTOP_CLASS}>
          <GoogleHomeWindow />
          <CmdTypingWindow reduceMotion={reduceMotion} diagnosticHover={diagnosticHover} />
          <ServicesMscWindow />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-desk-stack relative mx-auto w-full min-w-0 overflow-x-clip overflow-y-visible"
    >
      <div className="relative w-full min-w-0" style={{ height: flowHeight }}>
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${float ? "hero-desk-float" : ""}`}
          style={{ top: topInset }}
        >
          <div
            style={{
              width: HERO_DESK_ARTBOARD_W,
              height: HERO_DESK_ARTBOARD_H,
              transform: `scale(${scale}) translateX(2.5%)`,
              transformOrigin: "top center",
            }}
          >
            <div className={HERO_DESK_MOBILE_INNER} style={{ width: HERO_DESK_ARTBOARD_W }}>
              {deskWindows}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { openModal } = useContactModal();

  const handleHeroCtaClick = () => {
    trackEvent("hero_cta_click", { location: "hero" });
    openModal();
  };
  const reduceMotion = usePrefersReducedMotion();
  const [diagnosticHover, setDiagnosticHover] = useState(false);

  return (
      <section className="hero-engineer relative isolate z-30 w-full overflow-visible bg-[#04060d] pt-27 pb-5 max-lg:landscape:pt-24 sm:pt-28 sm:pb-6 lg:pt-20 lg:pb-8">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-tech-grid absolute inset-0" />
          <div className="hero-tech-glow absolute inset-0" />
          <div className="hero-grain hero-grain-fine absolute inset-0 opacity-2" />
          <div className="hero-tech-fade absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1580px] min-h-0 flex-1 items-center overflow-visible px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="grid w-full min-w-0 items-start gap-8 overflow-visible max-lg:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 xl:gap-16">
            <div className="hero-headline-enter relative z-50 max-w-[min(100%,540px)] space-y-3 lg:max-w-[min(100%,560px)] pointer-events-none">
              <p className="pointer-events-auto inline-flex w-fit border border-white/15 bg-white/4.5 px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.13em] text-neutral-400 sm:text-[9px] sm:tracking-[0.14em]">
                Sistemas que trabajan solos
              </p>

              <h1 className="pointer-events-auto m-0 p-0">
                <span className="sr-only">Tu negocio pierde horas. Yo hago que las recupere.</span>
                <div aria-hidden className="relative isolate z-20 space-y-2 overflow-visible sm:space-y-2.5">
                  <div className="relative z-10 grid w-fit max-w-full items-center max-lg:gap-x-4 max-lg:grid-cols-[auto_auto] max-lg:justify-start lg:grid-cols-[auto_auto] lg:justify-start lg:gap-3">
                    <div className="hero-headline-row relative z-10 flex min-w-0 shrink-0 flex-col justify-center font-semibold leading-[0.93] tracking-[-0.042em] text-[clamp(1.75rem,7.2vw,2.15rem)] max-lg:pr-0.5 lg:text-[clamp(2.05rem,3.9vw,3.75rem)]">
                      <span className="text-neutral-200/88 lg:block lg:whitespace-nowrap">Tu negocio</span>
                      <span className="text-[#f2f0ec] lg:block lg:whitespace-nowrap">pierde horas.</span>
                    </div>
                    <HeroHeadlineMascot />
                  </div>

                  <div className="relative z-10 grid w-fit max-w-full items-center max-lg:gap-x-4 max-lg:w-full max-lg:grid-cols-[auto_auto] max-lg:justify-end max-lg:justify-self-end lg:grid-cols-[minmax(0,1fr)_auto] lg:w-fit lg:items-stretch lg:justify-self-auto lg:gap-3">
                    <HeroStatsMatplotlibPanel variant="efficiency" />
                    <div className="hero-headline-row hero-headline-row--recover relative z-10 flex min-w-0 shrink-0 flex-col flex-nowrap items-end justify-center text-right font-semibold leading-[0.93] tracking-[-0.042em] text-[clamp(1.75rem,7.2vw,2.15rem)] max-lg:pl-0.5 lg:text-[clamp(2.05rem,3.9vw,3.75rem)]">
                      <span className="block whitespace-nowrap text-neutral-200/88">Yo hago que</span>
                      <span className="block whitespace-nowrap text-[#f2f0ec]">las recupere.</span>
                    </div>
                  </div>
                </div>
              </h1>

              <ul className="pointer-events-auto mt-5 space-y-1.5 pt-1 text-[15px] leading-tight text-neutral-200">
                <li className="flex items-start gap-3">
                  <span className="mt-[2px] shrink-0 text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  Reservas automáticas
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[2px] shrink-0 text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  Facturas que se envían solas
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[2px] shrink-0 text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  Clientes sincronizados
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-[2px] shrink-0 text-emerald-300" aria-hidden>
                    ✓
                  </span>
                  Webs hechas para vender
                </li>
              </ul>

              <p
                className="pointer-events-auto max-w-130 text-[clamp(0.95rem,1.6vw,1.05rem)] leading-[1.35] text-neutral-400"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                Webs, automatizaciones y herramientas que trabajan solas para que no tengas que perder tiempo en tareas
                repetitivas.
              </p>

              <div className="pointer-events-auto flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleHeroCtaClick}
                  onMouseEnter={() => setDiagnosticHover(true)}
                  onMouseLeave={() => setDiagnosticHover(false)}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#05070f] shadow-sm transition-colors hover:bg-neutral-100"
                >
                  <RotateCw className="h-4 w-4 shrink-0" aria-hidden />
                  Quiero ahorrar tiempo
                </button>
              </div>

              <p className="pointer-events-auto max-w-130 text-[12px] leading-relaxed text-neutral-400">
                Menos trabajo manual. Menos errores. Más tiempo para el negocio.
              </p>
            </div>

            <div className="relative z-40 min-w-0 overflow-visible max-lg:-mb-38 max-lg:landscape:-mb-28 max-lg:pt-1 lg:-mb-52 xl:-mb-56">
              <div className="relative z-1">
                <EngineerDeskStack reduceMotion={reduceMotion} diagnosticHover={diagnosticHover} />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-cmd-body {
            scroll-behavior: smooth;
          }
          @keyframes hero-desk-float {
            0%,
            100% {
              transform: translate(-50%, 0);
            }
            50% {
              transform: translate(-50%, -7px);
            }
          }
          .hero-desk-float {
            animation: hero-desk-float 4.6s ease-in-out infinite;
          }
          @keyframes hero-headline-enter {
            from {
              opacity: 0;
              transform: translateX(-28px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .hero-headline-enter {
            animation: hero-headline-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-cmd-body {
              scroll-behavior: auto;
            }
            .hero-desk-float {
              animation: none;
            }
            .hero-headline-enter {
              animation: none;
              opacity: 1;
              transform: none;
            }
          }
          .hero-tech-grid {
            background-image:
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            opacity: 1;
          }
          .hero-tech-glow {
            background: radial-gradient(ellipse 92% 74% at 70% 42%, rgba(56, 189, 248, 0.02), transparent 55%);
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
  );
}
