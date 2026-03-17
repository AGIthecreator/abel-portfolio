"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export type CarouselImage = {
  src: string;
  alt: string;
  caption?: string;
  /** Dimensiones fijas para evitar CLS */
  width: number;
  height: number;
};

type CarouselProps = {
  images: CarouselImage[];
  initialIndex?: number;
  className?: string;
};

export function Carousel({ images, initialIndex = 0, className }: CarouselProps) {
  const safeInitialIndex = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(Math.max(initialIndex, 0), images.length - 1);
  }, [images.length, initialIndex]);

  const [index, setIndex] = useState(safeInitialIndex);

  // Si cambian imágenes o el índice inicial, re-sincronizamos.
  useEffect(() => setIndex(safeInitialIndex), [safeInitialIndex]);

  const prev = useCallback(() => {
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(Math.max(0, images.length - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, next, prev]);

  const current = images[index];

  if (!current) {
    return (
      <div
        className={
          className ??
          "rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70"
        }
      >
        No hay imágenes para mostrar.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25">
        <button
          type="button"
          onClick={() => window.open(current.src, "_blank")}
          className="block w-full"
          title="Haga clic para ampliar en una nueva pestaña"
          aria-label="Abrir imagen en una nueva pestaña"
        >
          <Image
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            loading="lazy"
            className="h-auto w-full cursor-zoom-in select-none object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 960px"
            priority={false}
          />
        </button>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.50),transparent_55%)]" />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-white/70">
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 p-2 text-white/80 transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/35 p-2 text-white/80 transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {current.caption ? (
        <p className="mt-3 text-sm leading-6 text-white/70">{current.caption}</p>
      ) : null}

      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            className={
              "relative overflow-hidden rounded-xl border bg-black/20 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/30 " +
              (i === index
                ? "border-[rgba(34,211,238,0.45)]"
                : "border-white/10 hover:border-white/20")
            }
            aria-label={`Ir a imagen ${i + 1}`}
            aria-current={i === index}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              className="h-auto w-full object-cover opacity-85"
              sizes="160px"
              priority={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
