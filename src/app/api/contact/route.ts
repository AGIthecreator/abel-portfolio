import { Resend } from "resend";
import { NextResponse } from "next/server";
import {
  buildClientConfirmationEmailHtml,
  buildContactEmailHtml,
  sanitizeContactFields,
} from "@/lib/contact/email-template";
import { getClientIp, isRateLimited } from "@/lib/contact/rate-limit";
import { contactFormSchema } from "@/lib/contact/schema";
import { stripHeaderInjection } from "@/lib/contact/sanitize";

/** Notificación interna (lead). */
const RESEND_FROM_LEAD = "AGI <contacto@agithecreator.com>";

/** Confirmación al cliente. */
const RESEND_FROM_CLIENT = "Abel | AGI theCreator <contacto@agithecreator.com>";

const CLIENT_CONFIRM_SUBJECT = "Confirmado: He recibido tu mensaje";

function getMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    return null;
  }

  return { apiKey, contactEmail };
}

export async function POST(req: Request) {
  const config = getMailConfig();
  if (!config) {
    return NextResponse.json({ error: "Servicio no configurado" }, { status: 503 });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo más tarde." },
      { status: 429 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { name, email, message, website } = parsed.data;

    // Honeypot: bots que rellenan el campo oculto
    if (website) {
      return NextResponse.json({ success: true });
    }

    const cleanName = stripHeaderInjection(name);
    const cleanEmail = stripHeaderInjection(email);
    const { safeName, safeEmail, safeMessageHtml } = sanitizeContactFields(
      cleanName,
      cleanEmail,
      message,
    );

    const resend = new Resend(config.apiKey);
    const subjectName = cleanName || "Sin nombre";

    const [leadResult, clientResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM_LEAD,
        to: config.contactEmail,
        subject: `Nuevo contacto · ${subjectName}`,
        replyTo: cleanEmail,
        html: buildContactEmailHtml({ safeName, safeEmail, safeMessageHtml }),
      }),
      resend.emails.send({
        from: RESEND_FROM_CLIENT,
        to: cleanEmail,
        subject: CLIENT_CONFIRM_SUBJECT,
        html: buildClientConfirmationEmailHtml(),
      }),
    ]);

    if (leadResult.status === "rejected") {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    if (leadResult.value.error) {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    // La confirmación al cliente es best-effort: no bloquea el éxito del formulario
    if (clientResult.status === "rejected" || clientResult.value?.error) {
      console.error("[contact] confirmación al cliente no enviada", {
        reason:
          clientResult.status === "rejected"
            ? clientResult.reason
            : clientResult.value.error,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
