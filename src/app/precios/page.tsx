import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";
import { MAINTENANCE_OFFER, PRODUCTS, formatEurAmount, type Product } from "@/lib/commerce";

function productById(id: Product["id"]): Product {
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) throw new Error(`Producto ausente: ${id}`);
  return product;
}

const entrada = productById("entrada");
const profesional = productById("profesional");
const medida = productById("a-medida");
const sistemas = productById("sistemas");

export const metadata: Metadata = {
  title: "Precios de webs y automatización | AGI TheCreator",
  description: `Web de entrada ${formatEurAmount(entrada.publicFromEur)}, web profesional ${formatEurAmount(profesional.publicFromEur)}, proyecto a medida desde ${formatEurAmount(medida.publicFromEur)}, automatización desde ${formatEurAmount(sistemas.publicFromEur)} y mantenimiento ${formatEurAmount(MAINTENANCE_OFFER.priceFromEur)}/mes. Precios sin IVA. Valladolid y toda España.`,
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Precios de webs y automatización | AGI TheCreator",
    description:
      `Web de entrada, web profesional, proyecto a medida y automatización. Mantenimiento ${formatEurAmount(MAINTENANCE_OFFER.priceFromEur)}/mes. Alcance claro, sin humo.`,
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
    ...PRODUCTS.map((tier, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Offer",
        name: tier.name,
        description: tier.priceIsFrom
          ? `${tier.summary} ${tier.priceLabel}. El importe depende del alcance.`
          : tier.summary,
        price: String(tier.publicFromEur),
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String(tier.publicFromEur),
          priceCurrency: "EUR",
          valueAddedTaxIncluded: false,
        },
        seller: {
          "@type": "ProfessionalService",
          name: "AGI TheCreator",
          url: "https://agithecreator.com",
        },
      },
    })),
    {
      "@type": "ListItem",
      position: PRODUCTS.length + 1,
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
