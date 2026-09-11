"use client";

import { useMemo, useRef, useState } from "react";
import { getLabBlock } from "@/lib/lab/blocks";
import { LAB_CATEGORIES, getScenariosByCategory } from "@/lib/lab/scenarios";
import type { LabCategoryId } from "@/lib/lab/types";
import { ExecutionBadge, LabPanel } from "./LabUi";

/**
 * Explorador compacto de la biblioteca. Muestra una categoría cada vez:
 * la lista completa es DATA, no interfaz.
 *
 * Implementa el patrón tabs completo: una sola parada de tabulación en la
 * tira de pestañas, flechas para cambiar de categoría, y un panel asociado
 * mediante `aria-controls` / `aria-labelledby`.
 */
export function ScenarioLibrary() {
  const [category, setCategory] = useState<LabCategoryId>("reservas");
  const scenarios = useMemo(() => getScenariosByCategory(category), [category]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  const selectAt = (index: number) => {
    const total = LAB_CATEGORIES.length;
    const next = (index + total) % total;
    setCategory(LAB_CATEGORIES[next].id);
    setActiveId(null);
    tabRefs.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        selectAt(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        selectAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        selectAt(0);
        break;
      case "End":
        event.preventDefault();
        selectAt(LAB_CATEGORIES.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <LabPanel>
      <p
        id="lab-library-label"
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400"
      >
        La misma lógica en otros procesos
      </p>

      <div
        role="tablist"
        aria-labelledby="lab-library-label"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        {LAB_CATEGORIES.map((item, index) => {
          const selected = item.id === category;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`lab-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`lab-tabpanel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setCategory(item.id);
                setActiveId(null);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`cursor-pointer rounded-md border px-2.5 py-1 text-[12px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                selected
                  ? "border-violet-400/60 bg-violet-400/12 text-zinc-50"
                  : "border-white/12 bg-transparent text-zinc-300 hover:border-white/25 hover:text-zinc-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`lab-tabpanel-${category}`}
        aria-labelledby={`lab-tab-${category}`}
        tabIndex={0}
        className="mt-5 grid gap-5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400/70 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)]"
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {scenarios.map((scenario) => {
            const selected = scenario.id === active?.id;
            return (
              <li key={scenario.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(scenario.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`flex w-full cursor-pointer items-start gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                    selected
                      ? "bg-white/8 text-zinc-50"
                      : "text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                >
                  {/* El escenario abierto se marca también con un signo, no solo con fondo. */}
                  <span
                    aria-hidden
                    className={`mt-1.5 block h-px w-2.5 shrink-0 ${
                      selected ? "bg-violet-300" : "bg-transparent"
                    }`}
                  />
                  {scenario.title}
                </button>
              </li>
            );
          })}
        </ul>

        {active ? (
          <div className="min-w-0 border-t border-white/8 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-(family-name:--font-svc-display) text-[17px] text-zinc-100">
                {active.title}
              </h3>
              <ExecutionBadge mode={active.executionMode} />
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-300">
              {active.intro}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
              {active.flow.map((blockId, index) => (
                <span
                  key={`${blockId}-${index}`}
                  className="flex items-center gap-1.5"
                >
                  <span className="rounded border border-white/12 bg-white/2 px-2 py-0.5 font-mono text-[10.5px] tracking-[0.04em] text-zinc-300">
                    {getLabBlock(blockId).label}
                  </span>
                  {index < active.flow.length - 1 ? (
                    <span aria-hidden className="font-mono text-[11px] text-zinc-400">
                      →
                    </span>
                  ) : null}
                </span>
              ))}
            </div>

            <dl className="mt-4 flex flex-col gap-2.5">
              <div>
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-400">
                  Decisión
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-zinc-300">
                  {active.logic}
                </dd>
              </div>
              {active.exception ? (
                <div>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-400">
                    Excepción
                  </dt>
                  <dd className="mt-0.5 text-[13px] leading-relaxed text-zinc-300">
                    {active.exception}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-400">
                  Resultado
                </dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-zinc-300">
                  {active.outcome}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
    </LabPanel>
  );
}
