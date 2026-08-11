import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import { QuoteConfigurator } from "@/components/quote/QuoteConfigurator";

export const metadata: Metadata = {
  title: "Presupuesto orientativo | AGI TheCreator",
  description:
    "Configura qué necesita tu negocio: web de entrada, web profesional, proyecto a medida o automatización. Total orientativo con IVA. Valladolid y toda España.",
  alternates: { canonical: "/presupuesto" },
  openGraph: {
    title: "Presupuesto orientativo | AGI TheCreator",
    description:
      "Construye un punto de partida para tu web o sistema. Precios orientativos hasta confirmar el alcance.",
    url: "https://agithecreator.com/presupuesto",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: presupuesto orientativo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Presupuesto orientativo | AGI TheCreator",
    description: "Configura tu proyecto y ve un total orientativo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PresupuestoPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <QuoteConfigurator />
      </main>
      <Footer />
    </>
  );
}
