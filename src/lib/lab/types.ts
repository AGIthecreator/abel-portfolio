/**
 * Modelo de datos del Laboratorio de Automatización.
 *
 * Se comparte entre servidor (ejecución real) y cliente (render y simulaciones).
 * Ningún tipo de este archivo puede contener secretos ni datos personales.
 *
 * Regla estructural: `executionMode` y `status` los decide SIEMPRE el servidor
 * con el resultado real de la ejecución. El cliente solo los muestra.
 */

/** Distingue lo que el sistema ejecuta de verdad de lo que solo representa. */
export type LabExecutionMode = "real" | "simulated";

/** Estado visual y semántico de un paso dentro de un flujo. */
export type LabStepStatus =
  | "pending"
  | "running"
  | "done"
  | "blocked"
  | "exception";

/** Naturaleza del paso dentro del ciclo entrada → decisión → acción → seguimiento. */
export type LabStepType =
  | "input"
  | "record"
  | "classify"
  | "decision"
  | "action"
  | "status"
  | "document"
  | "followup"
  | "exception";

export interface LabStep {
  id: string;
  type: LabStepType;
  label: string;
  description: string;
  status: LabStepStatus;
  executionMode: LabExecutionMode;
  /** Texto corto que explica qué ocurrió de verdad en este paso. */
  detail?: string;
}

/** Rutas a las que la clasificación puede dirigir una solicitud. */
export type LabRouteId =
  | "reserva"
  | "presupuesto"
  | "urgente"
  | "soporte"
  | "documentacion"
  | "integracion"
  | "general";

/**
 * Ruta elegida por el servidor. Determina plantilla, asunto, equipo y plazo
 * del seguimiento. El cliente nunca elige la ruta.
 */
export interface LabRoute {
  id: LabRouteId;
  /** Nombre de la ruta tal y como se muestra en el timeline. */
  label: string;
  /** Equipo o área que recibe la solicitud. */
  team: string;
  /** Por qué se ha elegido esta ruta y no otra. */
  reason: string;
  /** Prefijo del asunto del aviso interno. */
  subjectTag: string;
  /** Compromiso de respuesta que se comunica al visitante. */
  sla: string;
  /** Minutos hasta el seguimiento programado por defecto. */
  followupDelayMinutes: number;
}

export interface LabClassification {
  type: string;
  area: string;
  priority: "Baja" | "Media" | "Alta";
  /** Señales de texto que activaron la clasificación. */
  signals: readonly string[];
  /** Motivo legible de por qué se clasificó así. */
  reason: string;
  /**
   * La clasificación son reglas deterministas reales ejecutadas en servidor,
   * no un modelo. Se marca `real` porque la decisión que produce sí cambia el
   * flujo, y la interfaz aclara que no hay IA detrás.
   */
  executionMode: LabExecutionMode;
}

/** Estado del ciclo de vida de un email según el proveedor. */
export type LabEmailEvent =
  | "queued"
  | "scheduled"
  | "sent"
  | "delivered"
  | "delivery_delayed"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "failed"
  | "canceled"
  | "suppressed";

export interface LabEmailStatus {
  /** `null` cuando el proveedor todavía no informa de ningún evento. */
  event: LabEmailEvent | null;
  scheduledAt: string | null;
  checkedAt: string;
}

export type LabActionStatus =
  | "done"
  | "pending"
  | "skipped"
  | "blocked"
  | "failed";

/** Identificadores estables de las acciones del Acto 1. */
export type LabActionId =
  | "record"
  | "email_internal"
  | "email_visitor"
  | "email_status"
  | "pdf"
  | "followup"
  | "followup_cancel"
  | "followup_reschedule"
  | "whatsapp"
  | "crm";

/** Resultado estructurado de cualquier acción del laboratorio. */
export interface LabAction {
  id: LabActionId;
  label: string;
  status: LabActionStatus;
  executionMode: LabExecutionMode;
  detail: string;
  /** Identificador del proveedor cuando la acción es real y lo devuelve. */
  providerId?: string;
  /** Mensaje de error del proveedor cuando la acción falla. */
  error?: string;
}

/** Bloques disponibles en el constructor de flujos y en la biblioteca. */
export type LabBlockId =
  | "formulario"
  | "datos"
  | "db"
  | "decision"
  | "email"
  | "whatsapp"
  | "crm"
  | "aviso"
  | "seguimiento"
  | "ia";

