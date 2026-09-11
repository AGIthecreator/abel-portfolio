import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Token de acceso: 32 bytes aleatorios, no es el runId. */
export function createLabAccessToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashLabAccessToken(token: string): string {
  return createHash("sha256").update(`agi-lab-at-v1:${token}`).digest("hex");
}

/** Comparación en tiempo constante. Longitudes distintas → false. */
export function accessTokensEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
