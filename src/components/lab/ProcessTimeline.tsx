"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LabStep, LabStepType } from "@/lib/lab/types";
import { ExecutionBadge, StatusLabel } from "./LabUi";

const DOT_BY_STATUS: Record<LabStep["status"], string> = {
  pending: "border-white/15 bg-transparent",
  running: "border-violet-300/70 bg-violet-400/30",
  done: "border-emerald-300/45 bg-emerald-400/25",
  blocked: "border-white/20 bg-white/10",
  exception: "border-amber-300/50 bg-amber-400/25",
};

/** Significado primero; el `label` técnico del servidor queda en el detalle. */
const STEP_MEANING: Record<LabStepType, string> = {
  input: "Solicitud recibida",
  record: "Datos registrados",
  classify: "Solicitud entendida",
  decision: "Ruta elegida",
  action: "Acción ejecutada",
  status: "Estado consultado",
  document: "Documento generado",
  followup: "Seguimiento",
  exception: "Excepción",
};

function meaningOf(step: LabStep): string {
  return STEP_MEANING[step.type] ?? step.description;
}

function summaryOf(step: LabStep): string {
  if (step.type === "classify") {
    const type = step.label.replace(/^Clasificación:\s*/i, "");
    const priority = /Prioridad\s+(Baja|Media|Alta)/i.exec(step.detail ?? "");
    return priority ? `${type} · Prioridad ${priority[1].toLowerCase()}` : type;
  }
  if (step.type === "decision") return step.description;
  return step.description;
}

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
  const open = step.status !== "pending";

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

      <div className={`min-w-0 flex-1 ${dimmed ? "opacity-55" : ""}`}>
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-mono text-[11px] tracking-[0.14em] text-violet-300">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[14px] font-medium text-zinc-50">
            {meaningOf(step)}
          </span>
          <span className="ml-auto">
            <StatusLabel status={step.status} />
          </span>
        </div>
        {open ? (
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">
            {summaryOf(step)}
          </p>
        ) : (
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
            {step.description}
          </p>
        )}
        {open && (step.detail || step.label) ? (
          <details className="mt-2">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-300">
              Ver detalle
            </summary>
            <div className="mt-2 flex flex-col gap-1.5 border-l border-white/10 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] text-zinc-300">{step.label}</span>
                <ExecutionBadge mode={step.executionMode} />
              </div>
              {step.detail ? (
                <p className="text-[12px] leading-relaxed text-zinc-400">
                  {step.detail}
                </p>
              ) : null}
            </div>
          </details>
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
