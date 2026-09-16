import type { LabClassification, LabRouteId } from "./types";

/**
 * Clasificación determinista por reglas, ejecutada en servidor.
 *
 * No es un modelo de lenguaje: son reglas legibles sobre el texto de entrada.
 * Se marca `real` porque se ejecuta de verdad y su resultado cambia la ruta,
 * la plantilla y el asunto del email que sale. La interfaz aclara siempre que
 * son reglas y no IA.
 */

interface Rule {
  type: string;
  area: string;
  route: LabRouteId;
  keywords: readonly string[];
}

const RULES: readonly Rule[] = [
  {
    type: "Reserva",
    area: "Atención al cliente",
    route: "reserva",
    keywords: [
      "reserva",
      "reservas",
      "cita",
      "citas",
      "agenda",
      "agendar",
      "hueco",
      "mesa",
      "turno",
    ],
  },
  {
    type: "Presupuesto",
    area: "Comercial",
    route: "presupuesto",
    keywords: [
      "presupuesto",
      "precio",
      "precios",
      "coste",
      "cuanto",
      "cuánto",
      "tarifa",
      "propuesta",
    ],
  },
  {
    type: "Soporte",
    area: "Operaciones",
    route: "soporte",
    keywords: [
      "error",
      "fallo",
      "problema",
      "incidencia",
      "no funciona",
      "roto",
      "soporte",
    ],
  },
  {
    type: "Documentación",
    area: "Administración",
    route: "documentacion",
    keywords: [
      "factura",
      "facturas",
      "documento",
      "documentos",
      "contrato",
      "albarán",
      "informe",
    ],
  },
  {
    type: "Integración",
    area: "Sistemas",
    route: "integracion",
    keywords: [
      "crm",
      "integrar",
      "integración",
      "conectar",
      "sincronizar",
      "api",
      "excel",
      "hoja de cálculo",
    ],
  },
];

/**
 * Prioridad: independiente del tipo. El tipo/ruta salen de RULES; la
 * prioridad sale de estas tres capas, en este orden:
 *
 * Alta  — URGENT_KEYWORDS (urgencia explícita). También fuerza la ruta `urgente`.
 * Media — VOLUME_KEYWORDS (carga repetida) o ATTENTION_KEYWORDS (incidencia).
 * Baja  — ninguna de las anteriores. Un tipo conocido sin esas señales sigue
 *         siendo Baja: "presupuesto" no es más urgente que una consulta.
 */
const URGENT_KEYWORDS = [
  "urgente",
  "hoy",
  "ya",
  "cuanto antes",
  "cuánto antes",
  "inmediato",
  "mañana",
] as const;

const VOLUME_KEYWORDS = [
  "muchas",
  "muchos",
  "cada día",
  "cada dia",
  "todos los días",
  "todos los dias",
  "todas las semanas",
  "constantemente",
  "a diario",
] as const;

/** Señales que piden más atención, sin ser todavía una urgencia. */
const ATTENTION_KEYWORDS = [
  "incidencia",
  "no funciona",
  "error",
  "fallo",
  "problema",
  "reclama",
  "reclamacion",
  "reclamación",
  "queja",
  "critico",
  "crítico",
] as const;

/** Etiquetas de ruta para mostrar el mismo resultado en cliente y servidor. */
export const LAB_ROUTE_LABELS: Record<LabRouteId, string> = {
  reserva: "Ruta de reserva",
  presupuesto: "Ruta de presupuesto",
  urgente: "Ruta urgente",
  soporte: "Ruta de soporte",
  documentacion: "Ruta documental",
  integracion: "Ruta técnica",
  general: "Ruta general",
};

/**
 * Mensajes de ejemplo para el Acto 1. Cada uno activa un perfil distinto
 * del clasificador real: no son una simulación paralela.
 */
export const LAB_CLASSIFY_SAMPLES = [
  {
    id: "general",
    label: "Consulta general",
    text: "Hola, quería información sobre cómo trabajáis.",
  },
  {
    id: "presupuesto",
    label: "Presupuesto",
    text: "¿Cuánto costaría una web para mi negocio?",
  },
  {
    id: "volumen",
    label: "Muchas reservas",
    text: "Tengo muchas reservas que gestiono cada día por WhatsApp.",
  },
  {
    id: "urgente",
    label: "Urgente",
    text: "El sistema no funciona y es urgente, lo necesito hoy.",
  },
] as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(haystack: string, keywords: readonly string[]): string | null {
  for (const keyword of keywords) {
    if (haystack.includes(normalize(keyword))) return keyword;
  }
  return null;
}

/** Resultado de la clasificación más la ruta que se deriva de ella. */
export interface LabClassificationResult {
  classification: LabClassification;
  routeId: LabRouteId;
}

export function classifyLabMessage(message: string): LabClassificationResult {
  const haystack = normalize(message);

  let type = "Consulta general";
  let area = "Atención al cliente";
  let routeId: LabRouteId = "general";
  let matchedKeyword: string | null = null;

  for (const rule of RULES) {
    const hit = matches(haystack, rule.keywords);
    if (hit) {
      type = rule.type;
      area = rule.area;
      routeId = rule.route;
      matchedKeyword = hit;
      break;
    }
  }

  const urgent = matches(haystack, URGENT_KEYWORDS);
  const recurring = matches(haystack, VOLUME_KEYWORDS);
  const attention = matches(haystack, ATTENTION_KEYWORDS);

  const priority: LabClassification["priority"] = urgent
    ? "Alta"
    : recurring || attention
      ? "Media"
      : "Baja";

  // La urgencia manda sobre el tipo: cambia el equipo que atiende y el plazo.
  if (urgent) routeId = "urgente";

  const signals: string[] = [];
  if (matchedKeyword) signals.push(matchedKeyword);
  if (recurring) signals.push(recurring);
  if (attention) signals.push(attention);
  if (urgent) signals.push(urgent);

  const reasonParts: string[] = [];
  if (matchedKeyword) reasonParts.push(`detecta «${matchedKeyword}»`);
  if (recurring) reasonParts.push(`detecta repetición («${recurring}»)`);
  if (attention) reasonParts.push(`detecta atención («${attention}»)`);
  if (urgent) reasonParts.push(`detecta urgencia («${urgent}»)`);

  const reason = reasonParts.length
    ? `Regla de texto: ${reasonParts.join(", ")}.`
    : "Sin señales claras en el texto: se trata como consulta general.";

  return {
    classification: {
      type,
      area,
      priority,
      signals,
      reason,
      executionMode: "real",
    },
    routeId,
  };
}

/** Vista lista para la UI: misma función, mismas reglas, etiquetas de ruta. */
export function presentLabClassification(message: string) {
  const { classification, routeId } = classifyLabMessage(message);
  return {
    type: classification.type,
    priority: classification.priority,
    area: classification.area,
    routeId,
    routeLabel: LAB_ROUTE_LABELS[routeId],
    reason: classification.reason,
    signals: classification.signals,
    executionMode: classification.executionMode,
  };
}
