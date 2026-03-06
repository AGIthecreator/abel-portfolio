"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type KeywordParticlesProps = {
  /** Optional: override list. If omitted, uses the strict technical list. */
  words?: string[];
  className?: string;
};

type Particle = {
  id: string;
  text: string;
  side: "top" | "bottom";
  leftPct: number;
  duration: number;
  delay: number;
  color: string;
  sizePx: number;
};

const DEFAULT_WORDS = [
  "Make",
  "PostgreSQL",
  "CRM",
  "Data Integrity",
  "Scalability",
  "Supabase",
  "Airtable",
  "Automation",
  "Architecture",
  "API Rest",
  "Security",
  "Workflows",
  "Full Stack",
] as const;

const PALETTE = [
  "#8B5CF6", // violet
  "#D8B4FE", // lilac
  "#A78BFA", // lavender
  "#C084FC", // electric purple
  "#F5F3FF", // near-white lilac glow
] as const;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function KeywordParticles({ words, className }: KeywordParticlesProps) {
  const list = useMemo(() => (words?.length ? words : [...DEFAULT_WORDS]), [words]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const MAX = 20;
    const total = clamp(list.length, 12, MAX);

    // Strict 50/50 split.
    const topCount = Math.floor(total / 2);
    const bottomCount = total - topCount;

    const next: Particle[] = [];

    function stratifiedX(i: number, count: number) {
      // covers 0..100 without leaving large holes: each particle gets its own bucket
      const bucket = 100 / Math.max(count, 1);
      const base = i * bucket;
      return base + Math.random() * bucket;
    }

    // TOP group
    for (let i = 0; i < topCount; i++) {
      const side: Particle["side"] = "top";
      const w = list[i % list.length];
      const leftPct = stratifiedX(i, topCount);

      // Critical: break lock-step timing
      const duration = 5.2 + Math.random() * (9.8 - 5.2);
      const delay = Math.random() * 4;

      const sizePx = 10 + Math.random() * 3;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      next.push({
        id: `${side}-${i}-${w}-${Math.random().toString(16).slice(2)}`,
        text: w,
        side,
        leftPct,
        duration,
        delay,
        color,
        sizePx,
      });
    }

    // BOTTOM group
    for (let i = 0; i < bottomCount; i++) {
      const side: Particle["side"] = "bottom";
      const w = list[(topCount + i) % list.length];
      const leftPct = stratifiedX(i, bottomCount);

      const duration = 5.2 + Math.random() * (9.8 - 5.2);
      const delay = Math.random() * 4;

      const sizePx = 10 + Math.random() * 3;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      next.push({
        id: `${side}-${i}-${w}-${Math.random().toString(16).slice(2)}`,
        text: w,
        side,
        leftPct,
        duration,
        delay,
        color,
        sizePx,
      });
    }

    setParticles(next);
  }, [list]);

  // Central attraction: toward the center. We rely on a mask to fade-out ~50px
  // before reaching the central reading corridor.
  const yToCenter = 160;

  if (particles.length === 0) return null;

  return (
    <div
      className={
        "pointer-events-none absolute inset-0 left-0 z-10 w-full overflow-hidden bg-transparent " +
        (className ?? "")
      }
      aria-hidden="true"
      style={{
        padding: 20,
        // Keep a clean corridor around the center.
        // The transparent band is approximately centered and sized to behave like
        // a 50px safety margin before the text block.
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 46%, rgba(0,0,0,0) 54%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)",
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 46%, rgba(0,0,0,0) 54%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)",
      }}
    >
      {particles.map((p) => {
        const style: React.CSSProperties = {
          left: `${p.leftPct}%`,
          color: p.color,
          fontSize: `${p.sizePx}px`,
          opacity: 0.16,
          textShadow: "0 0 16px rgba(139,92,246,0.12)",
        };

        if (p.side === "top") style.top = 0;
        else style.bottom = 0;

        const y = p.side === "top" ? yToCenter : -yToCenter;

        return (
          <motion.div
            key={p.id}
            className="absolute font-medium tracking-wide"
            style={style}
            animate={{
              y: [0, y],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {p.text}
          </motion.div>
        );
      })}
    </div>
  );
}
