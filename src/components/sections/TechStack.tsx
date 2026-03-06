"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { TechStackParticlesCanvas } from "@/components/ui/TechStackParticlesCanvas";
import { ConnectionParticlesCanvas } from "@/components/ui/ConnectionParticlesCanvas";
import { TokenOptimizer, type OrchestrationMode } from "@/components/ui/TokenOptimizer";
import {
  SiAirtable,
  SiAndroid,
  SiAngular,
  SiAnthropic,
  SiChatbot,
  SiCloudflare,
  SiCss,
  SiCanva,
  SiGit,
  SiGooglecloud,
  SiGooglegemini,
  SiGithubcopilot,
  SiHtml5,
  SiJavascript,
  SiMeta,
  SiMake,
  SiNodedotjs,
  SiOctopusdeploy,
  SiOpenai,
  SiPostgresql,
  SiReact,
  SiRobotframework,
  SiSupabase,
  SiTypescript,
  SiVercel,
  SiVuedotjs,
  SiZapier,
} from "react-icons/si";

import { Lock } from "lucide-react";

type PanelKey = "ai" | "frontend" | "backend" | "automation";

type Tech = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  premium?: boolean;
  context?: string;
};

type Panel = {
  key: PanelKey;
  title: string;
  color: string;
  items: Tech[];
};


type AiTabKey = "razonamiento" | "codigo" | "agentes";

const PANELS: Panel[] = [
  {
    key: "ai",
    title: "AI-Driven Development (Next-Gen)",
    color: "#FFD700", // electric yellow (radar Seguridad)
    items: [
      { label: "OpenAI GPT-4o", Icon: SiOpenai, premium: true, context: "Model routing & quality" },
      { label: "ChatGPT", Icon: SiChatbot, premium: true, context: "Product UX & workflows" },
      { label: "Claude Sonnet", Icon: SiAnthropic, premium: true, context: "Long-context reasoning" },
      { label: "Gemini Nano", Icon: SiGooglegemini, premium: true, context: "Fast on-device style" },
      { label: "Groq", Icon: SiRobotframework, premium: true, context: "Ultra-low latency inference" },
      { label: "Qwen", Icon: SiMeta, premium: true, context: "Open models & tooling" },
      { label: "Antigravity", Icon: SiCloudflare, premium: true, context: "Experimental agent stack" },
      { label: "Cursor", Icon: SiOpenai, premium: true, context: "AI-assisted refactors" },
      { label: "Copilot", Icon: SiGithubcopilot, premium: true, context: "Pair-programming assistant" },
    ],
  },
  {
    key: "frontend",
    title: "Desarrollo Frontend & Mobile",
    color: "#22D3EE", // cyan/sky clean
    items: [
      { label: "React Native", Icon: SiReact, context: "Mobile UI systems" },
      { label: "Android", Icon: SiAndroid, context: "Native constraints & delivery" },
      { label: "TypeScript", Icon: SiTypescript, context: "Typed DX & scalable apps" },
      { label: "Vue.js", Icon: SiVuedotjs, context: "Component architecture" },
      { label: "Angular", Icon: SiAngular, context: "Enterprise frontends" },
      { label: "JavaScript", Icon: SiJavascript, context: "Core language mastery" },
      { label: "HTML5", Icon: SiHtml5, context: "Semantic layout" },
      { label: "CSS3", Icon: SiCss, context: "Premium UI styling" },
    ],
  },
  {
    key: "backend",
    title: "Backend, Cloud & Infraestructura",
    color: "#19C37D", // neon green (radar IA/AUTO)
    items: [
      { label: "Node.js", Icon: SiNodedotjs, context: "APIs & backend services" },
      { label: "Supabase", Icon: SiSupabase, context: "Backend & Realtime Auth" },
      { label: "PostgreSQL", Icon: SiPostgresql, context: "Schema design & integrity" },
      { label: "Google Cloud", Icon: SiGooglecloud, context: "Cloud deployments" },
      { label: "Cloudflare", Icon: SiCloudflare, context: "Edge & security" },
      { label: "Vercel", Icon: SiVercel, context: "Production shipping" },
    ],
  },
  {
    key: "automation",
    title: "Automatización & Ecosistema",
    color: "#8B5CF6", // vibrant violet
    items: [
      { label: "Make", Icon: SiMake, context: "Automation workflows" },
      { label: "n8n", Icon: SiOctopusdeploy, context: "Advanced Automation" },
      { label: "Zapier", Icon: SiZapier, context: "API workflows" },
      { label: "Landbot", Icon: SiChatbot, context: "Personalized Chatbot" },
      { label: "Airtable", Icon: SiAirtable, context: "Ops databases" },
      {
        label: "Canva",
        Icon: SiCanva,
        context: "UI/UX & Assets",
      },
      { label: "Encryption", Icon: Lock, context: "Data protection" },
      { label: "Git", Icon: SiGit, context: "Clean versioning" },
    ],
  },
];

