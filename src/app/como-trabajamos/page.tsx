import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { ComoTrabajamos } from "@/components/sections/ComoTrabajamos";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Cómo trabajamos | AGI TheCreator",
  description:
    "El proceso de principio a fin, explicado en claro: qué hacemos, cuándo y por qué. Para que diseñar tu web no se sienta como contratar magia negra.",
  alternates: { canonical: "/como-trabajamos" },
  openGraph: {
    title: "Cómo trabajamos | AGI TheCreator",
    description:
      "No necesitas saber de webs. Necesitas saber qué va a pasar. Te explico el proceso desde el principio, sin tecnicismos ni sorpresas.",
    url: "https://agithecreator.com/como-trabajamos",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: cómo trabajamos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo trabajamos | AGI TheCreator",
    description:
      "El proceso de principio a fin, sin tecnicismos ni sorpresas. Valladolid y toda España.",
    images: ["/og-image.png"],
  },
};

export default function ComoTrabajamosPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <ComoTrabajamos />
      </main>
      <Footer />
    </>
  );
}
