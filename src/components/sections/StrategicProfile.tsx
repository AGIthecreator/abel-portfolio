"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % STRATEGIC_DATA.length);
    }, 6000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleManualClick = (newIndex: number) => {
    setIndex(newIndex);
    startTimer();
  };

  const getLayout = (cardIdx: number) => {
    const total = STRATEGIC_DATA.length;
    const diff = (cardIdx - index + total) % total;
    if (diff === 0) return { x: 0, scale: 1, z: 30, opacity: 1, blur: 0 };
    if (diff === 1) return { x: "72%", scale: 0.8, z: 10, opacity: 0.6, blur: 2.5 };
    return { x: "-72%", scale: 0.8, z: 10, opacity: 0.6, blur: 2.5 };
  };

  return (
    <section id="perfil" className="w-full">
      {/* Eliminado glass-card, neon-border y ajustado el padding superior */}
      <FadeIn className="relative overflow-hidden min-h-100 flex flex-col p-4 sm:p-6 pt-0 sm:pt-0">
        
        {/* Capa de lluvia (Z-0) */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <KeywordParticles words={TECH_RAIN_WORDS} />
        </div>

        {/* 
           CABECERA ELIMINADA (Título y línea horizontal)
        */}

        {/* Contenedor de las cards - Mantiene su posición central */}
        <div className="relative z-20 flex-1 flex items-center justify-center min-h-80">
          {STRATEGIC_DATA.map((item, i) => {
            const { x, scale, z, opacity, blur } = getLayout(i);
            const isCenter = z === 30;

            return (
              <motion.div
                key={item.title}
                animate={{ x, scale, zIndex: z, opacity, filter: `blur(${blur}px)` }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute w-full max-w-70 sm:max-w-105 select-none cursor-pointer"
                onClick={() => handleManualClick(i)}
              >
                <div 
                  className={`p-6 sm:p-10 rounded-3xl border transition-all duration-700 ${
                    isCenter ? 'bg-[#0a0a0c] border-white/20' : 'bg-[#0a0a0c] border-white/10'
                  }`}
                  style={{ boxShadow: isCenter ? `0 0 50px ${item.glow}` : 'none' }}
                >
                  <h3 className="font-bold tracking-tighter mb-4 text-xl sm:text-3xl text-center" 
                      style={{ color: isCenter ? item.color : 'rgba(255,255,255,0.4)' }}>
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-base text-center leading-relaxed transition-opacity ${isCenter ? 'text-white/80' : 'text-white/15'}`}>
                    {item.description}
                  </p>
                </div>
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
