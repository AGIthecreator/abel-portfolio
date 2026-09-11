import { LAB_LIMITS } from "./budget";
import type { LabRoute, LabRouteId } from "./types";

/**
 * Tabla de rutas del laboratorio.
 *
 * La clasificación no es decorativa: elige una de estas rutas y la ruta
 * determina plantilla, asunto, equipo, plazo y retardo del seguimiento.
 * Toda esta resolución ocurre en servidor. El cliente recibe la ruta ya
 * decidida y solo la muestra.
 */

const ROUTES: Record<LabRouteId, LabRoute> = {
  reserva: {
    id: "reserva",
    label: "Ruta de reserva",
    team: "Atención al cliente",
    reason: "El mensaje pide disponibilidad o una cita concreta.",
    subjectTag: "RESERVA",
    sla: "Confirmación de disponibilidad el mismo día laborable.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
  presupuesto: {
    id: "presupuesto",
    label: "Ruta de presupuesto",
    team: "Comercial",
    reason: "El mensaje pide condiciones económicas o una propuesta.",
    subjectTag: "PRESUPUESTO",
    sla: "Propuesta detallada en un máximo de 48 horas laborables.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
  urgente: {
    id: "urgente",
    label: "Ruta urgente",
    team: "Guardia de operaciones",
    reason: "El texto contiene señales de urgencia y se adelanta en la cola.",
    subjectTag: "URGENTE",
    sla: "Primera respuesta humana en menos de 2 horas laborables.",
    // La ruta urgente comprueba antes si alguien ha reaccionado.
    followupDelayMinutes: 5,
  },
  soporte: {
    id: "soporte",
    label: "Ruta de soporte",
    team: "Operaciones",
    reason: "El mensaje describe un fallo o una incidencia en curso.",
    subjectTag: "SOPORTE",
    sla: "Diagnóstico inicial en el siguiente turno de soporte.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
  documentacion: {
    id: "documentacion",
    label: "Ruta documental",
    team: "Administración",
    reason: "El mensaje gira alrededor de documentos o facturación.",
    subjectTag: "DOCUMENTOS",
    sla: "Revisión documental en 24 horas laborables.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
  integracion: {
    id: "integracion",
    label: "Ruta técnica",
    team: "Sistemas",
    reason: "El mensaje menciona conectar o sincronizar herramientas.",
    subjectTag: "INTEGRACION",
    sla: "Llamada técnica de 20 minutos para acotar el alcance.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
  general: {
    id: "general",
    label: "Ruta general",
    team: "Atención al cliente",
    reason: "Sin señales suficientes para especializar la ruta.",
    subjectTag: "GENERAL",
    sla: "Respuesta en el siguiente día laborable.",
    followupDelayMinutes: LAB_LIMITS.followupDelayMinutes,
  },
};

export function resolveLabRoute(routeId: LabRouteId): LabRoute {
  return ROUTES[routeId] ?? ROUTES.general;
}

export function isLabRouteId(value: string): value is LabRouteId {
  return value in ROUTES;
}
