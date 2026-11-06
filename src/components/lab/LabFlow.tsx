"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { LabFlowStep } from "@/lib/lab/cases";

/**
 * Camino de la automatización, al estilo de un flujo: un módulo se enciende
 * y la frase de ese paso se escribe debajo.
 */
export function LabFlow({
  steps,
  active,
  className = "",
}: {
  steps: readonly LabFlowStep[];
  /** Índice del módulo encendido. Los anteriores quedan hechos. */
  active: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const safeActive = Math.max(0, Math.min(active, steps.length - 1));
  const line = steps[safeActive]?.line ?? "";
  const [typed, setTyped] = useState(reduceMotion ? line.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setTyped(line.length);
      return;
    }
    setTyped(0);
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setTyped(count);
      if (count >= line.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [line, reduceMotion]);

  return (
    <div className={className}>
      <ol className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:items-stretch sm:gap-0">
        {steps.map((step, index) => {
          const done = index < safeActive;
          const current = index === safeActive;
          const lit = done || current;
          return (
            <li key={step.title} className="flex min-w-0 flex-1 items-stretch">
              <div
                className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border px-3 py-3 transition-[border-color,box-shadow] duration-500 ${
                  current
                    ? "border-violet-300/55 bg-[#101826] shadow-[0_0_28px_rgba(124,92,255,0.28)]"
                    : done
                      ? "border-emerald-300/30 bg-[#101826]"
                      : "border-white/10 bg-[#101826]/70"
                }`}
              >
                <span className="relative grid size-2.5 shrink-0 place-items-center">
                  <span
                    className={`size-2.5 rounded-full ${
                      done ? "bg-emerald-300" : current ? "bg-violet-300" : "bg-zinc-600"
                    }`}
                  />
                  {current && !reduceMotion ? (
                    <span
                      aria-hidden
                      className="absolute size-2.5 animate-ping rounded-full bg-violet-300/70"
                    />
                  ) : null}
                </span>
                <span
                  className={`text-[13.5px] ${lit ? "text-[#F3F1EB]" : "text-zinc-500"}`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="mx-1 hidden w-5 shrink-0 items-center sm:flex"
                >
                  <span
                    className={`h-px w-full transition-colors duration-500 ${
                      index < safeActive ? "bg-violet-300/80" : "bg-white/15"
                    }`}
                  />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p
        aria-live="polite"
        className="mt-4 min-h-7 font-(family-name:--font-svc-display) text-[20px] leading-snug text-[#F3F1EB]"
      >
        {line.slice(0, typed)}
        {typed < line.length ? (
          <span aria-hidden className="ml-0.5 inline-block w-px animate-pulse bg-[#F3F1EB]">
            &nbsp;
          </span>
        ) : null}
      </p>
    </div>
  );
}
