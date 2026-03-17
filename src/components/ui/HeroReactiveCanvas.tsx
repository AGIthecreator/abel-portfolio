"use client";

import React, { useEffect, useMemo, useRef } from "react";

type HeroReactiveCanvasProps = {
  /** 0..1 intensity multiplier for subtlety */
  intensity?: number;
  className?: string;
};

type Vec2 = { x: number; y: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function HeroReactiveCanvas({ intensity = 1, className }: HeroReactiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastT = useRef<number>(0);

  // Pointer tracking (normalized 0..1)
  const pointer = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const target = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const hovering = useRef(false);

  // Smoothed blob center (lag)
  const blob = useRef<Vec2>({ x: 0.5, y: 0.5 });

  const DPR = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      const dpr = DPR;
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      const nx = clamp((e.clientX - r.left) / r.width, 0, 1);
      const ny = clamp((e.clientY - r.top) / r.height, 0, 1);
      target.current = { x: nx, y: ny };

      // Expose pointer to CSS (for border glow + title side-light)
      parent.style.setProperty("--mx", `${nx * 100}%`);
      parent.style.setProperty("--my", `${ny * 100}%`);
      // name side-light: shift highlight left/right
      parent.style.setProperty("--lx", `${clamp(45 + (nx - 0.5) * 22, 20, 70)}%`);
    };

    const onEnter = () => {
      hovering.current = true;
    };
    const onLeave = () => {
      hovering.current = false;
      target.current = { x: 0.5, y: 0.5 };

      parent.style.setProperty("--mx", "50%");
      parent.style.setProperty("--my", "50%");
      parent.style.setProperty("--lx", "45%");
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerenter", onEnter, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (t: number) => {
      const dt = Math.min(0.05, (t - lastT.current) / 1000);
      lastT.current = t;

      // Smooth pointer with mild lag
      const lag = hovering.current ? 8.5 : 4.5;
      const smooth = 1 - Math.exp(-lag * dt);
      pointer.current = {
        x: lerp(pointer.current.x, target.current.x, smooth),
        y: lerp(pointer.current.y, target.current.y, smooth),
      };

      // Blob center follows pointer with extra lag
      const blobLag = hovering.current ? 4.2 : 2.4;
      const blobSmooth = 1 - Math.exp(-blobLag * dt);
      blob.current = {
        x: lerp(blob.current.x, pointer.current.x, blobSmooth),
        y: lerp(blob.current.y, pointer.current.y, blobSmooth),
      };

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Pulse + deformation
      const time = t / 1000;
      const pulse = 0.65 + 0.35 * Math.sin(time * 1.8);
      const hoverBoost = hovering.current ? 1 : 0;

      const cx = blob.current.x * w;
      const cy = blob.current.y * h;

      const baseR = Math.min(w, h) * (0.32 + 0.03 * pulse) * (0.95 + 0.07 * hoverBoost);
      const dx = (pointer.current.x - 0.5) * w;
      const dy = (pointer.current.y - 0.5) * h;
      const stretch = clamp(Math.hypot(dx, dy) / (Math.min(w, h) * 0.55), 0, 1);

      // Elliptical distortion depending on pointer direction
      const ex = baseR * (1 + 0.22 * stretch * intensity);
      const ey = baseR * (1 - 0.12 * stretch * intensity);
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(ex / baseR, ey / baseR);

      // Soft energy sphere: layered gradients (cheap)
      const g1 = ctx.createRadialGradient(0, 0, baseR * 0.05, 0, 0, baseR);
      g1.addColorStop(0, `rgba(139,92,246,${0.22 * intensity})`);
      g1.addColorStop(0.45, `rgba(139,92,246,${0.10 * intensity})`);
      g1.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(0, 0, baseR, 0, Math.PI * 2);
      ctx.fill();

      const g2 = ctx.createRadialGradient(0, 0, baseR * 0.05, 0, 0, baseR * 0.75);
      g2.addColorStop(0, `rgba(255,255,255,${0.06 * intensity})`);
      g2.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

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
  }, [DPR, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "pointer-events-none absolute inset-0 h-full w-full opacity-100 filter-[blur(0.2px)] " +
        (className ?? "")
      }
      aria-hidden="true"
    />
  );
}
