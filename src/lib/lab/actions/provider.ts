import { Resend } from "resend";
import { getLabMailConfig, labMailUnavailableReason } from "../config";
import type { LabExecutionMode } from "../types";

/**
 * Único punto del proyecto donde el laboratorio instancia el proveedor de email.
 *
 * Ningún componente React llama a Resend. Todo pasa por `lib/lab/actions/*`,
 * que se ejecuta solo en servidor y devuelve resultados estructurados.
 */

/** Resultado uniforme de cualquier acción del laboratorio. */
export interface LabActionOutcome<T = undefined> {
  /** True solo si la acción se completó de verdad. */
  ok: boolean;
  /** `real` únicamente cuando el proveedor ejecutó la operación. */
  executionMode: LabExecutionMode;
  /** Identificador devuelto por el proveedor, si lo hay. */
  providerId?: string;
  /** Explicación en lenguaje llano de lo que ha pasado. */
  detail: string;
  /** Motivo técnico del fallo, si falló. */
  error?: string;
  data?: T;
}

export function simulated<T = undefined>(
  detail: string,
  data?: T,
): LabActionOutcome<T> {
  return { ok: false, executionMode: "simulated", detail, data };
}

export function failed<T = undefined>(
  detail: string,
  error: string,
): LabActionOutcome<T> {
  return { ok: false, executionMode: "simulated", detail, error };
}

export function succeeded<T = undefined>(
  detail: string,
  providerId?: string,
  data?: T,
): LabActionOutcome<T> {
  return { ok: true, executionMode: "real", detail, providerId, data };
}

/**
 * Devuelve el cliente del proveedor o `null` si el laboratorio no tiene
 * credenciales propias. Nunca recurre a las credenciales de `/contacto`.
 */
export function getLabProvider(): {
  client: Resend;
  internalRecipient: string;
  from: string;
} | null {
  const config = getLabMailConfig();
  if (!config) return null;

  return {
    client: new Resend(config.apiKey),
    internalRecipient: config.internalRecipient,
    from: config.from,
  };
}

export function providerUnavailableOutcome<T = undefined>(): LabActionOutcome<T> {
  return simulated<T>(labMailUnavailableReason());
}

/** Normaliza cualquier excepción del proveedor a un mensaje corto. */
export function describeProviderError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  if (error instanceof Error && error.message) return error.message;
  return "Error no identificado del proveedor de email.";
}
