import { Resend } from "resend";
import { NextResponse } from "next/server";
import {
  buildContactEmailHtml,
  sanitizeContactFields,
} from "@/lib/contact/email-template";
import { getClientIp, isRateLimited } from "@/lib/contact/rate-limit";
import { contactFormSchema } from "@/lib/contact/schema";
import { stripHeaderInjection } from "@/lib/contact/sanitize";

/** Remitente verificado en Resend (dominio agithecreator.com). */
const RESEND_FROM = "AGI <contacto@agithecreator.com>";

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

    await resend.emails.send({
      from: RESEND_FROM,
      to: config.contactEmail,
      subject: `Nuevo contacto · ${subjectName}`,
      replyTo: cleanEmail,
      html: buildContactEmailHtml({ safeName, safeEmail, safeMessageHtml }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
