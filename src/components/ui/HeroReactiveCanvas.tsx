"use client";

import React, { useEffect, useRef } from "react";

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
  
  // Control de frames para ~30 FPS
  const lastFrameTime = useRef<number>(0);

  const pointer = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const target = useRef<Vec2>({ x: 0.5, y: 0.5 });
  const hovering = useRef(false);
  const blob = useRef<Vec2>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Resolución baja y fija (0.5x en móvil, 1x en desktop). Ligerísimo para la GPU.
    const isMobile = window.innerWidth < 768;
    const DPR = isMobile ? 0.5 : 1;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * DPR));
      canvas.height = Math.max(1, Math.floor(r.height * DPR));
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

      // Exponer variables CSS al contenedor padre
      parent.style.setProperty("--mx", `${nx * 100}%`);
      parent.style.setProperty("--my", `${ny * 100}%`);
    };

    const onEnter = () => { hovering.current = true; };
    const onLeave = () => {
      hovering.current = false;
      target.current = { x: 0.5, y: 0.5 };
      parent.style.setProperty("--mx", "50%");
      parent.style.setProperty("--my", "50%");
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerenter", onEnter, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });

    // Contexto desincronizado (más rápido) sin alfa innecesario si no se requiere, pero dejamos alpha: true
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    // PRE-RENDER OFFSCREEN: Dibujamos el gradiente SOLO UNA VEZ en textura pequeña de 256x256
    const offscreen = document.createElement("canvas");
    offscreen.width = 256;
    offscreen.height = 256;
    const octx = offscreen.getContext("2d");
    if (octx) {
      const center = 128;
      const radius = 128;
      
      const g1 = octx.createRadialGradient(center, center, radius * 0.05, center, center, radius);
      g1.addColorStop(0, `rgba(139,92,246,${0.25 * intensity})`);
      g1.addColorStop(0.5, `rgba(139,92,246,${0.10 * intensity})`);
      g1.addColorStop(1, "rgba(139,92,246,0)");
      
      octx.fillStyle = g1;
      octx.beginPath();
      octx.arc(center, center, radius, 0, Math.PI * 2);
      octx.fill();
    }

    const render = (t: number) => {
      rafRef.current = requestAnimationFrame(render);
      
      // Throttle a 30 FPS (~33ms)
      if (t - lastFrameTime.current < 33) return;
      
      const dt = Math.min(0.05, (t - lastFrameTime.current) / 1000);
      lastFrameTime.current = t;

      // Suavizado simplificado
      const smooth = 1 - Math.exp(-4.5 * dt);
      pointer.current.x = lerp(pointer.current.x, target.current.x, smooth);
      pointer.current.y = lerp(pointer.current.y, target.current.y, smooth);

      const blobSmooth = 1 - Math.exp(-2.4 * dt);
      blob.current.x = lerp(blob.current.x, pointer.current.x, blobSmooth);
      blob.current.y = lerp(blob.current.y, pointer.current.y, blobSmooth);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = blob.current.x * w;
      const cy = blob.current.y * h;

      // Animación de pulso básica, sin operaciones vectoriales pesadas
      const pulse = 0.65 + 0.35 * Math.sin((t / 1000) * 1.8);
      const baseR = Math.min(w, h) * (0.35 + 0.05 * pulse);

      ctx.save();
      ctx.translate(cx, cy);
      // Solo dibujamos la textura pre-renderizada
      ctx.drawImage(offscreen, -baseR, -baseR, baseR * 2, baseR * 2);
      ctx.restore();
    };

    // Arranque inmediato
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={
        "pointer-events-none absolute inset-0 h-full w-full opacity-100 " +
        (className ?? "")
      }
      style={{ contain: "strict" }}
      aria-hidden="true"
    />
  );
}
