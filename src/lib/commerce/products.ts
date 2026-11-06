import type { LineItem } from "./lineItems";
import { LINE_ITEMS } from "./lineItems";
import { PUBLIC_RATES, formatEurAmount, publicPriceLabel } from "./rates";

export type ProductId =
  | "entrada"
  | "profesional"
  | "a-medida"
  | "sistemas";

/** Detalle progresivo de /precios. No sustituye al alcance del presupuesto. */
export type PublicDetail = {
  includes: string[];
  conditions: string[];
};

export type Product = {
  id: ProductId;
  name: string;
  /**
   * Base que cobra calculateQuote (sin IVA).
   * null cuando no hay pack cerrado: el total sale de los módulos.
   */
  priceFromEur: number | null;
  /** Importe de la oferta pública. En sistemas es el mínimo, no un pack. */
  publicFromEur: number;
  /**
   * Tarifa pública anterior. Solo para mostrarla tachada en /precios.
   * calculateQuote no la lee.
   */
  previousPublicEur?: number;
  /** El importe público es un punto de partida, no un precio cerrado. */
  priceIsFrom: boolean;
  /** Suelo del presupuesto cuando no hay pack cerrado. */
  quoteFloorEur?: number;
  priceLabel: string;
  summary: string;
  suitedFor: string;
  highlight?: boolean;
  includes: string[];
  doesNotInclude: string[];
  publicDetail: PublicDetail;
  /** Partidas del pack (ids de LINE_ITEMS) */
  bundleLineIds: string[];
  /** Extras sugeridos en configurador */
  suggestedExtraIds: string[];
  internalNotes?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "entrada",
    name: "Web de entrada",
    priceFromEur: PUBLIC_RATES.entrada.eur,
    publicFromEur: PUBLIC_RATES.entrada.eur,
    previousPublicEur: PUBLIC_RATES.entrada.previousEur,
    priceIsFrom: false,
    priceLabel: publicPriceLabel(PUBLIC_RATES.entrada.eur),
    summary:
      "Una presencia digital profesional para empezar con una base sólida.",
    suitedFor:
      "Para negocios con un alcance acotado y el material ya preparado.",
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
    publicDetail: {
      includes: [
        "Diseño y desarrollo responsive",
        "Estructura acotada, en torno a cuatro secciones",
        "Formulario básico y publicación",
        "SEO técnico mínimo y analítica básica",
      ],
      conditions: [
        "El precio corresponde a ese alcance, con el material ya preparado.",
        "Redacción extensa, reservas, catálogos y automatizaciones se presupuestan aparte.",
        "Dominio y hosting se detallan con su coste cuando hagan falta.",
      ],
    },
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
      "page_extra",
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
    priceFromEur: PUBLIC_RATES.profesional.eur,
    publicFromEur: PUBLIC_RATES.profesional.eur,
    previousPublicEur: PUBLIC_RATES.profesional.previousEur,
    priceIsFrom: false,
    priceLabel: publicPriceLabel(PUBLIC_RATES.profesional.eur),
    summary:
      "Una web completa para presentar tus servicios, transmitir confianza y captar clientes.",
    suitedFor:
      "Para negocios que necesitan más criterio que una presencia básica.",
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
    publicDetail: {
      includes: [
        "Análisis, arquitectura y dirección creativa",
        "Diseño a medida y desarrollo orientado a conversión",
        "SEO técnico acorde al alcance y analítica esencial",
        "Publicación y configuración",
      ],
      conditions: [
        "No incluye campañas SEO, redes sociales ni fotografía.",
        "Reservas, catálogos, áreas privadas o integraciones se añaden y se presupuestan antes.",
        "Dominio y hosting van aparte, con su coste real.",
      ],
    },
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
      "page_extra",
      "copy_pack",
      "creative_extended",
      "form_advanced",
      "booking",
      "catalog_light",
      "private_area",
      "integration_simple",
      "whatsapp_advanced",
      "database",
      "automation_addon",
      "seo_tech_extended",
      "migration_web",
      "project_consulting",
    ],
    internalNotes: [
      "Referencia catálogo: hasta ~10 ítems cuando aplique; más volumen se presupuesta.",
    ],
  },
  {
    id: "a-medida",
    name: "Proyecto a medida",
    priceFromEur: PUBLIC_RATES.aMedida.eur,
    publicFromEur: PUBLIC_RATES.aMedida.eur,
    previousPublicEur: PUBLIC_RATES.aMedida.previousEur,
    priceIsFrom: true,
    priceLabel: publicPriceLabel(PUBLIC_RATES.aMedida.eur, true),
    summary:
      "Una herramienta, funcionalidad o sistema desarrollado alrededor de las necesidades de tu negocio.",
    suitedFor:
      "Para cuando hace falta una lógica propia, no una web estándar.",
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
    publicDetail: {
      includes: [
        "Análisis, diseño y desarrollo con lógica personalizada",
        "Formulario avanzado y una integración simple de partida",
        "SEO técnico, analítica y publicación",
      ],
      conditions: [
        `${formatEurAmount(PUBLIC_RATES.aMedida.eur)} es el punto de partida de este alcance, no el precio de cualquier desarrollo.`,
        "Los proyectos más grandes se presupuestan por separado.",
        "Reservas, áreas privadas, bases de datos o automatizaciones adicionales se acuerdan antes.",
      ],
    },
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
      "automation_addon",
      "webhook",
      "bot_basic",
      "ai_feature",
      "catalog_light",
      "catalog_bulk",
      "section_extra",
      "page_extra",
      "creative_extended",
      "copy_pack",
      "migration_web",
    ],
    internalNotes: [
      `${formatEurAmount(PUBLIC_RATES.aMedida.eur)} es punto de partida, no techo.`,
      "No presentar como ERP ni app enterprise.",
    ],
  },
  {
    id: "sistemas",
    name: "Automatización y sistemas",
    priceFromEur: null,
    publicFromEur: PUBLIC_RATES.sistemasFromEur,
    priceIsFrom: true,
    quoteFloorEur: PUBLIC_RATES.sistemasFromEur,
    priceLabel: publicPriceLabel(PUBLIC_RATES.sistemasFromEur, true),
    summary:
      "Un proceso repetitivo convertido en un flujo que trabaja por sí mismo.",
    suitedFor:
      "Para equipos que repiten un proceso y quieren dejar de hacerlo a mano.",
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
    publicDetail: {
      includes: [
        "Diseño del proceso que se va a automatizar",
        "Implementación del flujo acordado",
        "Conexiones necesarias y puesta en marcha",
      ],
      conditions: [
        `El importe parte de ${formatEurAmount(PUBLIC_RATES.sistemasFromEur)} y depende de la complejidad, las integraciones y el alcance real.`,
        "No es un precio cerrado para cualquier sistema.",
        "Lo que quede fuera del flujo acordado se presupuesta antes de hacerlo.",
      ],
    },
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
    internalNotes: [
      "El mínimo público es el suelo de una automatización pequeña.",
      "El importe sube con integraciones y alcance. No es el precio de cualquier sistema.",
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