export interface LabBlockDefinition {
  id: LabBlockId;
  label: string;
  /** Categoría funcional del bloque, usada para validar el flujo. */
  role: "entrada" | "proceso" | "accion" | "cierre";
  description: string;
  executionMode: LabExecutionMode;
}

/** Una decisión que el visitante debe tomar dentro de un escenario. */
export interface LabDecisionOption {
  id: string;
  label: string;
  /** Consecuencia real de elegir esta opción, no "correcto/incorrecto". */
  consequence: string;
  /** True si la opción deja el proceso parado esperando a una persona. */
  handsOff: boolean;
  /** True si la elección abre una excepción que hay que resolver. */
  raisesException: boolean;
}

export interface LabDecision {
  id: string;
  context: string;
  question: string;
  options: readonly LabDecisionOption[];
  /** Lectura del sistema tras responder, común a todas las opciones. */
  reading: string;
}

export interface LabException {
  id: string;
  trigger: string;
  resolvable: boolean;
  resolution: string;
}

/** Categorías de la biblioteca interna de escenarios. */
export type LabCategoryId =
  | "comercial"
  | "reservas"
  | "clinicas"
  | "restaurantes"
  | "inmobiliaria"
  | "profesionales"
  | "administracion"
  | "documentos"
  | "integraciones"
  | "ia"
  | "excepciones";

export interface LabCategory {
  id: LabCategoryId;
  label: string;
}

/**
 * Escenario reutilizable. La biblioteca es DATA: añadir un escenario nuevo
 * no requiere componentes nuevos.
 */
export interface LabScenario {
  id: string;
  category: LabCategoryId;
  title: string;
  /** Situación de entrada en una frase. */
  intro: string;
  /** Qué recibe el proceso. */
  inputs: readonly string[];
  /** Secuencia de bloques que define el flujo. */
  flow: readonly LabBlockId[];
  /** Decisión característica del escenario. */
  logic: string;
  /** Excepción típica de este escenario. */
  exception?: string;
  outcome: string;
  executionMode: LabExecutionMode;
}

/** Seguimiento programado en el proveedor. */
export interface LabFollowupState {
  /** Id del email programado en el proveedor. */
  providerId: string | null;
  scheduledAt: string | null;
  status: "scheduled" | "canceled" | "failed" | "none";
  executionMode: LabExecutionMode;
  reschedules: number;
}

/** Respuesta del endpoint de ejecución real del Acto 1. */
export interface LabRunResponse {
  ok: true;
  runId: string;
  duplicate: boolean;
  classification: LabClassification;
  route: LabRoute;
  steps: LabStep[];
  actions: LabAction[];
  /** Qué puede hacer el visitante a continuación, según lo que sea real. */
  capabilities: {
    emailStatus: boolean;
    pdf: boolean;
    followup: boolean;
  };
  /** Motivo por el que algo no es real, cuando aplica. */
  degradedReason?: string;
  /** Presente al reentrar o al detectar un duplicado de la misma sesión. */
  followup?: LabFollowupState | null;
}

export interface LabStatusResponse {
  ok: true;
  status: LabEmailStatus;
  step: LabStep;
  action: LabAction;
}

export interface LabFollowupResponse {
  ok: true;
  followup: LabFollowupState;
  step: LabStep;
  action: LabAction;
}

export interface LabErrorResponse {
  ok: false;
  error: string;
  code:
    | "invalid"
    | "rate_limited"
    | "not_found"
    | "limit_reached"
    | "server_error";
}

/** Resumen no identificativo del participante, para la sesión propia. */
export interface LabProgressResponse {
  ok: true;
  testCount: number;
  experiencesCompleted: number;
  demoCompleted: boolean;
  ctaClicked: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  source: "laboratorio";
}

/** Respuesta de reentrada. `found: false` no revela si el runId existió. */
export interface LabSessionResponse {
  ok: true;
  found: boolean;
  activation?: {
    runId: string;
    duplicate: boolean;
    classification: LabClassification;
    route: LabRoute;
    steps: LabStep[];
    actions: LabAction[];
    capabilities: LabRunResponse["capabilities"];
    degradedReason?: string;
    followup: LabFollowupState | null;
    input: { name: string; email: string; message: string };
  };
}
