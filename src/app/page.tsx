import { Hero } from "@/components/sections/Hero";
import { TechStack } from "@/components/sections/TechStack";
import { Projects } from "@/components/sections/Projects";
import { Footer } from "@/components/sections/Footer";
import { EcgConnector } from "@/components/ui/EcgConnector";
import { StrategicProfile } from "@/components/sections/StrategicProfile";

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Fondo Global (glows + keyword rain) */}
      <div className="pointer-events-none fixed inset-0">
        {/* Fondo limpio: sólo lluvia de palabras (susurro visual) */}
        <div className="cyber-keyword-rain" aria-hidden="true" />
      </div>

      <main className="relative z-10 mx-auto max-w-300 px-4 sm:px-6 lg:px-8">
        <section className="py-12 sm:py-16">
          <Hero />
        </section>

        {/* Conector ECG: primer pulso justo DEBAJO del Hero */}
        <EcgConnector className="my-2 sm:my-4" />

        <section className="py-10 sm:py-14">
          <TechStack />
        </section>

        <EcgConnector className="my-2 sm:my-4" />

        {/*
          Nota UI: dejamos un poco más de “aire” al final de Proyectos antes del ECG
          para que la sección cierre limpio y no parezca que las cards se “asoman”.
        */}
        <section className="py-10 sm:pt-14 sm:pb-18">
          <Projects />
        </section>

        <EcgConnector className="my-2 sm:my-4" />

        {/* VISIÓN TÉCNICA (Radar) */}
        <section className="py-10 sm:py-14">
          <StrategicProfile />
        </section>

        <Footer />
      </main>
    </div>
  );
}
