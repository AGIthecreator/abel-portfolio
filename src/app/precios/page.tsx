import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";
import { MAINTENANCE_OFFER, OFFER_TIERS } from "@/lib/data/offer";

export const metadata: Metadata = {
  title: "Precios: webs, proyectos a medida y mantenimiento | AGI TheCreator",
  description:
    "Web de entrada desde 510 €, web profesional desde 1.190 €, proyecto a medida desde 2.490 €, automatización según proyecto y mantenimiento desde 99 €/mes. Valladolid y toda España.",
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Precios: webs y sistemas para negocios | AGI TheCreator",
    description:
      "Web de entrada, web profesional, proyecto a medida y automatización. Mantenimiento desde 99 €/mes. Alcance claro, sin humo.",
    url: "https://agithecreator.com/precios",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: precios y servicios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios | AGI TheCreator",
    description:
      "Webs, proyectos a medida, automatización y mantenimiento. Desde Valladolid para toda España.",
    images: ["/og-image.png"],
  },
};

const offerJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Servicios AGI TheCreator",
  itemListElement: [
    ...OFFER_TIERS.map((tier, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Offer",
        name: tier.name,
        description: tier.summary,
        ...(tier.priceFromEur != null
          ? {
              price: String(tier.priceFromEur),
              priceCurrency: "EUR",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: String(tier.priceFromEur),
                priceCurrency: "EUR",
                valueAddedTaxIncluded: false,
              },
            }
          : {}),
        seller: {
          "@type": "ProfessionalService",
          name: "AGI TheCreator",
          url: "https://agithecreator.com",
        },
      },
    })),
    {
      "@type": "ListItem",
      position: OFFER_TIERS.length + 1,
      item: {
        "@type": "Offer",
        name: MAINTENANCE_OFFER.name,
        description: MAINTENANCE_OFFER.summary,
        price: String(MAINTENANCE_OFFER.priceFromEur),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String(MAINTENANCE_OFFER.priceFromEur),
          priceCurrency: "EUR",
          unitText: "MONTH",
          valueAddedTaxIncluded: false,
        },
        seller: {
          "@type": "ProfessionalService",
          name: "AGI TheCreator",
          url: "https://agithecreator.com",
        },
      },
    },
  ],
};

export default function PreciosPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <Pricing />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerJsonLd) }}
      />
    </>
  );
}
