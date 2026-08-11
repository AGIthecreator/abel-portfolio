import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getClientIp, isRateLimited } from "@/lib/contact/rate-limit";
import { stripHeaderInjection } from "@/lib/contact/sanitize";
import { buildQuotePdfModel } from "@/lib/commerce/buildQuotePdfModel";
import { validateAndBuildQuoteSubmission } from "@/lib/commerce/quoteSchema";
import {
  buildQuoteClientConfirmationEmailHtml,
  buildQuoteLeadEmailHtml,
} from "@/lib/commerce/quoteEmail";
import { quotePdfFilename, renderQuotePdfBuffer } from "@/lib/pdf/renderQuotePdf";

export const runtime = "nodejs";

const RESEND_FROM_LEAD = "AGI <contacto@agithecreator.com>";
const RESEND_FROM_CLIENT = "Abel | AGI theCreator <contacto@agithecreator.com>";
const CLIENT_SUBJECT = "He recibido tu proyecto";

function getMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  if (!apiKey || !contactEmail) return null;
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

    const validated = validateAndBuildQuoteSubmission(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: validated.status },
      );
    }

    if (validated.honeypot) {
      return NextResponse.json({ success: true, pdfAttached: false });
    }

    const { contact, diagnostic, result, input, timestamp } = validated;
    const cleanName = stripHeaderInjection(contact.name);
    const cleanEmail = stripHeaderInjection(contact.email);

    const quoteId = `q_${Date.now().toString(36)}`;
    let pdfAttached = false;
    let pdfAttachment:
      | { filename: string; content: string; contentType: string }
      | undefined;

    try {
      const model = buildQuotePdfModel({
        quoteId,
        timestamp,
        input,
        result,
        diagnostic,
        contact,
      });
      const pdfBuffer = await renderQuotePdfBuffer(model);
      pdfAttachment = {
        filename: quotePdfFilename(model),
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      };
      pdfAttached = true;
    } catch (err) {
      console.error("[quote] PDF no generado; emails sin adjunto", err);
      pdfAttached = false;
      pdfAttachment = undefined;
    }

    const resend = new Resend(config.apiKey);
    const subjectName = cleanName || "Sin nombre";
    const productLabel = result.productName ?? "Proyecto";
    const attachments = pdfAttachment ? [pdfAttachment] : undefined;

    const [leadResult, clientResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM_LEAD,
        to: config.contactEmail,
        subject: `Nuevo proyecto · ${productLabel} · ${subjectName}`,
        replyTo: cleanEmail,
        html: buildQuoteLeadEmailHtml({ contact, diagnostic, result }),
        ...(attachments ? { attachments } : {}),
      }),
      resend.emails.send({
        from: RESEND_FROM_CLIENT,
        to: cleanEmail,
        subject: CLIENT_SUBJECT,
        html: buildQuoteClientConfirmationEmailHtml(cleanName, {
          pdfAttached,
        }),
        ...(attachments ? { attachments } : {}),
      }),
    ]);

    if (leadResult.status === "rejected" || leadResult.value.error) {
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    if (clientResult.status === "rejected" || clientResult.value?.error) {
      console.error("[quote] confirmación al cliente no enviada", {
        reason:
          clientResult.status === "rejected"
            ? clientResult.reason
            : clientResult.value.error,
      });
      // Si el email al cliente falló, no afirmamos que el PDF llegó por email.
      pdfAttached = false;
    }

    return NextResponse.json({
      success: true,
      pdfAttached,
      quote: {
        productId: result.productId,
        productName: result.productName,
        subtotalEur: result.subtotalEur,
        vatEur: result.vatEur,
        totalEur: result.totalEur,
        maintenanceMonthlyEur: result.maintenanceMonthlyEur,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
