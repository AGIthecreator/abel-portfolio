"use client";

import React, { useState, useEffect } from "react";
import { 
  SiReact, SiNodedotjs, SiSupabase, SiPostgresql, SiVercel, 
  SiCloudflare, SiMake, SiAirtable, SiOpenai, SiTypescript, 
  SiStripe, SiDocker
} from "react-icons/si";
import { Terminal, ShieldCheck, Zap, Laptop, Globe, Layers, Eye, Target, TrendingUp, Cpu } from "lucide-react";
import type { IconType } from "react-icons";

type DiagramNode = {
  id: string;
  label: string;
  icon: IconType | React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
};
type DiagramLink = [fromId: string, toId: string];

const SYSTEMS = {
  saas: {
    label: "Arquitectura",
    title: "Arquitectura SaaS Escalable",
    color: "#22D3EE",
    desc: "Arquitectura lista para producción: alta concurrencia, monetización recurrente y seguridad distribuida en edge.",
    impact: ["Escalado automático sin intervención", "Revenue recurrente con Stripe", "Latencia global optimizada"],
    categories: { "Frontend": ["Next.js", "TS"], "Backend": ["Node", "Postgres"], "Pagos": ["Stripe"] },
    executive: {
      kpi: "99.9% uptime",
      p1: "Arquitectura distribuida capaz de soportar picos de +5k usuarios concurrentes sin degradación.",
      p2: "Sistema de pagos recurrentes con gestión automatizada de facturación, impuestos y retries.",
      extra: "Enfoque 'Serverless-first' para reducir costes operativos y mejorar resiliencia multi-región."
    },
    nodes: [
      { id: "n1", label: "Vercel", icon: SiVercel, x: 50, y: 15 },
      { id: "n2", label: "Next.js", icon: SiReact, x: 50, y: 40 },
      { id: "n3", label: "Node API", icon: SiNodedotjs, x: 25, y: 65 },
      { id: "n4", label: "Stripe", icon: SiStripe, x: 75, y: 65 },
      { id: "n5", label: "Postgres", icon: SiPostgresql, x: 25, y: 88 },
      { id: "n6", label: "Auth", icon: SiSupabase, x: 75, y: 88 },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n3", "n6"]]
  },
  automation: {
    label: "Automatización",
    title: "Motor de Flujos Neuronales",
    color: "#8B5CF6",
    desc: "Orquestación de procesos críticos mediante APIs e IA, eliminando tareas manuales.",
    impact: ["-95% carga operativa manual", "Ejecución continua 24/7", "Integración nativa con IA"],
    categories: { "Motor": ["Make", "n8n"], "IA": ["OpenAI", "Claude"], "Datos": ["Airtable"] },
    executive: {
      kpi: "+150h/mes liberadas",
      p1: "Automatización completa de flujos entre +10 herramientas sin intervención humana.",
      p2: "Procesamiento de lenguaje natural para clasificación y acción sobre leads en tiempo real.",
      extra: "Diseño de workflows resilientes con control de errores, retries y observabilidad integrada."
    },
    nodes: [
      { id: "n1", label: "Webhooks", icon: Globe, x: 50, y: 15 },
      { id: "n2", label: "Make", icon: SiMake, x: 50, y: 40 },
      { id: "n3", label: "OpenAI", icon: SiOpenai, x: 20, y: 65 },
      { id: "n4", label: "Ext. APIs", icon: Layers, x: 80, y: 65 },
      { id: "n5", label: "Airtable", icon: SiAirtable, x: 50, y: 88 },
      { id: "n6", label: "Logs", icon: Terminal, x: 80, y: 88 },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n4", "n6"]]
  },
  antifraud: {
    label: "Seguridad",
    title: "Protocolo Antifraude",
    color: "#19C37D",
    desc: "Sistema antifraude en producción basado en validación de identidad y trazabilidad completa.",
    impact: ["Reventa ilegal eliminada", "Validación DNI/QR", "Auditoría completa en tiempo real"],
    categories: { "Identidad": ["Auth", "JWT"], "Seguridad": ["Docker", "QR"], "Base": ["Postgres"] },
    executive: {
      kpi: "0% fraude operativo",
      p1: "Identidad única por ticket vinculada a documento oficial (DNI/NIE).",
      p2: "Rotación de claves y validación dinámica para evitar duplicación de accesos.",
      extra: "Modelo Zero-Trust aplicado a cada validación, asegurando integridad en todo el flujo."
    },
    nodes: [
      { id: "n1", label: "Identidad", icon: ShieldCheck, x: 50, y: 15 },
      { id: "n2", label: "Control", icon: SiSupabase, x: 50, y: 45 },
      { id: "n3", label: "QR Gen", icon: SiTypescript, x: 20, y: 70 },
      { id: "n4", label: "Docker", icon: SiDocker, x: 80, y: 70 },
      { id: "n5", label: "Audit", icon: SiPostgresql, x: 35, y: 90 },
      { id: "n6", label: "WAF", icon: SiCloudflare, x: 65, y: 90 },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n4", "n6"]]
  },
  retail: {
    label: "Retail",
    title: "Optimización Retail",
    color: "#FFD700",
    desc: "Automatización de despliegues en entornos físicos reduciendo drásticamente el tiempo operativo.",
    impact: ["-85% tiempo de setup", "Operativa simplificada", "Despliegue fiable offline"],
    categories: { "Sistemas": ["ADB", "Android"], "Interfaz": ["Electron"], "Scripts": ["Bash"] },
    executive: {
      kpi: "-85% tiempo técnico",
      p1: "Despliegue masivo de dispositivos Android sin necesidad de conexión externa.",
      p2: "Interfaz diseñada para operarios no técnicos con ejecución en un solo flujo.",
      extra: "CLI personalizada que permite configuraciones reproducibles y sin dependencia de red."
    },
    nodes: [
      { id: "n1", label: "Operador", icon: Laptop, x: 20, y: 25 },
      { id: "n2", label: "Motor", icon: Terminal, x: 50, y: 40 },
      { id: "n3", label: "Lógica", icon: SiTypescript, x: 80, y: 25 },
      { id: "n4", label: "Automatización", icon: SiOpenai, x: 30, y: 75 },
      { id: "n5", label: "Dispositivos", icon: Zap, x: 70, y: 75 },
      { id: "n6", label: "Sincro", icon: Globe, x: 50, y: 92 },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n4", "n6"]]
  }
};

export default function TechStack() {
  const [active, setActive] = useState<keyof typeof SYSTEMS>("saas");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const sys = SYSTEMS[active];
  const rgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  if (!mounted) return null;

  return (
    <section className="relative w-full text-white bg-transparent overflow-visible">
      <style jsx global>{`
        @keyframes pulseBg { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.05); } }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -2%); }
          40% { transform: translate(2%, 1%); }
          70% { transform: translate(-2%, 2%); }
          90% { transform: translate(1%, -1%); }
        }
      `}</style>
      
      {/* 🌌 FONDO DINÁMICO CON FUNDIDO SUPERIOR (SIN CORTES) */}
      <div className="absolute inset-0 pointer-events-none -z-10 mask-[linear-gradient(to_bottom,transparent,black_15%)]">
        <div className="absolute inset-0 opacity-30" 
             style={{ 
               background: `radial-gradient(circle at 50% 50%, ${rgba(sys.color, 0.2)} 0%, transparent 70%)`,
               animation: "pulseBg 6s ease-in-out infinite"
             }} 
        />
        <div className="absolute inset-0 opacity-[0.02] animate-[grain_8s_steps(10)_infinite]"
             style={{ backgroundImage: "url('https://vercel.app')" }} />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pt-2 pb-12">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10 h-24">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Terminal className="h-3 w-3" style={{ color: sys.color }} />
              <span>{`> sistema_v2: ${active} // status: active`}</span>
            </div>
            <h2 key={sys.title} className="text-4xl lg:text-6xl font-bold tracking-tight transition-all duration-700 animate-in fade-in slide-in-from-left-5">
              {sys.title.split(' ').map((word, i) => (
                <span key={i} className={i === sys.title.split(' ').length - 1 ? "" : "text-white"} style={{ color: i === sys.title.split(' ').length - 1 ? sys.color : undefined }}>{word} </span>
              ))}
            </h2>
          </div>
          
          <button 
            onClick={() => setRecruiterMode(!recruiterMode)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all duration-500 ${
              recruiterMode 
                ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.6)] scale-105' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'
            }`}
          >
            <Eye className="h-4 w-4" />
            {recruiterMode ? "Modo Técnico" : "Vista Reclutador"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* SELECTOR */}
          <div className="lg:col-span-3 space-y-3">
            {Object.entries(SYSTEMS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setActive(key as keyof typeof SYSTEMS)}
                className="w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 group hover:scale-[1.02]"
                style={{
                  borderColor: active === key ? rgba(item.color, 0.5) : "rgba(255,255,255,0.05)",
                  backgroundColor: active === key ? rgba(item.color, 0.12) : "rgba(255,255,255,0.02)",
                  transform: active === key ? "translateX(16px) scale(1.02)" : "scale(1)",
                }}
              >
                <span className={`text-[13px] font-bold uppercase tracking-widest ${active === key ? "text-white" : "text-white/40 group-hover:text-white/70"}`}>{item.label}</span>
                <div className="h-2 w-2 rounded-full transition-all duration-500" style={{ background: item.color, boxShadow: active === key ? `0 0 15px ${item.color}` : "none", opacity: active === key ? 1 : 0.2 }} />
              </button>
            ))}
          </div>

          {/* DIAGRAMA */}
          <div className="lg:col-span-5 h-137.5 relative rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
              {(sys.links as DiagramLink[]).map(([fromId, toId], i) => {
                const from = (sys.nodes as DiagramNode[]).find((n) => n.id === fromId);
                const to = (sys.nodes as DiagramNode[]).find((n) => n.id === toId);
                if (!from || !to) return null;
                const isHighlight = hoveredNode === fromId || hoveredNode === toId;
                
                return (
                  <g key={`${active}-link-${i}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={sys.color} strokeWidth={isHighlight ? "1" : "0.5"} strokeOpacity={isHighlight ? 1 : 0.3} className="transition-all duration-500" />
                    <circle r="0.8" fill={sys.color} opacity={isHighlight ? 1 : 0.7}>
                      <animateMotion dur={`${2.5 + i*0.3}s`} repeatCount="indefinite" path={`M ${from.x},${from.y} L ${to.x},${to.y}`} />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {sys.nodes.map((node) => {
              const isActive = hoveredNode === node.id;
              const isRelated = hoveredNode && sys.links.some(l => l.includes(node.id) && l.includes(hoveredNode));
              return (
                <div key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ left: `${node.x}%`, top: `${node.y}%`, opacity: hoveredNode && !isActive && !isRelated ? 0.3 : 1 }}
                >
                  <div className="p-4 rounded-2xl border transition-all duration-500 shadow-2xl"
                       style={{ 
                         borderColor: isActive || isRelated ? sys.color : "rgba(255,255,255,0.15)", 
                         backgroundColor: isActive || isRelated ? rgba(sys.color, 0.25) : "rgba(10,10,10,0.8)", 
                         transform: isActive ? "scale(1.3) rotate(5deg)" : isRelated ? "scale(1.15)" : "scale(1)",
                         boxShadow: isActive || isRelated ? `0 0 25px ${rgba(sys.color, 0.4)}` : "none",
                         filter: isActive ? `drop-shadow(0 0 12px ${sys.color})` : "none"
                       }}>
                    <node.icon className="h-6 w-6" style={{ color: isActive || isRelated ? "white" : rgba(sys.color, 0.7) }} />
                  </div>
                  <span className={`text-[10px] font-mono transition-colors duration-300 uppercase tracking-tighter font-bold ${isActive ? "text-white" : "text-white/40"}`}>{node.label}</span>
                </div>
              );
            })}

            {/* VISTA RECLUTADOR */}
            {recruiterMode && (
              <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-10 animate-in fade-in zoom-in duration-500">
                <div className="max-w-md w-full space-y-8">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase tracking-[0.5em]">
                    <Target className="h-4 w-4" />
                    <span>Estrategia_de_Negocio</span>
                  </div>
                  <h3 className="text-3xl font-bold leading-tight text-white">Impacto en <span style={{ color: sys.color }}>{sys.label}</span></h3>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5" style={{ color: sys.color }} />
                      <span className="text-2xl font-black italic tracking-tighter" style={{ color: sys.color }}>{sys.executive.kpi}</span>
                    </div>
                    <p className="text-lg text-white leading-snug font-medium">{sys.executive.p1}</p>
                  </div>
                  <div className="space-y-4 border-l-2 pl-6 py-2" style={{ borderColor: rgba(sys.color, 0.4) }}>
                    <p className="text-sm text-white/70 leading-relaxed italic">{sys.executive.p2}</p>
                    <p className="text-[11px] text-white/40 leading-relaxed">{sys.executive.extra}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="lg:col-span-4 flex flex-col h-137.5">
            <div className="space-y-8 grow">
              <div className="animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: "100ms" }}>
                <p className="text-lg text-white/80 leading-snug font-medium tracking-tight border-l-2 pl-6 py-1" style={{ borderColor: sys.color }}>
                  {sys.desc}
                </p>
              </div>
              
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: "250ms" }}>
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Propuesta de Valor</h4>
                <div className="flex flex-col gap-3">
                  {sys.impact.map((tag, i) => (
                    <div key={i} className="px-5 py-3 rounded-2xl bg-white/4 border border-white/10 flex items-center gap-4 transition-all hover:border-white/30 group">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0 group-hover:scale-150 transition-transform" style={{ background: sys.color, boxShadow: `0 0 10px ${sys.color}` }} />
                      <span className="text-[15px] font-bold text-white/90 group-hover:text-white transition-colors">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STACK TÉCNICO */}
            <div className="p-6 rounded-4xl bg-linear-to-br from-white/8 to-transparent border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: "450ms" }}>
              <div className="flex items-center gap-2 mb-4 opacity-40">
                <Cpu className="h-3 w-3" style={{ color: sys.color }} />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Stack Técnico</span>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {Object.entries(sys.categories).map(([cat, techs]) => (
                  <div key={cat} className="group">
                    <p className="text-xs font-black mb-2 uppercase tracking-widest group-hover:translate-x-1 transition-transform" style={{ color: sys.color }}>
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {techs.map((t, idx) => (
                        <span key={idx} className="text-[13px] font-bold text-white/80">{t}{idx < techs.length - 1 && <span className="ml-3 text-white/10">/</span>}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
