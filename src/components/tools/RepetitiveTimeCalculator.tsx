"use client";

import { useId, useMemo, useState } from "react";
import {
  EXAMPLE_INPUT,
  calculateFromRaw,
  fieldMessage,
  formatHours,
  formatToolEur,
  type ParseReason,
} from "@/lib/tools/repetitiveTime";

type Fields = typeof EXAMPLE_INPUT;

const FIELD_COPY = [
  {
    key: "timesPerWeek" as const,
    label: "Veces por semana",
    hint: "Ejemplo orientativo, no es un dato tuyo.",
  },
  {
    key: "minutesEach" as const,
    label: "Minutos de cada vez",
    hint: "Cuánto dura una ejecución.",
  },
  {
    key: "people" as const,
    label: "Personas que la hacen",
    hint: "Quienes repiten la misma tarea.",
  },
  {
    key: "hourlyCostEur" as const,
    label: "Coste por hora y persona, opcional",
    hint: "Si lo dejas vacío, no se calcula dinero.",
  },
];

function Field({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  error?: ParseReason;
  onChange: (value: string) => void;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <label className="block" htmlFor={id}>
      <span className="text-[13px] font-medium text-[#F3F1EB]">{label}</span>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        className="mt-1.5 w-full border border-white/10 bg-[#070b13] px-3 py-2.5 text-[15px] text-[#F3F1EB] outline-none focus:border-violet-300"
      />
      <span id={hintId} className="mt-1 block text-[12px] text-zinc-400">
        {hint}
      </span>
      {error ? (
        <span id={errorId} className="mt-1 block text-[12px] text-red-300">
          {fieldMessage(error)}
        </span>
      ) : null}
    </label>
  );
}

export function RepetitiveTimeCalculator() {
  const baseId = useId();
  const [fields, setFields] = useState<Fields>(EXAMPLE_INPUT);
  const result = useMemo(() => calculateFromRaw(fields), [fields]);

  const set = (key: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="overflow-hidden border border-violet-300/15 bg-[#0c1018] shadow-[0_30px_80px_-48px_rgba(88,60,160,0.7)]">
      <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <form
          className="bg-[#251c49] p-6 text-[#F3F1EB] sm:p-8"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/80">
            La tarea
          </p>
          <p className="mt-3 max-w-[18ch] font-serif text-[1.7rem] leading-[1.12] tracking-[-0.02em]">
            Cuatro datos y se ve el hueco.
          </p>
          <div className="mt-7 grid gap-4">
            {FIELD_COPY.map((field) => (
              <Field
                key={field.key}
                id={`${baseId}-${field.key}`}
                label={field.label}
                hint={field.hint}
                value={fields[field.key]}
                error={result.ok ? undefined : result.fields[field.key]}
                onChange={(value) => set(field.key, value)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFields(EXAMPLE_INPUT)}
            className="mt-6 text-[13px] text-violet-100/70 underline decoration-violet-200/30 underline-offset-[3px] hover:text-[#F3F1EB]"
          >
            Volver a los valores de ejemplo
          </button>
        </form>

        <div aria-live="polite" className="flex flex-col justify-between bg-[#12151f] p-6 sm:p-8">
          {result.ok ? (
            <>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                  Tiempo aproximado
                </p>
                <p className="mt-4 font-serif text-[clamp(3rem,6vw,4.4rem)] leading-none tracking-[-0.04em] text-[#F3F1EB]">
                  {formatHours(result.figures.hoursWeek)}
                  <span className="ml-2 font-sans text-[15px] tracking-normal text-zinc-400">h a la semana</span>
                </p>
                <p className="mt-6 max-w-[34ch] font-serif text-[1.35rem] leading-[1.3] text-[#F3F1EB]">
                  Nadie apunta este rato. Son minutos sueltos que, juntos, se comen la semana.
                </p>
                <p className="mt-3 max-w-[42ch] text-[14px] leading-[1.7] text-zinc-400">
                  Copiar un dato, avisar, apuntar y volver a buscar lo mismo. Si esa tarea ya tiene una regla clara, aquí es donde suele merecer la pena mirarla.
                </p>
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-px bg-violet-300/20">
                <div className="bg-[#0c1018] px-4 py-4">
                  <dt className="text-[12px] text-zinc-500">Al mes</dt>
                  <dd className="mt-1 font-serif text-[1.45rem] text-[#F3F1EB]">{formatHours(result.figures.hoursMonth)} h</dd>
                </div>
                <div className="bg-[#0c1018] px-4 py-4">
                  <dt className="text-[12px] text-zinc-500">Al año</dt>
                  <dd className="mt-1 font-serif text-[1.45rem] text-[#F3F1EB]">{formatHours(result.figures.hoursYear)} h</dd>
                </div>
                {result.figures.costWeekEur != null ? (
                  <>
                    <div className="bg-[#0c1018] px-4 py-4">
                      <dt className="text-[12px] text-zinc-500">Equivalente semanal</dt>
                      <dd className="mt-1 font-serif text-[1.45rem] text-[#F3F1EB]">{formatToolEur(result.figures.costWeekEur)}</dd>
                    </div>
                    <div className="bg-[#0c1018] px-4 py-4">
                      <dt className="text-[12px] text-zinc-500">Equivalente anual</dt>
                      <dd className="mt-1 font-serif text-[1.45rem] text-[#F3F1EB]">
                        {formatToolEur(result.figures.costYearEur ?? 0)}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
              <p className="mt-5 text-[12px] leading-relaxed text-zinc-500">
                El mes usa 4,33 semanas y el año, 52. El importe es el valor del tiempo, no un ahorro garantizado.
              </p>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-zinc-400">
              Corrige los campos marcados para ver el tiempo. Los valores de ejemplo solo orientan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
