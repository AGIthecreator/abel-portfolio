import { escapeHtml, stripHeaderInjection } from "@/lib/contact/sanitize";
import type { QuoteResult } from "@/lib/commerce/quote";
import type { QuoteContact, QuoteDiagnostic } from "@/lib/commerce/diagnostic";
import {
  labelBlocker,
  labelBusinessType,
  labelGoal,
  labelSituation,
  labelTimeline,
} from "@/lib/commerce/diagnostic";

function formatEur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function row(label: string, value: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#222;">
  <strong style="display:block;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#666;margin-bottom:4px;">${escapeHtml(label)}</strong>
  ${escapeHtml(value)}
</p>`;
}

export function buildQuoteLeadEmailHtml(args: {
  contact: QuoteContact;
  diagnostic: QuoteDiagnostic;
  result: QuoteResult;
}): string {
  const name = stripHeaderInjection(args.contact.name) || "Sin nombre";
  const company = args.contact.company?.trim() || "No indicada";
  const phone = args.contact.phone.trim() || "-";
  const email = args.contact.email.trim();
  const product = args.result.productName ?? "Sin producto";
  const total = `${formatEur(args.result.subtotalEur)} + IVA`;
  const maintenance =
    args.result.maintenanceMonthlyEur != null
      ? `${formatEur(args.result.maintenanceMonthlyEur)}/mes`
      : "No seleccionado";

  return `
<div style="font-family:Arial,sans-serif;background:#f4f4f4;padding:32px 16px;">
  <div style="max-width:640px;margin:auto;background:#F3F1EB;border-radius:16px;overflow:hidden;">
    <div style="background:#070b13;padding:24px;text-align:center;">
      <img src="https://agithecreator.com/logos/NavbarAGI.png" alt="AGItheCreator" style="max-width:200px;height:auto;" />
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#666;">Nuevo proyecto</p>
      <h2 style="margin:0 0 24px;font-size:24px;color:#070b13;">Lead de presupuesto</h2>

      <h3 style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#3a2d6b;">Cliente</h3>
      ${row("Nombre", name)}
      ${row("Empresa", company)}
      ${row("Email", email)}
      ${row("Teléfono", phone)}

      <div style="height:1px;background:rgba(0,0,0,0.08);margin:20px 0;"></div>

      <h3 style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#3a2d6b;">Proyecto</h3>
      ${row("Producto", product)}
      ${row("Total orientativo", total)}
      ${row("Mantenimiento", maintenance)}

      <div style="height:1px;background:rgba(0,0,0,0.08);margin:20px 0;"></div>

      <h3 style="margin:0 0 12px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#3a2d6b;">Diagnóstico</h3>
      ${row("Tipo de negocio", labelBusinessType(args.diagnostic))}
      ${row("Objetivo", labelGoal(args.diagnostic))}
      ${row("Situación actual", labelSituation(args.diagnostic))}
      ${row("Principal bloqueo", labelBlocker(args.diagnostic))}
      ${row("Plazo", labelTimeline(args.diagnostic))}

      <p style="margin:28px 0 0;font-size:12px;color:#888;text-align:center;">
        AGItheCreator · Enviado desde /presupuesto
      </p>
    </div>
  </div>
</div>`;
}

export function buildQuoteClientConfirmationEmailHtml(
  name: string,
  options?: { pdfAttached?: boolean },
): string {
  const safeName = escapeHtml(stripHeaderInjection(name) || "");
  const greeting = safeName ? `Hola ${safeName},` : "Hola,";
  const pdfNote = options?.pdfAttached
    ? `<p style="margin:0 0 18px;">
        Te adjunto el presupuesto orientativo en PDF para que puedas guardarlo o reenviarlo.
      </p>`
    : "";

  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;">
    <div style="text-align:center;margin:0 0 28px;">
      <img src="https://agithecreator.com/logos/NavbarAGI.png" alt="AGI theCreator" width="120" style="display:block;margin:0 auto;max-width:120px;height:auto;border:0;" />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">${greeting}</p>
      <p style="margin:0 0 18px;">Gracias por contarme tu proyecto.</p>
      <p style="margin:0 0 18px;">
        He recibido la información y revisaré lo que necesitas antes de ponerme en contacto contigo.
      </p>
      ${pdfNote}
      <p style="margin:0 0 18px;">
        El importe que has configurado es orientativo y lo confirmaré contigo antes de empezar.
      </p>
      <p style="margin:0;">Abel · AGI theCreator</p>
    </div>
  </div>
</div>`;
}
