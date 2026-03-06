"use client";

import React from "react";

export type OrchestrationMode = "haiku" | "sonnet" | "gpt";

export type TokenOptimizerProps = {
  value: OrchestrationMode;
  onChange: (mode: OrchestrationMode) => void;
  accent?: string;
  className?: string;
};

const MODES: Array<{ key: OrchestrationMode; label: string; sub: string }> = [
  { key: "haiku", label: "Razonamiento", sub: "Claude / GPT-4o / Qwen" },
  { key: "sonnet", label: "Código", sub: "Cursor / Antigravity / Groq" },
  { key: "gpt", label: "Chat/Agentes", sub: "ChatGPT / Gemini / Copilot" },
];

export function TokenOptimizer({ value, onChange, accent = "#FFD700", className }: TokenOptimizerProps) {
  return (
    <div className={"token-opt " + (className ?? "")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.78)" }}>
          SELECTOR DE IA: AHORRO DE TOKENS
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Selector de categoría IA"
        className="token-opt__tabs grid grid-cols-3 rounded-full p-1"
        style={{
          border: `1px solid ${hexToRgba(accent, 0.45)}`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), rgba(0,0,0,0.15)",
          boxShadow: `inset 0 0 18px ${hexToRgba(accent, 0.10)}`,
        }}
      >
        {MODES.map((m) => {
          const active = value === m.key;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(m.key)}
              className="token-opt__tab relative rounded-full px-2.5 py-2 text-left transition"
              style={{
                color: active ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.86)",
              }}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${hexToRgba(accent, 0.95)}, ${hexToRgba(accent, 0.65)})`,
                    boxShadow: `0 0 22px ${hexToRgba(accent, 0.22)}`,
                  }}
                />
              ) : null}

              <span className="relative block leading-tight">
                <span className="token-opt__tab-label block text-[11px] font-semibold">{m.label}</span>
                <span className="token-opt__tab-sub block text-[10px] opacity-80">({m.sub})</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 text-[10px] tracking-wide" style={{ color: "rgba(255,255,255,0.72)" }}>
        Enrutamiento de API (OpenRouter): <span style={{ color: hexToRgba(accent, 0.95) }}>-40% de consumo</span> optimizado
      </div>

      {/* Mobile-only: stack the 3 internal pills vertically and let them breathe */}
      <style jsx>{`
        @media (max-width: 768px) {
          .token-opt__tabs {
            display: flex;
            flex-direction: column;
            gap: 8px;
            border-radius: 16px;
            padding: 8px;
          }

          .token-opt__tab {
            width: 100%;
            padding: 8px 10px;
          }

          .token-opt__tab-label {
            font-size: 12px;
          }

          .token-opt__tab-sub {
            font-size: 12px;
          }
        }
      `}</style>
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
