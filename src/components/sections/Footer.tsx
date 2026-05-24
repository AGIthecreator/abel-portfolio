"use client";

import { Fragment, type CSSProperties, type MouseEvent, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { handleSectionNavClick } from "@/lib/scroll-to-section";

const EMAIL = "contacto@agithecreator.com";
const MAILTO = `mailto:${EMAIL}`;

const FOOTER_BG = "#070b13";

const FOOTER_SURFACE: CSSProperties = {
  background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 20%), ${FOOTER_BG}`,
};

const NAV_LINKS = [
  { href: "#entregables", label: "Qué construyo" },
  { href: "#perfil", label: "Cómo funciona" },
  { label: "Contacto", opensContact: true },
] as const;

const LEGAL_LINKS = [
  { href: "/legal", label: "Aviso legal" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
] as const;

const navLinkClass =
  "whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-200";

export function Footer() {
  const { openModal } = useContactModal();

  const scrollToTopCleanUrl = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
    window.history.replaceState(null, "", "/");
  }, []);

  return (
    <footer
      id="contacto"
      className="relative w-full scroll-mt-24 overflow-hidden border-t border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      style={FOOTER_SURFACE}
    >
      <div
        className="footer-grain-overlay pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1580px] px-4 sm:px-8 lg:px-12">
        <div className="footer-anchor relative">
          <Link
            id="footer-brand-link"
            href="/"
            onClick={scrollToTopCleanUrl}
            className="outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]"
            aria-label="Ir al inicio — AGItheCreator"
          >
            <Image
              id="footer-brand-logo-img"
              src="/logos/LogoAGItheCreator.webp"
              alt="AGItheCreator"
              width={320}
              height={320}
              quality={80}
              loading="lazy"
              sizes="(max-width: 1023px) 150px, 220px"
            />
          </Link>

          <div className="footer-content min-w-0">
            <div className="footer-main-row relative py-3">
              <nav
                className="flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5"
                aria-label="Enlaces del sitio"
              >
                {NAV_LINKS.map((item, index) => (
                  <Fragment key={"href" in item ? item.href : item.label}>
                    {index > 0 ? (
                      <span
                        className="select-none font-mono text-[11px] text-white/10"
                        aria-hidden
                      >
                        |
                      </span>
                    ) : null}
                    {"href" in item ? (
                      <a
                        href={item.href}
                        className={navLinkClass}
                        onClick={(e) => handleSectionNavClick(e, item.href)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={openModal}
                        className={`${navLinkClass} cursor-pointer border-0 bg-transparent p-0 font-inherit uppercase`}
                      >
                        {item.label}
                      </button>
                    )}
                  </Fragment>
                ))}
              </nav>

              <div className="footer-contact mt-3 flex flex-col items-center gap-0.5 lg:mt-0 lg:items-end">
                <a
                  href={MAILTO}
                  className="inline-block border border-white/10 bg-white/2 px-2.5 py-1 font-mono text-[10px] tracking-wide text-zinc-300 no-underline transition-[border-color,background-color,color] duration-200 hover:border-white/16 hover:bg-white/4 hover:text-zinc-100 sm:text-[11px]"
                >
                  {EMAIL}
                </a>
                <p className="text-[9px] text-zinc-400 sm:text-[10px]">Respondo personalmente</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 pb-3 pt-0.5">
              <nav
                className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5"
                aria-label="Enlaces legales"
              >
                {LEGAL_LINKS.map((item, index) => (
                  <Fragment key={item.href}>
                    {index > 0 ? (
                      <span
                        className="select-none font-mono text-[11px] text-white/10"
                        aria-hidden
                      >
                        |
                      </span>
                    ) : null}
                    <Link href={item.href} className={navLinkClass}>
                      {item.label}
                    </Link>
                  </Fragment>
                ))}
              </nav>
              <div
                className="h-px w-[min(72%,20rem)] bg-white/20 sm:w-[min(68%,24rem)]"
                role="presentation"
                aria-hidden
              />
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 opacity-50">
                AGITHECREATOR HECHO EN VALLADOLID · ESPAÑA © 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
