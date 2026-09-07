/** Datos públicos de contacto (única fuente). */

export const CONTACT_EMAIL = "contacto@agithecreator.com" as const;
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}` as const;
export const CONTACT_LOCATION = "Valladolid · España" as const;

/** Abel opera AGI TheCreator. Misma ficha visual que colaboradores. */
export const OPERATOR = {
  firstName: "Abel",
  role: "Desarrollo",
  note: "Webs, automatizaciones y sistemas a medida para negocios de toda España.",
  toolsIntro:
    "Cada encargo pide un montaje distinto: webs y apps, datos, automatización, ecommerce y cobros online.",
  tools:
    "Next.js, React, Vue, Angular, React Native, TypeScript, Java, Node, Python, PostgreSQL, Supabase, n8n, Make, Airtable, Stripe, Vercel, Cloudflare.",
} as const;

/** Firma pública en emails / copy. */
export const CONTACT_OPERATOR = OPERATOR.firstName;

/** Colaboradores puntuales. Dominio real de Aitor: rollanstudio.com */
export const COLLABORATORS = [
  {
    firstName: "Aitor",
    studio: "Rollan Studio",
    href: "https://rollanstudio.com",
    role: "Diseño gráfico",
    note: "Más de quince años de trayectoria a nivel nacional, con empresas nacionales TOP.",
  },
] as const;

const WHATSAPP_PREFILL = encodeURIComponent(
  "Hola Abel, quería comentarte una idea que tengo para mi negocio.",
);

/** España: 34 + 9 dígitos */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 9 && /^[679]/.test(digits)) {
    return `34${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("34")) {
    return digits;
  }
  return digits;
}

export function getWhatsAppNumber(): string {
  return normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "711206230",
  );
}

export function getWhatsAppHref(prefill: string = WHATSAPP_PREFILL): string {
  const number = getWhatsAppNumber();
  if (!number) return "";
  return `https://wa.me/${number}?text=${prefill}`;
}

/** Presentación legible: +34 711 206 230 */
export function formatWhatsAppDisplay(e164Digits: string): string {
  if (!e164Digits) return "";
  if (e164Digits.length === 11 && e164Digits.startsWith("34")) {
    const local = e164Digits.slice(2);
    return `+34 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return `+${e164Digits}`;
}
