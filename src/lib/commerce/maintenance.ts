/**
 * Mantenimiento: una sola opción pública.
 * Variantes internas reservadas para el futuro (no exponer en UI).
 */

import { PUBLIC_RATES, formatEurAmount } from "./rates";

export type MaintenanceOffer = {
  name: string;
  priceFromEur: number;
  /** Tarifa pública anterior. Solo se muestra tachada. No entra en cálculos. */
  previousPublicEur: number;
  priceLabel: string;
  priceNote: string;
  summary: string;
  /** Para quién, en la vista principal de /precios. */
  audience: string;
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
  priceFromEur: PUBLIC_RATES.maintenanceMonthlyEur,
  previousPublicEur: PUBLIC_RATES.maintenancePreviousEur,
  priceLabel: `${formatEurAmount(PUBLIC_RATES.maintenanceMonthlyEur)}/mes + IVA`,
  priceNote:
    "La referencia cubre el cuidado técnico habitual. Si el proyecto necesita más seguimiento, se concreta antes de empezar.",
  audience: "Para webs ya publicadas que necesitan seguimiento.",
  summary: "Tu web supervisada, actualizada y funcionando correctamente.",
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
