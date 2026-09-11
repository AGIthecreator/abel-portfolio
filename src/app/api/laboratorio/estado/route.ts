import { NextResponse } from "next/server";
import { getLabEmailStatus } from "@/lib/lab/actions/email";
import { LAB_LIMITS } from "@/lib/lab/budget";
import { getLabRepository } from "@/lib/lab/db";
import { guardLabAction, guardLabUsage, labError } from "@/lib/lab/guard";
import { mergeLabTrace, persistLabTrace } from "@/lib/lab/present";
import { labStatusSchema } from "@/lib/lab/schema";
import { buildStatusStep } from "@/lib/lab/steps";
import type { LabStatusResponse } from "@/lib/lab/types";

export const runtime = "nodejs";

/**
 * Estado real del email de una ejecución.
 *
 * Devuelve el último evento que informa el proveedor, sin traducirlo. Si el
 * proveedor aún no informa de nada, el estado queda pendiente en lugar de
 * afirmar que se ha entregado.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return labError("Datos inválidos", "invalid", 400);
  }

  const parsed = labStatusSchema.safeParse(body);
  if (!parsed.success) return labError("Datos inválidos", "invalid", 400);

  const guard = await guardLabAction(req, { runId: parsed.data.runId });
  if (!guard.ok) return guard.response;

  const { run } = guard;
  const repo = getLabRepository();

  const limit = await guardLabUsage(
    run,
    "statusChecks",
    LAB_LIMITS.statusChecksPerRun,
    "Has consultado el estado demasiadas veces en esta ejecución.",
  );
  if (limit) return limit;

  const emailId = run.internalEmailId ?? run.visitorEmailId;
  if (!emailId) {
    return labError(
      "Esta ejecución no generó ningún envío real que consultar.",
      "not_found",
      404,
    );
  }

  const updated = await repo.updateRun(run.runId, {
    usage: { statusChecks: run.usage.statusChecks + 1 },
  });
  const current = updated ?? {
    ...run,
    usage: { ...run.usage, statusChecks: run.usage.statusChecks + 1 },
  };

  const outcome = await getLabEmailStatus(emailId);
  const { step, action } = buildStatusStep(outcome);
  const trace = mergeLabTrace(current, step, action);
  await persistLabTrace(run.runId, trace.steps, trace.actions);

  await repo.addEvent({
    runId: run.runId,
    event: outcome.ok ? "status_checked" : "action_failed",
    detail: outcome.data?.event ?? outcome.error ?? "sin evento",
  });

  const payload: LabStatusResponse = {
    ok: true,
    status: outcome.data ?? {
      event: null,
      scheduledAt: null,
      checkedAt: new Date().toISOString(),
    },
    step,
    action,
  };

  return NextResponse.json(payload);
}
