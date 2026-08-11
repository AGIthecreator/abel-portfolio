export const COMMERCE_CURRENCY = "EUR" as const;
export const COMMERCE_TAX_NOTE = "+ IVA" as const;
export const OFFER_GUARANTEE_MONTHS = 2;

export const OFFER_SCOPE_NOTE =
  "El proyecto incluye lo acordado en el presupuesto. Si aparecen necesidades nuevas, las vemos y se presupuesta el trabajo adicional antes de hacerlo.";

export const OFFER_GUARANTEE_NOTE =
  "Garantía inicial de aproximadamente 2 meses sobre errores y fallos de la implementación. Los cambios de alcance, nuevas funcionalidades o rediseños se presupuestan aparte.";

export const OFFER_INFRA_NOTE =
  "Dominio, hosting e infraestructura (por ejemplo Cloudflare, Vercel u otros) se contemplan en el presupuesto según el proyecto con su coste real. No se asumen gratis.";

export const OFFER_EXTRAS_LABELS = [
  "Migración de web o dominio",
  "Trabajo extraordinario con hosting o infraestructura",
  "Fotografía o coordinación con diseñador gráfico (coste del tercero aparte)",
  "Redacción extensa o investigación de producto",
  "SEO profesional (estrategia y seguimiento)",
  "Consultoría creativa o de presentación del negocio",
  "Nuevas funcionalidades e integraciones fuera de alcance",
  "Carga masiva de productos o catálogo",
] as const;

/** Cuando la suma de partidas supera el precio del pack. */
export const PACK_VALUE_NOTE_SAVINGS =
  "El precio del proyecto no es la suma arbitraria de horas. El pack reúne estas piezas por un precio inferior al que tendrían contratadas por separado.";

/** Cuando no hay ahorro de pack (o no aplica): solo anclaje de referencia. */
export const PACK_VALUE_NOTE_REFERENCE =
  "Valores de referencia del catálogo. El precio del pack es el punto de partida de este conjunto; el alcance final se confirma al estudiar el proyecto.";

/** @deprecated Preferir packValueNoteFor() */
export const PACK_VALUE_NOTE = PACK_VALUE_NOTE_SAVINGS;

export function packValueNoteFor(
  bundleValueEur: number,
  packPriceEur: number | null,
): string {
  if (packPriceEur != null && bundleValueEur > packPriceEur) {
    return PACK_VALUE_NOTE_SAVINGS;
  }
  return PACK_VALUE_NOTE_REFERENCE;
}

export const TEMPLATES_CONTEXT =
  "Algunas referencias visuales para ayudarte a imaginar posibilidades. No son plantillas cerradas ni paquetes prediseñados: cada proyecto se adapta al negocio.";

export const QUOTE_PAGE = {
  title: "Presupuesto orientativo",
  hero: "Vamos a ver qué necesita tu negocio.",
  subtitle:
    "Configura un punto de partida. Los importes son orientativos hasta confirmar el alcance.",
  ctaContinue: "Continuar",
  ctaBack: "Atrás",
  stickyTotal: "Total orientativo",
} as const;

/** @deprecated Usar DIAGNOSTIC_* en diagnostic.ts */
export {
  DIAGNOSTIC_BUSINESS_TYPES as BUSINESS_TYPES,
  DIAGNOSTIC_GOALS as GOALS,
  DIAGNOSTIC_SITUATIONS as CURRENT_SITUATIONS,
} from "./diagnostic";

