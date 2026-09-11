"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  LAB_BLOCKS,
  LAB_MINIMAL_FLOW,
  getLabBlock,
  validateLabFlow,
} from "@/lib/lab/blocks";
import type { LabBuilderState, LabFlowStatus } from "@/lib/lab/session";
import type { LabBlockId, LabStepStatus } from "@/lib/lab/types";
import {
  ExecutionBadge,
  LabButton,
  LabEyebrow,
  LabHeading,
  LabPanel,
} from "./LabUi";
import { useManagedTimers } from "./useManagedTimers";

const STATUS_RING: Record<LabStepStatus, string> = {
  pending: "border-white/12 bg-white/2",
  running: "border-violet-400/50 bg-violet-400/10",
  done: "border-emerald-400/35 bg-emerald-400/8",
  blocked: "border-white/12 bg-white/2",
  exception: "border-amber-300/40 bg-amber-400/8",
};

const STATUS_TEXT: Record<LabStepStatus, string> = {
  pending: "Pendiente",
  running: "Ejecutando",
  done: "Recorrido",
  blocked: "Bloqueado",
  exception: "Excepción",
};

/** Estado del flujo en texto, visible antes de pulsar nada. */
const FLOW_STATUS_COPY: Record<LabFlowStatus, string> = {
  idle: "Sin ejecutar",
  running: "Ejecutando",
  executed: "Ejecutado",
  invalid: "Incompleto",
};

interface ActBuilderProps {
  builder: LabBuilderState;
  onBuilderChange: (patch: Partial<LabBuilderState>) => void;
  onContinue: () => void;
}

