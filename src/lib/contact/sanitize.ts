/** Escapa texto para interpolación segura en plantillas HTML de correo. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Elimina saltos de línea en campos usados en cabeceras (asunto, reply-to). */
export function stripHeaderInjection(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Texto escapado con saltos de línea convertidos a <br> para el cuerpo del email. */
export function escapeHtmlWithBreaks(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}
