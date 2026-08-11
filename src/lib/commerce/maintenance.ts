/**
 * Mantenimiento: una sola opción pública.
 * Variantes internas reservadas para el futuro (no exponer en UI).
 */

export type MaintenanceOffer = {
  name: string;
  priceFromEur: number;
  priceLabel: string;
  priceNote: string;
  summary: string;
  scopeClarification: string;
  includes: string[];
  doesNotInclude: string[];
  /** Preparado para ampliar sin mostrar planes públicos */
  internalVariants?: Array<{
    id: string;
    label: string;
    notes: string;
  }>;
};

export type MaintenanceChoice = "yes" | "no" | "later";

export const MAINTENANCE_OFFER: MaintenanceOffer = {
  name: "Mantenimiento",
  priceFromEur: 99,
  priceLabel: "Desde 99 €/mes + IVA",
  priceNote:
    "El precio final depende de las necesidades de mantenimiento de cada proyecto.",
  summary:
    "La web no termina cuando se publica. Un servicio recurrente para que AGI TheCreator siga cuidándola después del lanzamiento.",
  scopeClarification:
    "El mantenimiento cubre el cuidado técnico y pequeños ajustes. Nuevas páginas, funcionalidades, rediseños, cambios importantes de contenido, automatizaciones o trabajos que requieran desarrollo adicional se presupuestan aparte.",
  includes: [
    "Mantenimiento técnico",
    "Actualizaciones necesarias",
    "Revisión de funcionamiento",
    "Pequeños ajustes y correcciones",
    "Supervisión básica de que la web siga funcionando correctamente",
    "Apoyo ante pequeños problemas técnicos",
  ],
  doesNotInclude: [
    "Nuevas páginas o secciones importantes",
    "Nuevas funcionalidades o automatizaciones",
    "Rediseños o cambios importantes de contenido",
    "Desarrollo adicional fuera del cuidado habitual",
  ],
  internalVariants: [
    {
      id: "standard",
      label: "Estándar",
      notes: "Cuidado técnico habitual. Única opción pública por ahora.",
    },
  ],
};
