"use client";

import { Modal } from "@/components/ui/Modal";
import { Carousel, type CarouselImage } from "@/components/ui/Carousel";

type ArchitectureModalProps = {
  open: boolean;
  onClose: () => void;
  slides: { url: string; caption: string }[];
};

export function ArchitectureModal({ open, onClose, slides }: ArchitectureModalProps) {
  const images: CarouselImage[] = slides.map((s, i) => ({
    src: s.url,
    alt: `Aguarrás · Arquitectura (Blueprint) · Vista ${i + 10}`,
    caption: s.caption,
    width: 1920,
    height: 1080,
  }));

  return (
    <Modal open={open} onClose={onClose} title="AGUARRÁS_BLUEPRINT">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="font-mono text-[12px] tracking-[0.18em] text-cyan-200/70">
            SISTEMA · ARQUITECTURA · BLUEPRINT
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-white">
            Arquitectura de Aguarrás (visión técnica)
          </h3>
          <p className="text-sm leading-6 text-white/65">
            Secuencia visual del diseño y flujo de datos del ecosistema. Usa
            <span className="font-mono"> Esc</span> para cerrar el modal.
          </p>
        </header>

        <Carousel images={images} />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-[12px] text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
