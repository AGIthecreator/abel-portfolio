import { getLabDailyEmailBudget } from "./config";
import { getLabRepository } from "./db";

/**
 * Presupuesto de acciones reales del laboratorio.
 *
 * El rate limit protege el endpoint; esto protege el gasto y la cuota del
 * proveedor. Son cosas distintas y por eso viven en módulos distintos.
 *
 * Al agotarse, la experiencia NO falla: las acciones pasan a SIMULACIÓN con
 * el motivo a la vista.
 */

/** Límites por ejecución. Un visitante no puede convertir esto en un mailer. */
export const LAB_LIMITS = {
  /** Emails reales que puede disparar una ejecución (aviso + confirmación). */
  emailsPerRun: 2,
  /** Seguimientos programados por ejecución. */
  followupsPerRun: 1,
  /** Reprogramaciones permitidas sobre ese seguimiento. */
  reschedulesPerRun: 2,
  /** Informes PDF por ejecución (se permite repetir la descarga). */
  pdfsPerRun: 3,
  /** Consultas de estado por ejecución. */
  statusChecksPerRun: 10,
  /** Minutos de adelanto del seguimiento programado. */
  followupDelayMinutes: 15,
  /** Máximo desplazamiento acumulado al reprogramar, en minutos. */
  maxFollowupDelayMinutes: 24 * 60,
} as const;

/** True si aún queda presupuesto global para `count` emails reales. */
export async function hasEmailBudget(count = 1): Promise<boolean> {
  return getLabRepository().hasEmailBudget(count, getLabDailyEmailBudget());
}

/** Reserva atómica de `count` envíos. False → pasar a SIMULACIÓN. */
export async function reserveEmailBudget(count = 1): Promise<boolean> {
  return getLabRepository().tryConsumeEmailBudget(count, getLabDailyEmailBudget());
}

/** Devuelve reservas no usadas (envío fallido o parcial). */
export async function refundEmailBudget(count = 1): Promise<void> {
  if (count <= 0) return;
  await getLabRepository().refundEmailBudget(count);
}

export const BUDGET_EXHAUSTED_MESSAGE =
  "La demo ha alcanzado su presupuesto diario de envíos reales. Puedes seguir explorando las simulaciones.";
