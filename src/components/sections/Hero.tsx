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

const ROLE_STRINGS = ["Sistemas en producción", "Automatización real", "Ecosistemas SaaS"] as const;

export function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-175 bg-black overflow-hidden isolate">
      {/* FONDO */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <video
          autoPlay loop muted playsInline
          className="h-full w-full object-cover opacity-30 grayscale-[0.5] brightness-50"
          poster="/Frame-video-portfolio.PNG"
        >
          <source src="/videos/VideoHero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black" />
        <div className="absolute inset-0 z-10 opacity-20">
          <HeroReactiveCanvas intensity={0.5} />
        </div>
      </div>

      <FadeIn className="relative z-20 h-full w-full flex items-center justify-center px-6">
        <div className="w-full flex flex-col items-center text-center overflow-visible">
          
          {/* TEXTO PRINCIPAL */}
          <div className="flex flex-col gap-6 mb-10 w-full items-center overflow-visible">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white pr-10 leading-tight overflow-visible">
              <span className="hero-name">Abel González Iglesias</span>
            </h1>
            
            {/* ✅ CENTRADO COMPENSADO: ml-3 para equilibrar el espacio del cursor */}
            <div className="h-8 sm:h-12 w-full flex items-center justify-center overflow-visible">
              <span className="text-xl sm:text-3xl font-light text-white/60 flex items-center justify-center whitespace-nowrap pr-20">
                <Typewriter 
                  text={ROLE_STRINGS as any} 
                  phrases={ROLE_STRINGS as unknown as string[]} 
                  pauseAfterTypedMs={1500} 
                  typeSpeedMs={40}
                  className="text-violet-400 font-mono ml-3" 
                />
              </span>
            </div>

            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed">
              Full Stack Developer enfocado en <span className="text-white/80">SaaS y automatización</span>.<br></br> 
              Desarrollo sistemas reales con pagos y workflows en producción.
            </p>
          </div>

          {/* ACCIÓN PRINCIPAL */}
          <div className="flex flex-col items-center gap-12 w-full">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-violet-600/20 to-cyan-600/20 rounded-sm blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <NeonPulse>
                <a href="#proyectos" className="btn-cyber-minimal relative group">
                  <span className="absolute inset-0 cyber-scanner-effect opacity-20" />
                  <span className="relative z-10">Ver Proyectos</span>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </NeonPulse>
            </div>

            {/* ENLACES Y LOG TÉCNICO */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-8 text-white/30 text-sm font-medium tracking-widest uppercase">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub</a>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <a href="mailto:contacto@agithecreator.com" className="hover:text-violet-400 transition-colors">Email</a>
              </div>
              
              <div className="relative mt-2 group/log cursor-pointer">
                <div className="absolute inset-0 z-20 opacity-0 overflow-hidden">
                  <ArchitectureLogs />
                </div>
                
                <div className="relative z-10 py-1 px-3 border border-white/5 bg-white/2 rounded-md group-hover/log:border-cyan-500/30 transition-colors">
                  <span className="text-[9px] font-mono text-cyan-500/50 group-hover/log:text-cyan-400 animate-pulse">
                    &gt; systems_online.log
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <style jsx>{`
        .hero-name {
          background: linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.5));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .btn-cyber-minimal {
          position: relative;
          display: inline-block;
          padding: 1rem 3.5rem;
          background: #050505;
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .btn-cyber-minimal:hover {
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.03) translateY(-2px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7);
        }

        .cyber-scanner-effect {
          background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: scan-move 4s linear infinite;
        }

        @keyframes scan-move {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}
