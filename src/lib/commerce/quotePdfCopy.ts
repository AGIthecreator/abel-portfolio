/**
 * Copy y condiciones del PDF de presupuesto (centralizado, editable).
 */

export const QUOTE_PDF_BRAND = {
  name: "AGI TheCreator",
  siteUrl: "https://agithecreator.com",
  email: "contacto@agithecreator.com",
  location: "Valladolid · España",
} as const;

/** Validez del presupuesto desde la fecha de emisión. */
export const QUOTE_PDF_VALIDITY_DAYS = 15;

export const QUOTE_PDF_DOCUMENT = {
  title: "Presupuesto de proyecto",
  contextHeading: "Contexto del proyecto",
  /** Usar packValueNoteFor() en el modelo; este string es fallback. */
  packValueNote:
    "Valores de referencia del catálogo. El precio del pack es el punto de partida de este conjunto.",
  orientativeNote:
    "Este presupuesto es orientativo hasta confirmar el alcance final del proyecto.",
} as const;

export const QUOTE_PDF_TERMS = [
  "Garantía inicial de aproximadamente 2 meses sobre errores y fallos de la implementación.",
  "Los cambios de alcance, nuevas funcionalidades o rediseños se presupuestan aparte.",
  "El presupuesto es orientativo hasta confirmación final del proyecto.",
  "El mantenimiento es un servicio separado del desarrollo.",
  `Validez del presupuesto: ${QUOTE_PDF_VALIDITY_DAYS} días desde la fecha de emisión.`,
] as const;

export const QUOTE_PDF_MAINTENANCE_NOTE =
  "El mantenimiento puede añadirse después de publicar. Cubre el cuidado técnico y pequeños ajustes; el desarrollo nuevo se presupuesta aparte.";
