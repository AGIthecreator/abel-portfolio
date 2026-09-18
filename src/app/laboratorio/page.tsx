import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { LaboratorioShell } from "@/components/lab/LaboratorioShell";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Laboratorio de automatizaciones para negocios | AGI TheCreator",
  description:
    "Demostración interactiva de automatización de procesos: entra una solicitud, el sistema decide y ves un proceso de negocio ejecutarse solo.",
  alternates: { canonical: "/laboratorio" },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Laboratorio de automatizaciones para negocios | AGI TheCreator",
    description:
      "Prueba una automatización para negocios: una demostración paso a paso de un proceso automatizado.",
    url: "https://agithecreator.com/laboratorio",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Laboratorio de automatizaciones para negocios | AGI TheCreator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laboratorio de automatizaciones para negocios | AGI TheCreator",
    description:
      "Entra al laboratorio y prueba una automatización de procesos en marcha.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Laboratorio de automatizaciones para negocios",
      url: "https://agithecreator.com/laboratorio",
      inLanguage: "es-ES",
      description:
        "Laboratorio de automatizaciones: demostración interactiva de procesos automatizados para negocios.",
      isPartOf: {
        "@type": "WebSite",
        name: "AGI TheCreator",
        url: "https://agithecreator.com",
      },
      about: {
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
          name: "Laboratorio",
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
