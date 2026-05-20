"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EvidenceTestimonialsGrid } from "@/components/sections/EvidenceTestimonials";

const SECTION_BG = "#070b13";
const POLAROID_CAPTION = "#F3F1EB";

type Point = { x: number; y: number };

const EVIDENCE_BLOCKS = [
  {
    id: "reserva",
    headline: "Reserva confirmada.",
    label: "Clínica",
    position: "left-[22%] top-[4%] sm:left-[24%] sm:top-[5%]",
    anchor: { x: 26, y: 9 } satisfies Point,
    targetPolaroid: "notificacion",
  },
  {
    id: "factura",
    headline: "Factura enviada.",
    label: "Asesoría",
    position: "right-[24%] top-[3%] sm:right-[26%] sm:top-[4%]",
    anchor: { x: 72, y: 8 } satisfies Point,
    targetPolaroid: "factura",
  },
  {
    id: "cliente",
    headline: "Cliente atendido sin WhatsApp.",
    label: "Restaurante",
    position: "left-[38%] top-[30%] sm:left-[40%] sm:top-[32%]",
    anchor: { x: 46, y: 34 } satisfies Point,
    targetPolaroid: "notificacion",
  },
  {
    id: "stock",
    headline: "Stock actualizado.",
    label: "Tienda",
    position: "left-[26%] bottom-[34%] sm:left-[28%] sm:bottom-[36%]",
    anchor: { x: 30, y: 60 } satisfies Point,
    targetPolaroid: "gestoria",
  },
  {
    id: "formulario",
    headline: "Formulario respondido solo.",
    label: "Negocio local",
    position: "right-[28%] bottom-[32%] sm:right-[30%] sm:bottom-[34%]",
    anchor: { x: 68, y: 58 } satisfies Point,
    targetPolaroid: "programador",
  },
] as const;

const POLAROIDS = [
  {
    id: "notificacion",
    src: "/notificacion.png",
    alt: "Notificación de cita confirmada en tiempo real",
    caption: "Cita confirmada en tiempo real",
    rotate: "-rotate-3",
    position: "left-[8%] top-[15%]",
    anchor: { x: 16, y: 22 } satisfies Point,
    floatDelay: 0,
  },
  {
    id: "factura",
    src: "/factura.png",
    alt: "Sistema de cobro y facturación activo",
    caption: "Sistema de cobro activo",
    rotate: "rotate-2",
    position: "right-[12%] top-[10%]",
    anchor: { x: 84, y: 19 } satisfies Point,
    floatDelay: 0.35,
  },
  {
    id: "gestoria",
    src: "/gestoria.png",
    alt: "Instalación en negocio local — despacho de gestoría",
    caption: "Instalación en negocio local",
    rotate: "rotate-[4deg]",
    position: "left-[15%] bottom-[15%]",
    anchor: { x: 24, y: 78 } satisfies Point,
    floatDelay: 0.7,
  },
  {
    id: "programador",
    src: "/programador.png",
    alt: "Monitorización de sistemas en despacho técnico",
    caption: "Monitorización de sistemas",
    rotate: "-rotate-2",
    position: "right-[18%] bottom-[20%]",
    anchor: { x: 78, y: 74 } satisfies Point,
    floatDelay: 1.05,
  },
] as const;

/** Cableado ortogonal (solo 90°): texto → polaroid */
function orthogonalPath(from: Point, to: Point) {
  return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;
}

const PLANO_CONNECTIONS = EVIDENCE_BLOCKS.map((block) => {
  const polaroid = POLAROIDS.find((p) => p.id === block.targetPolaroid);
  if (!polaroid) return null;
  return { id: block.id, d: orthogonalPath(block.anchor, polaroid.anchor) };
}).filter(Boolean) as { id: string; d: string }[];

const CTA_MAIL =
  "mailto:contacto@agithecreator.com?subject=Qué%20necesita%20tu%20negocio";

function randomRevealDelay(seed: number, min = 0.12, max = 0.68) {
  const t = Math.sin(seed * 12.9898) * 43758.5453;
  const n = t - Math.floor(t);
  return min + n * (max - min);
}

function DotPattern() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.55) 0.5px, transparent 0.5px)",
        backgroundSize: "18px 18px",
        opacity: 0.04,
      }}
      aria-hidden
    />
  );
}

