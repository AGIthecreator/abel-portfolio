/**
 * Catálogo tipado de partidas comerciales (precios orientativos SIN IVA).
 * Uso: configurador, PDF futuro. No listar todos en /precios.
 */

export type LineItemUnit =
  | "proyecto"
  | "seccion"
  | "ud"
  | "flujo"
  | "elemento"
  | "mes"
  | "sesion"
  | "passthrough";

export type LineItemCategory =
  | "discovery"
  | "design"
  | "development"
  | "seo_tech"
  | "content"
  | "migration"
  | "seo_pro"
  | "infra"
  | "maintenance";

export type LineItem = {
  id: string;
  name: string;
  description: string;
  /** Precio orientativo sin IVA. null = coste real / passthrough */
  priceEur: number | null;
  unit: LineItemUnit;
  category: LineItemCategory;
  /** Mínimo facturable cuando aplica (ej. carga masiva) */
  minEur?: number;
  /** Visible como extra seleccionable en configurador */
  selectableExtra?: boolean;
  /** Notas internas */
  notes?: string;
};

/** Total de una partida aplicando cantidad y mínimo facturable. */
export function computeLineTotal(
  priceEur: number | null,
  quantity: number,
  minEur?: number,
): number | null {
  if (priceEur == null) return null;
  const raw = priceEur * quantity;
  if (minEur != null && raw < minEur) return minEur;
  return raw;
}

/** Precio visible de un extra (qty 1), respetando minEur. */
export function displayExtraPriceEur(item: LineItem): number | null {
  return computeLineTotal(item.priceEur, 1, item.minEur);
}