export const PRICING_FAQ_GROUPS = [
  {
    id: "producto",
    title: "Producto y alcance",
    items: [
      {
        q: "¿Qué diferencia hay entre Web de entrada y Web profesional?",
        a: "La de entrada es un proyecto acotado con material listo. La profesional incluye más análisis, diseño a medida, criterio y trabajo orientado a conversión.",
      },
      {
        q: "¿Cuándo necesito un Proyecto a medida?",
        a: "Cuando hace falta más lógica, reservas, áreas privadas, integraciones o automatizaciones que se salen de una web profesional estándar.",
      },
      {
        q: "¿Qué incluye realmente el precio?",
        a: "Lo descrito en el producto y lo cerrado en el presupuesto. No incluye trabajos fuera de alcance, SEO mensual ni servicios de terceros sin acuerdo.",
      },
      {
        q: "¿Cómo se calcula un Proyecto a medida?",
        a: "Parte desde 2.490 € + IVA y se ajusta al alcance real: lógica, integraciones, datos y funcionalidades. Los proyectos grandes se presupuestan individualmente.",
      },
      {
        q: "¿Puedo contratar una automatización sin hacer una web?",
        a: "Sí. Automatización y sistemas puede contratarse sola cuando el problema es de procesos, no de presencia web.",
      },
      {
        q: "¿El precio incluye IVA?",
        a: "Los precios públicos se muestran sin IVA (+ IVA). En el configurador verás subtotal, IVA (21 %) y total orientativo.",
      },
    ],
  },
  {
    id: "proceso",
    title: "Proceso y materiales",
    items: [
      {
        q: "¿Qué necesito tener preparado para empezar?",
        a: "Idealmente: idea clara del negocio, textos o borradores, imágenes si las tienes y acceso al dominio si ya existe. Si falta material, lo vemos y se valora.",
      },
      {
        q: "¿Puedo empezar aunque no tenga claro qué web necesito?",
        a: "Sí. Parte del trabajo es ayudarte a definir estructura y enfoque. Si hace falta más dirección creativa o consultoría, se presupuesta como tal.",
      },
      {
        q: "¿Qué pasa con textos e imágenes?",
        a: "Si los aportas, el proyecto avanza más rápido. Si hace falta redacción, investigación o coordinación con fotógrafo, se presupuestan aparte.",
      },
      {
        q: "¿Podéis ayudarme con dominio y hosting?",
        a: "Sí. Ayudo con la configuración. El coste real de dominio e infraestructura se refleja en el presupuesto; no se asume gratis.",
      },
      {
        q: "¿Qué ocurre si ya tengo una web?",
        a: "Se puede mejorar, rediseñar o migrar. La migración y el alcance se valoran según el estado real del proyecto.",
      },
      {
        q: "¿Cuánto tarda una web?",
        a: "Depende del alcance y del material disponible. Los plazos se acuerdan al cerrar el presupuesto, sin promesas genéricas.",
      },
      {
        q: "¿Qué ocurre si durante el proyecto quiero añadir cosas?",
        a: "Lo hablamos y se presupuesta el trabajo adicional antes de hacerlo. El alcance acordado es el que incluye el precio.",
      },
    ],
  },
  {
    id: "despues",
    title: "Después de publicar",
    items: [
      {
        q: "¿El mantenimiento es obligatorio?",
        a: "No. Es recomendable para el cuidado técnico después de publicar, pero no es una obligación artificial.",
      },
      {
        q: "¿Qué cubre el mantenimiento?",
        a: "Cuidado técnico, actualizaciones necesarias, revisiones y pequeños ajustes. No es desarrollo ilimitado ni nuevas funcionalidades.",
      },
      {
        q: "¿Qué ocurre si necesito cambios después?",
        a: "Los ajustes pequeños pueden entrar en mantenimiento según lo acordado. Cambios importantes se presupuestan aparte.",
      },
      {
        q: "¿Hacéis SEO?",
        a: "SEO técnico dentro del proyecto, sí. Estrategia SEO mensual o posicionamiento continuado es un extra o un especialista, no el servicio principal.",
      },
      {
        q: "¿Trabajáis fuera de Valladolid?",
        a: "Trabajo desde Valladolid con negocios de toda España. La cercanía local ayuda; el alcance no se limita a una ciudad.",
      },
      {
        q: "¿Qué garantía tiene el proyecto?",
        a: "Aproximadamente 2 meses sobre errores de la implementación. No cubre cambios de alcance, nuevas ideas ni rediseños.",
      },
    ],
  },
] as const;

/** Lista plana (compatibilidad / búsquedas). */
export type PricingFaqItem = { q: string; a: string };

export const PRICING_FAQ: PricingFaqItem[] = PRICING_FAQ_GROUPS.flatMap((g) =>
  g.items.map((item) => ({ q: item.q, a: item.a })),
);
