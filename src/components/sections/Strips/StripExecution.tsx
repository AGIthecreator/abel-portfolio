"use client";

import React from 'react';

const StripExecution = () => {
  const words = ["Sistemas", "diseñados", "para", "producción"];

  return (
    <section className="relative w-full bg-[#070707] border-t border-white/5 py-8 md:py-10 overflow-hidden">
      
      {/* Gradiente que respira (Efecto opacidad 4s) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 animate-pulse">
        <div className="h-full w-1/3 bg-linear-to-r from-emerald-500/50 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        
        <div className="flex flex-col items-center md:items-start">
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/25 uppercase italic">
            EXECUTION LAYER
          </span>
        </div>

        {/* Headline con Stagger de palabras */}
        <div className="text-center flex gap-x-3 flex-wrap justify-center">
          {words.map((word, i) => (
            <span 
              key={i} 
              className="text-2xl md:text-4xl font-semibold text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-end">
          <p className="text-xs md:text-sm font-mono text-white/30 uppercase tracking-widest flex gap-2">
            <span className="group/item cursor-default hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.4)] transition-all duration-300">
              <span className="text-red-500/40">No</span> humo
            </span>
            <span className="text-white/10">/</span>
            <span className="group/item cursor-default hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.4)] transition-all duration-300">
              <span className="text-red-500/40">No</span> teoría
            </span>
            <span className="text-white/10">/</span>
            <span className="text-emerald-500/60 italic hover:text-emerald-400 transition-colors duration-300 cursor-default">Sistemas reales</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StripExecution;
