"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  PRIMARY_CTA,
  SECONDARY_CTA,
} from "@/components/services/ServicePagePrimitives";
import type {
  LabActionStatus,
  LabExecutionMode,
  LabStepStatus,
} from "@/lib/lab/types";

/** Etiqueta REAL / SIMULACIÓN. Nunca se omite en una acción. */
export function ExecutionBadge({
  mode,
  className = "",
}: {
  mode: LabExecutionMode;
  className?: string;
}) {
  const real = mode === "real";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] ${
        real
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-white/15 bg-white/5 text-zinc-300"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`size-1 rounded-full ${real ? "bg-emerald-300" : "bg-zinc-400"}`}
      />
      {real ? "Real" : "Simulación"}
    </span>
  );
}

/**
 * Indicador compacto del tipo `REAL · EMAIL ENVIADO`.
 *
 * Es la forma de decir "esto ha ocurrido de verdad" sin convertir la página en
 * un panel técnico: una línea, sin caja grande y sin depender solo del color.
 */
export function ActionChip({
  mode,
  label,
  failed = false,
}: {
  mode: LabExecutionMode;
  label: string;
  failed?: boolean;
}) {
  const tone = failed
    ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
    : mode === "real"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
      : "border-white/15 bg-white/5 text-zinc-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] ${tone}`}
    >
      <span
        aria-hidden
        className={`size-1 rounded-full ${
          failed
            ? "bg-amber-300"
            : mode === "real"
              ? "bg-emerald-300"
              : "bg-zinc-400"
        }`}
      />
      {failed ? "No completado" : mode === "real" ? "Real" : "Simulación"}
      <span aria-hidden className="opacity-50">
        ·
      </span>
      {label}
    </span>
  );
}

const ACTION_STATUS_COPY: Record<LabActionStatus, string> = {
  done: "Ejecutada",
  pending: "Pendiente",
  skipped: "No ejecutada",
  blocked: "Bloqueada",
  failed: "No completada",
};

export function ActionStatusLabel({ status }: { status: LabActionStatus }) {
  const tone =
    status === "done"
      ? "text-emerald-200/90"
      : status === "failed"
        ? "text-amber-200"
        : "text-zinc-400";

  return (
    <span className={`font-mono text-[10px] tracking-[0.12em] uppercase ${tone}`}>
      {ACTION_STATUS_COPY[status]}
    </span>
  );
}

const STATUS_COPY: Record<LabStepStatus, string> = {
  pending: "Pendiente",
  running: "Procesando",
  done: "Completado",
  blocked: "Bloqueado",
  exception: "Excepción",
};

/**
 * Estado del paso en texto, no solo en color: la información nunca depende
 * del color ni de la animación.
 */
export function StatusLabel({ status }: { status: LabStepStatus }) {
  const tone =
    status === "done"
      ? "text-zinc-300"
      : status === "running"
        ? "text-violet-200"
        : status === "exception"
          ? "text-amber-200"
          : "text-zinc-400";

  return (
    <span className={`font-mono text-[10px] tracking-[0.12em] uppercase ${tone}`}>
      {STATUS_COPY[status]}
    </span>
  );
}

export function LabEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-(family-name:--font-svc-ui) text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
      {children}
    </p>
  );
}

export function LabHeading({
  children,
  as: Tag = "h2",
  id,
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`font-(family-name:--font-svc-display) text-[clamp(1.55rem,3.4vw,2.35rem)] leading-[1.15] font-medium text-zinc-50 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function LabPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/8 bg-white/2 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

type LabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function LabButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LabButtonProps) {
  const base =
    variant === "primary"
      ? PRIMARY_CTA
      : variant === "secondary"
        ? SECONDARY_CTA
        : "inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-[12px] font-medium text-zinc-400 transition-colors duration-200 hover:text-zinc-100 focus-visible:text-zinc-100";

  return (
    <button
      type="button"
      {...props}
      className={`${base} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {variant === "primary" ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="relative z-10">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Separador fino con numeración editorial. */
export function LabActMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] tracking-[0.16em] text-violet-300/70">
        {index}
      </span>
      <span className="h-px flex-1 bg-white/8" aria-hidden />
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
    </div>
  );
}
