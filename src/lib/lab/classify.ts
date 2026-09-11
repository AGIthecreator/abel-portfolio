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

  const priority: LabClassification["priority"] = urgent
    ? "Alta"
    : recurring || matchedKeyword
      ? "Media"
      : "Baja";

  // La urgencia manda sobre el tipo: cambia el equipo que atiende y el plazo.
  if (urgent) routeId = "urgente";

  const signals: string[] = [];
  if (matchedKeyword) signals.push(matchedKeyword);
  if (recurring) signals.push(recurring);
  if (urgent) signals.push(urgent);

  const reasonParts: string[] = [];
  if (matchedKeyword) reasonParts.push(`detecta «${matchedKeyword}»`);
  if (recurring) reasonParts.push(`detecta repetición («${recurring}»)`);
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
