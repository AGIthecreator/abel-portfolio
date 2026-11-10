import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import {
  EditorialImage,
  StripeBand,
} from "@/components/resources/ResourceBands";
import { RepetitiveTimeCalculator } from "@/components/tools/RepetitiveTimeCalculator";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

const TITLE = "Calculadora de tiempo en tareas repetitivas | AGI TheCreator";
const DESCRIPTION =
  "Calcula las horas que un negocio dedica a una tarea repetitiva. El cálculo se hace en tu navegador y no se envía a ningún sitio.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/herramientas/calculadora-tiempo" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/herramientas/calculadora-tiempo`,
    siteName: SITE_NAME,
    locale: "es_ES",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Calculadora de tiempo de AGI TheCreator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Calculadora de tiempo",
      item: `${SITE_URL}/herramientas/calculadora-tiempo`,
    },
  ],
};

export default function CalculadoraTiempoPage() {
  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#070b13] text-zinc-300">
        <StripeBand variant="down" className="pt-24 sm:pt-28">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-16">
            <header>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                Calculadora
              </p>
              <div className="mt-4 h-px w-12 bg-[#F3F1EB]/70" />
              <h1 className="mt-5 max-w-[16ch] font-serif text-[clamp(1.9rem,4.6vw,3rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#F3F1EB]">
                Cuánto tiempo se va en una tarea que se repite.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.75] text-zinc-400">
                Sirve para ver las horas de una tarea concreta. No dice si conviene automatizarla: eso depende de las excepciones y de si la regla está clara.
              </p>
            </header>
            <EditorialImage
              src="/recursos/calculadora-mesa.jpg"
              alt="Tres cuadernos oscuros y una carpeta en color hueso sobre una mesa de madera, con luz violeta."
              priority
              wide
            />
          </div>
        </StripeBand>

        <section
          className="bg-[#070b13]"
          aria-labelledby="calculadora-heading"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
            <h2 id="calculadora-heading" className="sr-only">
              Calculadora
            </h2>
            <RepetitiveTimeCalculator />
            <p className="mt-5 text-[13px] text-zinc-500">
              El cálculo se realiza en tu navegador. No enviamos ni almacenamos los datos que introduces.
            </p>
          </div>
        </section>

        <StripeBand variant="up">
          <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:py-16">
            <p className="max-w-[46ch] text-[16px] leading-[1.75] text-zinc-300">
              No todo ese tiempo puede recuperarse al automatizar. Hay que valorar excepciones, supervisión, configuración y mantenimiento. El cálculo sirve para identificar procesos que merece la pena estudiar.
            </p>
            <Link
              href="/automatizacion-de-procesos"
              className="mt-6 inline-flex min-h-11 items-center bg-[#F3F1EB] px-5 text-[14px] font-medium text-[#12151f] hover:bg-[#e7e2d6]"
            >
              Analizar mi proceso
            </Link>
          </section>
        </StripeBand>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  );
}
