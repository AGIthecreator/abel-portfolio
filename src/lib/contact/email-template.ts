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
