import { FadeIn } from "@/components/motion/FadeIn";
import { Download, Github, Linkedin, Mail } from "lucide-react";

const email = "abelagiempleo@gmail.com";
const tickerText =
  "SISTEMA LISTO PARA ESCALAR PROYECTOS ◆ DISPONIBILIDAD PARA NUEVAS AUTOMATIZACIONES ◆ OPTIMIZANDO PROCESOS CON IA ◆ CONTACTA AHORA ◆";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contacto" className="pt-14 pb-12 sm:pt-20">
      <FadeIn className="glass-card neon-border rounded-3xl px-6 py-6 sm:px-10">
        <div className="flex flex-col gap-6 sm:gap-5">
          {/* línea superior muy fina con degradado sutil, interrumpida por el copyright */}
          <div className="relative flex items-center">
            <div
              aria-hidden="true"
              className="h-px w-full bg-linear-to-r from-[rgba(139,92,246,0.0)] via-[rgba(139,92,246,0.55)] to-[rgba(34,211,238,0.55)] opacity-80"
            />

            <div className="footer-bubble px-3 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:px-3">
              <div className="footer-bubble__inner rounded-full border border-white/10 bg-[rgba(2,6,23,0.72)] px-3 py-1.5 text-[13.5px] text-white/70 backdrop-blur">
                <span className="font-mono text-white/80">©</span>{" "}
                <span className="footer-bubble__year font-mono text-white/80">{year}</span>{" "}
                Abel — Arquitecto Digital y Especialista en Automatización
              </div>
            </div>
          </div>

          <div className="footer-row flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* micro-indicadores de sistema */}
            <div className="order-2 flex flex-wrap items-center justify-center gap-2 text-[12px] tracking-wide text-white/80 sm:order-0 sm:flex-1 sm:flex-nowrap">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)] animate-status-led" />
                <span className="font-mono text-white/80">ESTADO:</span>
                <span className="text-white/80">ESTABLE</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <span className="font-mono text-white/80">LATENCIA:</span>
                <span className="text-white/80">22ms</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                <span className="font-mono text-white/80">UPTIME:</span>
                <span className="text-white/80">99.9%</span>
              </div>
            </div>

            {/* rótulo de datos (marquesina técnica) - ocupa el hueco central */}
            <div className="footer-ticker order-3 min-w-0 flex-1 sm:order-0">
              <div className="ticker-mask group relative w-full overflow-hidden">
                <div className="flex w-max items-center whitespace-nowrap py-1.5 font-mono text-[11px] sm:text-[12px] tracking-[0.16em] text-cyan-200/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.12)] animate-ticker group-hover:animate-ticker-slow">
                  {/*
                    Seamless loop:
                    - Renderizamos el texto 2 veces dentro del mismo track animado
                    - Cada copia tiene padding derecho generoso para que no se amontonen
                  */}
                  <span className="ticker-item pr-16">{tickerText}</span>
                  <span aria-hidden="true" className="ticker-item pr-16">
                    {tickerText}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 flex flex-col gap-4 sm:order-0 sm:flex-row sm:items-center">
              <div className="flex items-center justify-center gap-3 sm:justify-end">
              <a
                aria-label="GitHub"
                className="footer-social inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45 transition-all hover:scale-[1.06] hover:border-white/20 hover:bg-white/10 hover:text-white/90 hover:shadow-[0_0_22px_rgba(255,255,255,0.06)]"
                href="https://github.com/AGIthecreator"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                aria-label="LinkedIn"
                className="footer-social inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45 transition-all hover:scale-[1.06] hover:border-white/20 hover:bg-white/10 hover:text-white/90 hover:shadow-[0_0_22px_rgba(255,255,255,0.06)]"
                href="https://www.linkedin.com/in/abel-gonzalez-iglesias"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                aria-label="Email"
                className="footer-social inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45 transition-all hover:scale-[1.06] hover:border-white/20 hover:bg-white/10 hover:text-white/90 hover:shadow-[0_0_22px_rgba(255,255,255,0.06)]"
                href={`mailto:${email}`}
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            <a
              className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(139,92,246,0.42)] bg-transparent px-5 py-2.5 text-sm font-medium text-white/80 shadow-[0_0_0_1px_rgba(139,92,246,0.16),0_0_26px_rgba(139,92,246,0.10)] transition-all hover:border-[rgba(34,211,238,0.45)] hover:bg-[rgba(34,211,238,0.08)] hover:text-white hover:shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_30px_rgba(34,211,238,0.12)]"
              href="/CV_Abel_Gonzalez_Frontend_Developer.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <Download className="h-4 w-4" /> Descargar CV
            </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
