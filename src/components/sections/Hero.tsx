"use client";
import { FadeIn } from "@/components/motion/FadeIn";
import { NeonPulse } from "@/components/motion/NeonPulse";
import { Typewriter } from "@/components/motion/Typewriter";
import { ArchitectureLogs } from "@/components/ui/ArchitectureLogs";
import dynamic from "next/dynamic";

const HeroReactiveCanvas = dynamic(
  () => import("@/components/ui/HeroReactiveCanvas").then((m) => m.HeroReactiveCanvas),
  { ssr: false }
);

const ROLE_STRINGS = ["Full Stack Developer", "Automation Expert", "Security Focused"] as const;

export function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-175 bg-black overflow-hidden isolate">
      {/* FONDO */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <video
          autoPlay loop muted playsInline
          className="h-full w-full object-cover opacity-50 brightness-75"
          poster="/Frame-video-portfolio.PNG"
        >
          <source src="/videos/VideoHero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black" />
        <div className="absolute inset-0 z-10 opacity-30">
          <HeroReactiveCanvas intensity={0.7} />
        </div>
      </div>

      {/* CONTENIDO */}
      <FadeIn className="relative z-20 h-full w-full flex items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          
          <div className="w-full flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <p className="text-xs tracking-[0.25em] text-white/90 font-bold uppercase drop-shadow-2xl">
                CONSTRUYENDO EL FUTURO DIGITAL
              </p>
              
              <h1 className="relative inline-flex flex-nowrap items-baseline gap-x-3 text-[2.05rem] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
                <span className="hero-name text-white whitespace-nowrap drop-shadow-2xl">Abel G.I.</span>
                <span className="text-white/80 whitespace-nowrap">-</span>
                <span className="hero-name whitespace-nowrap drop-shadow-2xl">
                  <Typewriter 
                    /* ✅ SOLUCIÓN ERROR TS: Pasamos el primer string del array */
                    text={ROLE_STRINGS[0]} 
                    phrases={ROLE_STRINGS as unknown as string[]} 
                    pauseAfterTypedMs={1350} 
                    pauseAfterDeletedMs={250} 
                    typeSpeedMs={32} 
                    deleteSpeedMs={20} 
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-3 left-0 h-px w-full max-w-140 bg-linear-to-r from-cyan-400 via-white/50 to-transparent" />
              </h1>

              <p className="text-pretty text-base leading-none text-white font-medium sm:text-lg drop-shadow-lg max-w-3xl">
                · Full Stack Developer enfocado en SaaS y automatización<br />
                · Desarrollo sistemas reales con pagos y automatización<br />
                · Desplegados y funcionando en producción
              </p>
              <p className="-mt-1 text-sm text-cyan-400 font-semibold drop-shadow-md">
                React · Next.js · Node · Supabase · Stripe
              </p>
            </div>
          </div>

          {/* BOTONES CON AISLAMIENTO REFORZADO */}
          <div className="relative z-50 w-full flex flex-col sm:flex-row items-center justify-between gap-8 mt-20 isolate">
            <div className="w-full sm:w-auto flex justify-center">
              <NeonPulse>
                <a href="#proyectos" className="btn-cyber-final group">
                  <span className="absolute inset-0 cyber-reflejo-violet opacity-40" />
                  <span className="relative z-10">Ver Proyectos</span>
                </a>
              </NeonPulse>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white text-center sm:text-left drop-shadow-2xl max-w-50 sm:max-w-none">
              Sistemas en producción <span className="hidden sm:inline">|</span> <br className="sm:hidden" /> Automatización real
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <NeonPulse>
                <a href="#contacto" className="btn-cyber-final-slow border-white/20!">
                  <span className="absolute inset-0 cyber-reflejo-violet-slow opacity-20" />
                  <span className="relative z-10">Disponible para trabajar</span>
                </a>
              </NeonPulse>
            </div>

            <div className="hidden lg:flex">
              <ArchitectureLogs />
            </div>
          </div>
        </div>
      </FadeIn>

      <style jsx>{`
        .hero-name {
          background: linear-gradient(90deg, #fff, #fff 45%, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .btn-cyber-final, .btn-cyber-final-slow {
          position: relative;
          display: inline-flex;
          width: 100%;
          justify-content: center;
          padding: 0.8rem 2.2rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          background: #020617; /* Fondo sólido muy oscuro para evitar fallos con blur */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          /* BLINDAJE TOTAL: Forzamos capa de hardware para que no desaparezcan */
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: transform, box-shadow;
        }
        @media (min-width: 640px) { .btn-cyber-final, .btn-cyber-final-slow { width: auto; } }

        .btn-cyber-final {
          border: 1px solid rgba(34, 211, 238, 0.5);
          animation: neon-pulse 1.2s infinite alternate ease-in-out;
        }
        .btn-cyber-final-slow {
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: neon-slow 3s infinite alternate ease-in-out;
        }

        @keyframes neon-pulse {
          0% { border-color: rgba(34, 211, 238, 0.4); box-shadow: 0 0 5px rgba(34, 211, 238, 0.2); }
          100% { border-color: rgba(34, 211, 238, 1); box-shadow: 0 0 15px rgba(34, 211, 238, 0.6); }
        }
        @keyframes neon-slow {
          0% { border-color: rgba(255, 255, 255, 0.2); }
          100% { border-color: rgba(34, 211, 238, 0.5); box-shadow: 0 0 8px rgba(34, 211, 238, 0.3); }
        }

        .cyber-reflejo-violet, .cyber-reflejo-violet-slow {
          background: linear-gradient(135deg, transparent 25%, rgba(139, 92, 246, 0.4) 50%, transparent 75%);
          background-size: 200% 200%;
          animation: reflejo-speed 3s linear infinite;
        }
        .cyber-reflejo-violet-slow { animation-duration: 6s; }
        @keyframes reflejo-speed {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}
