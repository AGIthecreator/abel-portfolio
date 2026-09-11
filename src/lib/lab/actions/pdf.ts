import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { createElement } from "react";
import {
  BUDGET_EXHAUSTED_MESSAGE,
  refundEmailBudget,
  reserveEmailBudget,
} from "../budget";
import {
  buildLabReportEmailHtml,
  LAB_REPORT_EMAIL_SUBJECT,
} from "../email-template";
import { LabReportDocument } from "../pdf/LabReportDocument";
import { labReportFilename, type LabReportModel } from "../report";
import {
  describeProviderError,
  failed,
  getLabProvider,
  simulated,
  succeeded,
  type LabActionOutcome,
} from "./provider";

/**
 * Informe PDF del laboratorio.
 *
 * Se genera en servidor con @react-pdf/renderer, igual que el PDF comercial,
 * pero con documento y modelo propios. No reutiliza el embudo de presupuesto.
 */

export async function renderLabReportBuffer(
  model: LabReportModel,
): Promise<Buffer> {
  const element = createElement(LabReportDocument, { model }) as ReactElement;
  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0],
  );
  return Buffer.from(buffer);
}

/** Envía el informe como adjunto. Es opcional: si falla, el PDF sigue siendo real. */
export async function emailLabReport(
  model: LabReportModel,
  pdf: Buffer,
): Promise<LabActionOutcome> {
  const provider = getLabProvider();
  if (!provider) {
    return simulated(
      "El informe se ha generado, pero este entorno no puede enviarlo por email.",
    );
  }

  if (!(await reserveEmailBudget(1))) return simulated(BUDGET_EXHAUSTED_MESSAGE);

  try {
    const response = await provider.client.emails.send(
      {
        from: provider.from,
        to: model.visitor.email,
        subject: LAB_REPORT_EMAIL_SUBJECT,
        html: buildLabReportEmailHtml(model.visitor.name),
        attachments: [
          { filename: labReportFilename(model), content: pdf },
        ],
        tags: [
          { name: "source", value: "laboratorio" },
          { name: "kind", value: "report" },
        ],
      },
      { idempotencyKey: `lab-report-${model.runId}` },
    );

    if (response.error || !response.data?.id) {
      await refundEmailBudget(1);
      return failed(
        "El informe se ha generado, pero el proveedor no aceptó el envío.",
        describeProviderError(response.error),
      );
    }

    return succeeded(
      "Informe enviado como adjunto por email.",
      response.data.id,
    );
  } catch (error) {
    await refundEmailBudget(1);
    return failed(
      "El informe se ha generado, pero no se pudo enviar por email.",
      describeProviderError(error),
    );
  }
}
