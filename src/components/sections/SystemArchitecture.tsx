"use client";

import React, { useState, useEffect } from "react";
import { 
  SiReact, SiNodedotjs, SiSupabase, SiPostgresql, SiVercel, 
  SiCloudflare, SiMake, SiAirtable, SiOpenai, SiTypescript, SiStripe
} from "react-icons/si";
import { Terminal, Globe, ShieldCheck, Zap, Laptop, Database } from "lucide-react";

const SYSTEMS = {
  saas: {
    title: "SaaS Platform",
    subtitle: "Escalable y listo para producción",
    color: "#22D3EE",
    desc: "Infraestructura robusta con gestión de suscripciones y pagos.",
    impact: ["Arquitectura Serverless", "Pagos (Stripe)", "Seguridad Edge"],
    techStack: ["Next.js", "Stripe API", "Cloudflare", "PostgreSQL"],
    nodes: [
      { id: "v", label: "Vercel", icon: SiVercel, x: 50, y: 10 },
      { id: "f", label: "Next.js", icon: SiReact, x: 50, y: 35 },
      { id: "a", label: "Node API", icon: SiNodedotjs, x: 25, y: 60 },
      { id: "s", label: "Stripe", icon: SiStripe, x: 75, y: 60 },
      { id: "db", label: "PostgreSQL", icon: SiPostgresql, x: 50, y: 85 },
    ],
    links: [["v", "f"], ["f", "a"], ["f", "s"], ["a", "db"]]
  },
  automation: {
    title: "Business Automation",
    subtitle: "Procesos sin intervención manual",
    color: "#8B5CF6",
    desc: "Orquestación de eventos y sincronización de datos automática.",
    impact: ["Sin errores manuales", "Ahorro de tiempo", "Escalable"],
    techStack: ["Make", "Airtable", "Webhooks", "OpenAI"],
    nodes: [
      { id: "w", label: "Webhook", icon: Globe, x: 50, y: 10 },
      { id: "m", label: "Make", icon: SiMake, x: 50, y: 45 },
      { id: "db", label: "Airtable", icon: SiAirtable, x: 50, y: 85 },
    ],
    links: [["w", "m"], ["m", "db"]]
  }
};

export default function SystemArchitecture() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<keyof typeof SYSTEMS>("saas");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const sys = SYSTEMS[active];
  const rgba = (h: string, a: number) => {
    const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  if (!mounted) return <div className="h-150 bg-black/20 animate-pulse rounded-3xl" />;

  return (
    <section className="py-20 bg-transparent text-white">
      <div className="mb-16 border-l-2 border-white/10 pl-6">
        <h2 className="text-3xl font-bold mb-2">System Architecture</h2>
        <div className="flex items-center gap-2 text-white/30 font-mono text-sm">
          <Terminal className="h-4 w-4" />
          <p>{sys.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-2">
          {Object.entries(SYSTEMS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActive(key as keyof typeof SYSTEMS)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                active === key ? "bg-white/5 border-white/20" : "border-white/5 hover:border-white/10"
              }`}
              style={{ borderColor: active === key ? rgba(item.color, 0.4) : undefined }}
            >
              <span className={`text-sm font-semibold ${active === key ? "text-white" : "text-white/30"}`}>{item.title}</span>
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: item.color, opacity: active === key ? 1 : 0.2 }} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-5 h-125 relative rounded-3xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {sys.links.map(([fromId, toId], i) => {
              const from = sys.nodes.find(n => n.id === fromId);
              const to = sys.nodes.find(n => n.id === toId);
              if (!from || !to) return null;
              return <line key={i} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke={sys.color} strokeWidth="1" />;
            })}
          </svg>

          {sys.nodes.map((node) => (
            <div 
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div 
                className="p-3.5 rounded-2xl border bg-black/80 transition-all"
                style={{ borderColor: hoveredNode === node.id ? sys.color : "rgba(255,255,255,0.1)" }}
              >
                <node.icon className="h-5 w-5" style={{ color: hoveredNode === node.id ? sys.color : "gray" }} />
              </div>
              <span className="text-[9px] font-mono text-white/30 uppercase px-2 py-0.5 rounded bg-black/50 border border-white/5">{node.label}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 flex flex-col justify-center space-y-8">
          <h3 className="text-3xl font-bold" style={{ color: sys.color }}>{sys.title}</h3>
          <div className="space-y-3">
            {sys.impact.map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                <Zap className="h-3 w-3" style={{ color: sys.color }} />
                {text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
            {sys.techStack.map(tech => (
              <span key={tech} className="px-3 py-1 text-[10px] rounded-md bg-white/5 text-white/40 border border-white/5">{tech}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
