import { getLabBlock } from "./blocks";
import type {
  LabBlockId,
  LabScenario,
  LabStep,
  LabStepStatus,
  LabStepType,
} from "./types";

/**
 * Motor de escenarios.
 *
 * Convierte una secuencia de bloques (venga de la biblioteca o del
 * constructor del Acto 3) en pasos renderizables. Es la única pieza que sabe
 * traducir bloques a timeline, así que ningún componente duplica esa lógica.
 */

const BLOCK_STEP_TYPE: Record<LabBlockId, LabStepType> = {
  formulario: "input",
  datos: "record",
  db: "record",
  decision: "decision",
  ia: "classify",
  email: "action",
  whatsapp: "action",
  crm: "action",
  aviso: "action",
  seguimiento: "followup",
};

export function buildStepsFromFlow(
  flow: readonly LabBlockId[],
  status: LabStepStatus = "pending",
): LabStep[] {
  return flow.map((blockId, index) => {
    const block = getLabBlock(blockId);
    return {
      id: `${blockId}-${index}`,
      type: BLOCK_STEP_TYPE[blockId],
      label: block.label,
      description: block.description,
      status,
      executionMode: block.executionMode,
    };
  });
}

export function buildScenarioSteps(scenario: LabScenario): LabStep[] {
  return buildStepsFromFlow(scenario.flow);
}

/** Aplica un estado a un paso concreto sin mutar el array original. */
export function withStepStatus(
  steps: readonly LabStep[],
  index: number,
  status: LabStepStatus,
): LabStep[] {
  return steps.map((step, i) => (i === index ? { ...step, status } : step));
}

/** Marca todos los pasos con el mismo estado. */
export function withAllStepStatuses(
  steps: readonly LabStep[],
  status: LabStepStatus,
): LabStep[] {
  return steps.map((step) => ({ ...step, status }));
}

/** Cuenta cuántos pasos del flujo son acciones ejecutables. */
export function countFlowActions(flow: readonly LabBlockId[]): number {
  return flow.filter((id) => getLabBlock(id).role === "accion").length;
}
