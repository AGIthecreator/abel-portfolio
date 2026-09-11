import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/contact/sanitize";
import type { LabClassification, LabRoute, LabRouteId } from "./types";

const LOGO_URL = "https://agithecreator.com/logos/NavbarAGI.png";

/**
 * Plantillas del laboratorio.
 *
 * Hay una plantilla por ruta. La ruta la decide el servidor a partir de la
 * clasificación, así que dos mensajes distintos producen literalmente dos
 * emails distintos: distinto asunto, distinta apertura y distinto compromiso.
 */

interface RouteCopy {
  /** Asunto del email que recibe el visitante. */
  visitorSubject: string;
  /** Primera frase del cuerpo, específica de la ruta. */
  opening: string;
  /** Qué va a pasar a continuación en esta ruta. */
  next: string;
}

const ROUTE_COPY: Record<LabRouteId, RouteCopy> = {
  reserva: {
    visitorSubject: "Tu solicitud de reserva está en cola",
    opening:
      "El proceso ha leído tu mensaje, ha visto que pides disponibilidad y lo ha enviado a la cola de reservas.",
    next: "El siguiente paso sería comprobar el hueco y confirmártelo.",
  },
  presupuesto: {
    visitorSubject: "Tu petición de presupuesto está registrada",
    opening:
      "El proceso ha detectado que preguntas por condiciones económicas y ha dirigido tu mensaje a la cola comercial.",
    next: "El siguiente paso sería preparar una propuesta con alcance y precio.",
  },
  urgente: {
    visitorSubject: "Tu mensaje se ha marcado como urgente",
    opening:
      "El proceso ha encontrado señales de urgencia en tu texto y ha adelantado tu mensaje en la cola.",
    next: "El siguiente paso sería avisar a la persona de guardia antes que al resto.",
  },
  soporte: {
    visitorSubject: "Tu incidencia está registrada",
    opening:
      "El proceso ha interpretado tu mensaje como una incidencia y lo ha dirigido a la cola de soporte.",
    next: "El siguiente paso sería reproducir el fallo y darte un diagnóstico.",
  },
  documentacion: {
    visitorSubject: "Tu petición documental está registrada",
    opening:
      "El proceso ha visto que tu mensaje trata de documentos y lo ha dirigido a administración.",
    next: "El siguiente paso sería localizar el documento y enviártelo.",
  },
  integracion: {
    visitorSubject: "Tu consulta técnica está registrada",
    opening:
      "El proceso ha detectado que hablas de conectar herramientas y lo ha dirigido a la cola técnica.",
    next: "El siguiente paso sería acotar qué sistemas hay que unir.",
  },
  general: {
    visitorSubject: "Tu mensaje está registrado",
    opening:
      "El proceso ha leído tu mensaje y, al no encontrar señales claras, lo ha dejado en la cola general.",
    next: "El siguiente paso sería leerlo en persona y clasificarlo a mano.",
  },
};

/** Asunto del aviso interno. Lleva la ruta delante para poder filtrar. */
export function buildLabInternalSubject(route: LabRoute, name: string): string {
  const who = name.trim() || "Visitante";
  return `[LAB · ${route.subjectTag}] ${who}`;
}

export function buildLabVisitorSubject(route: LabRoute): string {
  return ROUTE_COPY[route.id].visitorSubject;
}

interface LabInternalEmailArgs {
  name: string;
  email: string;
  message: string;
  classification: LabClassification;
  route: LabRoute;
  runId: string;
}

/** Aviso interno disparado por una ejecución real del laboratorio. */
export function buildLabInternalEmailHtml({
  name,
  email,
  message,
  classification,
  route,
  runId,
}: LabInternalEmailArgs): string {
  const safeName = escapeHtml(name) || "Sin nombre";
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtmlWithBreaks(message);
  const safeType = escapeHtml(classification.type);
  const safeArea = escapeHtml(classification.area);
  const safePriority = escapeHtml(classification.priority);
  const safeRoute = escapeHtml(route.label);
  const safeTeam = escapeHtml(route.team);
  const safeReason = escapeHtml(route.reason);
  const safeRunId = escapeHtml(runId);

  return `
<div style="margin:0;padding:40px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#F3F1EB;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
    <div style="background:#070b13;padding:30px;text-align:center;">
      <img src="${LOGO_URL}" alt="AGI theCreator" style="max-width:200px;height:auto;border:0;" />
    </div>
    <div style="padding:34px;">
      <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#5a5f6b;margin:0 0 14px;">
        Laboratorio · ${safeRoute}
      </p>
      <h2 style="margin:0 0 26px;font-size:26px;color:#070b13;font-weight:600;">${safeName}</h2>
      <div style="margin-bottom:20px;font-size:15px;line-height:1.7;color:#2c3038;">
        <p style="margin:0 0 12px;"><strong>Email:</strong><br>${safeEmail}</p>
        <p style="margin:0 0 12px;">
          <strong>Clasificación (reglas, no IA):</strong><br>
          ${safeType} · ${safeArea} · Prioridad ${safePriority}
        </p>
        <p style="margin:0;">
          <strong>Ruta seleccionada:</strong><br>
          ${safeRoute} → ${safeTeam}<br>
          <span style="color:#5a5f6b;">${safeReason}</span>
        </p>
      </div>
      <div style="background:#ffffff;padding:22px;border-radius:12px;line-height:1.8;font-size:15px;color:#2c3038;">
        ${safeMessage}
      </div>
      <div style="margin-top:32px;padding-top:18px;border-top:1px solid rgba(0,0,0,0.08);font-size:12px;color:#5a5f6b;text-align:center;">
        AGI theCreator · Laboratorio de automatización · run ${safeRunId}
      </div>
    </div>
  </div>
</div>
`;
}

