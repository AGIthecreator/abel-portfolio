/**
 * Presupuesto corto con la misma plantilla que el PDF del formulario.
 * Sobrescribe public/propuesta-web-reclamaciones-hipotecarias.pdf
 *
 * Uso: npx tsx scripts/make-propuesta-reclamaciones.tsx
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { QuotePdfLine, QuotePdfModel } from "../src/lib/commerce/buildQuotePdfModel";
import { packValueNoteFor } from "../src/lib/commerce/copy";
import { VAT_RATE } from "../src/lib/commerce/rules";
import {
  QUOTE_PDF_BRAND,
  QUOTE_PDF_DOCUMENT,
  QUOTE_PDF_MAINTENANCE_NOTE,
  QUOTE_PDF_TERMS,
  QUOTE_PDF_VALIDITY_DAYS,
} from "../src/lib/commerce/quotePdfCopy";
import { renderQuotePdfBuffer } from "../src/lib/pdf/renderQuotePdf";

const OUT = path.join(
  process.cwd(),
  "public",
  "propuesta-web-reclamaciones-hipotecarias.pdf",
);

const PARTIDAS: QuotePdfLine[] = [
  {
    id: "analisis",
    name: "Análisis, estrategia y arquitectura web",
    description:
      "Estudio de estructura, público objetivo, navegación y planteamiento de captación.",
    priceEur: 250,
  },
  {
    id: "identidad",
    name: "Identidad visual / creación o renovación de logo",
    description: "Logo adaptado a la nueva web y sistema visual coherente.",
    priceEur: 300,
  },
  {
    id: "ui",
    name: "Dirección de arte y diseño UI",
    description:
      "Diseño de la interfaz, jerarquía visual, responsive y adaptación para un público adulto o mayor.",
    priceEur: 400,
  },
  {
    id: "desarrollo",
    name: "Desarrollo web",
    description:
      "Desarrollo completo de la nueva web, componentes, responsive, navegación, formularios y funcionalidades acordadas.",
    priceEur: 1150,
  },
  {
    id: "paginas",
    name: "Páginas y contenidos estructurales",
    description:
      "Desarrollo de aproximadamente 10–14 páginas, incluyendo las principales áreas de especialización, captación y páginas informativas.",
    priceEur: 400,
  },
  {
    id: "formularios",
    name: "Formularios + backend + conexión con Excel",
    description:
      "Formularios de captación y recepción de solicitudes en el sistema existente, sin incluir automatizaciones adicionales.",
    priceEur: 250,
  },
  {
    id: "seo",
    name: "SEO nacional + migración",
    description:
      "SEO técnico y on-page, estructura nacional, metadatos, indexación, migración y estrategia para los dominios existentes.",
    priceEur: 450,
  },
  {
    id: "dominios",
    name: "Gestión técnica de dominios",
    description:
      "Revisión y planteamiento de .com, .es y demás dominios para evitar problemas de duplicidad y consolidar autoridad.",
    priceEur: 150,
  },
  {
    id: "legales",
    name: "Legales + integraciones técnicas",
    description:
      "Implementación técnica de aviso legal, privacidad, cookies y elementos necesarios de la web.",
    priceEur: 90,
  },
  {
    id: "qa",
    name: "QA + optimización + lanzamiento",
    description:
      "Revisión final, responsive, formularios, enlaces, rendimiento, errores, SEO técnico y puesta en producción.",
    priceEur: 300,
  },
];

const NET = 3490;
const BUNDLE = PARTIDAS.reduce((sum, line) => sum + (line.priceEur ?? 0), 0);
const vatEur = Math.round(NET * VAT_RATE * 100) / 100;
const issuedAt = "2026-09-28T10:00:00.000Z";
const validUntil = new Date(issuedAt);
validUntil.setUTCDate(validUntil.getUTCDate() + QUOTE_PDF_VALIDITY_DAYS);

const model: QuotePdfModel = {
  brand: QUOTE_PDF_BRAND,
  documentTitle: QUOTE_PDF_DOCUMENT.title,
  issuedAt,
  validUntil: validUntil.toISOString(),
  validityDays: QUOTE_PDF_VALIDITY_DAYS,
  quoteId: "2026-09",
  client: {
    name: "",
    email: "",
    phone: "",
  },
  product: {
    id: "redisenio-reclamaciones",
    name: "Rediseño web",
    summary:
      "Rediseño para un despacho de reclamaciones hipotecarias. El alcance es el de las partidas: estrategia y captación, experiencia para público adulto, identidad visual, desarrollo, formularios conectados al sistema existente, SEO nacional, migración, dominios y lanzamiento.",
    packPriceEur: NET,
    includes: [],
    doesNotInclude: [
      "Campañas de Google Ads",
      "Gestión mensual de SEO (presupuesto según estrategia)",
      "Gestión de redes sociales",
      "Producción profesional de vídeo (+250–400 € orientativos)",
      "Sesión fotográfica profesional (según producción)",
      "Redacción jurídica especializada que requiera información no proporcionada",
      "Costes de herramientas o servicios de terceros",
      "Contenido y artículos (presupuesto según volumen)",
      "Automatizaciones posteriores (presupuesto según proceso)",
      "CRM",
      "WhatsApp API",
      "Calendario",
      "Pagos online",
      "Mantenimiento recurrente",
    ],
  },
  includedLines: PARTIDAS,
  bundleValueEur: BUNDLE,
  packSavingsEur: BUNDLE > NET ? BUNDLE - NET : null,
  extras: [],
  extrasTotalEur: 0,
  maintenance: {
    selected: false,
    name: "Mantenimiento",
    monthlyEur: null,
    summary: "",
    includes: [],
    noteWhenNotSelected: `${QUOTE_PDF_MAINTENANCE_NOTE} AGI Care, desde 79 €/mes + IVA, no forma parte de este presupuesto.`,
  },
  totals: {
    subtotalEur: NET,
    vatRate: VAT_RATE,
    vatEur,
    totalEur: Math.round((NET + vatEur) * 100) / 100,
  },
  context: {
    business: "",
    goal: "",
    situation: "",
    blocker: "",
    timeline: "",
  },
  terms: QUOTE_PDF_TERMS,
  packValueNote: packValueNoteFor(BUNDLE, NET),
  orientativeNote: QUOTE_PDF_DOCUMENT.orientativeNote,
  priceClose: {
    partsValueEur: BUNDLE,
    adjustmentEur: BUNDLE - NET,
    finalEur: NET,
    note: "La diferencia de 250 € no es una partida de trabajo. Es un ajuste comercial del proyecto sobre el valor de las partidas.",
  },
};

async function main() {
  const buffer = await renderQuotePdfBuffer(model);
  writeFileSync(OUT, buffer);
  const latin = buffer.toString("latin1");
  const counts = [...latin.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,120}?\/Count\s+(\d+)/g)].map(
    (match) => Number(match[1]),
  );
  const pages = counts.length ? Math.max(...counts) : 0;
  if (BUNDLE !== 3740 || NET !== 3490 || BUNDLE - NET !== 250) {
    throw new Error(`Desglose inesperado: partidas ${BUNDLE}, final ${NET}`);
  }
  console.log(`Partidas ${BUNDLE} € · ajuste −${BUNDLE - NET} € · final ${NET} € + IVA`);
  console.log(`PDF ${pages} páginas · ${(buffer.length / 1024).toFixed(0)} KB`);
  console.log(OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
