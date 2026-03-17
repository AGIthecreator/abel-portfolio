"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";

type ArchitectureLogsProps = {
  className?: string;
};

export function ArchitectureLogs({ className }: ArchitectureLogsProps) {
  const [open, setOpen] = useState(false);

  const specsText = useMemo(
    () => `# SYSTEM_SPECIFICATIONS v1.0

> Documento interno para lectura técnica. Formato: *terminal / GitHub Markdown*.

## Stack actual (Frontend)

- **React / Next.js** como base del portfolio: composición por secciones, UI modular y componentes reutilizables.
- **Tailwind CSS** para un sistema de estilos consistente (glass, neon, micro-animaciones) y responsive.

## Roadmap: Events / Data layer

Está prevista la **integración de Airtable** para el manejo de eventos (alta/edición/listado) y orquestación de la capa de contenido.

[cite: 2026-02-03]

## Seguridad: Protección de datos

Se contempla un **sistema de cifrado apoyado en Supabase** para proteger datos sensibles (payloads, tokens y/o registros), manteniendo separación de responsabilidades entre UI, acceso a datos y políticas de seguridad.

[cite: 2026-02-19]
`,
    []
  );

  return (
    <>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={
          className ??
          "inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.12em] text-cyan-200/75 drop-shadow-[0_0_14px_rgba(34,211,238,0.14)] transition hover:text-violet-300/85 hover:drop-shadow-[0_0_18px_rgba(139,92,246,0.22)]"
        }
        aria-label="Abrir Architecture Logs"
      >
        <span className="text-white/70">&gt;</span>
        <span>ARCHITECTURE_LOGS</span>
        <span
          aria-hidden="true"
          className="animate-terminal-cursor-blink text-cyan-200/80"
        >
          _
        </span>
      </a>

      <Modal open={open} onClose={() => setOpen(false)} title="ARCHITECTURE_LOGS">
        <article className="prose prose-invert max-w-none prose-headings:font-mono prose-p:font-mono prose-li:font-mono prose-strong:font-mono">
          <pre className="m-0 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-4 text-[12.5px] leading-relaxed text-white/80">
            {specsText}
          </pre>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-[12px] text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
            >
              Close
            </button>
          </div>
        </article>
      </Modal>
    </>
  );
}
