import {
  CONTACT_EMAIL,
  OPERATOR,
  getWhatsAppNumber,
} from "@/lib/contact/info";

export const SITE_URL = "https://agithecreator.com" as const;
export const SITE_NAME = "AGI TheCreator" as const;
export const SITE_LOCALE = "es_ES" as const;

/** Title y description públicos de la portada. El alcance es España; Valladolid es la base. */
export const HOME_TITLE =
  "Páginas web y automatización para negocios en España | AGI TheCreator" as const;
export const HOME_DESCRIPTION =
  "Desarrollo páginas web, diseño web y automatizaciones para negocios de toda España. Estudio en Valladolid y trato directo con quien construye el proyecto." as const;

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
 * Grafo único de la portada: WebSite + estudio.
 * Valladolid es la ciudad de servicio. No hay calle pública, así que la
 * dirección solo lleva localidad y país.
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
        description: HOME_DESCRIPTION,
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": ["Organization", "ProfessionalService"],
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
        address: {
          "@type": "PostalAddress",
          addressLocality: "Valladolid",
          addressRegion: "Castilla y León",
          addressCountry: "ES",
        },
        areaServed: [
          { "@type": "Country", name: "España" },
          { "@type": "AdministrativeArea", name: "Castilla y León" },
          { "@type": "City", name: "Valladolid" },
        ],
        knowsAbout: [
          "Desarrollo web",
          "Diseño web",
          "Páginas web para negocios",
          "Automatización de procesos",
          "Sistemas a medida",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Servicios para negocios",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Desarrollo web en Valladolid",
                url: `${SITE_URL}/desarrollo-web-valladolid`,
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Desarrollo web para negocios",
                url: `${SITE_URL}/desarrollo-web`,
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Automatización de procesos",
                url: `${SITE_URL}/automatizacion-de-procesos`,
              },
            },
          ],
        },
        founder: {
          "@type": "Person",
          name: OPERATOR.firstName,
          jobTitle: "Desarrollador web",
        },
      },
    ],
  };
}
