import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { HomeSectionScroll } from "@/components/HomeSectionScroll";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import {
  DeferredFaq,
  DeferredStrategicProfile,
  DeferredWhatIBuild,
} from "@/components/sections/DeferredSections";
import { HomeResources } from "@/components/sections/HomeResources";
import { LabInvite } from "@/components/sections/LabInvite";
import StripSystemStatus from "@/components/sections/Strips/StripSystemStatus";
import StripExecution from "@/components/sections/Strips/StripExecution";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  getHomeJsonLd,
} from "@/lib/seo/site";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function Page() {
  return (
      <div className="relative min-h-screen overflow-x-clip bg-[#030014]">
      <HomeSectionScroll />
      {/* Fondo Global */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 30%, rgba(80, 50, 200, 0.15), rgba(80, 50, 200, 0) 50%),
                         radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.12), rgba(0, 200, 255, 0) 50%)`,
          }}
        />
        <div className="cyber-keyword-rain opacity-30" aria-hidden="true" />
      </div>

      <SiteNavbar />

      <main>
      {/* 1. HERO */}
      <Hero />

      {/* FRANJA 1: logos / estado — justo debajo del hero compacto */}
      <div className="relative z-20">
        <StripExecution />
      </div>

      {/* BLOQUE 1: Narrativa Estratégica (z por debajo de la franja para no ocultarla) */}
      <div className="relative z-10 mx-auto max-w-300 overflow-visible px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-visible pt-0 pb-0">
          <DeferredStrategicProfile />
        </section>
      </div>

      {/* FRANJA 2: sin margen superior para pegar al bloque estratégico */}
      <StripSystemStatus />

      <LabInvite />

      {/* Mesa de evidencias — entrega de resultados */}
      <DeferredWhatIBuild />

      <HomeResources />

      <DeferredFaq />
      </main>

      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getHomeJsonLd()) }}
      />
      </div>
  );
}
