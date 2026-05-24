"use client";

import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { trackEvent } from "@/lib/analytics";
import { handleSectionNavClick } from "@/lib/scroll-to-section";

const NAV = [
  { href: "#entregables", label: "Qué construyo" },
  { href: "#perfil", label: "Cómo funciona" },
  { label: "Contacto", opensContact: true },
] as const;

const navLinkClass =
  "pointer-events-auto group relative whitespace-nowrap py-1 text-[15px] font-medium tracking-[-0.015em] text-zinc-300 no-underline transition-colors duration-200 hover:text-zinc-100";

const navLinkClassMobile =
  "group relative py-0.5 text-[14px] font-medium tracking-[-0.01em] text-zinc-400 no-underline transition-colors hover:text-zinc-200";

const navUnderlineClass =
  "pointer-events-none absolute -bottom-0.5 left-1/2 h-0.5 w-[2.35rem] max-w-[70%] -translate-x-1/2 origin-center scale-x-0 bg-emerald-500/90 transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100";

const navUnderlineClassMobile =
  "pointer-events-none absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 origin-center scale-x-0 bg-emerald-500/90 transition-transform duration-300 ease-out motion-safe:group-hover:scale-x-100";

/** Estado en inicio — idéntico al navbar aprobado. */
const NAV_BAR_BG_TOP: CSSProperties = {
  backgroundColor: "#070b13",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

/** Solo al hacer scroll: un poco más de opacidad y blur. */
const NAV_BAR_BG_SCROLLED: CSSProperties = {
  backgroundColor: "rgba(7, 11, 19, 0.98)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
};

/**
 * Altura de marca = fila `h-16`. Tamaño real: `#navbar-brand-link` / `#navbar-brand-logo-img` al final de globals.css (sin @layer).
 */
export function SiteNavbar() {
  const { openModal } = useContactModal();
  const [scrolled, setScrolled] = useState(false);

  const handleNavbarContactClick = useCallback(() => {
    trackEvent("navbar_contact_click", { location: "navbar" });
    openModal();
  }, [openModal]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTopCleanUrl = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    window.history.replaceState(null, "", "/");
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-100 border-b border-white/5 transition-[border-color,background-color,backdrop-filter] duration-300 ease-out"
      style={scrolled ? NAV_BAR_BG_SCROLLED : NAV_BAR_BG_TOP}
    >
      <nav
        className="pointer-events-none absolute left-1/2 top-8 z-30 hidden max-w-[calc(100%-16rem)] -translate-x-1/2 -translate-y-1/2 lg:flex lg:items-center lg:justify-center lg:gap-9 xl:max-w-none xl:gap-11"
        aria-label="Secciones"
      >
        {NAV.map((item) =>
          "href" in item ? (
            <a
              key={item.href}
              href={item.href}
              className={navLinkClass}
              onClick={(e) => handleSectionNavClick(e, item.href)}
            >
              {item.label}
              <span className={navUnderlineClass} aria-hidden />
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={handleNavbarContactClick}
              className={`${navLinkClass} cursor-pointer border-0 bg-transparent p-0 font-inherit`}
            >
              {item.label}
              <span className={navUnderlineClass} aria-hidden />
            </button>
          ),
        )}
      </nav>

      <div className="relative mx-auto grid h-16 min-h-16 max-h-16 w-full max-w-[1580px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4 sm:gap-x-4 sm:px-8 lg:px-12">
        <div className="min-w-0">
          <Link
            id="navbar-brand-link"
            href="/"
            onClick={scrollToTopCleanUrl}
            className="relative z-20 max-lg:min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]"
            aria-label="Ir al inicio"
          >
            <Image
              id="navbar-brand-logo-img"
              src="/logos/NavbarAGI.webp"
              alt="AGI"
              width={116}
              height={39}
              priority
              fetchPriority="high"
              quality={80}
              sizes="(max-width: 1023px) 116px, 200px"
            />
          </Link>
        </div>

        {/* Celda central: reserva hueco flexible (el menú va en <nav> absoluto al header) */}
        <div className="min-h-0 min-w-0" aria-hidden />

        <div className="min-h-0 min-w-0" aria-hidden />
      </div>

      <div className="site-navbar-mobile-row mx-auto flex max-w-[1580px] flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/5 px-5 pb-2.5 pt-2 sm:px-8 lg:hidden">
        {NAV.map((item) =>
          "href" in item ? (
            <a
              key={item.href}
              href={item.href}
              className={navLinkClassMobile}
              onClick={(e) => handleSectionNavClick(e, item.href)}
            >
              {item.label}
              <span className={navUnderlineClassMobile} aria-hidden />
            </a>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={handleNavbarContactClick}
              className={`${navLinkClassMobile} cursor-pointer border-0 bg-transparent p-0 font-inherit`}
            >
              {item.label}
              <span className={navUnderlineClassMobile} aria-hidden />
            </button>
          ),
        )}
      </div>
    </header>
  );
}
