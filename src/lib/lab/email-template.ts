import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/contact/sanitize";
import type { LabClassification, LabRoute, LabRouteId } from "./types";

const LOGO_URL = "https://agithecreator.com/logos/NavbarAGI.png";

/**
 * Plantillas del laboratorio.
 *
 * Hay una plantilla por ruta. La ruta la decide el servidor a partir de la
 * clasificación, así que dos mensajes distintos producen literalmente dos
 * emails distintos: distinto asunto, distinta apertura y distinto compromiso.
 * El correo al visitante nombra el proceso, lo ya ejecutado y lo que sigue.
 */

interface RouteCopy {
  /** Asunto del email que recibe el visitante. */
  visitorSubject: string;
  /** Qué ha reconocido el proceso en este mensaje. */
  opening: string;
  /** Qué sigue haciendo esta ruta con el caso ya ordenado. */
  next: string;
  /** Por qué esto importa en un negocio de verdad. */
  business: string;
}

const ROUTE_COPY: Record<LabRouteId, RouteCopy> = {
  reserva: {
    visitorSubject: "El proceso de reservas ya ha recibido tu solicitud",
    opening:
      "Ha identificado que pides disponibilidad o una cita y ha abierto el proceso de reservas.",
    next: "Comprobar el hueco y confirmártelo, sin que la petición se quede en un chat.",
    business:
      "En un negocio real, esto es lo que deja de depender de que alguien esté mirando el WhatsApp para no perder una mesa o una cita.",
  },
  presupuesto: {
    visitorSubject: "El proceso comercial ya ha registrado tu petición",
    opening:
      "Ha visto que preguntas por condiciones económicas y ha abierto el proceso de presupuesto.",
    next: "Preparar una propuesta con alcance y precio, con el caso ya ordenado para el equipo comercial.",
    business:
      "En un negocio real, esto es lo que evita que un pedido de precio se pierda entre mensajes y se conteste tarde o dos veces.",
  },
  urgente: {
    visitorSubject: "Tu caso ha entrado por la ruta urgente",
    opening:
      "Ha encontrado señales de urgencia y ha adelantado tu mensaje: no entra en la cola normal.",
    next: "Avisar a quien está de guardia antes que al resto.",
    business:
      "En un negocio real, esto es lo que separa una cola normal de lo que no puede esperar.",
  },
  soporte: {
    visitorSubject: "El proceso de soporte ya ha registrado tu incidencia",
    opening:
      "Ha interpretado tu mensaje como un fallo o una incidencia y ha abierto el proceso de soporte.",
    next: "Reproducir el fallo y darte un diagnóstico, con el caso ya clasificado.",
    business:
      "En un negocio real, esto es lo que evita que una incidencia viva solo en la memoria de quien pilló el mensaje.",
  },
  documentacion: {
    visitorSubject: "El proceso documental ya ha registrado tu petición",
    opening:
      "Ha visto que tu mensaje trata de documentos o facturación y lo ha dirigido a administración.",
    next: "Localizar el documento y enviártelo, con la petición ya registrada.",
    business:
      "En un negocio real, esto es lo que impide que una factura o un contrato dependan de un mensaje que nadie llegó a registrar.",
  },
  integracion: {
    visitorSubject: "El proceso técnico ya ha registrado tu consulta",
    opening:
      "Ha detectado que hablas de conectar herramientas y ha abierto la ruta técnica.",
    next: "Acotar qué sistemas hay que unir, separado ya de una consulta general.",
    business:
      "En un negocio real, esto es lo que evita tratar una integración como un mensaje más de la bandeja.",
  },
  general: {
    visitorSubject: "El proceso ya ha recibido tu mensaje",
    opening:
      "No ha encontrado una señal lo bastante clara para especializar la ruta, así que lo ha dejado en la cola general. Mejor eso que clasificar mal.",
    next: "Leerlo con el contexto que el proceso ya ha reunido, no desde cero.",
    business:
      "En un negocio real, esto es lo que hace un sistema cuando no está seguro: no inventa, deja el caso preparado para alguien.",
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

function followupLine(route: LabRoute): string {
  const minutes = route.followupDelayMinutes;
  if (minutes <= 5) {
    return "Si en unos minutos nadie ha reaccionado, el proceso insiste solo.";
  }
  return `Si en ${minutes} minutos nadie ha reaccionado, el proceso insiste solo.`;
}

/** Confirmación al visitante: proceso elegido, lo ya ejecutado y lo que sigue. */
export function buildLabVisitorEmailHtml(
  name: string,
  route: LabRoute,
  classification: LabClassification,
): string {
  const copy = ROUTE_COPY[route.id];
  const safeName = escapeHtml(name);
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";
  const safeRoute = escapeHtml(route.label);
  const safeTeam = escapeHtml(route.team);
  const safeSla = escapeHtml(route.sla);
  const safeReason = escapeHtml(route.reason);
  const safePriority = escapeHtml(classification.priority);
  const safeOpening = escapeHtml(copy.opening);
  const safeNext = escapeHtml(copy.next);
  const safeBusiness = escapeHtml(copy.business);
  const safeFollowup = escapeHtml(followupLine(route));

  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin:0 0 28px;">
      <img src="${LOGO_URL}" alt="AGI theCreator" width="120" style="display:block;margin:0 auto;max-width:120px;width:120px;height:auto;border:0;" />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">${greeting}</p>
      <p style="margin:0 0 18px;">
        Este correo no lo he escrito yo ahora. Lo ha disparado el proceso que acabas de activar en el laboratorio.
      </p>
      <p style="margin:0 0 18px;">${safeOpening}</p>
      <div style="margin:0 0 18px;padding:16px 18px;background:#F3F1EB;border-radius:10px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a5f6b;">
          Proceso elegido
        </p>
        <p style="margin:0 0 8px;font-size:16px;color:#070b13;">${safeRoute}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#2c3038;">Equipo: ${safeTeam}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#2c3038;">Prioridad: ${safePriority}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#2c3038;">${safeSla}</p>
        <p style="margin:0;font-size:13px;color:#5a5f6b;">${safeReason}</p>
      </div>
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a5f6b;">
        Lo que ya ha hecho
      </p>
      <ul style="margin:0 0 18px;padding:0 0 0 18px;color:#2c3038;">
        <li style="margin:0 0 6px;">Ha recibido la solicitud.</li>
        <li style="margin:0 0 6px;">La ha clasificado con reglas, no con IA.</li>
        <li style="margin:0 0 6px;">Ha avisado al equipo responsable.</li>
        <li style="margin:0;">Te ha enviado esta confirmación.</li>
      </ul>
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5a5f6b;">
        Lo que lleva a partir de aquí
      </p>
      <p style="margin:0 0 10px;">${safeNext}</p>
      <p style="margin:0 0 18px;">${safeFollowup}</p>
      <p style="margin:0 0 18px;">${safeBusiness}</p>
      <p style="margin:0 0 18px;">
        Eso es automatizar: la parte repetible ocurre sola. Una persona interviene cuando hace falta criterio, no para copiar el mensaje de un sitio a otro.
      </p>
      <p style="margin:0 0 18px;">
        Cuando lo lea, te respondo yo. El proceso ya ha hecho la parte que no debería esperar a que yo esté delante.
      </p>
      <p style="margin:0;">Abel. AGI theCreator</p>
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
