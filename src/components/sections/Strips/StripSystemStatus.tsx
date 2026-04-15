"use client";

import React from 'react';

const StripSystemStatus = () => {
  return (
    <section className="w-full bg-[#050505] border-y border-white/5 py-8 md:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
        
        <div className="flex items-center gap-3 group">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </div>
          <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-white/20 uppercase">
            SYSTEM STATUS
          </span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">
            +10 sistemas en producción
          </h2>
        </div>

        <div className="flex items-center">
          <p className="text-sm md:text-base text-white/40 font-medium tracking-wide">
            SaaS <span className="mx-2 text-white/10">•</span> 
            Automatización <span className="mx-2 text-white/10">•</span> 
            Infraestructura real
          </p>
        </div>
      </div>
    </section>
  );
};

export default StripSystemStatus;
