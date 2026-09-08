import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import { AutomatizacionProcesosContent } from "@/components/services/AutomatizacionProcesosContent";

const faqEntities = [
  {
    "@type": "Question",
    name: "¿Qué procesos se pueden automatizar?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Los que se repiten con reglas claras: formularios, reservas, avisos, sincronización entre herramientas o tareas administrativas.",
    },
  },
  {
    "@type": "Question",
    name: "¿Necesito utilizar IA?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "No. Muchas automatizaciones se resuelven con reglas, integraciones, bases de datos o APIs. La IA entra cuando aporta valor real al proceso.",
    },
  },
  {
    "@type": "Question",
    name: "¿Podéis conectar herramientas que ya utilizo?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí, cuando la herramienta lo permite y el alcance está claro. Primero el proceso; después la forma de conectar.",
    },
  },
  {
    "@type": "Question",
    name: "¿Se pueden automatizar reservas?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí, cuando el flujo de reserva, confirmación y aviso está bien definido.",
    },
  },
  {
    "@type": "Question",
    name: "¿Podéis trabajar con una web existente?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. A veces se automatiza alrededor de lo que ya tienes. Otras veces conviene ajustar la web para que el flujo sea más limpio.",
    },
  },
  {
    "@type": "Question",
    name: "¿Cómo sé si merece la pena automatizar algo?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Si el proceso se repite, consume tiempo y se puede describir con pasos claros, suele merecer mirarlo.",
    },
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Automatización de procesos para negocios",
      url: "https://agithecreator.com/automatizacion-de-procesos",
      description:
        "Automatización de procesos: primero el proceso, después la herramienta. Entrada, decisión, acción y seguimiento.",
      provider: {
        "@type": "ProfessionalService",
        name: "AGI TheCreator",
        url: "https://agithecreator.com",
      },
      areaServed: {
        "@type": "Country",
        name: "España",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        description: "Según proyecto",
        availability: "https://schema.org/InStock",
      },
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
          name: "Automatización de procesos",
          item: "https://agithecreator.com/automatizacion-de-procesos",
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
  title: "Automatización de procesos para negocios | AGI TheCreator",
  description:
    "Primero el proceso, después la herramienta. Menos tareas repetidas: formularios, reservas, avisos e integraciones. Según proyecto.",
  alternates: { canonical: "/automatizacion-de-procesos" },
  openGraph: {
    title: "Automatización de procesos para negocios | AGI TheCreator",
    description:
      "Entrada, decisión, acción y seguimiento. Sin meter IA porque sí.",
    url: "https://agithecreator.com/automatizacion-de-procesos",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: automatización de procesos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automatización de procesos | AGI TheCreator",
    description:
      "Menos tareas repetidas. Más tiempo para el negocio. Según proyecto.",
    images: ["/og-image.png"],
  },
};

export default function AutomatizacionDeProcesosPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <AutomatizacionProcesosContent />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