/** Confirmación al visitante, con el texto de la ruta que se ha elegido. */
export function buildLabVisitorEmailHtml(name: string, route: LabRoute): string {
  const copy = ROUTE_COPY[route.id];
  const safeName = escapeHtml(name);
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";
  const safeRoute = escapeHtml(route.label);
  const safeTeam = escapeHtml(route.team);
  const safeSla = escapeHtml(route.sla);
  const safeOpening = escapeHtml(copy.opening);
  const safeNext = escapeHtml(copy.next);

  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin:0 0 28px;">
      <img src="${LOGO_URL}" alt="AGI theCreator" width="120" style="display:block;margin:0 auto;max-width:120px;width:120px;height:auto;border:0;" />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">${greeting}</p>
      <p style="margin:0 0 18px;">
        Este email no lo he escrito yo ahora mismo: lo ha disparado el proceso que acabas de activar en el laboratorio.
      </p>
      <p style="margin:0 0 18px;">${safeOpening}</p>
      <div style="margin:0 0 18px;padding:16px 18px;background:#F3F1EB;border-radius:10px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a5f6b;">
          Ruta seleccionada
        </p>
        <p style="margin:0 0 10px;font-size:16px;color:#070b13;">${safeRoute} → ${safeTeam}</p>
        <p style="margin:0;font-size:14px;color:#2c3038;">${safeSla}</p>
      </div>
      <p style="margin:0 0 18px;">${safeNext}</p>
      <p style="margin:0 0 18px;">Tu mensaje me ha llegado. Lo leo yo, en persona, y te respondo.</p>
      <p style="margin:0;">Abel — AGI theCreator</p>
    </div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.08);">
      <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;line-height:1.5;letter-spacing:0.04em;color:#888;opacity:0.55;">
        REF: AGI_LAB_RUN // EJECUCIÓN REAL
      </p>
    </div>
  </div>
</div>
`;
}

/** Email de seguimiento programado. Se envía en el futuro, no ahora. */
export function buildLabFollowupEmailHtml(name: string, route: LabRoute): string {
  const safeName = escapeHtml(name);
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";
  const safeRoute = escapeHtml(route.label);

  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin:0 0 28px;">
      <img src="${LOGO_URL}" alt="AGI theCreator" width="120" style="display:block;margin:0 auto;max-width:120px;width:120px;height:auto;border:0;" />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">${greeting}</p>
      <p style="margin:0 0 18px;">
        Este es el seguimiento que dejaste programado en el laboratorio. Se programó en el momento en que activaste el proceso y ha salido solo, sin que nadie lo lanzara.
      </p>
      <p style="margin:0 0 18px;">
        Es el mecanismo que evita que una solicitud se quede parada: si nadie reacciona, el proceso insiste.
      </p>
      <p style="margin:0 0 18px;">Ruta de la que salió: ${safeRoute}.</p>
      <p style="margin:0;">Abel — AGI theCreator</p>
    </div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.08);">
      <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;line-height:1.5;letter-spacing:0.04em;color:#888;opacity:0.55;">
        REF: AGI_LAB_FOLLOWUP // ENVÍO PROGRAMADO
      </p>
    </div>
  </div>
</div>
`;
}

export function buildLabFollowupSubject(route: LabRoute): string {
  return `Seguimiento automático · ${route.label}`;
}

/** Email con el informe PDF adjunto. */
export function buildLabReportEmailHtml(name: string): string {
  const safeName = escapeHtml(name);
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";

  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin:0 0 28px;">
      <img src="${LOGO_URL}" alt="AGI theCreator" width="120" style="display:block;margin:0 auto;max-width:120px;width:120px;height:auto;border:0;" />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">${greeting}</p>
      <p style="margin:0 0 18px;">
        Adjunto va el informe de la ejecución que acabas de lanzar en el laboratorio. Lo ha generado el proceso, no una persona.
      </p>
      <p style="margin:0 0 18px;">
        Dentro tienes la traza completa: qué entró, cómo se clasificó, qué ruta se eligió y qué acciones se ejecutaron de verdad.
      </p>
      <p style="margin:0;">Abel — AGI theCreator</p>
    </div>
  </div>
</div>
`;
}

export const LAB_REPORT_EMAIL_SUBJECT = "Informe de tu ejecución en el laboratorio";
