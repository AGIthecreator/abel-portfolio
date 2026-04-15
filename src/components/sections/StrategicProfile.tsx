"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { KeywordParticles } from "@/components/ui/KeywordParticles";

const STRATEGIC_DATA = [
  { title: "Reducir fricción", description: "Los sistemas simples funcionan mejor. Menos pasos, menos errores, más eficiencia.", color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.4)" },
  { title: "Automatizar procesos", description: "Si algo se repite, se automatiza. Menos trabajo manual, más tiempo para lo importante.", color: "#19C37D", glow: "rgba(25, 195, 125, 0.35)" },
  { title: "Pensar en sistemas", description: "No optimizo tareas aisladas. Construyo flujos que funcionan de forma continua.", color: "#3B82F6", glow: "rgba(59, 130, 246, 0.35)" }
];

const TECH_RAIN_WORDS = ["APIs", "Webhooks", "Automation", "Stripe", "PostgreSQL", "Scaling", "Supabase", "Backend", "Frontend", "CRM", "Data flow"];

export function StrategicProfile() {
  const [index, setIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((duration = 6000) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % STRATEGIC_DATA.length);
      setIsInteracting(false);
    }, duration);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleManualClick = (newIndex: number) => {
    if (newIndex === index) return;
    setIndex(newIndex);
    setIsInteracting(true);
    // Pausa inteligente: 12 segundos tras interacción manual
    startTimer(12000); 
  };

  const getLayout = (cardIdx: number) => {
    const total = STRATEGIC_DATA.length;
    const diff = (cardIdx - index + total) % total;
    if (diff === 0) return { x: 0, scale: 1, z: 30, opacity: 1, blur: 0, shadowOpacity: 1 };
    if (diff === 1) return { x: "72%", scale: 0.8, z: 10, opacity: 0.6, blur: 2.5, shadowOpacity: 0 };
    return { x: "-72%", scale: 0.8, z: 10, opacity: 0.6, blur: 2.5, shadowOpacity: 0 };
  };

  return (
    <section id="perfil" className="w-full">
      <FadeIn className="relative overflow-hidden min-h-120 flex flex-col p-4 sm:p-6 pt-0">
        
        {/* 1. MICRO HEADLINE (Contexto discreto) */}
        <div className="relative z-30 flex justify-center mb-4 opacity-20 transition-opacity hover:opacity-40 duration-700">
           <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white">
             Enfoque estratégico // Core Logic
           </span>
        </div>

        {/* 4. PARTÍCULAS (Ajuste fino de opacidad) */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <KeywordParticles words={TECH_RAIN_WORDS} />
        </div>

        <div className="relative z-20 flex-1 flex items-center justify-center min-h-80">
          {STRATEGIC_DATA.map((item, i) => {
            const { x, scale, z, opacity, blur } = getLayout(i);
            const isCenter = z === 30;

            return (
              <motion.div
                key={item.title}
                animate={{ 
                  x, 
                  scale: isCenter ? 1 : scale, 
                  zIndex: z, 
                  opacity: isCenter ? 1 : opacity, 
                  filter: `blur(${blur}px)` 
                }}
                whileHover={!isCenter ? { scale: 0.85, opacity: 0.8 } : {}}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute w-full max-w-70 sm:max-w-105 select-none cursor-pointer"
                onClick={() => handleManualClick(i)}
              >
                {/* 2. EFECTO FLASH + GLOW */}
                <motion.div 
                  animate={{ 
                    boxShadow: isCenter 
                      ? [ `0 0 20px ${item.glow}`, `0 0 60px ${item.glow}`, `0 0 40px ${item.glow}` ] 
                      : '0 0 0px rgba(0,0,0,0)' 
                  }}
                  transition={{ duration: isCenter ? 0.8 : 0.2 }}
                  className={`p-6 sm:p-10 rounded-3xl border transition-all duration-700 ${
                    isCenter ? 'bg-[#0a0a0c]/90 border-white/20' : 'bg-[#0a0a0c]/40 border-white/5'
                  }`}
                >
                  {/* 6. DETALLE PRO: Letter spacing dinámico en foco */}
                  <motion.h3 
                    animate={{ 
                      letterSpacing: isCenter ? "-0.02em" : "0.05em",
                      color: isCenter ? item.color : 'rgba(255,255,255,0.4)'
                    }}
                    className="font-bold mb-4 text-xl sm:text-3xl text-center transition-colors duration-700"
                  >
                    {item.title}
                  </motion.h3>
                  
                  <p className={`text-xs sm:text-base text-center leading-relaxed transition-all duration-700 ${
                    isCenter ? 'text-white/80 opacity-100' : 'text-white/10 opacity-40'
                  }`}>
                    {item.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </FadeIn>

      <style jsx>{`
        :global(.cursor-pointer), :global(.cursor-pointer *) { 
          cursor: pointer !important; 
        }
      `}</style>
    </section>
  );
}
