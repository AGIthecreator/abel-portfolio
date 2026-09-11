import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { LaboratorioShell } from "@/components/lab/LaboratorioShell";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Laboratorio de automatización | AGI TheCreator",
  description:
    "Una demo interactiva: activa un proceso real, decide qué debe hacer el sistema y construye tu propio flujo. Automatizar no es hacer algo automáticamente.",
  alternates: { canonical: "/laboratorio" },
  openGraph: {
    title: "Laboratorio de automatización | AGI TheCreator",
    description:
      "Prueba tres situaciones reales y descubre qué ocurre cuando un proceso deja de depender de alguien delante del ordenador.",
    url: "https://agithecreator.com/laboratorio",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Laboratorio de automatización de AGI TheCreator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laboratorio de automatización | AGI TheCreator",
    description:
      "Activa un proceso, decide qué debe hacer el sistema y construye tu propio flujo.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Laboratorio de automatización",
      url: "https://agithecreator.com/laboratorio",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Demo interactiva que muestra cómo funciona una automatización por dentro: entrada, decisión, acción, seguimiento y excepciones.",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      publisher: {
        "@type": "ProfessionalService",
        name: "AGI TheCreator",
        url: "https://agithecreator.com",
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
          name: "Laboratorio de automatización",
          item: "https://agithecreator.com/laboratorio",
        },
      ],
    },
  ],
};

export default function LaboratorioPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <LaboratorioShell />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
