"use client";

import React, { useState, useEffect } from "react";
import { 
  SiReact, SiNodedotjs, SiSupabase, SiPostgresql, SiVercel, 
  SiCloudflare, SiMake, SiAirtable, SiOpenai, SiTypescript, 
  SiStripe, SiDocker
} from "react-icons/si";
import { Terminal, ShieldCheck, Zap, Laptop, Globe, Layers, ArrowRight } from "lucide-react";

// --- CONFIGURACIÓN DE DATOS (Fiel a los textos originales) ---
const SYSTEMS = {
  saas: {
    title: "Arquitectura SaaS Escalable",
    subtitle: "SaaS_Production_Core",
    color: "#22D3EE",
    desc: "Infraestructura preparada para producción real: alta concurrencia, pagos recurrentes y seguridad distribuida en edge.",
    impact: ["Escalabilidad automática bajo demanda", "Monetización integrada (Stripe)", "Latencia optimizada a nivel global"],
    categories: {
      "Frontend": ["Next.js", "TypeScript", "Tailwind"],
      "Backend": ["Node.js", "Supabase", "PostgreSQL"],
      "Infraestructura": ["Vercel", "Cloudflare WAF"],
      "Pagos": ["Stripe API"]
    },
    nodes: [
      { id: "v", label: "Vercel", icon: SiVercel, x: 50, y: 10, function: "Global Edge Hosting" },
      { id: "f", label: "Next.js", icon: SiReact, x: 50, y: 35, function: "Fullstack Framework" },
      { id: "a", label: "Node API", icon: SiNodedotjs, x: 25, y: 60, function: "Lógica de Negocio" },
      { id: "s", label: "Stripe", icon: SiStripe, x: 75, y: 60, function: "Pasarela de Pagos" },
      { id: "db", label: "Postgres", icon: SiPostgresql, x: 25, y: 85, function: "Base de Datos Relacional" },
      { id: "au", label: "Auth", icon: SiSupabase, x: 75, y: 85, function: "Auth & Realtime" },
    ],
    links: [["v", "f"], ["f", "a"], ["f", "s"], ["a", "db"], ["a", "au"]]
  },
  automation: {
    title: "Automatización de Procesos ",
    subtitle: "Automation_Logic_Unit",
    color: "#8B5CF6",
    desc: "Automatización de procesos críticos conectando APIs, datos e inteligencia artificial sin intervención manual.",
    impact: ["Reducción drástica de tareas manuales", "Ejecución continua 24/7", "Integración de IA en workflows reales"],
    categories: {
      "Engine": ["Make", "n8n"],
      "Datos": ["Airtable", "PostgreSQL"],
      "IA": ["OpenAI GPT-4o", "Claude"],
      "Comunicación": ["Twilio", "SendGrid"]
    },
    nodes: [
      { id: "w", label: "Webhooks", icon: Globe, x: 50, y: 10, function: "Event Trigger" },
      { id: "m", label: "Make", icon: SiMake, x: 50, y: 35, function: "Workflow Core" },
      { id: "ai", label: "OpenAI", icon: SiOpenai, x: 20, y: 60, function: "Procesamiento IA" },
      { id: "api", label: "Ext. APIs", icon: Layers, x: 80, y: 60, function: "Integraciones" },
      { id: "db", label: "Airtable", icon: SiAirtable, x: 50, y: 85, function: "Base de Datos Ops" },
    ],
    links: [["w", "m"], ["m", "ai"], ["m", "api"], ["ai", "db"], ["api", "db"]]
  },
  antifraud: {
    title: "Seguridad y Control Antifraude",
    subtitle: "Antifraud_Validation_v2",
    color: "#19C37D",
    desc: "Sistema antifraude en producción que elimina la reventa no autorizada mediante validación por DNI y QR único transferible.",
    impact: ["Reventa ilegal eliminada (0%)", "Validación por identidad (DNI)", "Transferencia controlada y trazable"],
    categories: {
      "Identity": ["Supabase Auth", "JWT"],
      "Backend": ["Node.js Cluster", "Redis"],
      "Security": ["Docker", "Cifrado QR"],
      "Base de Datos": ["PostgreSQL"]
    },
    nodes: [
      { id: "dni", label: "Auth DNI", icon: ShieldCheck, x: 50, y: 10, function: "Verificación de Identidad" },
      { id: "sup", label: "Supabase", icon: SiSupabase, x: 50, y: 35, function: "Controlador Lógico" },
      { id: "qr", label: "Gen QR", icon: SiTypescript, x: 20, y: 60, function: "Lógica de QR Seguro" },
      { id: "sec", label: "Seguridad", icon: SiDocker, x: 80, y: 60, function: "App Contenerizada" },
      { id: "log", label: "Auditoría", icon: SiPostgresql, x: 50, y: 85, function: "Registros Inmutables" },
    ],
    links: [["dni", "sup"], ["sup", "qr"], ["sup", "sec"], ["qr", "log"], ["sec", "log"]]
  },
  retail: {
    title: "Retail Optimización",
    subtitle: "Operational_Logic_Edge",
    color: "#FFD700",
    desc: "Automatización de configuración y migración de dispositivos, reduciendo tiempos en entornos físicos con usuarios no técnicos.",
    impact: ["Reducción de hasta 40 min por dispositivo", "Configuración simplificada para cualquier usuario", "Migración segura entre dispositivos"],
    categories: {
      "Scripts": ["JS", "Bash", "Python"],
      "Sistema": ["ADB Tools", "Android API"],
      "Interfaz": ["Electron", "React"],
      "Despliegue": ["Red Local"]
    },
    nodes: [
      { id: "in", label: "Operator", icon: Laptop, x: 50, y: 10, function: "Interfaz de Operador" },
      { id: "cli", label: "Custom CLI", icon: Terminal, x: 50, y: 35, function: "Motor de Automatización" },
      { id: "sh", label: "Scripts", icon: SiOpenai, x: 20, y: 60, function: "Automatización de Sistema" },
      { id: "adb", label: "ADB Logic", icon: SiTypescript, x: 80, y: 60, function: "Puente con Android" },
      { id: "out", label: "Device Set", icon: Zap, x: 50, y: 85, function: "Configuración Final" },
    ],
    links: [["in", "cli"], ["cli", "sh"], ["cli", "adb"], ["sh", "out"], ["adb", "out"]]
  }
};

