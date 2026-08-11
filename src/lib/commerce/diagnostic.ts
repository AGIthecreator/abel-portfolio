import type { ProductId } from "./products";

/** Clave de sessionStorage para el snapshot del presupuesto. */
export const QUOTE_SNAPSHOT_KEY = "agi_quote_snapshot";
/** Estado del flujo (diagnóstico / contacto) para recuperar tras recarga. */
export const QUOTE_FLOW_KEY = "agi_quote_flow";

export type DiagnosticOption = {
  id: string;
  label: string;
};

export const DIAGNOSTIC_BUSINESS_TYPES: readonly DiagnosticOption[] = [
  { id: "comercio", label: "Comercio" },
  { id: "hosteleria", label: "Hostelería" },
  { id: "servicios", label: "Servicios" },
  { id: "profesional", label: "Profesional liberal" },
  { id: "salud", label: "Salud / bienestar" },
  { id: "educacion", label: "Educación" },
  { id: "otro", label: "Otro" },
] as const;

/**
 * Objetivos en lenguaje de dueño de negocio (resultado), no de producto.
 * El producto ya se eligió en el configurador.
 */
export const DIAGNOSTIC_GOALS: readonly DiagnosticOption[] = [
  { id: "web_profesional", label: "Que me encuentren y me tomen en serio" },
  { id: "contactos", label: "Que me escriban o llamen más" },
  { id: "reservas", label: "Que puedan reservar sin tanto ir y venir" },
  { id: "vender", label: "Vender por internet" },
  { id: "mejorar_web", label: "Arreglar o renovar la web que ya tengo" },
  { id: "automatizar", label: "Dejar de hacer a mano lo que se puede automatizar" },
  { id: "sistema_medida", label: "Montar una herramienta a medida para cómo trabajo" },
  { id: "otro", label: "Otro" },
] as const;

export const DIAGNOSTIC_SITUATIONS: readonly DiagnosticOption[] = [
  { id: "sin_web", label: "No tengo web" },
  { id: "web_antigua", label: "Tengo una web antigua" },
  { id: "web_no_convence", label: "Tengo una web que no me convence" },
  { id: "redes", label: "Voy principalmente por redes o WhatsApp" },
  { id: "herramientas_desconectadas", label: "Uso varias herramientas y no encajan entre ellas" },
  { id: "sistema_a_medias", label: "Tengo algo a medias" },
  { id: "otro", label: "Otro" },
] as const;

export const DIAGNOSTIC_BLOCKERS: readonly DiagnosticOption[] = [
  { id: "percepcion", label: "Mi negocio no se ve como debería" },
  { id: "captacion", label: "Me cuesta que me escriban o llamen" },
  { id: "manual", label: "Pierdo tiempo con tareas manuales" },
  { id: "conversion", label: "Reservar o comprar es demasiado complicado" },
  { id: "herramientas", label: "Tengo demasiadas herramientas sueltas" },
  { id: "indefinicion", label: "No tengo claro qué necesito exactamente" },
  { id: "otro", label: "Otro" },
] as const;

export const DIAGNOSTIC_TIMELINES: readonly DiagnosticOption[] = [
  { id: "asap", label: "Lo antes posible" },
  { id: "semanas", label: "En las próximas semanas" },
  { id: "1_2_meses", label: "En 1-2 meses" },
  { id: "sin_prisa", label: "Sin prisa" },
  { id: "valorando", label: "Todavía lo estoy valorando" },
] as const;

export const DIAGNOSTIC_QUESTIONS = [
  {
    key: "businessType" as const,
    title: "¿A qué se dedica tu negocio?",
    options: DIAGNOSTIC_BUSINESS_TYPES,
  },
  {
    key: "goal" as const,
    title: "¿Qué quieres conseguir con esto?",
    options: DIAGNOSTIC_GOALS,
  },
  {
    key: "currentSituation" as const,
    title: "¿Cómo lo estás haciendo ahora?",
    options: DIAGNOSTIC_SITUATIONS,
  },
  {
    key: "blocker" as const,
    title: "¿Qué es lo que más te frena?",
    options: DIAGNOSTIC_BLOCKERS,
  },
  {
    key: "timeline" as const,
    title: "¿Cuándo te gustaría tenerlo listo?",
    options: DIAGNOSTIC_TIMELINES,
  },
] as const;