export const LINE_ITEMS: Record<string, LineItem> = {
  analysis_basic: {
    id: "analysis_basic",
    name: "Análisis inicial básico",
    description: "Revisión breve del negocio y del alcance para arrancar con claridad.",
    priceEur: 90,
    unit: "proyecto",
    category: "discovery",
  },
  analysis_full: {
    id: "analysis_full",
    name: "Análisis del negocio",
    description: "Análisis del negocio, objetivos y prioridades del proyecto.",
    priceEur: 180,
    unit: "proyecto",
    category: "discovery",
  },
  ia_architecture: {
    id: "ia_architecture",
    name: "Arquitectura de información",
    description: "Estructura de páginas, secciones y recorrido del usuario.",
    priceEur: 150,
    unit: "proyecto",
    category: "discovery",
  },
  creative_direction: {
    id: "creative_direction",
    name: "Dirección creativa",
    description: "Criterio visual y de presentación del negocio dentro del proyecto.",
    priceEur: 220,
    unit: "proyecto",
    category: "discovery",
  },
  creative_extended: {
    id: "creative_extended",
    name: "Dirección creativa ampliada",
    description: "Propuestas adicionales de estructura, enfoque y presentación.",
    priceEur: 180,
    unit: "proyecto",
    category: "discovery",
    selectableExtra: true,
  },
  project_consulting: {
    id: "project_consulting",
    name: "Consultoría de proyecto",
    description: "Sesión de criterio sobre estructura, prioridades y enfoque comercial.",
    priceEur: 120,
    unit: "sesion",
    category: "discovery",
    selectableExtra: true,
  },
  ui_entry: {
    id: "ui_entry",
    name: "Diseño UI entrada",
    description: "Diseño responsive acotado para proyectos claros y definidos.",
    priceEur: 160,
    unit: "proyecto",
    category: "design",
  },
  ui_custom: {
    id: "ui_custom",
    name: "Diseño UI a medida",
    description: "Diseño a medida orientado al negocio y a la conversión.",
    priceEur: 320,
    unit: "proyecto",
    category: "design",
  },
  ui_system: {
    id: "ui_system",
    name: "Sistema visual / UI ampliado",
    description: "Ampliación del sistema visual cuando el alcance lo requiere.",
    priceEur: 280,
    unit: "proyecto",
    category: "design",
    selectableExtra: true,
  },
  section_extra: {
    id: "section_extra",
    name: "Sección adicional",
    description: "Página o sección extra fuera del alcance base del pack.",
    priceEur: 90,
    unit: "seccion",
    category: "design",
    selectableExtra: true,
  },
  brand_coord: {
    id: "brand_coord",
    name: "Coordinación con diseñador / fotografía",
    description: "Coordinación con terceros. El coste del proveedor va aparte.",
    priceEur: 80,
    unit: "ud",
    category: "design",
    selectableExtra: true,
    notes: "No incluye honorarios del diseñador o fotógrafo.",
  },
  dev_entry: {
    id: "dev_entry",
    name: "Desarrollo responsive entrada",
    description: "Desarrollo de la web de entrada con alcance cerrado.",
    priceEur: 220,
    unit: "proyecto",
    category: "development",
  },
  dev_pro: {
    id: "dev_pro",
    name: "Desarrollo responsive profesional",
    description: "Desarrollo orientado a conversión y a la estructura del negocio.",
    priceEur: 380,
    unit: "proyecto",
    category: "development",
  },
  dev_custom: {
    id: "dev_custom",
    name: "Desarrollo a medida",
    description: "Desarrollo con lógica personalizada según el proyecto.",
    priceEur: 1100,
    unit: "proyecto",
    category: "development",
  },
  form_basic: {
    id: "form_basic",
    name: "Formulario básico",
    description: "Formulario de contacto o captura sencilla.",
    priceEur: 60,
    unit: "ud",
    category: "development",
  },
  form_advanced: {
    id: "form_advanced",
    name: "Formulario avanzado",
    description: "Formulario con lógica, validaciones o flujos más elaborados.",
    priceEur: 140,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  whatsapp_basic: {
    id: "whatsapp_basic",
    name: "WhatsApp básico",
    description: "Enlace o CTA a WhatsApp cuando encaja en el proyecto.",
    priceEur: 25,
    unit: "ud",
    category: "development",
  },
  whatsapp_advanced: {
    id: "whatsapp_advanced",
    name: "WhatsApp avanzado",
    description: "WhatsApp con flujo o notificación asociada.",
    priceEur: 90,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  booking: {
    id: "booking",
    name: "Sistema de reservas",
    description: "Módulo de reservas adaptado al negocio.",
    priceEur: 320,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  catalog_light: {
    id: "catalog_light",
    name: "Catálogo ligero",
    description: "Listado o catálogo acotado (referencia aproximada: hasta ~10 ítems).",
    priceEur: 180,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  catalog_bulk: {
    id: "catalog_bulk",
    name: "Carga masiva de productos",
    description:
      "Carga de catálogo por volumen. Mínimo facturable 120 € (aprox. 10 elementos).",
    priceEur: 12,
    unit: "elemento",
    category: "development",
    minEur: 120,
    selectableExtra: true,
  },
  private_area: {
    id: "private_area",
    name: "Área privada básica",
    description: "Zona privada sencilla para clientes o equipo.",
    priceEur: 480,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  integration_simple: {
    id: "integration_simple",
    name: "Integración externa simple",
    description: "Conexión con una herramienta externa de alcance limitado.",
    priceEur: 160,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  integration_complex: {
    id: "integration_complex",
    name: "Integración / API compleja",
    description: "Integración con lógica o API de mayor alcance.",
    priceEur: 350,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  webhook: {
    id: "webhook",
    name: "Webhook",
    description: "Endpoint o webhook a medida para conectar procesos.",
    priceEur: 120,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  database: {
    id: "database",
    name: "Base de datos / Airtable",
    description: "Setup de base de datos o Airtable para el proyecto.",
    priceEur: 220,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  automation_flow: {
    id: "automation_flow",
    name: "Automatización Make / n8n",
    description: "Un flujo de automatización con herramienta adecuada al caso.",
    priceEur: 180,
    unit: "flujo",
    category: "development",
    selectableExtra: true,
  },
  bot_basic: {
    id: "bot_basic",
    name: "Bot básico",
    description: "Bot o atención automatizada básica con un uso concreto.",
    priceEur: 280,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  ai_feature: {
    id: "ai_feature",
    name: "Funcionalidad IA concreta",
    description: "Pieza con IA solo cuando aporta un uso claro al negocio.",
    priceEur: 250,
    unit: "ud",
    category: "development",
    selectableExtra: true,
  },
  seo_tech_min: {
    id: "seo_tech_min",
    name: "SEO técnico mínimo",
    description: "Configuración SEO técnica imprescindible de la web.",
    priceEur: 70,
    unit: "proyecto",
    category: "seo_tech",
  },
  seo_tech_full: {
    id: "seo_tech_full",
    name: "SEO técnico completo según alcance",
    description: "SEO técnico acorde al tamaño y estructura del proyecto.",
    priceEur: 140,
    unit: "proyecto",
    category: "seo_tech",
  },
  seo_tech_extended: {
    id: "seo_tech_extended",
    name: "SEO técnico ampliado",
    description: "Ampliación técnica SEO dentro del proyecto (no estrategia mensual).",
    priceEur: 120,
    unit: "proyecto",
    category: "seo_tech",
    selectableExtra: true,
  },
  analytics: {
    id: "analytics",
    name: "Analytics + eventos básicos",
    description: "Configuración de analítica y eventos esenciales.",
    priceEur: 50,
    unit: "proyecto",
    category: "seo_tech",
  },
  publish_config: {
    id: "publish_config",
    name: "Publicación / configuración",
    description: "Publicación y configuración técnica del proyecto.",
    priceEur: 80,
    unit: "proyecto",
    category: "infra",
  },
  domain_help: {
    id: "domain_help",
    name: "Ayuda con dominio",
    description: "Ayuda para configurar el dominio cuando corresponda.",
    priceEur: 40,
    unit: "ud",
    category: "infra",
  },
  infra_setup: {
    id: "infra_setup",
    name: "Setup Cloudflare / Vercel",
    description: "Configuración base de infraestructura cuando aplica.",
    priceEur: 60,
    unit: "proyecto",
    category: "infra",
  },
  domain_cost: {
    id: "domain_cost",
    name: "Dominio",
    description: "Coste real del dominio + posible gestión de 0 a 15 €.",
    priceEur: null,
    unit: "passthrough",
    category: "infra",
    notes: "No inventar precio; reflejar coste real en presupuesto.",
  },
  hosting_cost: {
    id: "hosting_cost",
    name: "Hosting / infraestructura",
    description: "Coste real de hosting o infraestructura del proyecto.",
    priceEur: null,
    unit: "passthrough",
    category: "infra",
    notes: "No inventar precio; reflejar coste real en presupuesto.",
  },
  copy_page: {
    id: "copy_page",
    name: "Redacción de página",
    description: "Redacción de una página o sección.",
    priceEur: 90,
    unit: "ud",
    category: "content",
    selectableExtra: true,
  },
  copy_pack: {
    id: "copy_pack",
    name: "Pack copy hasta 5 páginas",
    description: "Redacción de textos para hasta aproximadamente 5 páginas.",
    priceEur: 350,
    unit: "proyecto",
    category: "content",
    selectableExtra: true,
  },
  content_research: {
    id: "content_research",
    name: "Investigación de contenido",
    description: "Investigación de producto o contenidos necesarios para construir bien.",
    priceEur: 160,
    unit: "proyecto",
    category: "content",
    selectableExtra: true,
  },
  migration_web: {
    id: "migration_web",
    name: "Migración web",
    description: "Migración desde una web existente.",
    priceEur: 220,
    unit: "proyecto",
    category: "migration",
    selectableExtra: true,
  },
  migration_domain: {
    id: "migration_domain",
    name: "Migración de dominio",
    description: "Migración o cambio de dominio.",
    priceEur: 90,
    unit: "ud",
    category: "migration",
    selectableExtra: true,
  },
  seo_monthly: {
    id: "seo_monthly",
    name: "SEO profesional mensual",
    description: "Estrategia y seguimiento SEO mensual. Extra, no servicio principal.",
    priceEur: 350,
    unit: "mes",
    category: "seo_pro",
    selectableExtra: true,
    notes: "Desde 350 €/mes. No es SEO técnico de proyecto.",
  },
  photo_coord: {
    id: "photo_coord",
    name: "Coordinación fotografía",
    description: "Coordinación. El coste del fotógrafo va aparte.",
    priceEur: 70,
    unit: "ud",
    category: "content",
    selectableExtra: true,
  },
  maint_base: {
    id: "maint_base",
    name: "Mantenimiento",
    description: "Cuidado técnico recurrente. No es desarrollo ilimitado.",
    priceEur: 99,
    unit: "mes",
    category: "maintenance",
  },
};

export function getLineItem(id: string): LineItem | undefined {
  return LINE_ITEMS[id];
}

export function listSelectableExtras(): LineItem[] {
  return Object.values(LINE_ITEMS).filter((item) => item.selectableExtra);
}
