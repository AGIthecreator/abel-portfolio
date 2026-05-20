"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useCallback } from "react";

const NAV = [
  { href: "#entregables", label: "Qué construyo" },
  { href: "#perfil", label: "Cómo funciona" },
  { href: "#proceso", label: "Proceso" },
  { href: "#contacto", label: "Contacto" },
] as const;

const CTA_MAIL =
  "mailto:contacto@agithecreator.com?subject=" +
  encodeURIComponent("Ver qué necesita mi negocio");

const NAV_BAR_BG: CSSProperties = {
  backgroundColor: "#070b13",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

/**
 * Altura de marca = fila `h-16`. Tamaño real: `#navbar-brand-link` / `#navbar-brand-logo-img` al final de globals.css (sin @layer).
 */
export function SiteNavbar() {
  const scrollToTopCleanUrl = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    window.history.replaceState(null, "", "/");
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-100 border-b border-white/5 transition-[border-color] duration-300 ease-out" style={NAV_BAR_BG}>
      <nav
        className="pointer-events-none absolute left-1/2 top-8 z-30 hidden max-w-[calc(100%-16rem)] -translate-x-1/2 -translate-y-1/2 lg:flex lg:items-center lg:justify-center lg:gap-9 xl:max-w-none xl:gap-11"
        aria-label="Secciones"
      >
        {NAV.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="pointer-events-auto group relative whitespace-nowrap py-1 text-[13px] font-medium tracking-[-0.015em] text-zinc-300 no-underline transition-colors duration-200 hover:text-zinc-100"
          >
            {label}
            <span
              className="pointer-events-none absolute -bottom-0.5 left-1/2 h-0.5 w-[2.35rem] max-w-[70%] -translate-x-1/2 origin-center scale-x-0 bg-emerald-500/90 transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100"
              aria-hidden
            />
          </a>
        ))}
      </nav>

      <div className="relative mx-auto grid h-16 min-h-16 max-h-16 w-full max-w-[1580px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4 sm:gap-x-4 sm:px-8 lg:px-12">
        <div className="min-w-0">
          <a
            id="navbar-brand-link"
            href="/"
            onClick={scrollToTopCleanUrl}
            className="relative z-20 max-lg:min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]"
            aria-label="Ir al inicio"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="navbar-brand-logo-img"
              src="/logos/NavbarAGI.png"
              alt="AGI"
              fetchPriority="high"
              decoding="async"
            />
          </a>
        </div>

        {/* Celda central: reserva hueco flexible (el menú va en <nav> absoluto al header) */}
        <div className="min-h-0 min-w-0" aria-hidden />

        <div className="relative z-20 min-w-0 shrink-0 justify-self-end pl-1 max-lg:pl-2 sm:pl-3">
          <a
            href={CTA_MAIL}
            className="whitespace-nowrap border border-white/14 bg-transparent px-3 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-zinc-200 no-underline transition-[background-color,border-color,color] duration-200 hover:border-white/22 hover:bg-white/[0.035] hover:text-white max-lg:px-2.5 max-lg:py-1.5 max-lg:text-[9px] max-lg:tracking-widest sm:px-3.5 sm:text-[11px] sm:tracking-[0.14em]"
          >
            Ver qué necesita tu negocio
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/5 px-5 pb-2.5 pt-2 sm:px-8 lg:hidden">
        {NAV.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="group relative py-0.5 text-[12px] font-medium tracking-[-0.01em] text-zinc-400 no-underline transition-colors hover:text-zinc-200"
          >
            {label}
            <span
              className="pointer-events-none absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 origin-center scale-x-0 bg-emerald-500/90 transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100"
              aria-hidden
            />
          </a>
        ))}
      </div>
    </header>
  );
}
