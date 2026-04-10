import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Footer } from "@/components/sections/Footer";
import { EcgConnector } from "@/components/ui/EcgConnector";
import {
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
        
        <section className="pt-12 sm:pt-16 pb-6">
          <Hero />
          <Manifesto /> 
        </section>

        <EcgConnector className="my-2 sm:my-4" />

        <section className="py-10 sm:py-14">
          <DeferredTechStack />
        </section>

        <EcgConnector className="my-2 sm:my-4" />

        <section className="py-10 sm:pt-14 sm:pb-18">
          <DeferredProjects />
        </section>

        <EcgConnector className="my-2 sm:my-4" />

        <section className="py-10 sm:py-14">
          <DeferredStrategicProfile />
        </section>

        <Footer />
      </main>
    </div>
  );
}