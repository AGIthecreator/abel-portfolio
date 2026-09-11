import { NextResponse } from "next/server";
import {
  cancelLabFollowup,
  rescheduleLabFollowup,
  scheduleLabFollowup,
} from "@/lib/lab/actions/followup";
import { LAB_LIMITS } from "@/lib/lab/budget";
import { getLabRepository } from "@/lib/lab/db";
import { guardLabAction, guardLabUsage, labError } from "@/lib/lab/guard";
import {
  followupFromRun,
  mergeLabTrace,
  persistLabTrace,
} from "@/lib/lab/present";
import { resolveLabRoute } from "@/lib/lab/routing";
import { labFollowupOperationSchema } from "@/lib/lab/schema";
import { buildCancelStep, buildFollowupStep } from "@/lib/lab/steps";
import type { LabRunRecord } from "@/lib/lab/store";
import type {
  LabAction,
  LabFollowupResponse,
  LabFollowupState,
  LabStep,
} from "@/lib/lab/types";

export const runtime = "nodejs";

/**
 * Seguimiento programado: programar, cancelar y reprogramar.
 *
 * Las tres operaciones son reales contra el proveedor (`scheduledAt`,
 * `emails.cancel` y `emails.update`). Ninguna se simula si el laboratorio
 * tiene credenciales propias: si el proveedor rechaza la operación, se devuelve
 * el motivo en lugar de fingir que salió bien.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return labError("Datos inválidos", "invalid", 400);
  }

  const parsed = labFollowupOperationSchema.safeParse(body);
  if (!parsed.success) return labError("Datos inválidos", "invalid", 400);

  const guard = await guardLabAction(req, parsed.data);
  if (!guard.ok) return guard.response;

  const { run } = guard;
  const repo = getLabRepository();
  const { operation, name, email, shiftMinutes } = parsed.data;
  const route = resolveLabRoute(run.routeId);

  if (operation === "schedule") {
    const limit = await guardLabUsage(
      run,
      "followups",
      LAB_LIMITS.followupsPerRun,
      "Esta ejecución ya ha programado su seguimiento.",
    );
    if (limit) return limit;

    const outcome = await scheduleLabFollowup({
      runId: run.runId,
      name,
      email,
      route,
      delayMinutes: route.followupDelayMinutes,
    });

    let current = run;
    if (outcome.ok && outcome.providerId && outcome.data) {
      const updated = await repo.updateRun(run.runId, {
        followupEmailId: outcome.providerId,
        followupScheduledAt: outcome.data.scheduledAt,
        followupCanceled: false,
        usage: {
          followups: run.usage.followups + 1,
          emails: run.usage.emails + 1,
        },
      });
      if (updated) current = updated;
      await repo.upsertFollowup(run.runId, {
        providerId: outcome.providerId,
        status: "scheduled",
        executionMode: "real",
        scheduledAt: outcome.data.scheduledAt,
        cancelled: false,
        reschedules: current.usage.reschedules,
      });
    }

    await repo.addEvent({
      runId: run.runId,
      event: outcome.ok ? "followup_scheduled" : "action_failed",
      detail: outcome.data?.scheduledAt ?? outcome.error ?? "no programado",
    });

    const { step, action } = buildFollowupStep(outcome, "schedule");
    await persistOutcomeTrace(current, step, action);
    return respond(current, step, action, outcome.ok);
  }

  if (!run.followupEmailId) {
    return labError(
      "Esta ejecución no tiene ningún seguimiento programado.",
      "not_found",
      404,
    );
  }

  if (operation === "cancel") {
    if (run.followupCanceled) {
      return labError(
        "El seguimiento de esta ejecución ya estaba cancelado.",
        "limit_reached",
        409,
      );
    }

    const outcome = await cancelLabFollowup(run.followupEmailId);
    let current = run;
    if (outcome.ok) {
      const updated = await repo.updateRun(run.runId, {
        followupCanceled: true,
      });
      if (updated) current = updated;
      await repo.upsertFollowup(run.runId, {
        providerId: run.followupEmailId,
        status: "canceled",
        executionMode: "real",
        scheduledAt: run.followupScheduledAt,
        cancelled: true,
        reschedules: run.usage.reschedules,
      });
    }

    await repo.addEvent({
      runId: run.runId,
      event: outcome.ok ? "followup_canceled" : "action_failed",
      detail: outcome.error ?? "cancelado",
    });

    const { step, action } = buildCancelStep(outcome);
    await persistOutcomeTrace(current, step, action);
    return respond(current, step, action, outcome.ok);
  }

  if (run.followupCanceled) {
    return labError(
      "El seguimiento está cancelado: ya no se puede mover.",
      "limit_reached",
      409,
    );
  }

  const limit = await guardLabUsage(
    run,
    "reschedules",
    LAB_LIMITS.reschedulesPerRun,
    "Has movido la fecha del seguimiento demasiadas veces.",
  );
  if (limit) return limit;

  const remaining = run.followupScheduledAt
    ? Math.round(
        (new Date(run.followupScheduledAt).getTime() - Date.now()) / 60_000,
      )
    : route.followupDelayMinutes;
  const delayMinutes = Math.min(
    LAB_LIMITS.maxFollowupDelayMinutes,
    Math.max(1, remaining) + (shiftMinutes ?? 60),
  );

  const outcome = await rescheduleLabFollowup(run.followupEmailId, delayMinutes);

  let current = run;
  if (outcome.ok && outcome.data) {
    const updated = await repo.updateRun(run.runId, {
      followupScheduledAt: outcome.data.scheduledAt,
      usage: { reschedules: run.usage.reschedules + 1 },
    });
    if (updated) current = updated;
    await repo.upsertFollowup(run.runId, {
      providerId: run.followupEmailId,
      status: "scheduled",
      executionMode: "real",
      scheduledAt: outcome.data.scheduledAt,
      cancelled: false,
      reschedules: current.usage.reschedules,
    });
  }

  await repo.addEvent({
    runId: run.runId,
    event: outcome.ok ? "followup_rescheduled" : "action_failed",
    detail: outcome.data?.scheduledAt ?? outcome.error ?? "no reprogramado",
  });

  const { step, action } = buildFollowupStep(outcome, "reschedule");
  await persistOutcomeTrace(current, step, action);
  return respond(current, step, action, outcome.ok);
}

async function persistOutcomeTrace(
  run: LabRunRecord,
  step: LabStep,
  action: LabAction,
): Promise<void> {
  const trace = mergeLabTrace(run, step, action);
  await persistLabTrace(run.runId, trace.steps, trace.actions);
}

/** Devuelve el estado del seguimiento leído del registro, no del cliente. */
function respond(
  run: LabRunRecord,
  step: LabStep,
  action: LabAction,
  ok: boolean,
): NextResponse {
  const derived = followupFromRun(run);
  const followup: LabFollowupState = derived ?? {
    providerId: run.followupEmailId,
    scheduledAt: run.followupCanceled ? null : run.followupScheduledAt,
    status: !run.followupEmailId
      ? ok
        ? "scheduled"
        : "failed"
      : run.followupCanceled
        ? "canceled"
        : "scheduled",
    executionMode: ok && run.followupEmailId ? "real" : "simulated",
    reschedules: run.usage.reschedules,
  };

  const payload: LabFollowupResponse = { ok: true, followup, step, action };
  return NextResponse.json(payload);
}
