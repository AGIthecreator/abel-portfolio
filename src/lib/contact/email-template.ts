import { escapeHtml, escapeHtmlWithBreaks } from "@/lib/contact/sanitize";

type ContactEmailFields = {
  safeName: string;
  safeEmail: string;
  safeMessageHtml: string;
};

export function buildContactEmailHtml({
  safeName,
  safeEmail,
  safeMessageHtml,
}: ContactEmailFields): string {
  const displayName = safeName || "Sin nombre";

  return `
<div style="
font-family:Arial,sans-serif;
background:#f4f4f4;
padding:40px;
">

<div style="
max-width:640px;
margin:auto;
background:#F3F1EB;
border-radius:20px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.08);
">

<div style="
background:#070b13;
padding:30px;
text-align:center;
">

<img
src="https://agithecreator.com/logos/NavbarAGI.png"
alt="AGItheCreator"
style="
max-width:220px;
height:auto;
"
/>

</div>

<div style="padding:35px">

<p style="
font-size:11px;
letter-spacing:3px;
text-transform:uppercase;
color:#666;
margin:0 0 15px;
">
Nuevo contacto
</p>

<h2 style="
margin:0 0 30px;
font-size:28px;
color:#070b13;
font-weight:600;
">
${displayName}
</h2>

<div style="
margin-bottom:20px;
font-size:15px;
line-height:1.7;
">

<p>
<strong>Email:</strong><br>
${safeEmail}
</p>

</div>

<div style="
background:white;
padding:22px;
border-radius:12px;
line-height:1.8;
font-size:15px;
color:#333;
">

${safeMessageHtml}

</div>

<div style="
margin-top:35px;
padding-top:20px;
border-top:1px solid rgba(0,0,0,0.08);
font-size:12px;
color:#666;
text-align:center;
">

AGItheCreator · Mensaje recibido desde la web

</div>

</div>

</div>

</div>
`;
}

export function sanitizeContactFields(name: string, email: string, message: string) {
  return {
    safeName: escapeHtml(name),
    safeEmail: escapeHtml(email),
    safeMessageHtml: escapeHtmlWithBreaks(message),
  };
}

const CONFIRM_LOGO_URL = "https://agithecreator.com/logos/NavbarAGI.png";

/** Confirmación automática al remitente del formulario. */
export function buildClientConfirmationEmailHtml(): string {
  return `
<div style="margin:0;padding:32px 20px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin:0 0 28px;">
      <img
        src="${CONFIRM_LOGO_URL}"
        alt="AGI theCreator"
        width="120"
        style="display:block;margin:0 auto;max-width:120px;width:120px;height:auto;border:0;"
      />
    </div>
    <div style="font-size:15px;line-height:1.75;color:#1a1a1a;">
      <p style="margin:0 0 18px;">Hola,</p>
      <p style="margin:0 0 18px;">
        Solo te escribo de forma automática para confirmarte que tu mensaje me ha llegado correctamente.
      </p>
      <p style="margin:0 0 18px;">
        Lo leeré hoy mismo y te daré una respuesta en cuanto pueda sentarme a revisarlo con calma (normalmente en menos de 24h).
      </p>
      <p style="margin:0 0 18px;">Hablamos pronto.</p>
      <p style="margin:0;">Abel — AGI theCreator</p>
    </div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.08);">
      <p style="margin:0;font-family:ui-monospace,'Courier New',monospace;font-size:10px;line-height:1.5;letter-spacing:0.04em;color:#888;opacity:0.55;">
        REF: AGISTUDIO_CONFIRM_MSG // SISTEMA OPERATIVO
      </p>
    </div>
  </div>
</div>
`;
}
