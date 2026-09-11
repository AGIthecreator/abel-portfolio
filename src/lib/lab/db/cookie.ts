import type { NextResponse } from "next/server";
import { LAB_STORE_LIMITS } from "../store";

export const LAB_ACCESS_COOKIE = "agi_lab_at";

function parseCookieHeader(header: string, name: string): string | null {
  const parts = header.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

/**
 * Lee el token de acceso.
 *
 * La cookie httpOnly es la fuente principal. El header `X-Lab-Access` es un
 * respaldo same-origin por si el cliente reenvía el token de su sesión; no
 * sustituye a la cookie cuando ambas están presentes.
 */
export function readLabAccessToken(req: Request): string | null {
  const cookie = parseCookieHeader(req.headers.get("cookie") ?? "", LAB_ACCESS_COOKIE);
  if (cookie) return cookie;
  const header = req.headers.get("x-lab-access")?.trim();
  return header || null;
}

export function applyLabAccessCookie(
  response: NextResponse,
  token: string,
  maxAgeSec?: number,
): void {
  response.cookies.set({
    name: LAB_ACCESS_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/laboratorio",
    maxAge:
      maxAgeSec ?? Math.floor(LAB_STORE_LIMITS.runTtlMs / 1000),
  });
}

export function remainingCookieMaxAge(expiresAt: number): number {
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
}

export function clearLabAccessCookie(response: NextResponse): void {
  response.cookies.set({
    name: LAB_ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/laboratorio",
    maxAge: 0,
  });
}
