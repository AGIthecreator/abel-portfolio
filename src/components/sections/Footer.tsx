"use client";

import React from "react";
import { Download, ArrowUpRight } from "lucide-react";

const email = "contacto@agithecreator.com";
const githubUrl = "https://github.com";
const linkedinUrl = "https://linkedin.com";
const cvUrl = "/CV_Abel_Gonzalez_2026.pdf";

export function Footer({ activeColor = "#8B5CF6" }: { activeColor?: string }) {
  const year = 2026;

  return (
    /* CORRECCIÓN: Eliminado mt-32 y márgenes de pantalla negativos */
    <footer
      id="contacto"
      className="relative scroll-mt-24 w-full overflow-hidden border-t border-white/5 bg-[#050505]"
    >
      
      {/* 🛠 LÍNEAS LATERALES TÉCNICAS */}
      <div className="hidden lg:block absolute left-[8%] top-1/2 -translate-y-1/2 w-[22%] h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 w-[22%] h-px bg-linear-to-l from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="w-full px-6 md:px-12 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* BLOQUE IZQUIERDO: Branding Reforzado */}
          <div className="flex flex-col gap-1.5 text-center lg:text-left">
            <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-white">
              Sistemas en <span style={{ color: activeColor }} className="transition-colors duration-1000">producción.</span>
            </h3>
            <p className="text-[12px] font-mono text-white/30 uppercase tracking-[0.3em] font-bold">
              production_mode // v2.0
            </p>
          </div>

          {/* BLOQUE CENTRAL: El Botón Elástico */}
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
               <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
               Disponible para proyectos
             </div>
             
             <a 
              href={`mailto:${email}`}
              className="group flex items-center justify-center gap-0 hover:gap-4 px-6 py-3 rounded-full border border-white/10 bg-white/2 hover:bg-white/5 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] min-w-52.5 hover:min-w-77.5"
            >
              <span className="text-sm font-bold text-white/90 group-hover:text-white/60 transition-colors duration-500">
                {email}
              </span>
              
              <div className="max-w-0 overflow-hidden group-hover:max-w-30 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap pl-2 translate-x-4 group-hover:translate-x-0 transition-transform duration-700" style={{ color: activeColor }}>
                  ¡Hablemos!
                </span>
              </div>

              <div className="p-1.5 rounded-full ml-2 shrink-0" style={{ backgroundColor: `${activeColor}15` }}>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" style={{ color: activeColor }} />
              </div>
            </a>
          </div>

          {/* BLOQUE DERECHO: Infraestructura Ensanchada */}
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-end gap-2.5">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Infraestructura</p>
               <div className="flex items-center gap-8">
                  <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-white/40 hover:text-white transition-colors tracking-widest">LINKEDIN</a>
                  <a href={githubUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-white/40 hover:text-white transition-colors tracking-widest">GITHUB</a>
                  <a href={cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-white/40 hover:text-white transition-colors tracking-widest">
                    CV <Download className="h-3 w-3" />
                  </a>
               </div>
            </div>
            
            <div className="h-10 w-px bg-white/5 hidden md:block" />
            
            <div className="text-right flex flex-col gap-0.5">
              <p className="text-[11px] font-bold text-white/60 tracking-tight font-sans">© {year} ABEL GONZÁLEZ</p>
              <p className="text-[9px] text-white/20 uppercase tracking-widest font-mono">España / Remoto</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
