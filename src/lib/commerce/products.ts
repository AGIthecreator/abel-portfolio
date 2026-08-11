import type { LineItem } from "./lineItems";
import { LINE_ITEMS } from "./lineItems";

export type ProductId =
  | "entrada"
  | "profesional"
  | "a-medida"
  | "sistemas";

export type Product = {
  id: ProductId;
  name: string;
  /** Precio público de pack (sin IVA). null = según proyecto */
  priceFromEur: number | null;
  priceLabel: string;
  summary: string;
  suitedFor: string;
  highlight?: boolean;
  includes: string[];
  doesNotInclude: string[];
  /** Partidas del pack (ids de LINE_ITEMS) */
  bundleLineIds: string[];
  /** Extras sugeridos en configurador */
  suggestedExtraIds: string[];
  /** Precio orientativo solo interno (p. ej. sistemas) */
  internalFromEur?: number;
  internalNotes?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "entrada",
    name: "Web de entrada",
    priceFromEur: 510,
    priceLabel: "Desde 510 € + IVA",
    summary:
      "Para proyectos claros y acotados que necesitan una web profesional sin complicaciones.",
    suitedFor:
      "Pensada para negocios pequeños, presencia sencilla y material ya preparado.",
    includes: [
      "Diseño responsive y desarrollo",
      "Estructura web acotada",
      "Referencia aproximada: hasta 4 secciones principales",
      "Formulario básico",
      "WhatsApp si encaja",
      "Publicación y configuración técnica",
      "SEO técnico mínimo imprescindible",
      "Analytics básico",
      "Ayuda con dominio cuando corresponda",
    ],
    doesNotInclude: [
      "Estrategia SEO ni posicionamiento mensual",
      "Redacción extensa o investigación de contenido",
      "Diseño altamente personalizado o branding completo",
      "Formularios avanzados, reservas o catálogos (opciones aparte)",
      "Automatizaciones e integraciones avanzadas",
      "Gestión de Google Business Profile",
      "Gestión de redes sociales",
    ],
    bundleLineIds: [
      "analysis_basic",
      "ui_entry",
      "dev_entry",
      "form_basic",
      "whatsapp_basic",
      "seo_tech_min",
      "analytics",
      "publish_config",
      "domain_help",
    ],
    suggestedExtraIds: [
      "section_extra",
      "form_advanced",
      "copy_page",
      "migration_web",
      "migration_domain",
      "creative_extended",
    ],
    internalNotes: [
      "Material visual aportado por el cliente acelera el proyecto.",
      "Alcance cerrado en presupuesto; ampliaciones se presupuestan aparte.",
    ],
  },
  {
    id: "profesional",
    name: "Web profesional",
    priceFromEur: 1190,
    priceLabel: "Desde 1.190 € + IVA",
    summary:
      "La opción principal: una web pensada para tu negocio, no una plantilla con otro logo.",
    suitedFor:
      "Pensada para negocios con recorrido comercial que necesitan claridad, conversión y criterio.",
    highlight: true,
    includes: [
      "Análisis del negocio y arquitectura web",
      "Dirección creativa",
      "Diseño a medida",
      "Desarrollo responsive orientado a conversión",
      "Varias secciones y formulario básico según proyecto",
      "SEO técnico acorde al alcance",
      "Analítica esencial e integración ligera necesaria para publicar",
      "Publicación y configuración",
      "Asesoramiento dentro del proyecto",
    ],
    doesNotInclude: [
      "Campañas SEO mensuales",
      "Link building",
      "Gestión continua de redes sociales",
      "Formularios avanzados, reservas, catálogos o áreas privadas (opciones aparte)",
      "Sistemas de automatización complejos",
      "Fotografía profesional",
      "Branding de terceros sin presupuesto",
    ],
    bundleLineIds: [
      "analysis_full",
      "ia_architecture",
      "creative_direction",
      "ui_custom",
      "dev_pro",
      "form_basic",
      "seo_tech_full",
      "analytics",
      "publish_config",
    ],
    suggestedExtraIds: [
      "section_extra",
      "form_advanced",
      "booking",
      "catalog_light",
      "integration_simple",
      "whatsapp_advanced",
      "seo_tech_extended",
      "copy_pack",
      "migration_web",
      "creative_extended",
      "project_consulting",
      "private_area",
      "database",
      "automation_flow",
    ],
    internalNotes: [
      "Referencia catálogo: hasta ~10 ítems cuando aplique; más volumen se presupuesta.",
    ],
  },
  {
    id: "a-medida",
    name: "Proyecto a medida",
    priceFromEur: 2490,
    priceLabel: "Desde 2.490 € + IVA",
    summary:
      "Cuando hace falta lógica, datos o integraciones más allá de una web profesional.",
    suitedFor:
      "Proyectos con más lógica, alcance, integraciones o necesidades específicas. Punto de partida: los proyectos grandes se presupuestan individualmente.",
    includes: [
      "Análisis, arquitectura y dirección creativa",
      "Diseño UI a medida",
      "Desarrollo con lógica personalizada según el alcance base",
      "Formulario avanzado e integración simple de partida",
      "SEO técnico, analytics y publicación",
      "Setup de infraestructura cuando aplica",
      "Consultoría de proyecto incluida en el pack",
    ],
    doesNotInclude: [
      "Reservas, áreas privadas, bases de datos o automatizaciones adicionales (opciones según alcance)",
      "Catálogos, bots o funciones de IA (opciones aparte)",
      "Software empresarial completo por el precio de partida",
      "Aplicaciones enormes sin alcance cerrado",
      "Trabajos de terceros (fotografía, branding) sin presupuesto",
      "SEO mensual ni gestión de redes",
      "Desarrollo ilimitado fuera de lo acordado",
    ],
    bundleLineIds: [
      "analysis_full",
      "ia_architecture",
      "creative_direction",
      "ui_custom",
      "dev_custom",
      "form_advanced",
      "seo_tech_full",
      "analytics",
      "publish_config",
      "infra_setup",
      "integration_simple",
      "project_consulting",
    ],
    suggestedExtraIds: [
      "booking",
      "private_area",
      "database",
      "integration_complex",
      "automation_flow",
      "webhook",
      "bot_basic",
      "ai_feature",
      "catalog_light",
      "catalog_bulk",
      "section_extra",
      "creative_extended",
      "copy_pack",
      "migration_web",
    ],
    internalNotes: [
      "2.490 € es punto de partida, no techo.",
      "No presentar como ERP ni app enterprise.",
    ],
  },
  {
    id: "sistemas",
    name: "Automatización y sistemas",
    priceFromEur: null,
    priceLabel: "Según proyecto",
    summary:
      "Cuando la web sola no basta: procesos, reservas, bases de datos, APIs y automatizaciones.",
    suitedFor:
      "Negocios que pierden tiempo en tareas repetidas o necesitan herramientas a medida.",
    includes: [
      "Diseño del proceso o flujo a automatizar",
      "Implementación con la herramienta adecuada (Make, n8n, código…)",
      "Conexiones entre sistemas según el alcance acordado",
      "Pruebas y puesta en marcha del flujo seleccionado",
    ],
    doesNotInclude: [
      "Precio cerrado sin módulos seleccionados",
      "Promesas genéricas de “IA revolucionaria”",
      "Sustitución de herramientas críticas sin analizar antes el proceso",
      "Funcionalidades o desarrollos que no formen parte del alcance acordado",
    ],
    bundleLineIds: [],
    suggestedExtraIds: [
      "automation_flow",
      "database",
      "integration_simple",
      "integration_complex",
      "webhook",
      "booking",
      "form_advanced",
      "bot_basic",
      "ai_feature",
      "project_consulting",
    ],
    internalFromEur: 690,
    internalNotes: [
      "Referencia interna: desde ~690 € para automatizaciones pequeñas.",
      "No mostrar como tarifa pública ni como total sin módulos.",
    ],
  },
];

export function getProduct(id: ProductId): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getBundleLineItems(productId: ProductId): LineItem[] {
  const product = getProduct(productId);
  if (!product) return [];
  return product.bundleLineIds
    .map((id) => LINE_ITEMS[id])
    .filter((item): item is LineItem => Boolean(item));
}
