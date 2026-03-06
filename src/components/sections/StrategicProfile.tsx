"use client";

import React, { useMemo, useRef, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { KeywordParticles } from "@/components/ui/KeywordParticles";

type AxisKey = "seguridad" | "ia" | "ux" | "cloud" | "negocio";

const AXES: Array<{
  key: AxisKey;
  label: string;
  color: string;
  value: number; // 0..100
}> = [
  { key: "seguridad", label: "Seguridad", color: "#FFD700", value: 90 },
  { key: "ia", label: "IA/Auto", color: "#19C37D", value: 85 },
  { key: "ux", label: "UX", color: "#3B82F6", value: 70 },
  { key: "cloud", label: "Cloud", color: "#F38020", value: 80 },
  { key: "negocio", label: "Negocio", color: "#8B5CF6", value: 75 },
];

const TECH_RAIN_WORDS = [
  "Make",
  "PostgreSQL",
  "CRM",
  "Data Integrity",
  "Scalability",
  "Supabase",
] as const;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (Math.PI / 180) * angleDeg;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function polygonPoints(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  startAngleDeg: number
) {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < sides; i++) {
    const a = startAngleDeg + (360 / sides) * i;
    pts.push(polarToXY(cx, cy, r, a));
  }
  return pts;
}

function pointsToAttr(pts: Array<{ x: number; y: number }>) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

