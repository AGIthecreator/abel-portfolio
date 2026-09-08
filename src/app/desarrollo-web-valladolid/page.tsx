import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import { DesarrolloWebValladolidContent } from "@/components/services/DesarrolloWebValladolidContent";

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
      text: "Sí. El proceso está pensado para funcionar en remoto.",
    },
  },
  {
    "@type": "Question",
    name: "¿Cuánto cuesta una web en Valladolid?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Lo mismo que en el resto de España. No hay tarifa local distinta.",
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
      name: "Desarrollo web desde Valladolid",
      url: "https://agithecreator.com/desarrollo-web-valladolid",
      description:
        "Estudio independiente que trabaja desde Valladolid con clientes de toda España. Trato directo y mismo criterio en remoto o presencial.",
      provider: {
        "@type": "ProfessionalService",
        name: "AGI TheCreator",
        url: "https://agithecreator.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Valladolid",
          addressCountry: "ES",
        },
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
          name: "Desarrollo web desde Valladolid",
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
  title: "Desarrollo web desde Valladolid | AGI TheCreator",
  description:
    "Estudio independiente desde Valladolid. Trato directo con quien desarrolla el proyecto. Presencial cuando aporta; remoto con clientes de toda España.",
  alternates: { canonical: "/desarrollo-web-valladolid" },
  openGraph: {
    title: "Desarrollo web desde Valladolid | AGI TheCreator",
    description:
      "Trabajo desde Valladolid con clientes de toda España. Trato directo, sin tarifa local inventada.",
    url: "https://agithecreator.com/desarrollo-web-valladolid",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: desarrollo web desde Valladolid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollo web desde Valladolid | AGI TheCreator",
    description:
      "Estudio independiente. Trato directo. Aquí o a distancia.",
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