function EvidenceBlock({
  headline,
  label,
  position,
  delay,
}: {
  headline: string;
  label: string;
  position: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute z-20 hidden max-w-[13.5rem] sm:block ${position}`}
      initial={{ opacity: 0, filter: "blur(14px)", y: 6 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.32, 1] }}
    >
      <p className="text-[13px] font-semibold leading-snug tracking-[-0.02em] text-zinc-100 sm:text-[15px]">
        {headline}
      </p>
      <p className="mt-1 font-mono text-[10px] tracking-wide text-zinc-500 sm:text-[11px]">
        ↳ {label}
      </p>
    </motion.div>
  );
}

function Polaroid({
  src,
  alt,
  caption,
  rotate,
  position,
  delay,
  floatDelay,
  inline = false,
}: {
  src: string;
  alt: string;
  caption: string;
  rotate: string;
  position: string;
  delay: number;
  floatDelay: number;
  inline?: boolean;
}) {
  return (
    <motion.figure
      className={
        inline
          ? `relative z-10 w-[9.5rem] shrink-0 sm:hidden ${rotate}`
          : `absolute z-10 hidden w-40 md:w-48 lg:w-52 sm:block ${position} ${rotate}`
      }
      initial={{ opacity: 0, filter: "blur(16px)", y: 12 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.32, 1] }}
    >
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{
          duration: 7.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        }}
      >
        <motion.div
          className="overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.85)]"
          style={{
            backgroundColor: POLAROID_CAPTION,
            padding: "9px 9px 0",
          }}
          whileHover={{ scale: 1.02, rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-900">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 38vw, 208px"
            />
          </div>
          <p
            className="px-1 pb-2.5 pt-2 text-center text-[9px] leading-tight tracking-[0.02em] text-zinc-600 sm:text-[10px]"
            style={{
              fontFamily: '"Segoe Script", "Bradley Hand", "Apple Chancery", cursive',
            }}
          >
            {caption}
          </p>
        </motion.div>
      </motion.div>
    </motion.figure>
  );
}

export function WhatIBuild() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.06 });

  const delays = useMemo(
    () =>
      [...EVIDENCE_BLOCKS, ...POLAROIDS].map((_, i) =>
        randomRevealDelay(i + 1)
      ),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="entregables"
      className="relative z-0 -mt-2 w-full overflow-visible sm:-mt-4"
      style={{ backgroundColor: SECTION_BG }}
      aria-labelledby="what-i-build-heading"
    >
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-visible">
        <div
          className="relative w-full overflow-visible pt-10 pb-8 sm:pt-12 sm:pb-10 lg:pt-14 lg:pb-12"
          style={{ backgroundColor: SECTION_BG }}
        >
          <DotPattern />

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.35 }}
          >
            <motion.header
              className="relative z-30 px-4 pb-4 text-center sm:pb-6"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.04 }}
            >
              <p
                id="what-i-build-heading"
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 sm:text-[11px]"
              >
                Lo que entrego.
              </p>
            </motion.header>

            {/* Tablero de evidencias */}
            <div className="relative mx-auto w-full max-w-7xl overflow-visible px-4 sm:px-6">
              <div className="relative mx-auto min-h-[min(88vh,42rem)] w-full overflow-visible sm:min-h-[34rem] lg:min-h-[36rem]">
                <svg
                  className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible sm:block"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  {PLANO_CONNECTIONS.map((line, i) => (
                    <motion.path
                      key={line.id}
                      d={line.d}
                      fill="none"
                      stroke="rgba(113,113,122,0.2)"
                      strokeWidth={0.8}
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        pathLength: {
                          duration: 1.15,
                          delay: 0.2 + i * 0.09,
                          ease: [0.22, 1, 0.32, 1],
                        },
                        opacity: { duration: 0.35, delay: 0.15 + i * 0.09 },
                      }}
                    />
                  ))}
                </svg>

                {EVIDENCE_BLOCKS.map((block, i) => (
                  <EvidenceBlock
                    key={block.id}
                    headline={block.headline}
                    label={block.label}
                    position={block.position}
                    delay={delays[i] ?? 0.2}
                  />
                ))}

                {POLAROIDS.map((p, i) => (
                  <Polaroid
                    key={p.id}
                    src={p.src}
                    alt={p.alt}
                    caption={p.caption}
                    rotate={p.rotate}
                    position={p.position}
                    floatDelay={p.floatDelay}
                    delay={delays[EVIDENCE_BLOCKS.length + i] ?? 0.35}
                  />
                ))}

                {/* Móvil */}
                <motion.div className="relative z-30 space-y-6 px-1 pb-6 pt-2 sm:hidden">
                  {EVIDENCE_BLOCKS.map((block, i) => (
                    <motion.div
                      key={`m-${block.id}`}
                      className="border-l border-zinc-700/50 pl-4"
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      whileInView={{ opacity: 1, filter: "blur(0px)" }}
                      viewport={{ once: true }}
                      transition={{ delay: delays[i], duration: 0.75 }}
                    >
                      <p className="text-sm font-semibold text-zinc-100">
                        {block.headline}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                        ↳ {block.label}
                      </p>
                    </motion.div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {POLAROIDS.map((p, i) => (
                      <Polaroid
                        key={`m-${p.id}`}
                        src={p.src}
                        alt={p.alt}
                        caption={p.caption}
                        rotate={p.rotate}
                        position=""
                        floatDelay={p.floatDelay}
                        inline
                        delay={delays[EVIDENCE_BLOCKS.length + i] ?? 0.35}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Manifiesto + CTA */}
            <motion.div
              className="relative z-30 mx-auto mt-6 max-w-2xl px-4 sm:mt-8 sm:px-6"
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.32, 1] }}
            >
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-8 text-center sm:px-10 sm:py-10">
                <p className="text-lg font-semibold leading-snug tracking-[-0.03em] text-zinc-100 sm:text-xl">
                  No construyo páginas bonitas.
                </p>
                <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed tracking-[-0.02em] text-zinc-300 sm:text-lg">
                  Construyo sistemas que hacen que el negocio siga funcionando
                  cuando tú estás ocupado.
                </p>
              </div>

              <div className="mt-8 text-center sm:mt-10">
                <p className="text-balance text-base font-medium leading-snug tracking-[-0.03em] text-zinc-200 sm:text-lg">
                  ¿Quieres seguir persiguiendo tareas o que el sistema las
                  persiga por ti?
                </p>
                <a
                  href={CTA_MAIL}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-zinc-600/60 bg-transparent px-7 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 transition-all duration-300 hover:border-white hover:text-white"
                >
                  Ver qué necesita tu negocio
                </a>
              </div>
            </motion.div>

            <EvidenceTestimonialsGrid className="relative z-30 mt-8 px-4 sm:mt-10 sm:px-6" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
