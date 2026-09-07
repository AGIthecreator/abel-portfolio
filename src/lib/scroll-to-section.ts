import type { MouseEvent } from "react";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desplazamiento suave a una sección sin dejar `#id` en la barra de direcciones. */
export function scrollToSectionById(sectionId: string): boolean {
  const el = document.getElementById(sectionId);
  if (!el) return false;

  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "instant" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", "/");
  return true;
}

/**
 * Enlaces a secciones del Home.
 * - En `/`: scroll in-place y limpia el hash.
 * - Desde otra ruta: navega a `/#id` (el Home resuelve el scroll al montar).
 */
export function handleSectionNavClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
): void {
  e.preventDefault();
  const id = href.replace(/^#/, "");
  if (!id) return;

  const onHome =
    window.location.pathname === "/" || window.location.pathname === "";

  if (onHome) {
    scrollToSectionById(id);
    return;
  }

  window.location.assign(`/#${id}`);
}

/** Si la URL llega con hash de sección del Home, hace scroll y limpia la barra. */
export function consumeHomeSectionHash(): void {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;

  const tryScroll = () => {
    if (scrollToSectionById(hash)) return true;
    return false;
  };

  if (tryScroll()) return;

  // Secciones deferred pueden montar un instante después.
  window.setTimeout(() => {
    tryScroll();
  }, 120);
  window.setTimeout(() => {
    tryScroll();
  }, 400);
}
