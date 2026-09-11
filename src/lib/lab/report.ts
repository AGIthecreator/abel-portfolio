import type { LabAction, LabClassification, LabRoute, LabStep } from "./types";

/**
 * Modelo del "Informe de automatización" del laboratorio.
 *
 * Es un modelo propio, deliberadamente independiente de `QuotePdfModel`: el
 * informe describe una ejecución, no una oferta comercial. No comparte precios,
 * productos ni IVA, y no debe acabar acoplado al embudo de presupuesto.
 *
 * Solo contiene lo que el visitante ha escrito y lo que el proceso ha hecho.
 * No se añade ningún dato que no haga falta para entender la ejecución.
 */
export interface LabReportModel {
  runId: string;
  generatedAt: string;
  visitor: {
    name: string;
    email: string;
    message: string;
  };
  classification: LabClassification;
  route: LabRoute;
  steps: readonly LabStep[];
  realActions: readonly LabAction[];
  simulatedActions: readonly LabAction[];
  /** Estado del email tal y como lo informó el proveedor, si se consultó. */
  emailStatus: string | null;
  /** Fecha del seguimiento programado, si existe. */
  followupScheduledAt: string | null;
}

interface BuildArgs {
  runId: string;
  name: string;
  email: string;
  message: string;
  classification: LabClassification;
  route: LabRoute;
  steps: readonly LabStep[];
  actions: readonly LabAction[];
  emailStatus?: string | null;
  followupScheduledAt?: string | null;
}

export function buildLabReportModel({
  runId,
  name,
  email,
  message,
  classification,
  route,
  steps,
  actions,
  emailStatus = null,
  followupScheduledAt = null,
}: BuildArgs): LabReportModel {
  return {
    runId,
    generatedAt: new Date().toISOString(),
    visitor: { name, email, message },
    classification,
    route,
    steps,
    realActions: actions.filter((action) => action.executionMode === "real"),
    simulatedActions: actions.filter(
      (action) => action.executionMode === "simulated",
    ),
    emailStatus,
    followupScheduledAt,
  };
}

export function labReportFilename(model: LabReportModel): string {
  const date = model.generatedAt.slice(0, 10);
  const shortId = model.runId.slice(0, 8);
  return `informe-automatizacion-${date}-${shortId}.pdf`;
}
