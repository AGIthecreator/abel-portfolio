"use client";

import React from 'react';

interface StripProductionProps {
  activeColor?: string;
}

const StripProduction = ({ activeColor = "#8B5CF6" }: StripProductionProps) => {
  const items = ["Arquitectura", "Automatización", "Ejecución"];

  return (
    <section className="w-full bg-[#050505] py-8 md:py-10 overflow-hidden m-0 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="order-2 md:order-1 flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">
            PRODUCTION MODE
          </span>
        </div>

        <div className="order-1 md:order-2 text-center flex items-center gap-4">
          {items.map((item, i) => (
            <React.Fragment key={item}>
              <h2 
                className="text-xl md:text-3xl font-medium text-white tracking-[0.15em] uppercase transition-all duration-500 hover:tracking-[0.2em] cursor-default"
                onMouseEnter={(e) => (e.currentTarget.style.color = activeColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
              >
                {item}
              </h2>
              {i < 2 && (
                <span className="text-white/20 animate-pulse">/</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="order-3 flex items-center gap-3 bg-white/2 px-4 py-2 rounded-full border border-white/5 hover:border-white/10 transition-colors duration-500">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
          </div>
          <span className="text-xs md:text-sm text-white/60 font-medium whitespace-nowrap tracking-wide">
            Disponible para proyectos
          </span>
        </div>
      </div>
    </section>
  );
};

export default StripProduction;
