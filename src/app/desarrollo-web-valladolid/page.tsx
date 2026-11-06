import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import { DesarrolloWebValladolidContent } from "@/components/services/DesarrolloWebValladolidContent";
import { ORGANIZATION_ID } from "@/lib/seo/site";

const faqEntities = [
  {
    "@type": "Question",
    name: "¿Trabajáis solo en Valladolid?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "No. Trabajo desde aquí, pero también con clientes de toda España.",
    },
  },
  {
    "@type": "Question",
    name: "¿Podemos reunirnos presencialmente?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Cuando el proyecto y la logística lo permiten, sí. No es un requisito ni cambia el precio.",
    },
  },
  {
    "@type": "Question",
    name: "¿Trabajáis con empresas de otras ciudades?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. El proceso está pensado para funcionar en remoto: diagnóstico, alcance, desarrollo y revisión.",
    },
  },
  {
    "@type": "Question",
    name: "¿Cuánto cuesta una web en Valladolid?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Lo mismo que en el resto de España. Una página web en Valladolid no tiene tarifa local distinta. Las referencias públicas están en precios.",
    },
  },
  {
    "@type": "Question",
    name: "¿Podéis renovar una web existente?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. Se revisa qué conservar, qué reconstruir y se presupuesta el alcance con claridad.",
    },
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Desarrollo web en Valladolid",
      serviceType: "Desarrollo web",
      url: "https://agithecreator.com/desarrollo-web-valladolid",
      description:
        "Páginas web, diseño web y automatización para negocios en Valladolid. Estudio independiente: trato directo, en persona cuando aporta y en remoto con clientes de toda España.",
      provider: {
        "@id": ORGANIZATION_ID,
      },
      areaServed: [
        {
          "@type": "City",
          name: "Valladolid",
        },
        {
          "@type": "Country",
          name: "España",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://agithecreator.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Desarrollo web en Valladolid",
          item: "https://agithecreator.com/desarrollo-web-valladolid",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqEntities,
    },
  ],
};

export const metadata: Metadata = {
  title: "Desarrollo web en Valladolid | AGI TheCreator",
  description:
    "Páginas web, diseño web y automatización para negocios en Valladolid. Trato directo con quien desarrolla. En persona cuando aporta y en remoto para toda España.",
  alternates: { canonical: "/desarrollo-web-valladolid" },
  openGraph: {
    title: "Desarrollo web en Valladolid | AGI TheCreator",
    description:
      "Páginas web y automatización para negocios de Valladolid y de toda España. Sin tarifa local distinta.",
    url: "https://agithecreator.com/desarrollo-web-valladolid",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: desarrollo web en Valladolid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollo web en Valladolid | AGI TheCreator",
    description:
      "Páginas web, diseño y automatización. Trato directo, aquí o a distancia.",
    images: ["/og-image.png"],
  },
};

export default function DesarrolloWebValladolidPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <DesarrolloWebValladolidContent />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
