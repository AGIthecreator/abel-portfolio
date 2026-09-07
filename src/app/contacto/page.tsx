import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { ContactPageContent } from "@/components/sections/ContactPageContent";
import { Footer } from "@/components/sections/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contacto | AGI TheCreator",
  url: "https://agithecreator.com/contacto",
  about: {
    "@type": "ProfessionalService",
    name: "AGI TheCreator",
    url: "https://agithecreator.com",
  },
  mentions: [
    {
      "@type": "Person",
      name: "Abel",
      jobTitle: "Desarrollador web",
    },
    {
      "@type": "Person",
      name: "Aitor Martínez Rollán",
      jobTitle: "Diseñador gráfico",
      url: "https://rollanstudio.com",
      worksFor: {
        "@type": "Organization",
        name: "Rollan Studio",
        url: "https://rollanstudio.com",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Contacto | AGI TheCreator",
  description:
    "Escribe a Abel en AGI TheCreator. Email, WhatsApp y un mensaje breve. Estudio independiente en Valladolid. Si quieres plantear un proyecto, puedes empezar por el diagnóstico.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto | AGI TheCreator",
    description:
      "Habla directamente con quien desarrolla: webs, automatizaciones y sistemas para negocios. Desde Valladolid para toda España.",
    url: "https://agithecreator.com/contacto",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: contacto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | AGI TheCreator",
    description:
      "Email, WhatsApp o un mensaje breve. Respuesta directa, sin intermediarios.",
    images: ["/og-image.png"],
  },
};

export default function ContactoPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <ContactPageContent />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
