import { NextResponse } from "next/server";
import { describeEmailEvent, getLabEmailStatus } from "@/lib/lab/actions/email";
import { emailLabReport, renderLabReportBuffer } from "@/lib/lab/actions/pdf";
import { succeeded } from "@/lib/lab/actions/provider";
import { LAB_LIMITS } from "@/lib/lab/budget";
import { getLabRepository } from "@/lib/lab/db";
import { guardLabAction, guardLabUsage, labError } from "@/lib/lab/guard";
import { mergeLabTrace, persistLabTrace } from "@/lib/lab/present";
import { rebuildRunState } from "@/lib/lab/rebuild";
import { buildLabReportModel, labReportFilename } from "@/lib/lab/report";
import { labFollowupActionSchema } from "@/lib/lab/schema";
import { buildDocumentStep } from "@/lib/lab/steps";

export const runtime = "nodejs";

/**
 * Informe PDF real de una ejecución.
 *
 * Devuelve el binario directamente para que el visitante lo descargue. Si el
 * laboratorio tiene proveedor de email configurado, además lo envía adjunto;
 * si ese envío falla, el PDF sigue siendo real y solo el envío queda marcado
 * como no completado en la cabecera de respuesta.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return labError("Datos inválidos", "invalid", 400);
  }

  const parsed = labFollowupActionSchema.safeParse(body);
  if (!parsed.success) return labError("Datos inválidos", "invalid", 400);

  const guard = await guardLabAction(req, parsed.data);
  if (!guard.ok) return guard.response;

  const { run } = guard;
  const repo = getLabRepository();

  const limit = await guardLabUsage(
    run,
    "pdfs",
    LAB_LIMITS.pdfsPerRun,
    "Has generado el informe demasiadas veces en esta ejecución.",
  );
  if (limit) return limit;

  const { name, email, message } = parsed.data;
  const { classification, route, steps, actions } = rebuildRunState(
    run,
    message,
  );

  let emailStatus: string | null = null;
  const emailId = run.internalEmailId ?? run.visitorEmailId;
  if (emailId) {
    const status = await getLabEmailStatus(emailId);
    emailStatus = status.ok
      ? describeEmailEvent(status.data?.event ?? null)
      : "No se pudo consultar el estado en el momento del informe.";
  }

  const model = buildLabReportModel({
    runId: run.runId,
    name,
    email,
    message,
    classification,
    route,
    steps,
    actions,
    emailStatus,
    followupScheduledAt: run.followupCanceled ? null : run.followupScheduledAt,
  });

  try {
    const pdf = await renderLabReportBuffer(model);
    const emailed = run.usage.pdfs === 0 ? await emailLabReport(model, pdf) : null;

    const { step, action } = buildDocumentStep(
      succeeded(
        `Informe generado en el servidor (${Math.round(pdf.byteLength / 1024)} KB).`,
      ),
      emailed,
    );
    const nextUsage = { pdfs: run.usage.pdfs + 1 };
    const updated = await repo.updateRun(run.runId, { usage: nextUsage });
    const current = updated ?? { ...run, usage: { ...run.usage, ...nextUsage } };
    const trace = mergeLabTrace(current, step, action);
    await persistLabTrace(run.runId, trace.steps, trace.actions);

    await repo.addEvent({
      runId: run.runId,
      event: "pdf_generated",
      detail: `bytes=${pdf.byteLength} email=${emailed?.ok ?? "omitido"}`,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${labReportFilename(model)}"`,
        "Cache-Control": "no-store",
        "X-Lab-Report-Emailed": emailed?.ok ? "real" : "simulated",
        "X-Lab-Report-Email-Detail": encodeURIComponent(
          emailed?.detail ?? "El informe no se ha enviado por email.",
        ),
      },
    });
  } catch (error) {
    await repo.addEvent({
      runId: run.runId,
      event: "action_failed",
      detail: `pdf: ${String(error)}`,
    });
    return labError("No se pudo generar el informe.", "server_error", 500);
  }
}
