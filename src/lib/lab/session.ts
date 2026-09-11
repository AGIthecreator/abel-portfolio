import { CLINIC_DECISIONS } from "./decisions";
import type {
  LabAction,
  LabBlockId,
  LabClassification,
  LabExecutionMode,
  LabFollowupState,
  LabRoute,
  LabStep,
} from "./types";

/**
 * Estado de la experiencia en el navegador.
 *
 * Vive en sessionStorage: recordar el flujo no ejecuta nada por sí solo.
 * Volver a la página nunca dispara acciones reales.
 */

const STORAGE_KEY = "agi_lab_session_v2";

export type LabAct = 0 | 1 | 2 | 3 | 4;

export interface LabStats {
  experiences: number;
  decisions: number;
  /** Acciones que el servidor confirmó como ejecutadas de verdad. */
  realActions: number;
  /** Acciones que solo se representan. */
  simulatedActions: number;
  exceptions: number;
  flows: number;
}

/** Estado del Acto 1. Crece conforme el visitante ejecuta más acciones. */
export interface LabActivationState {
  runId: string;
  duplicate: boolean;
  classification: LabClassification;
  route: LabRoute;
  steps: LabStep[];
  actions: LabAction[];
  capabilities: {
    emailStatus: boolean;
    pdf: boolean;
    followup: boolean;
  };
  degradedReason?: string;
  followup: LabFollowupState | null;
  /** Entrada de la ejecución, necesaria para las acciones posteriores. */
  input: { name: string; email: string; message: string };
}

/**
 * Resumen inmutable de una ejecución ya cerrada. Se guarda cuando el visitante
 * vuelve a activar el proceso, para que los contadores no se pierdan ni se
 * cuenten dos veces al repetir una acción.
 */
export interface LabRunSummary {
  runId: string;
  realActions: number;
  simulatedActions: number;
  exceptions: number;
  decisions: number;
}

/**
 * Estado del constructor del Acto 3.
 *
 * Distingue explícitamente los cuatro estados posibles para que volver al acto
 * no borre lo que ya se ejecutó ni muestre un flujo ejecutado como si estuviera
 * en reposo.
 */
export type LabFlowStatus = "idle" | "running" | "executed" | "invalid";

export interface LabBuilderState {
  flow: LabBlockId[];
  status: LabFlowStatus;
  /** Estado por bloque tras la última ejecución, indexado por posición. */
  executedStatuses: ("done" | "blocked" | "pending")[];
  /**
   * El Acto 3 no ejecuta nada contra el exterior: es un constructor. Todo lo
   * que "recorre" cuenta como simulación, con el mismo modelo que el Acto 1.
   */
  simulatedActions: number;
  decisions: number;
}

export interface LabSessionState {
  version: 2;
  act: LabAct;
  activation: LabActivationState | null;
  pastRuns: LabRunSummary[];
  decisions: Record<string, string>;
  builder: LabBuilderState;
  visitedActs: LabAct[];
}

export function createEmptyBuilder(): LabBuilderState {
  return {
    flow: [],
    status: "idle",
    executedStatuses: [],
    simulatedActions: 0,
    decisions: 0,
  };
}

