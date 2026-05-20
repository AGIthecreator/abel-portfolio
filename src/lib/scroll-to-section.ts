import type { MouseEvent } from "react";

/** Desplazamiento suave a una sección sin dejar `#id` en la barra de direcciones. */
export function scrollToSectionById(sectionId: string): boolean {
  const el = document.getElementById(sectionId);
  if (!el) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({
    behavior: reduceMotion ? "instant" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", "/");
  return true;
}

export function handleSectionNavClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
): void {
  e.preventDefault();
  const id = href.replace(/^#/, "");
  scrollToSectionById(id);
}
