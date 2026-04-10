"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { NeonPulse } from "@/components/motion/NeonPulse";
import { Typewriter } from "@/components/motion/Typewriter";
import { ArchitectureLogs } from "@/components/ui/ArchitectureLogs";
import dynamic from "next/dynamic";

const HeroReactiveCanvas = dynamic(
  () =>
    import("@/components/ui/HeroReactiveCanvas").then(
      (m) => m.HeroReactiveCanvas
    ),
  { ssr: false }
);

const ROLE_STRINGS = [
  "Full Stack Developer",
  "Automation Expert",
  "Security Focused",
] as const;

export function Hero() {
  return (
    <section className="relative pt-6 sm:pt-10">
      <FadeIn className="group/hero glass-card neon-border relative rounded-3xl px-6 py-9 sm:px-10 sm:py-12 overflow-hidden">
        <HeroReactiveCanvas intensity={0.9} />

        <div
          aria-hidden="true"
          className="hero-border pointer-events-none absolute inset-0 rounded-3xl"
        />

        <div className="relative flex flex-col items-center">
          {/* BLOQUE SUPERIOR */}
          <div className="relative z-20 flex flex-col gap-7 w-full -mb-10 sm:-mb-14">
            <div className="flex flex-col gap-4">
              <p className="text-xs tracking-[0.25em] text-white/80 font-semibold">
                CONSTRUYENDO EL FUTURO DIGITAL
              </p>

              <h1 className="relative inline-flex flex-nowrap items-baseline gap-x-3 text-[2.05rem] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-3 left-0 h-px w-[min(560px,92%)] bg-linear-to-r from-accent via-white/50 to-transparent"
                />
                <span className="hero-name text-white whitespace-nowrap">
                  Abel G.I.
                </span>
                <span className="text-white/80 whitespace-nowrap">-</span>
                <span className="hero-name whitespace-nowrap">
                  <Typewriter
  text={ROLE_STRINGS[0]} // El primer string de la lista para el valor inicial
  phrases={ROLE_STRINGS as unknown as string[]} // Forzamos el array a ser un array de strings estándar
  pauseAfterTypedMs={1350}
  pauseAfterDeletedMs={250}
  typeSpeedMs={32}
  deleteSpeedMs={20}
/>


                </span>
              </h1>

              <p className="w-full max-w-none text-pretty text-base leading-none text-white/95 sm:text-lg drop-shadow-sm">
                · Full Stack Developer enfocado en SaaS y automatización<br />
                · Desarrollo sistemas reales con pagos y automatización<br />
                · Desplegados y funcionando en producción
              </p>
              <p className="-mt-1 w-full max-w-none text-sm leading-none text-white/70 font-medium">
                React · Next.js · Node · Supabase · Stripe
              </p>
            </div>
          </div>

          {/* BLOQUE MEDIO: Video */}
          <div className="hero-demo-video relative z-10 opacity-50 transition-opacity duration-700 group-hover/hero:opacity-75" aria-label="Video de demostración 16:9" role="presentation">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/Frame-video-portfolio.PNG"
              controls={false}
              preload="metadata"
            >
              <source
                media="(max-width: 768px)"
                src="https://res.cloudinary.com/dzsyoknqy/video/upload/f_auto,q_auto,w_800,vc_h265,br_1m/v1774948305/bfwu00oiswhhmobfvehb.mp4"
                type="video/mp4"
              />
              <source
                src="https://res.cloudinary.com/dzsyoknqy/video/upload/f_auto,q_auto,vc_h265/v1774948305/bfwu00oiswhhmobfvehb.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* BLOQUE INFERIOR */}
          <div className="relative z-20 flex flex-col gap-4 sm:flex-row sm:items-center w-full -mt-10 sm:-mt-14 px-2">
            
            {/* BOTÓN PROYECTOS: Neón AZUL rápido */}
            <NeonPulse>
              <a
                href="#proyectos"
                className="btn-proyectos-active-blue group relative inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950/80 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-slate-900/90 focus:outline-none"
              >
                {/* Reflejo interno violeta a velocidad media (2s) */}
                <span className="absolute inset-0 cyber-reflejo-violet opacity-40" aria-hidden="true" />
                <span className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 neon-glow" />
                <span className="relative">Ver Proyectos</span>
              </a>
            </NeonPulse>

            <p className="flex-none text-sm font-bold text-white/95 text-center sm:text-left drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              Ingeniería técnica rigurosa | Visionario de producto digital
            </p>

            {/* BOTÓN DISPONIBLE: Mismo efecto pero LENTO y tenue */}
            <NeonPulse>
              <a
                href="#contacto"
                className="btn-disponible-slow group relative inline-flex w-fit shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-950/60 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white/80 transition-all duration-300 ease-out hover:scale-105 hover:bg-slate-900/80 hover:text-white focus:outline-none"
              >
                {/* Reflejo interno violeta LENTO (5s) */}
                <span className="absolute inset-0 cyber-reflejo-violet-slow opacity-20" aria-hidden="true" />
                <span className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 neon-glow" />
                <span className="relative">Disponible para trabajar</span>
              </a>
            </NeonPulse>

            <div className="sm:ml-auto flex shrink-0 justify-center">
              <ArchitectureLogs />
            </div>
          </div>
        </div>

        <style jsx>{`
          /* NEÓN RÁPIDO AZUL/CIAN para Proyectos (0.8s) */
          .btn-proyectos-active-blue {
            border: 1px solid rgba(255, 255, 255, 0.4);
            animation: neon-blue-pulse 0.8s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
          }

          @keyframes neon-blue-pulse {
            0% { 
              border-color: rgba(255, 255, 255, 0.4); 
              box-shadow: 0 0 2px rgba(34, 211, 238, 0.2); /* Cian suave */
            }
            50% {
              border-color: rgba(139, 92, 246, 0.6); /* Pasando por morado */
            }
            100% { 
              border-color: rgba(34, 211, 238, 1); /* Azul eléctrico/Cian intenso */
              box-shadow: 0 0 12px rgba(34, 211, 238, 0.9), inset 0 0 4px rgba(34, 211, 238, 0.5); 
            }
          }

          /* NEÓN LENTO AZUL para Disponible (3s) */
          .btn-disponible-slow {
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: neon-blue-slow-pulse 3s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
          }

          @keyframes neon-blue-slow-pulse {
            0% { 
              border-color: rgba(255, 255, 255, 0.2); 
              box-shadow: 0 0 1px rgba(34, 211, 238, 0.1); 
            }
            100% { 
              border-color: rgba(34, 211, 238, 0.6); /* Azul eléctrico sutil */
              box-shadow: 0 0 6px rgba(34, 211, 238, 0.4); 
            }
          }

          /* Reflejo violeta Proyectos (2s) */
          .cyber-reflejo-violet {
            background: linear-gradient(
              135deg,
              transparent 25%,
              rgba(139, 92, 246, 0.5) 50%,
              transparent 75%
            );
            background-size: 200% 200%;
            animation: reflejo-speed 2s linear infinite;
          }

          /* Reflejo violeta Disponible (5s) */
          .cyber-reflejo-violet-slow {
            background: linear-gradient(
              135deg,
              transparent 25%,
              rgba(139, 92, 246, 0.3) 50%,
              transparent 75%
            );
            background-size: 200% 200%;
            animation: reflejo-speed 5s linear infinite;
          }

          @keyframes reflejo-speed {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          .hero-name {
            background: linear-gradient(90deg, #fff, #fff 45%, #8b5cf6);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .hero-demo-video {
            width: 100%;
            max-width: min(960px, 100%);
            margin: 0 auto;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 40px -10px rgba(168, 85, 247, 0.3);
            overflow: hidden;
            aspect-ratio: 16 / 9;
            background: #000;
          }

          .hero-demo-video video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        `}</style>
      </FadeIn>
    </section>
  );
}