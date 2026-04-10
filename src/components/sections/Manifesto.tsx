"use client";

import { motion } from "framer-motion";

export function Manifesto() {
  // 1. Keyframes: Aparece (0.1), Se queda (0.9), Desaparece (1)
  const loopVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: [0, 1, 1, 0], 
      y: [10, 0, 0, -5] 
    }
  };

  // 2. Configuración del Timer con los valores solicitados
  const timer = (delay: number) => ({
    duration: 6,
    repeat: Infinity,
    repeatDelay: 1,
    times: [0, 0.1, 0.9, 1],
    delay: delay,
    ease: "easeInOut"
  });

  return (
    <section className="relative py-12 sm:py-16 px-6 overflow-hidden bg-background">
      <div className="max-w-4xl mx-auto">
        
        {/* BLOQUE 1: INTRO (Delay 0.4s) */}
        <div className="mb-12 sm:mb-16 text-center">
          <motion.div 
            variants={loopVariants as any} 
            initial="initial" 
            animate="animate" 
            transition={timer(0.4) as any}
          >
            <span className="text-accent uppercase tracking-[0.4em] text-[10px] mb-3 block opacity-70">
              Developer Manifesto
            </span>
            <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white/90">
              No soy solo <span className="text-white font-medium border-b border-accent/40">desarrollador.</span>
            </h2>
          </motion.div>
        </div>

        {/* BLOQUE 2 Y 3: CUERPO (Delays 0.8s y 1.2s) */}
        <div className="space-y-12 sm:space-y-16 mb-16 sm:mb-20">
          <motion.div 
            variants={loopVariants as any} 
            initial="initial" 
            animate="animate" 
            transition={timer(0.8) as any}
          >
            <div className="max-w-xl">
              <p className="text-lg sm:text-xl text-white/95 leading-tight font-medium">
                Construyo sistemas completos que funcionan en producción y resuelven <span className="text-accent">problemas reales.</span>
              </p>
            </div>
          </motion.div>

          <motion.div 
            variants={loopVariants as any} 
            initial="initial" 
            animate="animate" 
            transition={timer(1.2) as any}
          >
            <div className="max-w-lg ml-auto text-right">
              <p className="text-sm sm:text-base text-white/60 leading-relaxed italic border-r-2 border-accent/20 pr-6 py-1">
                Desde plataformas SaaS escalables hasta automatizaciones que eliminan trabajo manual.
              </p>
            </div>
          </motion.div>
        </div>

        {/* BLOQUE 4: CIERRE (Delays 1.6s y 1.8s) */}
        <div className="relative pt-8">
          <motion.div 
            variants={loopVariants as any} 
            initial="initial" 
            animate="animate" 
            transition={timer(1.6) as any}
            className="absolute top-0 left-0 w-16 h-px bg-accent/30" 
          />
          <motion.div 
            variants={loopVariants as any} 
            initial="initial" 
            animate="animate" 
            transition={timer(1.8) as any}
          >
            <div className="space-y-2">
              <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-white leading-none">
                Mi foco no es el código.
              </p>
              <p className="text-xl sm:text-3xl font-bold tracking-tighter text-accent/90">
                Es que el sistema funcione, escale y ahorre tiempo.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
