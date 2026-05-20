import { Fragment, type CSSProperties } from "react";

const EMAIL = "contacto@agithecreator.com";
const MAILTO = `mailto:${EMAIL}`;

const FOOTER_BG = "#070b13";

const FOOTER_SURFACE: CSSProperties = {
  background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 20%), ${FOOTER_BG}`,
};

const NAV_LINKS = [
  { href: "#perfil", label: "Qué construyo" },
  { href: "#entregables", label: "Cómo funciona" },
  { href: "#contacto", label: "Contacto" },
] as const;

const navLinkClass =
  "whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-200";

export function Footer() {
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
        {/* La altura la define solo .footer-content (nav + contacto + placa), no el logo */}
        <div className="footer-anchor relative">
          <a
            id="footer-brand-link"
            href="/"
            className="outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]"
            aria-label="Ir al inicio — AGItheCreator"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="footer-brand-logo-img"
              src="/logos/LogoAGItheCreator.png"
              alt="AGItheCreator"
              decoding="async"
            />
          </a>

          <div className="footer-content min-w-0">
            <div className="footer-main-row relative py-3">
              <nav
                className="flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5"
                aria-label="Enlaces del sitio"
              >
                {NAV_LINKS.map(({ href, label }, index) => (
                  <Fragment key={href}>
                    {index > 0 ? (
                      <span
                        className="select-none font-mono text-[11px] text-white/10"
                        aria-hidden
                      >
                        |
                      </span>
                    ) : null}
                    <a href={href} className={navLinkClass}>
                      {label}
                    </a>
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
                <p className="text-[9px] text-zinc-600 sm:text-[10px]">Respondo personalmente</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 pb-3 pt-0.5">
              <div
                className="h-px w-[min(72%,20rem)] bg-white/20 sm:w-[min(68%,24rem)]"
                role="presentation"
                aria-hidden
              />
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 opacity-40">
                AGITHECREATOR HECHO EN VALLADOLID · ESPAÑA © 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
