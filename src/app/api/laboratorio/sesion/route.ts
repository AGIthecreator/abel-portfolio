import { NextResponse } from "next/server";
import {
  applyLabAccessCookie,
  clearLabAccessCookie,
  readLabAccessToken,
  remainingCookieMaxAge,
} from "@/lib/lab/db/cookie";
import { hashLabAccessToken } from "@/lib/lab/db/crypto";
import { getLabRepository } from "@/lib/lab/db";
import { activationFromRun } from "@/lib/lab/present";
import type { LabSessionResponse } from "@/lib/lab/types";

export const runtime = "nodejs";

/**
 * Reentrada del laboratorio.
 *
 * GET restaura la ejecución asociada a la cookie httpOnly. No ejecuta acciones.
 * DELETE olvida solo la cookie de este visitante: «Empezar de nuevo».
 * No acepta runId ni borra filas de otras ejecuciones.
 */
export async function GET(req: Request) {
  const token = readLabAccessToken(req);
  if (!token) {
    const payload: LabSessionResponse = { ok: true, found: false };
    return NextResponse.json(payload);
  }

  const repo = getLabRepository();
  const run = await repo.getRunByAccessTokenHash(hashLabAccessToken(token));
  const activation = run ? activationFromRun(run) : null;

  if (!run || !activation) {
    const response = NextResponse.json({
      ok: true,
      found: false,
    } satisfies LabSessionResponse);
    if (!run) clearLabAccessCookie(response);
    return response;
  }

  const payload: LabSessionResponse = { ok: true, found: true, activation };
  const response = NextResponse.json(payload);
  applyLabAccessCookie(
    response,
    token,
    remainingCookieMaxAge(run.expiresAt),
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, found: false } satisfies LabSessionResponse);
  clearLabAccessCookie(response);
  return response;
}
