"use client";

import type { LabAct } from "@/lib/lab/session";

const ACTS: readonly { act: LabAct; label: string }[] = [
  { act: 1, label: "Activa" },
  { act: 2, label: "Decide" },
  { act: 3, label: "Construye" },
  { act: 4, label: "Resultado" },
];

export function DemoProgress({
  current,
  visited,
  onNavigate,
}: {
  current: LabAct;
  visited: readonly LabAct[];
  onNavigate: (act: LabAct) => void;
}) {
  return (
    <nav
      aria-label="Progreso de la demo"
      className="flex flex-wrap items-center gap-x-1 gap-y-2"
    >
      {ACTS.map(({ act, label }, index) => {
        const isCurrent = act === current;
        const isVisited = visited.includes(act);
        const reachable = isVisited || isCurrent;

        return (
          <span key={act} className="flex items-center">
            <button
              type="button"
              onClick={() => reachable && onNavigate(act)}
              disabled={!reachable}
              aria-current={isCurrent ? "step" : undefined}
              className={`cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-default ${
                isCurrent
                  ? "text-violet-200"
                  : reachable
                    ? "text-zinc-300 hover:text-zinc-50"
                    : "text-zinc-500"
              }`}
            >
              <span className="mr-1.5">{String(act).padStart(2, "0")}</span>
              {label}
            </button>
            {index < ACTS.length - 1 ? (
              <span aria-hidden className="text-zinc-600">
                ·
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
