"use client";

import { useEffect } from "react";
import { consumeHomeSectionHash } from "@/lib/scroll-to-section";

/** Resuelve `/#seccion` al llegar al Home desde otra ruta. */
export function HomeSectionScroll() {
  useEffect(() => {
    consumeHomeSectionHash();
  }, []);

  return null;
}