const AI_GLASS = new Set(["OpenAI GPT-4o", "ChatGPT", "Claude Sonnet", "Gemini Nano", "Groq", "Qwen", "Antigravity", "Cursor"]);

const ORBITAL_RELATIONS: Record<string, string[]> = {
  Supabase: ["PostgreSQL", "Node.js", "Vercel", "Google Cloud"],
  TypeScript: ["React Native", "JavaScript", "Angular", "Vue.js"],
  Make: ["Airtable", "Encryption", "Git"],
  "OpenAI GPT-4o": ["ChatGPT", "Claude Sonnet", "Gemini Nano", "Groq", "Qwen"],
};

const AI_TAB_ITEMS: Record<AiTabKey, string[]> = {
  razonamiento: ["Claude Sonnet", "OpenAI GPT-4o", "Qwen"],
  codigo: ["Cursor", "Antigravity", "Groq"],
  agentes: ["ChatGPT", "Gemini Nano", "Copilot"],
};

function TechPill({
  tech,
  color,
  premium,
  activeLabel,
  relatedLabels,
  setActiveLabel,
  onHoverLabel,
  neonBoost = 1,
}: {
  tech: Tech;
  color: string;
  premium: boolean;
  activeLabel: string | null;
  relatedLabels: Set<string>;
  setActiveLabel: (label: string | null) => void;
  onHoverLabel?: (label: string | null) => void;
  /** Subtle glow intensity multiplier (used for AI panel orchestration selector) */
  neonBoost?: number;
}) {
  const border = `1px solid ${hexToRgba(color, 0.55 * neonBoost)}`;
  const text = hexToRgba(color, 0.92);
  const isAiGlass = premium && AI_GLASS.has(tech.label);

  const baseBg =
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.00) 60%), rgba(255,255,255,0.02)";

  const glowBase = `inset 0 0 12px 2px ${hexToRgba(color, 0.30)}`;
  const glowHover = `inset 0 0 12px 2px ${hexToRgba(color, 0.60)}`;
  const isRelated = activeLabel ? relatedLabels.has(tech.label) : false;
  const isCore = activeLabel === tech.label && ORBITAL_RELATIONS[tech.label];

  // UX: mantenemos una anchura mínima para badges “de sistema” (p.ej. Canva)
  // y evitar que queden demasiado estrechos respecto a Airtable/Supabase.
  const minWidth = tech.label === "Canva" ? 148 : undefined;

  const glowBoost = premium ? neonBoost : 1;

  return (
    <div
      className={
        "tech-pill relative inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 backdrop-blur-sm bg-transparent overflow-hidden"
      }
      style={{
        border,
        color: text,
        background: baseBg,
        minWidth,
        boxShadow: isRelated
          ? `inset 0 0 12px 2px ${hexToRgba(color, 0.45 * glowBoost)}, 0 0 22px ${hexToRgba(color, 0.18 * glowBoost)}`
          : isCore
            ? `inset 0 0 14px 3px ${hexToRgba(color, 0.55 * glowBoost)}, 0 0 28px ${hexToRgba(color, 0.22 * glowBoost)}`
            : `inset 0 0 12px 2px ${hexToRgba(color, 0.30 * glowBoost)}`,
      }}
      onMouseEnter={() => {
        setActiveLabel(tech.label);
        onHoverLabel?.(tech.label);
      }}
      onMouseLeave={() => {
        setActiveLabel(null);
        onHoverLabel?.(null);
      }}
      data-tech-label={tech.label}
    >
      {/* Orbital highlight ring for related pills */}
      {isRelated && (
        <span
          aria-hidden="true"
          className="tech-pill__orbital"
          style={{ borderColor: color }}
        />
      )}
      {/* liquid glass / fracture pattern for AI bubbles */}
      {isAiGlass ? (
        <span
          aria-hidden="true"
          className="tech-pill__fracture"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 14px), repeating-linear-gradient(25deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)",
          }}
        />
      ) : null}

      {/* hover touch pressure */}
      <span
        aria-hidden="true"
        className="tech-pill__press"
        style={{
          boxShadow: `inset 0 0 12px 2px ${hexToRgba(color, 0.18)}`,
        }}
      />

      <div className="tech-pill__content relative flex items-center gap-3">
        <tech.Icon className="h-4 w-4" />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-medium tracking-wide">{tech.label}</span>
          </div>
          {tech.context ? (
            <div className="tech-pill__context text-[10px] leading-tight opacity-0 transition-opacity duration-200">
              {tech.context}
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        .tech-pill:hover {
          box-shadow: ${glowHover};
        }

        .tech-pill:hover {
          transform: translateZ(0);
        }

        .tech-pill__content {
          transition: transform 200ms ease-out;
        }

        .tech-pill:hover .tech-pill__content {
          transform: scale(1.03);
        }

        .tech-pill:hover .tech-pill__context {
          opacity: 0.9;
        }

        .tech-pill__press {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          opacity: 0;
          transition: opacity 80ms linear;
          pointer-events: none;
        }

        .tech-pill:hover .tech-pill__press {
          opacity: 1;
        }

        .tech-pill__fracture {
          position: absolute;
          width: 200%;
          height: 200%;
          left: -50%;
          top: -50%;
          opacity: 0.15;
          pointer-events: none;
          transform: translate3d(0, 0, 0);
          animation: fractureDrift 20s linear infinite;
          mask-image: radial-gradient(circle at 35% 30%, black 35%, transparent 70%);
          -webkit-mask-image: radial-gradient(circle at 35% 30%, black 35%, transparent 70%);
        }

        .tech-pill:hover .tech-pill__fracture {
          animation-duration: 13.3s; /* ~50% faster */
        }

        /* AI scan line: runs occasionally for Next-Gen feel */
        .tech-pill__scan {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          pointer-events: none;
          opacity: 0.0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.14),
            transparent
          );
          transform: translateX(-120%);
          animation: scanSweep 5s linear infinite;
        }

        @keyframes scanSweep {
          0% {
            opacity: 0;
            transform: translateX(-120%);
          }
          12% {
            opacity: 0;
          }
          18% {
            opacity: 0.75;
          }
          30% {
            opacity: 0;
            transform: translateX(120%);
          }
          100% {
            opacity: 0;
            transform: translateX(120%);
          }
        }

        @keyframes fractureDrift {
          from {
            transform: translate3d(-6%, -6%, 0);
          }
          to {
            transform: translate3d(6%, 6%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-pill__fracture {
            animation: none;
          }
          .tech-pill__content {
            transition: none;
          }
        }
      `}</style>

      {isAiGlass ? <span aria-hidden="true" className="tech-pill__scan" /> : null}
    </div>
  );
}

function PanelCard({ panel }: { panel: Panel }) {
  const premium = panel.key === "ai";
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [orchestration, setOrchestration] = useState<OrchestrationMode>("haiku");
  // optional: bubble hover -> parent “data stream” effect
  const onHoverLabel = useMemo(() => (typeof window !== "undefined" ? (window as any).__techStackHoverLabel : undefined), []);

  const aiTab: AiTabKey = useMemo(() => {
    switch (orchestration) {
      case "haiku":
        return "razonamiento";
      case "sonnet":
        return "codigo";
      case "gpt":
        return "agentes";
      default:
        return "razonamiento";
    }
  }, [orchestration]);

  const neonBoost = useMemo(() => {
    switch (orchestration) {
      case "haiku":
        return 0.88;
      case "sonnet":
        return 1.0;
      case "gpt":
        return 1.15;
      default:
        return 1.0;
    }
  }, [orchestration]);

  const relatedLabels = useMemo(() => {
    if (!activeLabel) return new Set<string>();
    const rel = ORBITAL_RELATIONS[activeLabel] ?? [];
    return new Set<string>(rel);
  }, [activeLabel]);

  return (
    <div
      className="glass-card relative overflow-hidden p-4"
      style={{
        borderColor: hexToRgba(panel.color, 0.38),
        boxShadow: `0 0 0 1px ${hexToRgba(panel.color, 0.14)}, 0 0 42px ${hexToRgba(panel.color, 0.08)}, inset 0 0 18px rgba(255,255,255,0.02)`,
      }}
    >
      {/* connection particles background (subtle) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.28]">
        <ConnectionParticlesCanvas intensity={0.45} color={panel.color} />
      </div>

      <div className="mb-5 flex items-center gap-4">
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: hexToRgba(panel.color, 0.95) }}
        >
          {panel.title}
        </h3>
        <div
          className="h-px flex-1"
          style={{ background: `linear-gradient(to right, ${hexToRgba(panel.color, 0.45)}, transparent)` }}
        />
      </div>

      {premium ? (
        <div className="mb-4">
          <TokenOptimizer value={orchestration} onChange={setOrchestration} accent={panel.color} />
        </div>
      ) : null}

      {/*
        Nota UX: al añadir un badge extra (Canva), aumentamos ligeramente el gap
        y permitimos wrap natural para evitar sensación de "amontonamiento".
      */}
      <div className="flex flex-wrap gap-3.5">
        {(premium
          ? panel.items.filter((t) => AI_TAB_ITEMS[aiTab].includes(t.label))
          : panel.items
        ).map((t) => (
          <TechPill
            key={t.label}
            tech={t}
            color={panel.color}
            premium={premium}
            activeLabel={activeLabel}
            relatedLabels={relatedLabels}
            setActiveLabel={setActiveLabel}
            onHoverLabel={onHoverLabel}
            neonBoost={neonBoost}
          />
        ))}
      </div>
    </div>
  );
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function TechStack() {
  // stable memo for render perf
  const panels = useMemo(() => PANELS, []);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Record<PanelKey, HTMLDivElement | null>>({
    ai: null,
    frontend: null,
    backend: null,
    automation: null,
  });

  const streamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRafRef = useRef<number | null>(null);

  // Hover state for triggering data stream
  const [streamActive, setStreamActive] = useState<{
    from: "supabase" | "airtable";
    t0: number;
  } | null>(null);

  const setPanelRef = (key: PanelKey) => (el: HTMLDivElement | null) => {
    panelRefs.current[key] = el;
  };

  const onGlobalHoverLabel = (label: string | null) => {
    if (label === "Supabase") {
      setStreamActive({ from: "supabase", t0: performance.now() });
      return;
    }
    if (label === "Airtable") {
      setStreamActive({ from: "airtable", t0: performance.now() });
      return;
    }
    // let the current animation finish; no immediate cancel
  };

  // bridge callback to PanelCard without prop drilling (keeps file changes minimal)
  useEffect(() => {
    (window as any).__techStackHoverLabel = onGlobalHoverLabel;
    return () => {
      delete (window as any).__techStackHoverLabel;
    };
  }, [onGlobalHoverLabel]);

  useEffect(() => {
    const grid = gridRef.current;
    const canvas = streamCanvasRef.current;
    if (!grid || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = grid.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(grid);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    const canvas = streamCanvasRef.current;
    if (!grid || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!streamActive) return;

    // Resolve origin/destination points (in grid-local coords)
    const automationEl = panelRefs.current.automation;
    if (!automationEl) return;

    const originLabel = streamActive.from === "supabase" ? "Supabase" : "Airtable";
    const originEl = grid.querySelector<HTMLElement>(`[data-tech-label="${originLabel}"]`);
    if (!originEl) return;

    const gridRect = grid.getBoundingClientRect();
    const aRect = originEl.getBoundingClientRect();
    const bRect = automationEl.getBoundingClientRect();

    const ax = aRect.left - gridRect.left + aRect.width * 0.9;
    const ay = aRect.top - gridRect.top + aRect.height * 0.5;
    const bx = bRect.left - gridRect.left + bRect.width * 0.15;
    const by = bRect.top - gridRect.top + bRect.height * 0.3;

    const color = streamActive.from === "supabase" ? "#19C37D" : "#8B5CF6";

    const duration = 650; // ms
    const particles = Array.from({ length: 18 }).map((_, i) => ({
      o: i / 18,
      r: 1 + (i % 3) * 0.35,
    }));

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const render = (now: number) => {
      const t = Math.min(1, (now - streamActive.t0) / duration);
      const k = easeOutCubic(t);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base beam
      ctx.lineWidth = 1;
      ctx.strokeStyle = hexToRgba(color, 0.22 * (1 - t));
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Moving bright head
      const hx = ax + (bx - ax) * k;
      const hy = ay + (by - ay) * k;
      ctx.fillStyle = hexToRgba(color, 0.55 * (1 - t * 0.35));
      ctx.beginPath();
      ctx.arc(hx, hy, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Trail particles
      for (const p of particles) {
        const tt = Math.max(0, Math.min(1, k - p.o));
        const px = ax + (bx - ax) * tt;
        const py = ay + (by - ay) * tt;
        const alpha = (1 - p.o) * (1 - t) * 0.35;
        ctx.fillStyle = hexToRgba(color, alpha);
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (t < 1) {
        streamRafRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (streamRafRef.current) cancelAnimationFrame(streamRafRef.current);
    streamRafRef.current = requestAnimationFrame(render);

    return () => {
      if (streamRafRef.current) cancelAnimationFrame(streamRafRef.current);
    };
  }, [streamActive]);

  return (
    <section id="stack" className="text-white">
      <FadeIn className="glass-card neon-border p-4 sm:p-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            TECH STACK
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent ml-4" />
        </div>

        <div ref={gridRef} className="relative">
          <canvas
            ref={streamCanvasRef}
            className="pointer-events-none absolute inset-0 z-10"
            aria-hidden="true"
          />

          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {panels.map((p) => (
              <div key={p.key} ref={setPanelRef(p.key)}>
                <PanelCard panel={p} />
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