export function ActBuilder({
  builder,
  onBuilderChange,
  onContinue,
}: ActBuilderProps) {
  const reduceMotion = useReducedMotion();
  const { schedule, clear, isMounted } = useManagedTimers();
  const { flow, status } = builder;

  /**
   * Los estados por bloque viven en la sesión, no en estado local: volver al
   * Acto 3 después de haberlo ejecutado tiene que mostrar el flujo tal y como
   * quedó, no en reposo. El estado local solo se usa mientras se anima.
   */
  const [liveStatuses, setLiveStatuses] = useState<LabStepStatus[] | null>(null);
  const [showValidation, setShowValidation] = useState(
    builder.status === "executed" || builder.status === "invalid",
  );

  useEffect(() => {
    trackEvent("builder_started");
  }, []);

  const validation = useMemo(() => validateLabFlow(flow), [flow]);
  const running = liveStatuses !== null;

  /** Cualquier cambio en el flujo invalida la ejecución anterior. */
  const updateFlow = useCallback(
    (next: LabBlockId[]) => {
      clear();
      setLiveStatuses(null);
      setShowValidation(false);
      onBuilderChange({
        flow: next,
        status: "idle",
        executedStatuses: [],
      });
    },
    [clear, onBuilderChange],
  );

  const addBlock = (id: LabBlockId) => updateFlow([...flow, id]);
  const removeBlock = (index: number) =>
    updateFlow(flow.filter((_, i) => i !== index));

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= flow.length) return;
    const next = [...flow];
    [next[index], next[target]] = [next[target], next[index]];
    updateFlow(next);
  };

  const finish = useCallback(
    (executedFlow: LabBlockId[]) => {
      const actionBlocks = executedFlow.filter((id) => {
        const block = getLabBlock(id);
        return block.role === "accion" || block.role === "cierre";
      }).length;
      const decisionBlocks = executedFlow.filter(
        (id) => id === "decision" || id === "ia",
      ).length;

      setLiveStatuses(null);
      onBuilderChange({
        status: "executed",
        executedStatuses: executedFlow.map(() => "done" as const),
        // El constructor no ejecuta nada hacia fuera: todo cuenta como simulado.
        simulatedActions: actionBlocks,
        decisions: decisionBlocks,
      });
      trackEvent("builder_flow_executed", { blocks: executedFlow.length });
    },
    [onBuilderChange],
  );

  const runFlow = () => {
    setShowValidation(true);

    if (validation.severity !== "valid") {
      trackEvent("builder_flow_failed", { issues: validation.issues.length });
      onBuilderChange({ status: "invalid", executedStatuses: [] });
      return;
    }

    trackEvent("builder_flow_validated", { blocks: flow.length });
    clear();

    const snapshot = [...flow];
    // La ejecución del constructor es instantánea a efectos de sesión: el
    // escalonado solo es visual. Si el visitante se va a mitad de la animación,
    // al volver el flujo sigue marcado como ejecutado.
    finish(snapshot);

    if (reduceMotion || snapshot.length === 0) return;

    setLiveStatuses(snapshot.map(() => "pending"));
    const stepMs = 330;
    snapshot.forEach((_, index) => {
      schedule(() => {
        setLiveStatuses((prev) => {
          const next: LabStepStatus[] = prev
            ? [...prev]
            : snapshot.map(() => "pending");
          for (let i = 0; i < index; i += 1) next[i] = "done";
          next[index] = "running";
          return next;
        });
      }, index * stepMs);
    });

    schedule(() => {
      if (isMounted()) setLiveStatuses(null);
    }, snapshot.length * stepMs);
  };

  const statusAt = (index: number): LabStepStatus =>
    liveStatuses?.[index] ?? builder.executedStatuses[index] ?? "pending";

  return (
    <div>
      <LabEyebrow>Acto 03 · Construye el flujo</LabEyebrow>
      <LabHeading className="mt-3 max-w-2xl">
        Haz que nadie tenga que perseguir la solicitud
      </LabHeading>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-300">
        Una persona pide información sobre un servicio. Monta el proceso para
        que llegue al equipo correcto y no dependa de que alguien se acuerde.
        Aquí se construye y se recorre: no se ejecuta nada hacia fuera.
      </p>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
            Bloques
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LAB_BLOCKS.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => addBlock(block.id)}
                title={block.description}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/12 bg-white/2 px-2.5 py-1.5 text-[12.5px] text-zinc-300 transition-colors duration-200 hover:border-violet-400/40 hover:bg-white/5 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70"
              >
                <Plus className="size-3 text-violet-300" aria-hidden />
                {block.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <LabButton
              variant="ghost"
              onClick={() => updateFlow([...LAB_MINIMAL_FLOW])}
            >
              Ver un flujo que funciona
            </LabButton>
            {flow.length > 0 ? (
              <LabButton variant="ghost" onClick={() => updateFlow([])}>
                Vaciar
              </LabButton>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              Flujo
            </p>
            <p
              className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                status === "executed"
                  ? "text-emerald-200"
                  : status === "invalid"
                    ? "text-amber-200"
                    : "text-zinc-400"
              }`}
            >
              {FLOW_STATUS_COPY[status]}
            </p>
          </div>

          <LabPanel>
            {flow.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-center">
                <p className="max-w-xs text-[13.5px] leading-relaxed text-zinc-300">
                  Añade bloques para montar el proceso. Empieza por lo que lo
                  activa.
                </p>
              </div>
            ) : (
              <ol className="m-0 flex list-none flex-col gap-2 p-0 lg:flex-row lg:flex-wrap lg:items-stretch lg:gap-0">
                {flow.map((blockId, index) => {
                  const block = getLabBlock(blockId);
                  const blockStatus = statusAt(index);
                  return (
                    <li
                      key={`${blockId}-${index}`}
                      className="flex items-center lg:mb-2"
                    >
                      <div
                        className={`w-full rounded-lg border px-3 py-2.5 transition-colors duration-300 lg:w-auto lg:min-w-38 ${STATUS_RING[blockStatus]}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-violet-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[13px] font-medium text-zinc-100">
                            {block.label}
                          </span>
                          <span className="ml-auto flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveBlock(index, -1)}
                              disabled={index === 0 || running}
                              aria-label={`Mover ${block.label} antes`}
                              className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowUp className="size-3 lg:hidden" aria-hidden />
                              <ArrowUp
                                className="hidden size-3 -rotate-90 lg:block"
                                aria-hidden
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(index, 1)}
                              disabled={index === flow.length - 1 || running}
                              aria-label={`Mover ${block.label} después`}
                              className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowDown className="size-3 lg:hidden" aria-hidden />
                              <ArrowDown
                                className="hidden size-3 -rotate-90 lg:block"
                                aria-hidden
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(index)}
                              disabled={running}
                              aria-label={`Quitar ${block.label}`}
                              className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-400/70 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <X className="size-3" aria-hidden />
                            </button>
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <ExecutionBadge mode={block.executionMode} />
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
                            {STATUS_TEXT[blockStatus]}
                          </span>
                        </div>
                      </div>

                      {index < flow.length - 1 ? (
                        <span
                          aria-hidden
                          className="hidden shrink-0 px-2 font-mono text-[13px] text-zinc-400 lg:block"
                        >
                          →
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </LabPanel>

          {showValidation ? (
            <div
              role="status"
              className={`mt-4 rounded-xl border p-5 ${
                validation.severity === "valid"
                  ? "border-emerald-400/25 bg-emerald-400/5"
                  : "border-amber-300/25 bg-amber-400/5"
              }`}
            >
              {validation.severity === "valid" ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                    Flujo válido
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-300">
                    {validation.reading}
                  </p>
                </>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {validation.issues.map((issue) => (
                    <li key={issue.title}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200">
                        {issue.title}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-300">
                        {issue.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <LabButton
              variant={status === "executed" ? "secondary" : "primary"}
              onClick={runFlow}
              disabled={running || flow.length === 0}
            >
              {running
                ? "Ejecutando…"
                : status === "executed"
                  ? "Volver a recorrer"
                  : "Ejecutar flujo"}
            </LabButton>
            {status === "executed" ? (
              <LabButton onClick={onContinue}>Continuar</LabButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
