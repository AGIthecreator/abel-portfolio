import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/sections/Footer";
import {
  DeferredManifesto,
  DeferredProjects,
  DeferredStrategicProfile,
  DeferredTechStack,
} from "@/components/sections/DeferredSections";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Fondo Global */}
      <div className="pointer-events-none fixed inset-0">
        <div className="cyber-keyword-rain" aria-hidden="true" />
      </div>

      <main className="relative z-10 mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        
        {/* Bloque Superior: Hero + Manifesto + StrategicProfile */}
        <section className="pt-12 sm:pt-16 pb-6">
          <Hero />
          
          <div className="mt-8 sm:mt-12">
            <DeferredManifesto />
          </div>

          <div className="mt-10 sm:mt-14">
            <DeferredStrategicProfile />
          </div>
        </section>

        {/* Bloque Tecnologías */}
        <section className="py-10 sm:py-14">
          <DeferredTechStack />
        </section>

        {/* Bloque Proyectos */}
        <section className="py-10 sm:pt-14 sm:pb-18">
          <DeferredProjects />
        </section>

        <Footer />
      </main>
    </div>
  );
}
