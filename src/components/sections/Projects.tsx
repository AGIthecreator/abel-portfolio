"use client";

import React from "react";
import Image from "next/image";
import { Play, ExternalLink, ShieldCheck, Zap, Github } from "lucide-react";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { motion, Variants } from "framer-motion";

// 🎬 Animación de Bloque Atómico (Unidad de Sistema)
const projectVariant: Variants = {
  hiddenLeft: { 
    opacity: 0, 
    x: -60 
  },
  hiddenRight: { 
    opacity: 0, 
    x: 60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.15 // Micro-delay para que el visual entre justo después del texto
    }
  }
};

const childVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5 } 
  }
};

// 🧩 Función Visual: Permite control manual y formato vertical
function ProjectVisual({ type, src, alt, isVertical = false }: { type: 'video' | 'image', src: string, alt: string, isVertical?: boolean }) {
  return (
    <motion.div 
      variants={childVariant}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl group mx-auto ${isVertical ? 'aspect-9/16 max-w-70' : 'aspect-video w-full'}`}
    >
      {type === 'video' ? (
        <video 
          src={src} 
          controls 
          className="h-full w-full object-cover opacity-90"
          poster={isVertical ? "/images/poster-callguard.jpg" : "/projects/automation-preview.jpg"}
        />
      ) : (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#030014]/40 via-transparent to-transparent" />
    </motion.div>
  );
}

export function Projects() {
  return (
    <section id="proyectos" className="space-y-48 py-20 overflow-hidden">
      
      {/* PROYECTO 1: PUCELATICKETING */}
      <motion.div 
        variants={projectVariant}
        initial="hiddenRight"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div className="order-1">
          <ProjectVisual type="image" src="/projects/pucelaticketing.jpg" alt="PucelaTicketing" />
        </div>
        <motion.div variants={childVariant} className="order-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white leading-none">PucelaTicketing</h2>
            <p className="text-xl text-accent font-medium leading-tight">Plataforma de gestión de eventos con pagos y control de accesos</p>
          </div>
          <div className="space-y-4 text-white/70">
            <p><span className="text-white font-bold">Impacto:</span> Sistema completo en producción que automatiza entradas, pagos y validación de accesos en tiempo real.</p>
            <p><span className="text-white font-bold">Problema:</span> Control manual de entradas, riesgo de reventa fraudulenta y validaciones lentas en accesos.</p>
            <p><span className="text-white font-bold">Solución:</span> Desarrollo de plataforma con Stripe, autenticación y sistema antifraude basado en DNI y QR dinámicos únicos. Transferencias controladas mediante modificación de datos verificados.</p>
          </div>
          <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-white font-bold mb-2 italic">Resultado:</p>
            <ul className="text-white/90 space-y-1 list-disc list-inside">
              <li>Eliminación del fraude por reventa no autorizada.</li>
              <li>Reducción del control manual en accesos.</li>
              <li>Validación rápida y segura en eventos.</li>
            </ul>
          </div>
          <div className="pt-4">
            <a href="https://pucelaticketing.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2 w-fit px-6 py-3 rounded-full bg-accent/10 border border-accent/20 text-white font-medium hover:bg-accent/20 transition-all">
              <ExternalLink className="h-4 w-4" /> Ver proyecto
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* PROYECTO 2: AGUARRÁS */}
      <motion.div 
        variants={projectVariant}
        initial="hiddenLeft"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <motion.div variants={childVariant} className="order-2 lg:order-1 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white leading-none">Aguarrás Estudio</h2>
            <p className="text-xl text-accent font-medium leading-tight">Plataforma web con gestión automatizada de contenidos y operaciones</p>
          </div>
          <div className="space-y-4 text-white/70">
            <p><span className="text-white font-bold">Impacto:</span> Sistema que conecta web, contenidos y operaciones internas sin gestión manual.</p>
            <p><span className="text-white font-bold">Problema:</span> Gestión manual de citas, inscripciones a talleres y actualización de la web.</p>
            <p><span className="text-white font-bold">Solución:</span> Integración de Airtable + Make para automatizar contenidos, reservas y publicaciones en tiempo real.</p>
          </div>
          <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-white font-bold mb-2 italic">Resultado:</p>
            <ul className="text-white/90 space-y-1 list-disc list-inside">
              <li>Eliminación de gestión manual en web y operaciones.</li>
              <li><strong>Optimización de costes:</strong> Reducción del 80% en el gasto, transformando una inversión anual de 464€ en tan solo 92€.</li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <ProjectModal />
            <a href="https://aguarr-s-estudio-the-artful-space.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white/80 font-medium hover:bg-white/10 transition-all">
              <ExternalLink className="h-4 w-4" /> Ver proyecto
            </a>
          </div>
        </motion.div>
        <div className="order-1 lg:order-2">
          <ProjectVisual type="image" src="/projects/aguarras.jpg" alt="Aguarrás Estudio" />
        </div>
      </motion.div>

      {/* PROYECTO 3: TOOLS / OPTIMIZACIÓN */}
      <motion.div 
        variants={projectVariant}
        initial="hiddenRight"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div className="order-1 flex justify-center">
          <ProjectVisual 
            type="video" 
            src="/videos/callguard-demo.mp4" 
            alt="CallGuard Video Demo" 
            isVertical={true} 
          />
        </div>
        <motion.div variants={childVariant} className="order-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white leading-none">
              Optimización de procesos técnicos y herramientas
            </h2>
            <p className="text-xl text-accent font-medium leading-tight">
              Scripts y sistemas que reducen tiempos en operaciones técnicas y atención al cliente
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-80">
                <Zap className="h-4 w-4 text-accent" /> Automatización en entorno técnico
              </h4>
              <div className="pl-6 border-l border-accent/30 space-y-2 text-white/70 text-sm">
                <p>Configuración personalizada de dispositivos automatizada, reduciendo entre 15 y 20 minutos por cliente.</p>
                <p>Migración de datos entre dispositivos optimizada, ahorrando hasta 40 minutos en casos complejos.</p>
                <a 
                  href="https://github.com/AGIthecreator/transfer-upgrade-para-tienda" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 w-fit px-3 py-1.5 mt-2 rounded-full border border-white/10 bg-white/5 text-[11px] hover:bg-white/10 transition-all"
                >
                  <Github className="h-3.5 w-3.5" /> Ver en GitHub
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] opacity-80">
                <ShieldCheck className="h-4 w-4 text-blue-500" /> Sistema de detección y bloqueo inteligente
              </h4>
              <div className="pl-6 border-l border-blue-500/30 space-y-2 text-white/70 text-sm">
                <p>Sistema que detecta patrones de centralitas y agrupa números sospechosos, permitiendo su bloqueo automático sin depender de APIs externas.</p>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.agithecreator.callguard" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 w-fit px-3 py-1.5 mt-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-white hover:bg-blue-500/20 transition-all"
                >
                  <Play className="h-3.5 w-3.5" /> Ver proyecto on Play Store
                </a>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-accent font-bold">
            Resultado: Reducción significativa de tiempo técnico por cliente y mejora en la eficiencia operativa.
          </div>
        </motion.div>
      </motion.div>

      {/* PROYECTO 4: AUTOMATIZACIONES */}
      <motion.div 
        variants={projectVariant}
        initial="hiddenLeft"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <motion.div variants={childVariant} className="order-2 lg:order-1 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white leading-none">
              Automatización de procesos operativos
            </h2>
            <p className="text-xl text-accent font-medium leading-tight">
              Sistemas que eliminan tareas manuales y reducen horas de trabajo diario
            </p>
          </div>
          
          <div className="space-y-4 text-white/70">
            <p><span className="text-white font-bold">Impacto:</span> Automatizaciones reales en producción que optimizan flujos de trabajo y reducen tiempos operativos de forma constante.</p>
            <p><span className="text-white font-bold">Problema:</span> Procesos manuales repetitivos en gestión de datos, clientes y operaciones internas que consumen tiempo y generan errores.</p>
            <p><span className="text-white font-bold">Solución:</span> Desarrollo de workflows con APIs, Webhooks, Airtable y Make que automatizan registros, sincronización y notificaciones.</p>
          </div>

          <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-white font-bold mb-2 italic">Resultado:</p>
            <ul className="text-white/90 space-y-1 list-disc list-inside">
              <li>Ahorro de varias horas diarias en operaciones repetitivas.</li>
              <li>Reducción de entre 15 y 40 minutos por tarea en casos reales.</li>
            </ul>
          </div>
        </motion.div>

        {/* CONTENEDOR DEL VIDEO */}
        <div className="order-1 lg:order-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <ProjectVisual type="video" src="/videos/escenarios.mp4" alt="Automatización de procesos" />
        </div>
      </motion.div>
    </section>
  );
}