export default function TechStack() {
  const [active, setActive] = useState<keyof typeof SYSTEMS>("saas");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => { 
    setMounted(true); 
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sys = SYSTEMS[active];
  const rgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center text-white overflow-hidden py-20 lg:py-0 isolate">
      
      {/* 🌌 FONDO DINÁMICO */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 -z-10"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      >
        <div 
          className="absolute inset-0 opacity-25" 
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${rgba(sys.color, 0.15)} 0%, transparent 70%)`,
            animation: "pulseBg 6s ease-in-out infinite"
          }} 
        />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />
      </div>

      <style jsx global>{`
        @keyframes nodeIn {
          from { opacity: 0; transform: translate(-50%, -40%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pulseBg {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
        
        <div className="h-32 mb-10 flex flex-col justify-end">
          <div className="flex items-center gap-3 text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            <Terminal className="h-3.5 w-3.5" />
            <span>{`> system_status: ACTIVE // id: ${sys.subtitle}`}</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" key={sys.title}>
            {sys.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 🎛️ SELECTOR (Fiel a los títulos de SYSTEMS) */}
          <div className="lg:col-span-3 space-y-2.5">
            {Object.entries(SYSTEMS).map(([key, item]) => {
              const isSelected = active === key;
              return (
                <button
                  key={key}
                  onClick={() => { setActive(key as keyof typeof SYSTEMS); setHoveredNode(null); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-500 group"
                  style={{
                    borderColor: isSelected ? rgba(item.color, 0.3) : "rgba(255,255,255,0.05)",
                    backgroundColor: isSelected ? rgba(item.color, 0.08) : "rgba(255,255,255,0.01)",
                    boxShadow: isSelected ? `0 0 20px ${rgba(item.color, 0.15)}` : "none"
                  }}
                >
                  <span className={`text-sm font-bold tracking-wide transition-all ${isSelected ? "text-white" : "text-white/20 group-hover:text-white/50"}`}>
                    {item.title.split(' ')[0]}
                  </span>
                  <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${isSelected ? "scale-125" : "scale-100"}`} 
                       style={{ background: item.color, boxShadow: isSelected ? `0 0 10px ${item.color}` : "none", opacity: isSelected ? 1 : 0.2 }} 
                  />
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 h-130 relative lg:w-[110%] lg:-ml-[5%] rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl cursor-crosshair">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {sys.links.map(([fromId, toId]: any, i: number) => {
                const from = sys.nodes.find((n: any) => n.id === fromId);
                const to = sys.nodes.find((n: any) => n.id === toId);
                if (!from || !to) return null;
                const isHighlight = hoveredNode === fromId || hoveredNode === toId;
                return (
                  <g key={`${active}-link-${i}`}>
                    <line 
                      x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke={sys.color} strokeWidth={isHighlight ? "2" : "1"}
                      strokeOpacity={isHighlight ? 0.8 : 0.2}
                      className="transition-all duration-500"
                    />
                    <circle 
                      r="2.5" 
                      fill={sys.color} 
                      opacity="0.8"
                      style={{ filter: `drop-shadow(0 0 6px ${sys.color})` }}
                    >
                      <animateMotion dur={`${2.5 + i*0.3}s`} repeatCount="indefinite" path={`M ${from.x * 5.5},${from.y * 5.2} L ${to.x * 5.5},${to.y * 5.2}`} />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {sys.nodes.map((node: any, i: number) => {
              const isActive = hoveredNode === node.id;
              const isRelated = hoveredNode && (sys.links.some((l: any) => (l[0] === node.id && l[1] === hoveredNode) || (l[1] === node.id && l[0] === hoveredNode)));
              
              return (
                <div 
                  key={`${active}-${node.id}`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute flex flex-col items-center gap-2 z-20 group transition-opacity duration-300"
                  style={{ 
                    left: `${node.x}%`, 
                    top: `${node.y}%`,
                    animation: `nodeIn 0.6s ease forwards`,
                    animationDelay: `${i * 0.08}s`,
                    opacity: hoveredNode && !isActive && !isRelated ? 0.2 : 1
                  }}
                >
                  <div 
                    className="p-3.5 rounded-2xl border transition-all duration-500"
                    style={{ 
                      borderColor: isActive || isRelated ? sys.color : "rgba(255,255,255,0.08)", 
                      backgroundColor: isActive || isRelated ? rgba(sys.color, 0.2) : "rgba(5,5,5,0.9)",
                      transform: isActive ? "scale(1.2)" : "scale(1)"
                    }}
                  >
                    <node.icon className="h-5 w-5" style={{ color: isActive || isRelated ? "white" : rgba(sys.color, 0.5) }} />
                  </div>
                  
                  {isActive && (
                    <div className="absolute -top-14 bg-black/90 border border-white/10 px-3 py-1 rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-bold" style={{ color: sys.color }}>{node.function}</p>
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest pointer-events-none">{node.label}</span>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8 lg:pl-6 min-h-125">
            <div className="h-20 flex items-center">
              <p className="text-sm text-white/50 leading-relaxed italic border-l border-white/10 pl-5">
                {sys.desc}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase">Impacto en Negocio</h4>
              <div className="grid gap-2.5">
                {sys.impact.map((text: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                    <ArrowRight className="h-3 w-3" style={{ color: sys.color }} />
                    <p className="text-[12px] text-white/70 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 pt-5 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase">Ecosistema</h4>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                {Object.entries(sys.categories).map(([cat, techs]) => (
                  <div key={cat} className="space-y-1">
                    <p className="text-[10px] font-bold text-white/40">{cat}</p>
                    <div className="text-[11px] text-white/70 flex flex-wrap gap-1.5">
                      {(techs as string[]).map((t, idx) => (
                        <span key={t}>
                          {t}{idx < (techs as string[]).length - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.4em]">
            no trabajo con herramientas aisladas · diseño sistemas que funcionan en producción
          </p>
        </div>
      </div>
    </section>
  );
}
