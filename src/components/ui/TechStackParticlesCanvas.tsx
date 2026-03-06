"use client";

import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  className?: string;
  /** 0..1 intensity multiplier */
  intensity?: number;
  /** Hex color for links/dots */
  color?: string;
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Lightweight particle canvas for Tech Stack panels.
 * ~18 particles, no pointer tracking, minimal GPU cost.
 * Inspired by ConnectionParticlesCanvas but stripped down.
 */
export function TechStackParticlesCanvas({
  className,
  intensity = 0.45,
  color = "#8B5CF6",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef(0);

  const DPR = useMemo(
    () => (typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { r, g, b } = hexToRgb(color);

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * DPR));
      canvas.height = Math.max(1, Math.floor(rect.height * DPR));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // Deterministic lightweight set — 18 particles
    const N = 18;
    const pts = Array.from({ length: N }).map((_, i) => {
      const angle = (i / N) * Math.PI * 2;
      const radius = 0.12 + (i % 5) * 0.08;
      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        vx: (Math.sin(i * 13) * 0.003 + 0.001) * (i % 2 ? 1 : -1),
        vy: (Math.cos(i * 9) * 0.003 + 0.001) * (i % 3 ? 1 : -1),
      };
    });

    const render = (t: number) => {
      const dt = Math.min(0.05, (t - lastT.current) / 1000);
      lastT.current = t;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Drift particles
      for (const p of pts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
      }

      const linkDist = 78 * DPR;

      // Connections (thin, subtle)
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const ax = a.x * w;
        const ay = a.y * h;
        for (let j = i + 1; j < pts.length; j++) {
          const bp = pts[j];
          const bx = bp.x * w;
          const by = bp.y * h;
          const d = Math.hypot(ax - bx, ay - by);
          if (d > linkDist) continue;
          const alpha = (1 - d / linkDist) * 0.09 * intensity;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // Dots
      for (const p of pts) {
        ctx.fillStyle = `rgba(${r},${g},${b},${0.07 * intensity})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 1 * DPR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [DPR, color, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "pointer-events-none absolute inset-0 h-full w-full " + (className ?? "")
      }
      aria-hidden="true"
    />
  );
}