export type QuoteDiagnostic = {
  businessType: string;
  businessTypeOther?: string;
  goal: string;
  goalOther?: string;
  currentSituation: string;
  currentSituationOther?: string;
  blocker: string;
  blockerOther?: string;
  timeline: string;
};

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  consent: boolean;
};

export type QuoteFlowPhase =
  | "configure"
  | "diagnostic"
  | "contact"
  | "review"
  | "success"
  | "error";

export type QuoteFlowState = {
  phase: QuoteFlowPhase;
  /** 0-4 en diagnóstico; ignorado en otras fases */
  diagnosticStep: number;
  diagnostic: Partial<QuoteDiagnostic>;
  contact: Partial<QuoteContact>;
};

export const EMPTY_FLOW_STATE: QuoteFlowState = {
  phase: "configure",
  diagnosticStep: 0,
  diagnostic: {},
  contact: {},
};

/** Filtra objetivos que no encajan con el producto ya elegido. */
export function getGoalsForProduct(
  productId: ProductId | null,
): readonly DiagnosticOption[] {
  if (productId === "sistemas") {
    return DIAGNOSTIC_GOALS.filter(
      (g) => g.id !== "web_profesional" && g.id !== "mejorar_web",
    );
  }
  if (productId === "entrada" || productId === "profesional") {
    return DIAGNOSTIC_GOALS.filter((g) => g.id !== "sistema_medida");
  }
  return DIAGNOSTIC_GOALS;
}

function findLabel(
  options: readonly DiagnosticOption[],
  id: string | undefined,
  other?: string,
): string {
  if (!id) return "-";
  if (id === "otro") return other?.trim() || "Otro";
  return options.find((o) => o.id === id)?.label ?? id;
}

export function labelBusinessType(d: Partial<QuoteDiagnostic>): string {
  return findLabel(DIAGNOSTIC_BUSINESS_TYPES, d.businessType, d.businessTypeOther);
}

export function labelGoal(d: Partial<QuoteDiagnostic>): string {
  return findLabel(DIAGNOSTIC_GOALS, d.goal, d.goalOther);
}

export function labelSituation(d: Partial<QuoteDiagnostic>): string {
  return findLabel(DIAGNOSTIC_SITUATIONS, d.currentSituation, d.currentSituationOther);
}

export function labelBlocker(d: Partial<QuoteDiagnostic>): string {
  return findLabel(DIAGNOSTIC_BLOCKERS, d.blocker, d.blockerOther);
}

export function labelTimeline(d: Partial<QuoteDiagnostic>): string {
  return findLabel(DIAGNOSTIC_TIMELINES, d.timeline);
}

export function isDiagnosticComplete(
  d: Partial<QuoteDiagnostic>,
): d is QuoteDiagnostic {
  if (!d.businessType || !d.goal || !d.currentSituation || !d.blocker || !d.timeline) {
    return false;
  }
  if (d.businessType === "otro" && !d.businessTypeOther?.trim()) return false;
  if (d.goal === "otro" && !d.goalOther?.trim()) return false;
  if (d.currentSituation === "otro" && !d.currentSituationOther?.trim()) return false;
  if (d.blocker === "otro" && !d.blockerOther?.trim()) return false;
  return true;
}

export function maintenanceChoiceLabel(
  choice: "yes" | "no" | "later",
  monthlyEur: number | null,
): string {
  if (choice === "yes" && monthlyEur != null) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(monthlyEur) + "/mes";
  }
  if (choice === "yes") return "Sí";
  if (choice === "no") return "Ahora no";
  return "Lo hablamos después";
}