export function createLabSession(): LabSessionState {
  return {
    version: 2,
    act: 0,
    activation: null,
    pastRuns: [],
    decisions: {},
    builder: createEmptyBuilder(),
    visitedActs: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
}

function parseBuilder(value: unknown): LabBuilderState {
  if (!isRecord(value)) return createEmptyBuilder();

  const status = value.status;
  const safeStatus: LabFlowStatus =
    status === "running" || status === "executed" || status === "invalid"
      ? status
      : "idle";

  return {
    flow: Array.isArray(value.flow) ? (value.flow as LabBlockId[]) : [],
    // Un flujo restaurado nunca vuelve como "running": esa ejecución terminó.
    status: safeStatus === "running" ? "idle" : safeStatus,
    executedStatuses: Array.isArray(value.executedStatuses)
      ? (value.executedStatuses.filter(
          (s) => s === "done" || s === "blocked" || s === "pending",
        ) as LabBuilderState["executedStatuses"])
      : [],
    simulatedActions: readCount(value.simulatedActions),
    decisions: readCount(value.decisions),
  };
}

function parsePastRuns(value: unknown): LabRunSummary[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((entry) => ({
    runId: typeof entry.runId === "string" ? entry.runId : "",
    realActions: readCount(entry.realActions),
    simulatedActions: readCount(entry.simulatedActions),
    exceptions: readCount(entry.exceptions),
    decisions: readCount(entry.decisions),
  }));
}

/** Lectura defensiva: cualquier dato corrupto reinicia la sesión. */
export function loadLabSession(): LabSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 2) return null;

    const act = typeof parsed.act === "number" ? parsed.act : 0;
    const safeAct = ([0, 1, 2, 3, 4] as const).includes(act as LabAct)
      ? (act as LabAct)
      : 0;

    return {
      version: 2,
      act: safeAct,
      activation: isRecord(parsed.activation)
        ? (parsed.activation as unknown as LabActivationState)
        : null,
      pastRuns: parsePastRuns(parsed.pastRuns),
      decisions: isRecord(parsed.decisions)
        ? (parsed.decisions as Record<string, string>)
        : {},
      builder: parseBuilder(parsed.builder),
      visitedActs: Array.isArray(parsed.visitedActs)
        ? (parsed.visitedActs.filter((a) => typeof a === "number") as LabAct[])
        : [],
    };
  } catch {
    return null;
  }
}

export function saveLabSession(state: LabSessionState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / modo privado: la experiencia sigue funcionando en memoria */
  }
}

export function clearLabSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nada que limpiar */
  }
}

/** True si merece la pena ofrecer «Continuar» al volver. */
export function hasLabProgress(state: LabSessionState): boolean {
  return (
    state.act > 0 ||
    state.activation !== null ||
    state.pastRuns.length > 0 ||
    Object.keys(state.decisions).length > 0 ||
    state.builder.flow.length > 0
  );
}

/** Cuenta acciones por modo de ejecución sobre una lista de acciones. */
export function countActions(
  actions: readonly LabAction[],
  mode: LabExecutionMode,
): number {
  return actions.filter(
    (action) => action.executionMode === mode && action.status === "done",
  ).length;
}

export function summarizeActivation(
  activation: LabActivationState,
): LabRunSummary {
  return {
    runId: activation.runId,
    realActions: countActions(activation.actions, "real"),
    simulatedActions: activation.actions.filter(
      (action) => action.executionMode === "simulated",
    ).length,
    exceptions:
      activation.actions.filter(
        (action) =>       action.status === "failed" || action.status === "blocked",
      ).length + (activation.duplicate ? 1 : 0),
    // Decisiones reales del Acto 1: clasificación y elección de ruta. Cuando la
    // comprobación de duplicados detiene el proceso, solo hubo esa decisión.
    decisions: activation.duplicate ? 1 : 2,
  };
}

/**
 * Estadísticas del Acto 4. Se derivan del estado real de la sesión:
 * ningún contador se incrementa por mostrar una pantalla.
 */
export function computeLabStats(state: LabSessionState): LabStats {
  const answeredIds = Object.keys(state.decisions);

  const answeredExceptions = CLINIC_DECISIONS.reduce((total, decision) => {
    const chosen = state.decisions[decision.id];
    if (!chosen) return total;
    const option = decision.options.find((o) => o.id === chosen);
    return option?.raisesException ? total + 1 : total;
  }, 0);

  const act2Complete = CLINIC_DECISIONS.every((d) =>
    Boolean(state.decisions[d.id]),
  );

  const current = state.activation
    ? summarizeActivation(state.activation)
    : null;
  const runs = [...state.pastRuns, ...(current ? [current] : [])];

  const flowExecuted = state.builder.status === "executed";

  const experiences =
    (runs.length > 0 ? 1 : 0) + (act2Complete ? 1 : 0) + (flowExecuted ? 1 : 0);

  const sum = (key: keyof LabRunSummary) =>
    runs.reduce((total, run) => total + (run[key] as number), 0);

  return {
    experiences,
    decisions: sum("decisions") + answeredIds.length + state.builder.decisions,
    realActions: sum("realActions"),
    simulatedActions: sum("simulatedActions") + state.builder.simulatedActions,
    exceptions: sum("exceptions") + answeredExceptions,
    flows: flowExecuted ? 1 : 0,
  };
}
