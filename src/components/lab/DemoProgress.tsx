"use client";

export type LabProgressStep = "caso" | "prueba" | "recorrido" | "cierre";

const STEPS: readonly { id: LabProgressStep; label: string }[] = [
  { id: "caso", label: "Tu caso" },
  { id: "prueba", label: "La prueba" },
  { id: "recorrido", label: "El recorrido" },
  { id: "cierre", label: "El cierre" },
];

export function DemoProgress({
  current,
  visited,
  onNavigate,
}: {
  current: LabProgressStep;
  visited: readonly LabProgressStep[];
  onNavigate: (step: LabProgressStep) => void;
}) {
  return (
    <nav
      aria-label="Progreso de la demo"
      className="flex flex-wrap items-center gap-x-1 gap-y-2"
    >
      {STEPS.map(({ id, label }, index) => {
        const isCurrent = id === current;
        const reachable = visited.includes(id) || isCurrent;

        return (
          <span key={id} className="flex items-center">
            <button
              type="button"
              onClick={() => reachable && onNavigate(id)}
              disabled={!reachable}
              aria-current={isCurrent ? "step" : undefined}
              className={`cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-default ${
                isCurrent
                  ? "text-violet-200"
                  : reachable
                    ? "text-zinc-300 hover:text-zinc-50"
                    : "text-zinc-400"
              }`}
            >
              <span className="mr-1.5">{String(index + 1).padStart(2, "0")}</span>
              {label}
            </button>
            {index < STEPS.length - 1 ? (
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
