/**
 * Configuración del laboratorio.
 *
 * REGLA CRÍTICA: el laboratorio NUNCA lee `RESEND_API_KEY` ni `CONTACT_EMAIL`.
 * Esas credenciales pertenecen al formulario de contacto, que es negocio real.
 * Si la configuración propia del laboratorio no existe, el laboratorio sigue
 * funcionando pero todas sus acciones de email quedan como SIMULACIÓN.
 *
 * Variables (todas server-side, ninguna con prefijo NEXT_PUBLIC_):
 *   LAB_RESEND_API_KEY  — obligatoria para que haya envíos reales.
 *   LAB_CONTACT_EMAIL   — destinatario del aviso interno de la demo.
 *   LAB_EMAIL_FROM      — opcional. Remitente. Debe ser de un dominio verificado.
 *   LAB_DAILY_EMAIL_BUDGET — opcional. Tope global de emails reales por día.
 *   LAB_SUPABASE_URL       — URL del proyecto de persistencia del laboratorio.
 *   LAB_SUPABASE_SERVICE_ROLE_KEY — service role, SOLO servidor. Nunca NEXT_PUBLIC_.
 */

const DEFAULT_FROM = "AGI Laboratorio <contacto@agithecreator.com>";

export interface LabMailConfig {
  apiKey: string;
  internalRecipient: string;
  from: string;
}

/**
 * Devuelve la configuración de email del laboratorio, o `null` si no está
 * completa. No hay fallback a las variables de contacto: es intencional.
 */
export function getLabMailConfig(): LabMailConfig | null {
  const apiKey = process.env.LAB_RESEND_API_KEY?.trim();
  const internalRecipient = process.env.LAB_CONTACT_EMAIL?.trim();

  if (!apiKey || !internalRecipient) return null;

  return {
    apiKey,
    internalRecipient,
    from: process.env.LAB_EMAIL_FROM?.trim() || DEFAULT_FROM,
  };
}

/** True si el entorno puede ejecutar acciones reales de email. */
export function isLabMailConfigured(): boolean {
  return getLabMailConfig() !== null;
}

/** Motivo legible de por qué no hay email real, para mostrarlo sin mentir. */
export function labMailUnavailableReason(): string {
  const hasKey = Boolean(process.env.LAB_RESEND_API_KEY?.trim());
  const hasRecipient = Boolean(process.env.LAB_CONTACT_EMAIL?.trim());

  if (!hasKey && !hasRecipient) {
    return "Este entorno no tiene credenciales propias de email para la demo.";
  }
  if (!hasKey) {
    return "Falta la clave de email propia de la demo.";
  }
  return "Falta el destinatario interno propio de la demo.";
}

/** Tope global diario de emails reales del laboratorio. */
export function getLabDailyEmailBudget(): number {
  const raw = Number(process.env.LAB_DAILY_EMAIL_BUDGET);
  if (Number.isFinite(raw) && raw >= 0) return Math.trunc(raw);
  return 40;
}

export interface LabDbConfig {
  url: string;
  serviceRoleKey: string;
}

/**
 * Persistencia propia del laboratorio. No hay fallback a variables genéricas
 * de Supabase: si estas no existen, el laboratorio usa memoria de proceso.
 */
export function getLabDbConfig(): LabDbConfig | null {
  const url = process.env.LAB_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.LAB_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function isLabDbConfigured(): boolean {
  return getLabDbConfig() !== null;
}
