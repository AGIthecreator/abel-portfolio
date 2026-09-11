import type { LabBlockDefinition, LabBlockId } from "./types";

/** Catálogo de bloques. Lo usan el constructor del Acto 3 y la biblioteca. */
export const LAB_BLOCKS: readonly LabBlockDefinition[] = [
  {
    id: "formulario",
    label: "Formulario",
    role: "entrada",
    description: "Alguien pide algo desde la web.",
    executionMode: "real",
  },
  {
    id: "datos",
    label: "Datos",
    role: "proceso",
    description: "Se ordena lo que ha llegado: quién, qué y para cuándo.",
    executionMode: "real",
  },
  {
    id: "db",
    label: "Base de datos",
    role: "proceso",
    description: "La solicitud queda registrada y deja de depender de nadie.",
    executionMode: "real",
  },
  {
    id: "decision",
    label: "Decisión",
    role: "proceso",
    description: "El proceso mira el caso y elige qué corresponde.",
    executionMode: "real",
  },
  {
    id: "ia",
    label: "IA",
    role: "proceso",
    description: "Lee texto libre y propone tipo, urgencia o destinatario.",
    executionMode: "simulated",
  },
  {
    id: "email",
    label: "Email",
    role: "accion",
    description: "Envía un mensaje a la persona o al equipo.",
    executionMode: "real",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    role: "accion",
    description: "Avisa por el canal donde el equipo ya está mirando.",
    executionMode: "simulated",
  },
  {
    id: "crm",
    label: "CRM",
    role: "accion",
    description: "Deja la ficha creada donde se hace el seguimiento.",
    executionMode: "simulated",
  },
  {
    id: "aviso",
    label: "Aviso interno",
    role: "accion",
    description: "Le llega a la persona concreta que tiene que actuar.",
    executionMode: "real",
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    role: "cierre",
    description: "Si nadie responde, el proceso vuelve a insistir.",
    executionMode: "simulated",
  },
] as const;

const BLOCK_MAP = new Map<LabBlockId, LabBlockDefinition>(
  LAB_BLOCKS.map((block) => [block.id, block]),
);

export function getLabBlock(id: LabBlockId): LabBlockDefinition {
  const block = BLOCK_MAP.get(id);
  if (!block) throw new Error(`Bloque desconocido: ${id}`);
  return block;
}

export type LabFlowSeverity = "valid" | "incomplete" | "invalid";

export interface LabFlowIssue {
  title: string;
  detail: string;
}

export interface LabFlowValidation {
  severity: LabFlowSeverity;
  issues: readonly LabFlowIssue[];
  /** Resumen en una frase de lo que haría el flujo tal y como está. */
  reading: string;
}

const ACTION_BLOCKS: readonly LabBlockId[] = ["email", "whatsapp", "crm", "aviso"];
const STORAGE_BLOCKS: readonly LabBlockId[] = ["datos", "db"];

/**
 * Valida el flujo del Acto 3.
 *
 * No busca "la respuesta correcta": comprueba que el proceso sepa qué hacer
 * en cada situación, que registre lo que recibe y que no dependa de que
 * alguien se acuerde.
 */
export function validateLabFlow(flow: readonly LabBlockId[]): LabFlowValidation {
  const issues: LabFlowIssue[] = [];

  if (flow.length === 0) {
    return {
      severity: "invalid",
      issues: [
        {
          title: "El flujo está vacío",
          detail: "Empieza por lo que activa el proceso: alguien pide algo.",
        },
      ],
      reading: "Todavía no ocurre nada.",
    };
  }

  const indexOf = (id: LabBlockId) => flow.indexOf(id);
  const has = (id: LabBlockId) => indexOf(id) !== -1;

  if (flow[0] !== "formulario") {
    issues.push({
      title: "Falta la entrada",
      detail:
        "Un proceso empieza cuando alguien pide algo. Sin entrada, no hay nada que automatizar.",
    });
  }

  const storageIndex = STORAGE_BLOCKS.map(indexOf).filter((i) => i !== -1);
  const firstStorage = storageIndex.length ? Math.min(...storageIndex) : -1;
  const actionIndexes = ACTION_BLOCKS.map(indexOf).filter((i) => i !== -1);
  const firstAction = actionIndexes.length ? Math.min(...actionIndexes) : -1;

  if (firstStorage === -1) {
    issues.push({
      title: "Falta un paso",
      detail:
        "El mensaje se enviaría, pero la solicitud no quedaría registrada.",
    });
  } else if (firstAction !== -1 && firstAction < firstStorage) {
    issues.push({
      title: "El orden deja un hueco",
      detail:
        "La acción se ejecuta antes de registrar la solicitud: si algo falla, no queda rastro.",
    });
  }

  if (!has("decision")) {
    issues.push({
      title: "No hay decisión",
      detail:
        "Sin decisión el proceso hace siempre lo mismo, también cuando no toca.",
    });
  }

  if (firstAction === -1) {
    issues.push({
      title: "Nadie se entera",
      detail:
        "El proceso registra la solicitud, pero no llega a la persona que tiene que actuar.",
    });
  }

  if (!has("seguimiento")) {
    issues.push({
      title: "Sin continuidad",
      detail:
        "Si nadie responde, la solicitud se queda quieta y alguien tendrá que perseguirla.",
    });
  }

  const severity: LabFlowSeverity =
    issues.length === 0 ? "valid" : flow.length < 3 ? "invalid" : "incomplete";

  const reading =
    severity === "valid"
      ? "La solicitud entra, queda registrada, se decide a quién corresponde, la persona adecuada se entera y el proceso insiste si nadie responde."
      : issues[0]?.detail ?? "El flujo aún deja pasos sin cubrir.";

  return { severity, issues, reading };
}

/** Flujo mínimo válido que el Acto 3 propone como referencia. */
export const LAB_MINIMAL_FLOW: readonly LabBlockId[] = [
  "formulario",
  "datos",
  "decision",
  "aviso",
  "seguimiento",
] as const;
