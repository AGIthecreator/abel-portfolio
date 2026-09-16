"use client";

import { useState } from "react";
import { getLabBlock } from "@/lib/lab/blocks";
import { getLabFeaturedScenarios } from "@/lib/lab/scenarios";
import { LabPanel, ProcessRail } from "./LabUi";

/**
 * Tira compacta de automatizaciones. Reutiliza LAB_FEATURED_SCENARIOS:
 * no ejecuta el flujo, solo muestra cómo se aplica a procesos distintos.
 */
export function AutomationStrip({
  eyebrow = "Otros procesos",
  intro = "Esto se puede aplicar a muchos procesos diferentes.",
}: {
  eyebrow?: string;
  intro?: string;
}) {
  const featured = getLabFeaturedScenarios();
  const [activeId, setActiveId] = useState(featured[0]?.id ?? "");
  const active = featured.find((item) => item.id === activeId) ?? featured[0];

  if (!active) return null;

  const flowLabels = active.scenario.flow.map((id) => getLabBlock(id).label);

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {eyebrow}
      </p>
      <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-zinc-400">
        {intro}
      </p>

      <div
        role="tablist"
        aria-label="Ejemplos de automatización"
        className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {featured.map((item) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(item.id)}
              className={`shrink-0 cursor-pointer rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                selected
                  ? "border-violet-400/50 bg-violet-400/10 text-violet-100"
                  : "border-white/12 bg-white/2 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {item.shortTitle}
            </button>
          );
        })}
      </div>

      <LabPanel className="mt-4">
        <p className="text-[15px] text-zinc-100">{active.intent}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
          {active.scenario.intro}
        </p>
        <ProcessRail steps={active.rail} className="mt-4" />
        <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
          {flowLabels.join(" → ")}
        </p>
      </LabPanel>
    </div>
  );
}
