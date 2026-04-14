"use client";

import React, { useState, useEffect } from "react";
import { 
  SiReact, SiNodedotjs, SiSupabase, SiPostgresql, SiVercel, 
  SiCloudflare, SiMake, SiAirtable, SiOpenai, SiTypescript, 
  SiStripe, SiDocker
} from "react-icons/si";
import { Terminal, ShieldCheck, Zap, Laptop, Globe, Layers, ArrowRight, Eye, Target, TrendingUp, Cpu } from "lucide-react";

const SYSTEMS = {
  saas: {
    label: "Arquitectura",
    title: "Arquitectura SaaS Escalable",
    subtitle: "SaaS_Production_Core",
    color: "#22D3EE",
    desc: "Infraestructura preparada para producción real: alta concurrencia, pagos recurrentes y seguridad distribuida en edge.",
    impact: ["Escalabilidad automática", "Monetización Stripe", "Latencia optimizada"],
    categories: { "Frontend": ["Next.js", "TS"], "Backend": ["Node", "Postgres"], "Pagos": ["Stripe"] },
    executive: {
      kpi: "Disponibilidad 99.9%",
      p1: "Infraestructura distribuida que soporta picos de +5k usuarios simultáneos sin degradación.",
      p2: "Sistemas de cobro recurrente con gestión automática de impuestos y facturación global.",
      extra: "Implementación de una arquitectura 'Serverless First' para minimizar costes operativos y maximizar la resiliencia ante fallos geográficos."
    },
    nodes: [
      { id: "n1", label: "Vercel", icon: SiVercel, x: 50, y: 10, function: "Global Edge Hosting" },
      { id: "n2", label: "Next.js", icon: SiReact, x: 50, y: 35, function: "Framework Fullstack" },
      { id: "n3", label: "Node API", icon: SiNodedotjs, x: 25, y: 60, function: "Lógica de Negocio" },
      { id: "n4", label: "Stripe", icon: SiStripe, x: 75, y: 60, function: "Pasarela de Pagos" },
      { id: "n5", label: "Postgres", icon: SiPostgresql, x: 25, y: 85, function: "DB Relacional" },
      { id: "n6", label: "Auth", icon: SiSupabase, x: 75, y: 85, function: "Auth & Realtime" },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n3", "n6"]]
  },
  automation: {
    label: "Automatización",
    title: "Neural Workflow Engine",
    subtitle: "Automation_Logic_Unit",
    color: "#8B5CF6",
    desc: "Automatización de procesos críticos conectando APIs e IA sin intervención manual.",
    impact: ["Ahorro 95% tiempo", "Ejecución 24/7", "IA Integrada"],
    categories: { "Motor": ["Make", "n8n"], "IA": ["OpenAI", "Claude"], "Datos": ["Airtable"] },
    executive: {
      kpi: "+150h ahorradas/mes",
      p1: "Eliminación de errores humanos en la sincronización de datos entre +10 herramientas distintas.",
      p2: "Procesamiento de lenguaje natural para categorizar y actuar sobre leads en tiempo real.",
      extra: "Desarrollo de conectores personalizados que unifican el flujo de datos entre sistemas legados y herramientas modernas de IA."
    },
    nodes: [
      { id: "n1", label: "Webhooks", icon: Globe, x: 50, y: 10, function: "Event Trigger" },
      { id: "n2", label: "Make", icon: SiMake, x: 50, y: 35, function: "Workflow Core" },
      { id: "n3", label: "OpenAI", icon: SiOpenai, x: 20, y: 60, function: "AI Processing" },
      { id: "n4", label: "Ext. APIs", icon: Layers, x: 80, y: 60, function: "Integration" },
      { id: "n5", label: "Airtable", icon: SiAirtable, x: 50, y: 85, function: "Ops Database" },
      { id: "n6", label: "Logs", icon: Terminal, x: 80, y: 85, function: "Audit Trail" },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n4", "n6"]]
  },
  antifraud: {
    label: "Seguridad",
    title: "Protocolo Antifraude",
    subtitle: "Secure_Validation_v2",
    color: "#19C37D",
    desc: "Sistema en producción que elimina la reventa mediante validación criptográfica y DNI.",
    impact: ["0% Reventa Ilegal", "Validación DNI", "Trazabilidad"],
    categories: { "Identidad": ["Auth", "JWT"], "Seguridad": ["Docker", "QR"], "Base": ["Postgres"] },
    executive: {
      kpi: "Reventa erradicada",
      p1: "Asignación de identidad única por ticket vinculada a documento oficial (DNI/NIE).",
      p2: "Algoritmos de rotación de claves para evitar la duplicación de códigos QR en accesos.",
      extra: "Protocolo de 'Zero Trust' aplicado a cada transacción, garantizando que el origen y destino del ticket sean siempre verificables."
    },
    nodes: [
      { id: "n1", label: "Identidad", icon: ShieldCheck, x: 50, y: 10, function: "Validación DNI" },
      { id: "n2", label: "Control", icon: SiSupabase, x: 50, y: 40, function: "Lógica" },
      { id: "n3", label: "QR Gen", icon: SiTypescript, x: 20, y: 60, function: "Cripto" },
      { id: "n4", label: "Docker", icon: SiDocker, x: 80, y: 60, function: "Seguridad" },
      { id: "n5", label: "Audit", icon: SiPostgresql, x: 35, y: 85, function: "Inmutable" },
      { id: "n6", label: "WAF", icon: SiCloudflare, x: 65, y: 85, function: "Protección" },
    ],
    links: [["n1", "n2"], ["n2", "n3"], ["n2", "n4"], ["n3", "n5"], ["n4", "n6"]]
  },
  retail: {
    label: "Retail",
    title: "Optimización Retail",
    subtitle: "Operational_Logic_Edge",
    color: "#FFD700",
    desc: "Automatización masiva de dispositivos en puntos de venta físicos reduciendo tiempos operativos.",
    impact: ["-40 min/setup", "UI Simplificada", "Migración Segura"],
    categories: { "Sistemas": ["ADB", "Android"], "Interfaz": ["Electron"], "Scripts": ["Bash"] },
    executive: {
      kpi: "-85% tiempo técnico",
      p1: "Despliegue masivo de aplicaciones y configuraciones sobre dispositivos Android en red local.",
      p2: "Interfaz simplificada para operarios no técnicos, permitiendo migraciones de sistema en 1 clic.",
      extra: "Uso de herramientas CLI personalizadas que eliminan la necesidad de conexión a internet para la puesta en marcha de equipos críticos."
    },
    nodes: [
      { id: "n1", label: "Operador", icon: Laptop, x: 20, y: 20, function: "Interfaz" },
      { id: "n2", label: "Motor", icon: Terminal, x: 50, y: 35, function: "CLI" },
      { id: "n3", label: "Lógica", icon: SiTypescript, x: 80, y: 20, function: "Puente" },
      { id: "n4", label: "Automatización", icon: SiOpenai, x: 30, y: 70, function: "Scripts" },
      { id: "n5", label: "Dispositivos", icon: Zap, x: 70, y: 70, function: "Config" },
      { id: "n6", label: "Sincro", icon: Globe, x: 50, y: 90, function: "Red Local" },
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
    <section className="relative w-full text-white bg-transparent isolate overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none -z-10 transition-all duration-1000">
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               background: `radial-gradient(circle at 50% 50%, ${rgba(sys.color, 0.15)} 0%, transparent 70%)`,
               animation: "pulseBg 6s ease-in-out infinite"
             }} 
        />
      </div>

      <style jsx global>{`
        @keyframes pulseBg { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.1); } }
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-6 h-24">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Terminal className="h-3 w-3" />
              <span>{`> estado_sistema: ACTIVO // morph_v2`}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight transition-all duration-500">{sys.title}</h2>
          </div>
          
          <button 
            onClick={() => setRecruiterMode(!recruiterMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${recruiterMode ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
          >
            <Eye className="h-3 w-3" />
            {recruiterMode ? "Modo Técnico" : "Vista Reclutador"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* SELECTOR */}
          <div className="lg:col-span-3 space-y-2">
            {Object.entries(SYSTEMS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setActive(key as keyof typeof SYSTEMS)}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-500 group"
                style={{
                  borderColor: active === key ? rgba(item.color, 0.4) : "rgba(255,255,255,0.05)",
                  backgroundColor: active === key ? rgba(item.color, 0.1) : "rgba(255,255,255,0.01)",
                }}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${active === key ? "text-white" : "text-white/20"}`}>{item.label}</span>
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: item.color, boxShadow: active === key ? `0 0 10px ${item.color}` : "none", opacity: active === key ? 1 : 0.2 }} />
              </button>
            ))}
          </div>

          {/* DIAGRAMA */}
          <div className="lg:col-span-5 h-125 relative rounded-3xl border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {sys.links.map(([fromId, toId]: any, i: number) => {
                const from = sys.nodes.find((n: any) => n.id === fromId);
                const to = sys.nodes.find((n: any) => n.id === toId);
                if (!from || !to) return null;
                
                // CORRECCIÓN: Comprobamos si el enlace contiene el nodo hovered
                const isHighlight = hoveredNode === fromId || hoveredNode === toId;
                
                return (
                  <g key={`${active}-link-${i}`}>
                    <line 
                      x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke={sys.color} strokeWidth={isHighlight ? "2.5" : "1"}
                      strokeOpacity={isHighlight ? 1 : 0.2}
                      className="transition-all duration-500"
                    />
                    <circle r="2.5" fill={sys.color} opacity={isHighlight ? 1 : 0.6} style={{ filter: `drop-shadow(0 0 6px ${sys.color})` }}>
                      <animateMotion dur={`${2.5 + i*0.3}s`} repeatCount="indefinite" path={`M ${from.x * 5},${from.y * 5} L ${to.x * 5},${to.y * 5}`} />
                    </circle>
                  </g>
                );
              })}
            </svg>

            {sys.nodes.map((node) => {
              const isActive = hoveredNode === node.id;
              // CORRECCIÓN: Usamos .includes() para saber si el nodo es vecino del hovered
              const isRelated = hoveredNode && sys.links.some(l => l.includes(node.id) && l.includes(hoveredNode));

              return (
                <div key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ left: `${node.x}%`, top: `${node.y}%`, opacity: hoveredNode && !isActive && !isRelated ? 0.2 : 1 }}
                >
                  <div className="p-3.5 rounded-2xl border transition-all duration-500"
                       style={{ 
                         borderColor: isActive || isRelated ? sys.color : "rgba(255,255,255,0.1)", 
                         backgroundColor: isActive || isRelated ? rgba(sys.color, 0.2) : "rgba(10,10,10,0.5)", 
                         transform: isActive ? "scale(1.2)" : isRelated ? "scale(1.1)" : "scale(1)" 
                       }}>
                    <node.icon className="h-5 w-5" style={{ color: isActive || isRelated ? "white" : rgba(sys.color, 0.6) }} />
                  </div>
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">{node.label}</span>
                </div>
              );
            })}

            {/* VISTA RECLUTADOR */}
            {recruiterMode && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                <div className="max-w-md w-full space-y-6 text-left">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-[0.4em]">
                    <Target className="h-4 w-4" />
                    <span>Enfoque_Negocio</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight">
                    Optimización de <span style={{ color: sys.color }}>{sys.label}</span> con impacto medible.
                  </h3>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" style={{ color: sys.color }} />
                      <span className="text-lg font-black" style={{ color: sys.color }}>{sys.executive.kpi}</span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">{sys.executive.p1}</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-1 rounded bg-white/10 text-white/80"><ShieldCheck className="h-3 w-3" /></div>
                      <p className="text-xs text-white/60">{sys.executive.p2}</p>
                    </div>
                    <div className="flex gap-4 items-start pt-2 border-t border-white/5">
                      <div className="mt-1 p-1 rounded bg-white/10 text-white/80"><Cpu className="h-3 w-3" /></div>
                      <div>
                        <p className="text-[9px] font-bold text-white/40 uppercase mb-1">Estrategia de Implementación</p>
                        <p className="text-[11px] text-white/50 italic leading-relaxed">{sys.executive.extra}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:pl-6">
            <p className="text-sm text-white/50 leading-relaxed italic border-l border-white/10 pl-5">{sys.desc}</p>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Impacto Real</h4>
              {sys.impact.map((text, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 transition-all">
                  <ArrowRight className="h-3 w-3" style={{ color: sys.color }} />
                  <p className="text-[12px] text-white/70 font-medium">{text}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              {Object.entries(sys.categories).map(([cat, techs]) => (
                <div key={cat} className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase">{cat}</p>
                  <p className="text-[11px] text-white/70">{(techs as string[]).join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.4em]">
            no trabajo con herramientas aisladas · diseño sistemas que funcionan en producción
          </p>
        </div>
      </div>
    </section>
  );
}
