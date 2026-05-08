"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { KeywordParticles } from "@/components/ui/KeywordParticles";

const STRATEGIC_DATA = [
  {
    title: "Si se repite, se automatiza",
    description:
      "No tiene sentido hacer diez veces lo mismo. Si una tarea se repite, prefiero dejarla resuelta para siempre.",
    color: "#9E8CFF",
    glow: "rgba(158, 140, 255, 0.34)",
  },
  {
    title: "Lo simple suele durar mas",
    description:
      "Prefiero un sistema claro que aguante anos antes que algo enorme que nadie quiera tocar dentro de tres meses.",
    color: "#67C9D8",
    glow: "rgba(103, 201, 216, 0.30)",
  },
  {
    title: "El codigo no es el objetivo",
    description:
      "Lo importante no es la tecnologia. Lo importante es que funcione bien y quite trabajo en vez de anadirlo.",
    color: "#4A7FA3",
    glow: "rgba(74, 127, 163, 0.30)",
  },
];

const TECH_RAIN_WORDS = [
  "Workflows",
  "APIs",
  "Pagos",
  "PostgreSQL",
  "Supabase",
  "Webhooks",
  "SaaS",
  "Operaciones",
  "Integraciones",
  "Automatizacion",
];

export function StrategicProfile() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((duration = 6200) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % STRATEGIC_DATA.length);
    }, duration);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleManualClick = (newIndex: number) => {
    if (newIndex === index) return;
    setIndex(newIndex);
    startTimer(12000);
  };

  const getLayout = (cardIdx: number) => {
    const total = STRATEGIC_DATA.length;
    const diff = (cardIdx - index + total) % total;

    if (diff === 0) return { x: 0, y: -4, scale: 1, z: 30, opacity: 1, blur: 0 };
    if (diff === 1) return { x: "68%", y: 14, scale: 0.84, z: 10, opacity: 0.66, blur: 2.2 };
    return { x: "-68%", y: 14, scale: 0.84, z: 10, opacity: 0.66, blur: 2.2 };
  };

  return (
    <section id="perfil" className="w-full">
      <FadeIn className="relative min-h-120 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b13] p-4 sm:p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(158,140,255,0.12),transparent_40%),radial-gradient(circle_at_84%_78%,rgba(103,201,216,0.1),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(74,127,163,0.1),transparent_45%)]" />
          <div className="absolute inset-0 opacity-[0.06] [background-size:64px_64px] [background-image:linear-gradient(rgba(148,163,184,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.4)_1px,transparent_1px)]" />
        </div>

        <div className="relative z-30 mb-8 text-center sm:mb-10">
          <h2 className="mx-auto max-w-3xl text-3xl font-medium tracking-[-0.02em] text-slate-100 sm:text-4xl">
            La forma en la que suelo trabajar
          </h2>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 opacity-20">
          <KeywordParticles words={TECH_RAIN_WORDS} />
        </div>

        <div className="relative z-20 flex min-h-88 flex-1 items-center justify-center">
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 1200 560"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lineA" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(158,140,255,0.05)" />
                <stop offset="50%" stopColor="rgba(158,140,255,0.42)" />
                <stop offset="100%" stopColor="rgba(158,140,255,0.05)" />
              </linearGradient>
              <linearGradient id="lineB" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(103,201,216,0.05)" />
                <stop offset="50%" stopColor="rgba(103,201,216,0.38)" />
                <stop offset="100%" stopColor="rgba(103,201,216,0.05)" />
              </linearGradient>
            </defs>
            <path
              className="strategic-connector strategic-connector-a"
              d="M160,410 C370,350 470,180 600,180 C735,180 840,350 1040,410"
              fill="none"
              stroke="url(#lineA)"
              strokeWidth="1.2"
            />
            <path
              className="strategic-connector strategic-connector-b"
              d="M160,410 C360,450 500,480 600,480 C705,480 845,450 1040,410"
              fill="none"
              stroke="url(#lineB)"
              strokeWidth="1.2"
            />
          </svg>

          {STRATEGIC_DATA.map((item, i) => {
            const { x, y, scale, z, opacity, blur } = getLayout(i);
            const isCenter = z === 30;

            return (
              <motion.div
                key={item.title}
                animate={{ x, y, scale, zIndex: z, opacity, filter: `blur(${blur}px)` }}
                whileHover={{ scale: isCenter ? 1.02 : 0.87, rotateZ: isCenter ? 0 : i === 1 ? 0.8 : -0.8 }}
                transition={{ duration: 1.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-full max-w-72 cursor-pointer select-none sm:max-w-110"
                onClick={() => handleManualClick(i)}
              >
                <motion.div
                  animate={{
                    boxShadow: isCenter
                      ? [
                          `0 20px 50px -30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.09), 0 0 28px ${item.glow}`,
                          `0 20px 50px -30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.14), 0 0 42px ${item.glow}`,
                          `0 20px 50px -30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.09), 0 0 28px ${item.glow}`,
                        ]
                      : "0 10px 30px -24px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
                    y: isCenter ? [0, -3, 0] : [0, 2, 0],
                    backdropFilter: isCenter ? "blur(9px)" : "blur(5px)",
                  }}
                  transition={{
                    boxShadow: { duration: 4.6, repeat: Infinity, ease: "easeInOut" },
                    y: { duration: isCenter ? 4.8 : 5.6, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className={`rounded-3xl border p-6 transition-all duration-700 sm:p-10 ${
                    isCenter
                      ? "border-white/20 bg-[linear-gradient(155deg,rgba(14,18,30,0.92),rgba(8,12,20,0.86))]"
                      : "border-white/8 bg-[linear-gradient(155deg,rgba(14,18,30,0.62),rgba(8,12,20,0.56))]"
                  }`}
                >
                  <motion.h3
                    animate={{ letterSpacing: isCenter ? "-0.01em" : "0.01em", color: isCenter ? item.color : "rgba(203, 213, 225, 0.72)" }}
                    className="mb-4 text-center text-2xl font-semibold leading-tight transition-colors duration-700 sm:text-3xl"
                  >
                    {item.title}
                  </motion.h3>

                  <p
                    className={`text-center text-sm leading-relaxed transition-all duration-700 sm:text-base ${
                      isCenter ? "text-slate-200/90 opacity-100" : "text-slate-300/45 opacity-70"
                    }`}
                  >
                    {item.description}
                  </p>

                  <div className="pointer-events-none mt-6 flex justify-center">
                    <span className={`h-[2px] rounded-full transition-all duration-700 ${isCenter ? "w-18 bg-white/60" : "w-10 bg-white/20"}`} />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </FadeIn>

      <style jsx>{`
        :global(.cursor-pointer),
        :global(.cursor-pointer *) {
          cursor: pointer !important;
        }

        .strategic-connector {
          stroke-dasharray: 7 13;
          filter: drop-shadow(0 0 9px rgba(148, 163, 184, 0.16));
        }

        .strategic-connector-a {
          animation: strategicFlowA 8s linear infinite;
        }

        .strategic-connector-b {
          animation: strategicFlowB 10s linear infinite;
        }

        @keyframes strategicFlowA {
          0% {
            stroke-dashoffset: 220;
            opacity: 0.38;
          }
          50% {
            opacity: 0.74;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.38;
          }
        }

        @keyframes strategicFlowB {
          0% {
            stroke-dashoffset: -200;
            opacity: 0.35;
          }
          50% {
            opacity: 0.68;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.35;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .strategic-connector-a,
          .strategic-connector-b {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
