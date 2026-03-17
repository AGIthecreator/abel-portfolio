"use client";

import { useState } from "react";
import { ArchitectureModal } from "@/components/ui/ArchitectureModal";
import { projects } from "@/lib/data/portfolio";

export function ProjectModal() {
  const [openBlueprint, setOpenBlueprint] = useState(false);
  const aguarrasSlides =
    projects.find((p) => p.key === "aguarras")?.architectureSlides ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenBlueprint(true)}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.10)] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[rgba(34,211,238,0.16)] focus:outline-none focus:ring-2 focus:ring-cyan-300/35"
        aria-label="Abrir blueprint de arquitectura de Aguarrás"
      >
        Blueprint
      </button>
      <ArchitectureModal
        open={openBlueprint}
        onClose={() => setOpenBlueprint(false)}
        slides={aguarrasSlides}
      />
    </>
  );
}
