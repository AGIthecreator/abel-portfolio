import { SiteNavbar } from "@/components/SiteNavbar";
import { ContactModal } from "@/components/contact/ContactModal";
import { ContactModalProvider } from "@/components/contact/ContactModalContext";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import {
  DeferredStrategicProfile,
  DeferredWhatIBuild,
} from "@/components/sections/DeferredSections";

// Importaciones de las franjas (Solo las dos definitivas)
import StripSystemStatus from "@/components/sections/Strips/StripSystemStatus";
import StripExecution from "@/components/sections/Strips/StripExecution";

export default function Page() {
  return (
    <ContactModalProvider>
      <div className="relative min-h-screen overflow-x-clip bg-[#030014]">
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

      {/* 1. HERO */}
      <Hero />

      {/* FRANJA 1: por encima del bloque estratégico para que el CMD del Hero siga tapando solo la franja, no tapar la franja con el perfil */}
      <div className="relative z-20">
        <StripSystemStatus />
      </div>

      {/* BLOQUE 1: Narrativa Estratégica (z por debajo de la franja para no ocultarla) */}
      <main className="relative z-10 mx-auto max-w-300 overflow-visible px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-visible pt-0 pb-0">
          <DeferredStrategicProfile />
        </section>
      </main>

      {/* FRANJA 2: sin margen superior para pegar al bloque estratégico */}
      <div className="mb-6 sm:mb-8">
        <StripExecution />
      </div>

      {/* Mesa de evidencias — entrega de resultados */}
      <DeferredWhatIBuild />

      <Footer />
      <ContactModal />
      </div>
    </ContactModalProvider>
  );
}
