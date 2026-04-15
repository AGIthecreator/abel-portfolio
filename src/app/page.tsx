import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import {
  DeferredManifesto,
  DeferredProjects,
  DeferredStrategicProfile,
  DeferredTechStack,
} from "@/components/sections/DeferredSections";

// Importaciones de las franjas (Solo las dos definitivas)
import StripSystemStatus from "@/components/sections/Strips/StripSystemStatus";
import StripExecution from "@/components/sections/Strips/StripExecution";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-[#030014]">
      {/* Fondo Global */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div 
          className="absolute inset-0" 
          style={{
            background: `radial-gradient(circle at 20% 30%, rgba(80, 50, 200, 0.15), rgba(80, 50, 200, 0) 50%),
                         radial-gradient(circle at 80% 70%, rgba(0, 200, 255, 0.12), rgba(0, 200, 255, 0) 50%)`
          }}
        />
        <div className="cyber-keyword-rain opacity-30" aria-hidden="true" />
      </div>

      {/* 1. HERO */}
      <Hero />

      {/* FRANJA 1: El interruptor Hero → Manifesto */}
      <StripSystemStatus />

      {/* BLOQUE 1: Narrativa Estratégica */}
      <main className="relative z-10 mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        <section className="relative pt-6 pb-6">
          <div className="mt-8 sm:mt-12"><DeferredManifesto /></div>
          <div className="mt-10 sm:mt-14"><DeferredStrategicProfile /></div>
        </section>
      </main>

      {/* FRANJA 2: El interruptor Perfil → Proyectos */}
      <div className="my-10 sm:my-16">
        <StripExecution />
      </div>

      {/* BLOQUE 2: Ejecución y Stack */}
      <main className="relative z-10 mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        <section className="relative py-10 sm:pt-14 sm:pb-18">
          <div 
            className="absolute right-0 top-1/2 -z-10 h-112.5 w-112.5 -translate-y-1/2 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, rgba(0, 200, 255, 0.1) 0%, rgba(0, 200, 255, 0.05) 30%, transparent 100%)`,
              filter: 'blur(80px)'
            }}
          />
          <DeferredProjects />
        </section>

        <section className="py-10 sm:py-14">
          <DeferredTechStack />
        </section>
      </main>

      {/* FOOTER DIRECTO: Al haber quitado la franja 3, el TechStack respira hacia el contacto */}
      <Footer />
    </div>
  );
}