function RadarHud() {
  // Interactive radar (no tooltips). Professional focus on hover of nodes.

  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 135;
  const sides = 5;
  const startAngle = -90; // top

  const [active, setActive] = useState<AxisKey | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  const ringR = useMemo(() => [0.25, 0.5, 0.75, 1].map((k) => k * radius), [radius]);
  const outer = useMemo(
    () => polygonPoints(cx, cy, radius, sides, startAngle),
    [cx, cy, radius, sides, startAngle]
  );

  const valuePoly = useMemo(() => {
    return AXES.map((axis, idx) => {
      const a = startAngle + (360 / sides) * idx;
      const r = (axis.value / 100) * radius;
      return polarToXY(cx, cy, r, a);
    });
  }, [cx, cy, radius, sides, startAngle]);

  const axesLines = useMemo(() => {
    return outer.map((p) => ({ x1: cx, y1: cy, x2: p.x, y2: p.y }));
  }, [outer, cx, cy]);

  // Label alignment by vertex position (golden rule)
  const labelMeta = useMemo(() => {
    return AXES.map((axis, idx) => {
      const a = startAngle + (360 / sides) * idx;
      const p = polarToXY(cx, cy, radius + 44, a);

      // Right vertices: left aligned. Left vertices: right aligned. Top: centered.
      const isTop = idx === 0;
      const isRight = p.x > cx + 8;
      const isLeft = p.x < cx - 8;
      const anchor: "start" | "middle" | "end" = isTop ? "middle" : isRight ? "start" : isLeft ? "end" : "middle";

      const dx = anchor === "start" ? 12 : anchor === "end" ? -12 : 0;
      const dy = isTop ? -14 : 0;

      return { axis, x: p.x + dx, y: p.y + dy, anchor };
    });
  }, [cx, cy, radius, sides, startAngle]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="radar-wrap relative mx-auto aspect-square w-full max-w-105 overflow-visible">
        <svg viewBox={`${-16} ${-16} ${size + 32} ${size + 32}`} className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.20)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.10)" />
            </radialGradient>
          </defs>

          {/* grid rings */}
          {ringR.map((r) => {
            const pts = polygonPoints(cx, cy, r, sides, startAngle);
            return (
              <polygon
                key={r}
                points={pointsToAttr(pts)}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeOpacity={0.06}
                strokeWidth={0.5}
                shapeRendering="geometricPrecision"
              />
            );
          })}

          {/* axis lines */}
          {axesLines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={active === AXES[i].key ? AXES[i].color : "rgba(255,255,255,0.10)"}
              strokeOpacity={active === AXES[i].key ? 0.85 : 1}
              strokeWidth={active === AXES[i].key ? 2 : 0.5}
              shapeRendering="geometricPrecision"
              style={{ transition: "stroke-width 200ms ease-out, stroke-opacity 200ms ease-out" }}
            />
          ))}

          {/* value polygon */}
          <polygon
            points={pointsToAttr(valuePoly)}
            fill="url(#radarFill)"
            stroke="#8B5CF6"
            strokeWidth={2}
            className="radar-breath"
            style={{
              filter: "drop-shadow(0 0 12px rgba(139,92,246,0.4)) drop-shadow(0 0 16px rgba(139,92,246,0.22))",
            }}
          />

          {/* nodes (hover focus) */}
          {outer.map((p, idx) => {
            const axis = AXES[idx];
            const isActive = active === axis.key;
            return (
              <g key={axis.key}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill={axis.color}
                  onMouseEnter={() => setActive(axis.key)}
                  onMouseLeave={() => setActive(null)}
                  className={isActive ? "radar-node is-active" : "radar-node"}
                  style={{
                    cursor: "default",
                    filter: isActive
                      ? `drop-shadow(0 0 16px ${axis.color}cc) drop-shadow(0 0 26px ${axis.color}66)`
                      : `drop-shadow(0 0 10px ${axis.color}66) drop-shadow(0 0 18px ${axis.color}33)`,
                  }}
                />
              </g>
            );
          })}

          {/* vertex labels (static alignment) */}
          {labelMeta.map(({ axis, x, y, anchor }) => (
            <text
              key={`label-${axis.key}`}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill={active && active !== axis.key ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.78)"}
              className="radar-label"
              fontSize={10}
              fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
              letterSpacing="0.12em"
            >
              {axis.label.toUpperCase()}
            </text>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {AXES.map((a) => {
            const isActive = active === a.key;
            return (
              <div
                key={a.key}
                className="select-none rounded-full px-3 py-1.5 backdrop-blur-xl"
                style={{
                  background: "transparent",
                  border: isActive ? `1px solid ${a.color}` : "1px solid rgba(139, 92, 246, 0.20)",
                  boxShadow: "inset 0 0 12px rgba(139, 92, 246, 0.10)",
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: a.color,
                      boxShadow: `0 0 12px ${a.color}66`,
                    }}
                  />
                  <span className="text-white/80">{a.label}</span>
                  <span className="tabular-nums text-white/65">{a.value}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        /* Force stable SVG scaling (avoid micro-jitter / bounce artifacts) */
        .radar-node {
          transform-box: fill-box;
          transform-origin: center;
          transition: transform 200ms ease-out;
          will-change: transform;
        }

        .radar-node.is-active {
          transform: scale(1.1);
        }

        /* ultra subtle breathing for the violet polygon */
        .radar-breath {
          animation: radarBreath 6.8s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        @keyframes radarBreath {
          0%,
          100% {
            opacity: 0.92;
          }
          50% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .radar-breath {
            animation: none;
          }
        }

        /* Mobile-only: reduce radar footprint / avoid label clipping on edges */
        @media (max-width: 768px) {
          .radar-wrap {
            max-width: 320px;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }

          :global(.radar-label) {
            font-size: 8px;
            letter-spacing: 0.1em;
          }
        }
      `}</style>
    </div>
  );
}

export function StrategicProfile() {
  return (
    <section id="perfil" className="text-white">
      <FadeIn className="glass-card neon-border p-6 sm:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            VISIÓN TÉCNICA
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          {/* Left: narrative (vertically centered) */}
          <div className="glass-card neon-border relative overflow-hidden px-6 py-12 sm:px-8">
            {/* Technical word rain (single reference inside this card only) */}
            <KeywordParticles words={[...TECH_RAIN_WORDS]} />

            <div className="relative z-20 flex flex-col justify-center items-center h-full min-h-75 bg-transparent text-center">
              <div className="max-w-[62ch]">
                <p className="text-lg text-white/70 leading-relaxed">
                  Con una sólida base en{" "}
                  <span className="font-semibold text-white/85">
                    arquitectura de bases de datos y sistemas CRM complejos
                  </span>
                  , aprendí la importancia de la estructura y la integridad del dato. Hoy conecto
                  interfaces de alto nivel con automatización y sistemas robustos para acelerar el delivery
                  sin perder calidad ni seguridad.
                </p>
              </div>
            </div>
          </div>

          {/* Right: radar floating on the solid background (no card) */}
          <div className="relative">
            <RadarHud />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
