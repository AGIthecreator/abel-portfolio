"use client";

import React, { useEffect, useMemo, useRef } from "react";

type ConnectionParticlesCanvasProps = {
  className?: string;
  /** 0..1 intensity multiplier */
  intensity?: number;
  /** color for links/glow */
  color?: string;
};

type Vec2 = { x: number; y: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

export function ConnectionParticlesCanvas({
  className,
  intensity = 0.55,
  color = "#8B5CF6",
}: ConnectionParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef<number>(0);

  const pointer = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const target = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const hovering = useRef(false);

  const DPR = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

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

    const onMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      target.current = { x: nx, y: ny };
    };
    const onEnter = () => {
      hovering.current = true;
    };
    const onLeave = () => {
      hovering.current = false;
      target.current = { x: 0.5, y: 0.5 };
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerenter", onEnter, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });

    // Deterministic initial particles (stable)
    const N = 42;
    const pts = Array.from({ length: N }).map((_, i) => {
      const a = (i / N) * Math.PI * 2;
      const rr = 0.15 + (i % 7) * 0.06;
      return {
        x: 0.5 + Math.cos(a) * rr,
        y: 0.5 + Math.sin(a) * rr,
        vx: (Math.sin(i * 11) * 0.004 + 0.002) * (i % 2 ? 1 : -1),
        vy: (Math.cos(i * 7) * 0.004 + 0.002) * (i % 3 ? 1 : -1),
      };
    });

    const render = (t: number) => {
      const dt = Math.min(0.05, (t - lastT.current) / 1000);
      lastT.current = t;

      // Smooth pointer
      const lag = hovering.current ? 10 : 4;
      const smooth = 1 - Math.exp(-lag * dt);
      pointer.current = {
        x: lerp(pointer.current.x, target.current.x, smooth),
        y: lerp(pointer.current.y, target.current.y, smooth),
      };

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // evolve points (subtle drift)
      for (const p of pts) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // soft wrap
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
      }

      const px = pointer.current.x * w;
      const py = pointer.current.y * h;

      // link distance increases near pointer
      const baseLink = 90 * DPR;
      const boost = hovering.current ? 60 * DPR : 0;
      const linkDist = baseLink + boost * intensity;

      // draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const ax = a.x * w;
        const ay = a.y * h;

        // proximity to pointer adds energy
        const dp = Math.hypot(ax - px, ay - py);
        const pEnergy = clamp(1 - dp / (220 * DPR), 0, 1);

        for (let j = i + 1; j < pts.length; j++) {
          const b2 = pts[j];
          const bx = b2.x * w;
          const by = b2.y * h;
          const d = Math.hypot(ax - bx, ay - by);
          if (d > linkDist) continue;

          const alpha = (1 - d / linkDist) * (0.10 + 0.22 * pEnergy) * intensity;
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // draw points
      for (const p of pts) {
        const x = p.x * w;
        const y = p.y * h;
        const dp = Math.hypot(x - px, y - py);
        const a = (0.08 + 0.22 * clamp(1 - dp / (220 * DPR), 0, 1)) * intensity;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 * DPR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [DPR, color, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "pointer-events-none absolute inset-0 h-full w-full opacity-100 filter-[blur(0.15px)] " +
        (className ?? "")
      }
      aria-hidden="true"
    />
  );
}
