import {
  CONTACT_EMAIL,
  OPERATOR,
  getWhatsAppNumber,
} from "@/lib/contact/info";

export const SITE_URL = "https://agithecreator.com" as const;
export const SITE_NAME = "AGI TheCreator" as const;
export const SITE_LOCALE = "es_ES" as const;

/** Title y description públicos de la portada. No cambiar el copy en esta fase. */
export const HOME_TITLE =
  "AGI TheCreator | Páginas web y sistemas para negocios" as const;
export const HOME_DESCRIPTION =
  "Creo páginas web y herramientas para negocios que quieren trabajar mejor, atender más rápido y dejar de perder tiempo con tareas que se repiten." as const;

export const OG_IMAGE_PATH = "/og-image.png" as const;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  "AGI TheCreator — desarrollo web, sistemas y automatización" as const;
export const OG_IMAGE_ABSOLUTE = `${SITE_URL}${OG_IMAGE_PATH}` as const;
export const BRAND_LOGO_PATH = "/logos/LogoAGItheCreator.webp" as const;
export const BRAND_LOGO_ABSOLUTE = `${SITE_URL}${BRAND_LOGO_PATH}` as const;

export const WEBSITE_ID = `${SITE_URL}/#website` as const;
export const ORGANIZATION_ID = `${SITE_URL}/#organization` as const;

export const OG_IMAGE = {
  url: OG_IMAGE_PATH,
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: OG_IMAGE_ALT,
} as const;

function organizationTelephone(): string | undefined {
  const digits = getWhatsAppNumber();
  if (!digits) return undefined;
  return `+${digits}`;
}

/**
 * Grafo único de la portada: WebSite + Organization.
 * Un solo nodo de marca. Valladolid es área de servicio, no domicilio comercial.
 * Los servicios concretos viven en sus páginas como Service.provider → @id.
 */
export function getHomeJsonLd() {
  const telephone = organizationTelephone();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "es-ES",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        ...(telephone ? { telephone } : {}),
        description: HOME_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: BRAND_LOGO_ABSOLUTE,
        },
        image: OG_IMAGE_ABSOLUTE,
        areaServed: [
          { "@type": "City", name: "Valladolid" },
          { "@type": "Country", name: "España" },
        ],
        founder: {
          "@type": "Person",
          name: OPERATOR.firstName,
        },
      },
    ],
  };
}
