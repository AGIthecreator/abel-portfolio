import { hashLabIdentifier } from "./store";
import { getLabRepository } from "./db";
import { LAB_STORE_LIMITS } from "./store";

/**
 * Rate limit propio del laboratorio (ventana deslizante).
 * Reutiliza `getClientIp` del módulo de contacto para no duplicar la lectura
 * de cabeceras, pero mantiene su propio contador: la demo admite más intentos
 * que el formulario de contacto porque es una experiencia interactiva.
 *
 * La IP se hashea antes de persistir. El backend (Supabase o memoria) es el
 * que cuenta.
 */
export async function isLabRateLimited(ip: string): Promise<boolean> {
  return getLabRepository().isRateLimited(hashLabIdentifier(ip));
}

export const LAB_RATE_LIMIT = {
  windowMs: LAB_STORE_LIMITS.rateWindowMs,
  maxRequests: LAB_STORE_LIMITS.rateMaxRequests,
} as const;
