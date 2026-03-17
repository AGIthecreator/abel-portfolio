"use client";

import React, { useEffect, useRef, useState } from "react";

type DeferredMountProps = {
  /** Lo que se renderiza en SSR y antes de entrar en viewport (skeleton/placeholder). */
  fallback?: React.ReactNode;
  /** Empieza a cargar/montar antes de estar visible. */
  rootMargin?: string;
  /** Si true, monta una sola vez. */
  once?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Monta el contenido (y por tanto dispara imports dinámicos) sólo cuando el bloque
 * está cerca del viewport.
 */
export function DeferredMount({
  children,
  fallback = null,
  rootMargin = "500px 0px",
  once = true,
  className,
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted && once) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;

        if (e.isIntersecting) {
          setMounted(true);
          if (once) io.disconnect();
        } else if (!once) {
          setMounted(false);
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [mounted, once, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : fallback}
    </div>
  );
}
