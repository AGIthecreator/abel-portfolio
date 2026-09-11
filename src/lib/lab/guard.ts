import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/contact/rate-limit";
import { hashLabAccessToken } from "./db/crypto";
import { readLabAccessToken } from "./db/cookie";
import { getLabRepository } from "./db";
import { isLabRateLimited } from "./rate-limit";
import { hashLabPayload, type LabRunRecord } from "./store";
import type { LabErrorResponse } from "./types";

/**
 * Controles comunes de las acciones posteriores a una ejecución.
 *
 * Rate limit compartido con `/run`. El acceso exige el token de la cookie
 * (o `X-Lab-Access`), no el `runId` suelto. Token ausente o incorrecto → 404,
 * igual que si la ejecución no existiera: no se confirma enumeración.
 */

export function labError(
  error: string,
  code: LabErrorResponse["code"],
  status: number,
): NextResponse {
  return NextResponse.json({ ok: false, error, code }, { status });
}

export interface LabGuardOk {
  ok: true;
  run: LabRunRecord;
  clientIp: string;
}

export interface LabGuardFail {
  ok: false;
  response: NextResponse;
}

const MISSING_RUN_MESSAGE =
  "Esta ejecución ya no está disponible en el servidor. Vuelve a activar el proceso.";

/** Comprueba rate limit, token de acceso e integridad de la entrada. */
export async function guardLabAction(
  req: Request,
  input: { runId: string; name?: string; email?: string; message?: string },
): Promise<LabGuardOk | LabGuardFail> {
  const clientIp = getClientIp(req);

  if (await isLabRateLimited(clientIp)) {
    return {
      ok: false,
      response: labError(
        "Demasiados intentos. Inténtalo más tarde.",
        "rate_limited",
        429,
      ),
    };
  }

  const token = readLabAccessToken(req);
  if (!token) {
    return { ok: false, response: labError(MISSING_RUN_MESSAGE, "not_found", 404) };
  }

  const repo = getLabRepository();
  const run = await repo.getRunByAccessTokenHash(hashLabAccessToken(token));

  if (!run || run.runId !== input.runId) {
    return { ok: false, response: labError(MISSING_RUN_MESSAGE, "not_found", 404) };
  }

  if (input.name != null && input.email != null && input.message != null) {
    const expected = hashLabPayload({
      name: input.name,
      email: input.email,
      message: input.message,
    });
    if (expected !== run.payloadHash) {
      await repo.addEvent({
        runId: run.runId,
        event: "run_rejected",
        detail: "hash de entrada no coincide",
      });
      return {
        ok: false,
        response: labError(
          "Los datos no coinciden con los de la ejecución original.",
          "invalid",
          400,
        ),
      };
    }
  }

  return { ok: true, run, clientIp };
}

/** Comprueba un contador de uso de la ejecución antes de gastar cuota. */
export async function guardLabUsage(
  run: LabRunRecord,
  key: keyof LabRunRecord["usage"],
  limit: number,
  message: string,
): Promise<NextResponse | null> {
  if (run.usage[key] >= limit) {
    await getLabRepository().addEvent({
      runId: run.runId,
      event: "limit_reached",
      detail: `${key}>=${limit}`,
    });
    return labError(message, "limit_reached", 429);
  }
  return null;
}
