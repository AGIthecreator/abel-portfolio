"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  LAB_ENTRY_BLOCKS,
  getLabBlock,
  isLabEntryBlock,
  labMinimalFlow,
  validateLabFlow,
} from "@/lib/lab/blocks";
import {
  LAB_CHANNELS,
  channelFromEntryBlock,
  type LabChannel,
  type LabChannelId,
} from "@/lib/lab/channels";
import { getLabFeaturedScenarios } from "@/lib/lab/scenarios";
import type { LabBuilderState, LabFlowStatus } from "@/lib/lab/session";
import type { LabBlockId, LabStepStatus } from "@/lib/lab/types";
import { AutomationStrip } from "./AutomationStrip";
import {
  ExecutionBadge,
  LabButton,
  LabEyebrow,
  LabHeading,
  LabPanel,
  ProcessRail,
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

const FLOW_STATUS_COPY: Record<LabFlowStatus, string> = {
  idle: "Sin ejecutar",
  running: "Ejecutando",
  executed: "Ejecutado",
  invalid: "Incompleto",
};

const CORE_BLOCKS: readonly LabBlockId[] = [
  "datos",
  "db",
  "decision",
  "aviso",
  "email",
  "seguimiento",
];

const EXTRA_BLOCKS: readonly LabBlockId[] = ["ia", "whatsapp", "crm"];

const DEFAULT_GOAL = ["Recibir", "Guardar", "Decidir", "Avisar", "Seguir"] as const;

const GUIDE = [
  {
    prompt: "¿Qué inicia el proceso?",
    hint: "El canal cambia. El proceso puede ser el mismo.",
    highlight: LAB_ENTRY_BLOCKS,
    done: "Solicitud recibida",
  },
  {
    prompt: "Ahora necesitamos registrar lo que ha llegado.",
    hint: "Si no queda registrado, el proceso no puede continuar solo.",
    highlight: ["datos", "db"] as const,
    done: "Datos registrados",
  },
  {
    prompt: "El sistema necesita decidir qué hacer.",
    hint: "Sin esta pieza, haría siempre lo mismo.",
    highlight: ["decision"] as const,
    done: "El sistema puede decidir",
  },
  {
    prompt: "Alguien debe enterarse.",
    hint: "La solicitud tiene que llegar a una persona.",
    highlight: ["aviso", "email"] as const,
    done: "El equipo se entera",
  },
  {
    prompt: "La solicitud no debería quedar olvidada.",
    hint: "Si nadie responde, el proceso tiene que volver.",
    highlight: ["seguimiento"] as const,
    done: "Hay seguimiento",
  },
] as const;

function guideIndex(flow: readonly LabBlockId[]): number {
  const found = GUIDE.findIndex(
    (step) => !step.highlight.some((id) => flow.includes(id)),
  );
  return found === -1 ? GUIDE.length : found;
}

type BuilderPhase = "channel" | "scenario" | "build" | "examples";

function initialPhase(builder: LabBuilderState): BuilderPhase {
  if (builder.status === "executed") return "build";
  if (builder.flow.length > 0) return "build";
  return "channel";
}

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
  const featured = getLabFeaturedScenarios();

  const [phase, setPhase] = useState<BuilderPhase>(() => initialPhase(builder));
  const [channelId, setChannelId] = useState<LabChannelId>(() =>
    flow[0] ? channelFromEntryBlock(flow[0]).id : "formulario",
  );
  const [scenarioId, setScenarioId] = useState(featured[0]?.id ?? "");

  const [liveStatuses, setLiveStatuses] = useState<LabStepStatus[] | null>(null);
  const [showValidation, setShowValidation] = useState(
    builder.status === "executed" || builder.status === "invalid",
  );

  useEffect(() => {
    trackEvent("builder_started");
  }, []);

  const validation = useMemo(() => validateLabFlow(flow), [flow]);
  const running = liveStatuses !== null;
  const channel = LAB_CHANNELS.find((item) => item.id === channelId) ?? LAB_CHANNELS[0];
  const scenario =
    featured.find((item) => item.id === scenarioId) ?? featured[0];

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

  const addBlock = (id: LabBlockId) => {
    if (isLabEntryBlock(id)) {
      const rest = flow.filter((blockId) => !isLabEntryBlock(blockId));
      updateFlow([id, ...rest]);
      setChannelId(channelFromEntryBlock(id).id);
      return;
    }
    updateFlow([...flow, id]);
  };

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

  const currentGuide = guideIndex(flow);
  const guideComplete = currentGuide >= GUIDE.length;
  const guideStep = GUIDE[currentGuide];
  const highlighted = new Set<string>(
    guideStep ? [...guideStep.highlight] : [],
  );
  const goalRail = scenario?.rail ?? DEFAULT_GOAL;

  const confirmChannel = (next: LabChannel) => {
    setChannelId(next.id);
    const rest = flow.filter((id) => !isLabEntryBlock(id));
    updateFlow([next.entryBlock, ...rest]);
  };

  const renderBlockButton = (id: LabBlockId) => {
    const block = getLabBlock(id);
    const active = highlighted.has(id);
    return (
      <button
        key={block.id}
        type="button"
        onClick={() => addBlock(block.id)}
        title={block.description}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12.5px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
          active
            ? "border-violet-400/50 bg-violet-400/10 text-zinc-50"
            : "border-white/12 bg-white/2 text-zinc-300 hover:border-violet-400/40 hover:bg-white/5 hover:text-zinc-100"
        }`}
      >
        <Plus className="size-3 text-violet-300" aria-hidden />
        {block.label}
      </button>
    );
  };

  if (phase === "channel") {
    return (
      <div>
        <LabEyebrow>03 · Lo construyes</LabEyebrow>
        <LabHeading className="mt-3 max-w-2xl">
          ¿Desde dónde puede empezar un proceso?
        </LabHeading>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-400">
          El canal cambia. El proceso puede ser el mismo.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {LAB_CHANNELS.map((item) => {
            const selected = item.id === channel.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => confirmChannel(item)}
                className={`cursor-pointer rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                  selected
                    ? "border-violet-400/50 bg-violet-400/10"
                    : "border-white/10 bg-white/2 hover:border-white/20"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[15px] text-zinc-100">{item.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                    {item.badge}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <LabPanel className="mt-5 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Así llega
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-100">
            {channel.label}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">
            «{channel.inbound}»
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
            El canal cambia. El proceso puede ser el mismo.
          </p>
        </LabPanel>

        <div className="mt-6">
          <LabButton
            onClick={() => {
              confirmChannel(channel);
              setPhase("scenario");
            }}
          >
            Continuar
          </LabButton>
        </div>
      </div>
    );
  }

  if (phase === "scenario") {
    return (
      <div>
        <LabEyebrow>03 · Lo construyes</LabEyebrow>
        <LabHeading className="mt-3 max-w-2xl">
          Elige un proceso para construir
        </LabHeading>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-400">
          Misma lógica. Distinto trabajo.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {featured.map((item) => {
            const selected = item.id === scenario?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScenarioId(item.id)}
                className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                  selected
                    ? "border-violet-400/50 bg-violet-400/10 text-zinc-50"
                    : "border-white/12 bg-white/2 text-zinc-300 hover:border-white/20"
                }`}
              >
                {item.intent}
              </button>
            );
          })}
        </div>

        {scenario ? (
          <LabPanel className="mt-5 max-w-xl">
            <p className="text-[15px] text-zinc-100">{scenario.intent}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
              {scenario.scenario.intro}
            </p>
            <ProcessRail steps={scenario.rail} className="mt-4" />
          </LabPanel>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <LabButton onClick={() => setPhase("build")}>Construir este proceso</LabButton>
          <LabButton variant="ghost" onClick={() => setPhase("channel")}>
            Cambiar canal
          </LabButton>
        </div>
      </div>
    );
  }

  if (phase === "examples") {
    return (
      <div>
        <LabEyebrow>03 · Lo construyes</LabEyebrow>
        <LabHeading className="mt-3 max-w-2xl">
          La misma idea, en otros procesos
        </LabHeading>
        <div className="mt-6">
          <AutomationStrip
            eyebrow="Ejemplos"
            intro="Esto se puede aplicar a muchos procesos diferentes."
          />
        </div>
        <div className="mt-6">
          <LabButton onClick={onContinue}>Continuar</LabButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LabEyebrow>03 · Lo construyes</LabEyebrow>
      <LabHeading className="mt-3 max-w-2xl">
        {scenario?.intent ?? "Haz que la solicitud llegue y no se olvide"}
      </LabHeading>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-300">
        Empieza en {channel.label}. El canal ya está elegido: ahora conecta el
        proceso.
      </p>

      <div className="mt-5 max-w-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Tu objetivo
        </p>
        <ProcessRail
          steps={goalRail}
          activeIndex={Math.min(currentGuide, goalRail.length - 1)}
          className="mt-2"
        />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-8">
        <div>
          {guideComplete || !guideStep ? (
            <p className="text-[14px] leading-relaxed text-zinc-100">
              Proceso listo. Recórrelo para ver cómo se conecta.
            </p>
          ) : (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300/90">
                Paso {String(currentGuide + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-100">
                {guideStep.prompt}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                {guideStep.hint}
              </p>
            </div>
          )}

          {currentGuide > 0 ? (
            <ul className="mt-4 flex list-none flex-col gap-1 p-0 text-[12.5px] text-zinc-400">
              {GUIDE.slice(0, currentGuide).map((step) => (
                <li key={step.done}>{step.done}</li>
              ))}
            </ul>
          ) : null}

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Qué inicia el proceso
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LAB_ENTRY_BLOCKS.map(renderBlockButton)}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
            WhatsApp, email y chat son simulaciones. No hay integración real.
          </p>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            Piezas del proceso
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CORE_BLOCKS.map(renderBlockButton)}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-zinc-300">
              Más acciones
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXTRA_BLOCKS.map(renderBlockButton)}
            </div>
          </details>

          <div className="mt-5 flex flex-wrap gap-2">
            <LabButton
              variant="ghost"
              onClick={() => updateFlow(labMinimalFlow(channel.entryBlock))}
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
                  Empieza por la pieza que inicia el proceso. El sistema te
                  indica cuál toca ahora.
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
                          <ExecutionBadge
                            mode={block.executionMode}
                            className="opacity-70"
                          />
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
                  : "Recorrer el proceso"}
            </LabButton>
            {status === "executed" ? (
              <LabButton onClick={() => setPhase("examples")}>Continuar</LabButton>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
