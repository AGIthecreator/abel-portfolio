"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { NeonPulse } from "@/components/motion/NeonPulse";
import { Typewriter } from "@/components/motion/Typewriter";
import { ArchitectureLogs } from "@/components/ui/ArchitectureLogs";
import { HeroReactiveCanvas } from "@/components/ui/HeroReactiveCanvas";

const ROLE_STRINGS = [
  "Full Stack Developer",
  "Automation Expert",
  "Security Focused",
] as const;

export function Hero() {
  return (
    <section className="relative pt-6 sm:pt-10">
      <FadeIn className="group/hero glass-card neon-border relative rounded-3xl px-6 py-9 sm:px-10 sm:py-12">
        {/* Reactive canvas background */}
        <HeroReactiveCanvas intensity={0.9} />

        {/* pointer-driven border glow */}
        <div
          aria-hidden="true"
          className="hero-border pointer-events-none absolute inset-0 rounded-3xl"
        />

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p className="text-xs tracking-[0.25em] text-white/60">
              CONSTRUYENDO EL FUTURO DIGITAL
            </p>

            <h1 className="relative inline-flex flex-nowrap items-baseline gap-x-3 text-[2.05rem] font-bold tracking-tighter sm:text-6xl lg:text-7xl">
              {/* minimal cyberpunk underline */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-3 left-0 h-px w-[min(560px,92%)] bg-linear-to-r from-accent via-white/30 to-transparent"
              />

              <span
                className="hero-name text-white whitespace-nowrap"
              >
                Abel
              </span>
              <span className="text-white/60 whitespace-nowrap">-</span>
              <span className="hero-name whitespace-nowrap">
                <Typewriter
                  text={ROLE_STRINGS[0]}
                  phrases={[...ROLE_STRINGS]}
                  pauseAfterTypedMs={1350}
                  pauseAfterDeletedMs={250}
                  typeSpeedMs={32}
                  deleteSpeedMs={20}
                />
              </span>
            </h1>

            <p className="max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
              Estratega técnico enfocado en crear soluciones escalables y seguras que fusionan código de vanguardia con visión de negocio.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <NeonPulse>
              <a
                href="#contacto"
                className="neon-glow group relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full bg-linear-to-r from-[rgba(139,92,246,0.18)] via-[rgba(139,92,246,0.08)] to-[rgba(139,92,246,0.18)] px-6 py-3 text-sm font-medium text-white ring-1 ring-accent-glow transition-all duration-300 ease-out animate-cta-glow hover:scale-105 hover:from-[rgba(139,92,246,0.22)] hover:via-[rgba(139,92,246,0.10)] hover:to-[rgba(139,92,246,0.22)] hover:ring-[rgba(34,211,238,0.60)] hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_34px_rgba(34,211,238,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(34,211,238,0.70)]"
              >
                {/* pulso violeta sutil y constante */}
                <span className="absolute inset-0 cyber-violet-pulse" aria-hidden="true" />
                <span className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 neon-glow" />
                <span className="relative">Contacto</span>
              </a>
            </NeonPulse>

            <p className="text-sm font-medium text-white/75">
              Ingeniería técnica rigurosa | Visionario de producto digital
            </p>

            {/* Architecture Logs: empujado al extremo derecho en desktop; wrap/centrado en mobile */}
            <div className="sm:ml-auto flex justify-center sm:justify-end">
              <ArchitectureLogs />
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-border {
            opacity: 0;
            transition: opacity 220ms ease;
            background: radial-gradient(
              420px circle at var(--mx, 50%) var(--my, 50%),
              rgba(139, 92, 246, 0.22),
              transparent 55%
            );
            box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.24);
          }

          :global(.group\/hero:hover) .hero-border {
            opacity: 1;
          }

          .hero-name {
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.85),
              rgba(255, 255, 255, 1) 45%,
              rgba(139, 92, 246, 0.85)
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
        `}</style>
      </FadeIn>
    </section>
  );
}
