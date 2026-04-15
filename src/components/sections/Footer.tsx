"use client";

import React from "react";
import { Github, Linkedin, Download, ArrowUpRight } from "lucide-react";

const email = "contacto@agithecreator.com";
const githubUrl = "https://github.com/AGIthecreator";
const linkedinUrl = "https://www.linkedin.com/in/abel-gonzalez-iglesias/";
const cvUrl = "/CV_Abel_Gonzalez_2026.pdf";

export function Footer({ activeColor = "#8B5CF6" }: { activeColor?: string }) {
  const year = 2026;

  return (
    <footer id="contacto" className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#050505] border-t border-white/5 mt-32 overflow-hidden">
      
      {/* 🛠 LÍNEAS LATERALES (Divididas para no tocar el botón) */}
      <div className="hidden lg:block absolute left-[10%] top-1/2 -translate-y-1/2 w-[25%] h-px bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 w-[25%] h-px bg-linear-to-l from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="w-full px-12 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* BLOQUE IZQUIERDO: Branding (Tamaño aumentado) */}
          <div className="flex flex-col gap-1.5 text-center lg:text-left">
            <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-white">
              Sistemas en <span style={{ color: activeColor }} className="transition-colors duration-1000">producción.</span>
            </h3>
            <p className="text-[12px] font-mono text-white/30 uppercase tracking-[0.3em] font-bold">
              production_mode // v2.0
            </p>
          </div>

          {/* BLOQUE CENTRAL: Botón Expandible Elástico */}
          <div className="flex flex-col items-center gap-3">
             <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">
               <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
               Disponible para proyectos
             </div>
             
             <a 
              href={`mailto:${email}`}
              className="group flex items-center justify-center gap-0 hover:gap-4 px-6 py-3 rounded-full border border-white/10 bg-white/2 hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-50 hover:min-w-70"
            >
              <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                {email}
              </span>
              
              {/* Texto que aparece al expandirse */}
              <span className="max-w-0 overflow-hidden group-hover:max-w-25 transition-all duration-500 ease-out text-xs font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 whitespace-nowrap" style={{ color: activeColor }}>
                ¡Hablemos!
              </span>

              <div className="p-1.5 rounded-full ml-2" style={{ backgroundColor: `${activeColor}15` }}>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" style={{ color: activeColor }} />
              </div>
            </a>
          </div>

          {/* BLOQUE DERECHO: Infraestructura */}
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
              <p className="text-[11px] font-bold text-white/60 tracking-tight">© {year} ABEL GONZÁLEZ</p>
              <p className="text-[9px] text-white/20 uppercase tracking-widest">España / Remoto</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
