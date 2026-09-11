"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LabStep } from "@/lib/lab/types";
import { ExecutionBadge, StatusLabel } from "./LabUi";

const DOT_BY_STATUS: Record<LabStep["status"], string> = {
  pending: "border-white/15 bg-transparent",
  running: "border-violet-300/70 bg-violet-400/30",
  done: "border-emerald-300/45 bg-emerald-400/25",
  blocked: "border-white/20 bg-white/10",
  exception: "border-amber-300/50 bg-amber-400/25",
};

function StepRow({
  step,
  index,
  isLast,
  animate,
}: {
  step: LabStep;
  index: number;
  isLast: boolean;
  animate: boolean;
}) {
  const dimmed = step.status === "pending";

  return (
    <li className="relative flex gap-4 pb-5 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden
          className="absolute top-5 left-[7px] h-full w-px bg-white/8"
        />
      ) : null}

      <span className="relative mt-1.5 shrink-0">
        <span
          aria-hidden
          className={`block size-3.5 rounded-full border transition-colors duration-300 ${DOT_BY_STATUS[step.status]}`}
        />
        {step.status === "running" && animate ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-violet-300/60"
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
      </span>

      <div className={`min-w-0 flex-1 ${dimmed ? "opacity-60" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {/* La numeración es posicional: el timeline crece con la ejecución. */}
          <span className="font-mono text-[11px] tracking-[0.14em] text-violet-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[13px] font-semibold text-zinc-100">
            {step.label}
          </span>
          {/* La etiqueta solo aparece cuando ya se sabe qué ha hecho el paso. */}
          {dimmed ? null : <ExecutionBadge mode={step.executionMode} />}
          <span className="ml-auto">
            <StatusLabel status={step.status} />
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">
          {step.description}
        </p>
        {step.detail && step.status !== "pending" ? (
          <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400">
            {step.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function ProcessTimeline({
  steps,
  label = "Ejecución del proceso",
  live = false,
}: {
  steps: readonly LabStep[];
  label?: string;
  /** Anuncia los pasos nuevos a lectores de pantalla mientras se ejecuta. */
  live?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ol
      aria-label={label}
      aria-live={live ? "polite" : undefined}
      aria-relevant={live ? "additions text" : undefined}
      className="m-0 list-none p-0"
    >
      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          index={index}
          isLast={index === steps.length - 1}
          animate={!reduceMotion}
        />
      ))}
    </ol>
  );
}
