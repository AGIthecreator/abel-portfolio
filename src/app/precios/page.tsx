import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Precios y servicios | AGI TheCreator",
  description:
    "Servicios web orientados a cada negocio. Presencia, movimiento y sistemas construidos con sentido — sin extras ni costes sorpresa.",
  alternates: { canonical: "/precios" },
  openGraph: {
    title: "Precios y servicios | AGI TheCreator",
    description:
      "Cada negocio empieza desde un punto distinto. Servicios web claros, humanos y sin presión comercial.",
    url: "https://agithecreator.com/precios",
  },
};

export default function PreciosPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
