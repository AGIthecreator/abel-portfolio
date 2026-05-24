"use client";

import Image from "next/image";
import { motion } from "framer-motion";
const SECTION_BG = "#070b13";
const POLAROID_CAPTION = "#F3F1EB";

/** Alineado al ancho real en móvil (max ~200–225px) para no pedir 750–1080px a Next */
const IMAGE_SIZES = "(max-width: 640px) 200px, (max-width: 1024px) 220px, 260px";
const IMAGE_SIZES_AXIS = "(max-width: 640px) 230px, (max-width: 1024px) 250px, 292px";
const POLAROID_QUALITY = 80;

/** Orden: arriba centro → medio (local | factura) → eje (despacho) → abajo desplazado (tienda) */
const BOARD_ITEMS = [
  {
    id: "cafe",
    layout: "top" as const,
    headline: "Mesa llena esta noche.",
    label: "Cafetería",
    src: "/notificacion.webp",
    alt: "Cafetería con mesas ocupadas",
    caption: "Cola cerrada",
    rotateDeg: -1.25,
    floatDelay: 0,
  },
  {
    id: "local",
    layout: "midLeft" as const,
    headline: "Cliente atendido sin perseguir mensajes.",
    label: "Local",
    src: "/restaurante.webp",
    alt: "Servicio en local sin interrupciones",
    caption: "Sala en calma",
    rotateDeg: 1.5,
    floatDelay: 0.15,
  },
  {
    id: "asesoria",
    layout: "midRight" as const,
    headline: "Trabajo terminado. Factura enviada.",
    label: "Asesoría",
    src: "/factura.webp",
    alt: "Factura emitida",
    caption: "Cobro listo",
    rotateDeg: -1.75,
    floatDelay: 0.3,
  },
  {
    id: "ingenieria",
    layout: "center" as const,
    headline: "Tu negocio sigue funcionando.",
    label: "Ingeniería aplicada",
    src: "/programador.webp",
    alt: "Despacho técnico",
    caption: "Siempre encendido",
    rotateDeg: 0.75,
    floatDelay: 0.45,
  },
  {
    id: "comercio",
    layout: "bottom" as const,
    headline: "La tienda sigue moviéndose sola.",
    label: "Comercio",
    src: "/tienda.webp",
    alt: "Comercio activo",
    caption: "Stock vivo",
    rotateDeg: -1.5,
    floatDelay: 0.6,
  },
] as const;

function DotPattern() {
  return (
    <div
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

function TechnicalLabel({ headline, label }: { headline: string; label: string }) {
  return (
    <div className="w-full text-left">
      <p className="text-xs font-medium leading-snug tracking-[-0.01em] text-zinc-100 antialiased">
        {headline}
      </p>
      <p className="mt-0.5 font-mono text-[10px] leading-none text-zinc-500">
        ↳ {label}
      </p>
    </div>
  );
}

function PolaroidFigure({
  src,
  alt,
  caption,
  rotateDeg,
  floatDelay,
  isAxis,
}: {
  src: string;
  alt: string;
  caption: string;
  rotateDeg: number;
  floatDelay: number;
  isAxis?: boolean;
}) {
  const widthClass = isAxis
    ? "w-[min(100%,calc(100vw-2.5rem))] max-w-[225px] sm:max-w-none sm:w-[225px] lg:w-[292px]"
    : "w-[min(100%,calc(100vw-2.5rem))] max-w-[200px] sm:max-w-none sm:w-[200px] lg:w-[260px]";

  return (
    <motion.figure
      className={`relative z-10 shrink-0 shadow-2xl ${widthClass}`}
      style={{ rotate: `${rotateDeg}deg` }}
      animate={{ y: [0, -3, 0] }}
      transition={{
        duration: 6.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: floatDelay,
      }}
    >
      <div
        className="overflow-hidden rounded-[2px]"
        style={{
          backgroundColor: POLAROID_CAPTION,
          padding: "6px 6px 0",
        }}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-900">
          <Image
            src={src}
            alt={alt}
            fill
            quality={POLAROID_QUALITY}
            loading="lazy"
            sizes={isAxis ? IMAGE_SIZES_AXIS : IMAGE_SIZES}
            className="object-cover object-center"
          />
        </div>
        <div className="flex h-7 shrink-0 items-center justify-center px-1">
          <p
            className="text-center text-[9px] font-medium leading-none tracking-wide text-zinc-700"
            style={{
              fontFamily:
                '"Segoe Script", "Bradley Hand", "Apple Chancery", cursive',
            }}
          >
            {caption}
          </p>
        </div>
      </div>
    </motion.figure>
  );
}

function EvidencePiece({
  item,
  index,
  className = "",
}: {
  item: (typeof BOARD_ITEMS)[number];
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`isolate flex w-max max-w-full flex-col items-start gap-0 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.6,
        delay: 0.05 + index * 0.06,
        ease: [0.22, 1, 0.32, 1],
      }}
    >
      <div className="relative z-20 mb-2 w-full sm:mb-2.5">
        <TechnicalLabel headline={item.headline} label={item.label} />
      </div>
      <PolaroidFigure
        src={item.src}
        alt={item.alt}
        caption={item.caption}
        rotateDeg={item.rotateDeg}
        floatDelay={item.floatDelay}
        isAxis={item.id === "ingenieria"}
      />
    </motion.div>
  );
}

/** Plano técnico: centro ↔ cada esquina del tablero (ortogonal, muy sutil) */
function DraftingConnectors() {
  const strokeCls = "stroke-zinc-900/50";
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-1 hidden h-full w-full overflow-visible md:block"
      viewBox="0 0 600 520"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <motion.path
        d="M 300 268 L 300 200 L 268 200 L 268 108"
        className={strokeCls}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ pathLength: { duration: 0.95, delay: 0.2 }, opacity: { duration: 0.35 } }}
      />
      <motion.path
        d="M 300 268 L 220 268 L 220 232 L 132 232"
        className={strokeCls}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ pathLength: { duration: 0.95, delay: 0.3 }, opacity: { duration: 0.35 } }}
      />
      <motion.path
        d="M 300 268 L 380 268 L 380 232 L 472 232"
        className={strokeCls}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ pathLength: { duration: 0.95, delay: 0.4 }, opacity: { duration: 0.35 } }}
      />
      <motion.path
        d="M 300 268 L 300 336 L 352 336 L 352 408"
        className={strokeCls}
        strokeWidth={0.5}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ pathLength: { duration: 0.95, delay: 0.5 }, opacity: { duration: 0.35 } }}
      />
    </svg>
  );
}

export function WhatIBuild() {
  const cafe = BOARD_ITEMS.find((i) => i.id === "cafe")!;
  const local = BOARD_ITEMS.find((i) => i.id === "local")!;
  const asesoria = BOARD_ITEMS.find((i) => i.id === "asesoria")!;
  const ingenieria = BOARD_ITEMS.find((i) => i.id === "ingenieria")!;
  const comercio = BOARD_ITEMS.find((i) => i.id === "comercio")!;

  return (
    <section
      id="entregables"
      className="relative -mt-6 scroll-mt-24 w-full overflow-x-clip overflow-y-visible pt-16 sm:-mt-8 sm:pt-20"
      style={{ backgroundColor: SECTION_BG }}
      aria-label="Mesa de trabajo — evidencias"
    >
      <DotPattern />

      <div className="relative z-10 mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-12 sm:px-6 lg:px-10 sm:pb-16">
        <div className="relative mx-auto w-full min-w-0 max-w-full overflow-x-clip">
          <DraftingConnectors />

          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-5 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-3">
            {/* Fila 1 — cafetería, centrada en el ancho del tablero */}
            <div className="flex justify-center lg:col-span-12 lg:row-start-1">
              <EvidencePiece
                item={cafe}
                index={0}
                className="max-sm:translate-x-0 -translate-x-2 sm:-translate-x-3 lg:-translate-x-6"
              />
            </div>

            {/* Fila 2 — local y factura: dos columnas en desktop, más separación horizontal */}
            <div className="flex justify-center lg:col-span-5 lg:row-start-2 lg:justify-start lg:pl-2 xl:pl-6">
              <EvidencePiece
                item={local}
                index={1}
                className="sm:translate-x-0 lg:translate-x-2"
              />
            </div>
            <div className="flex justify-center lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:justify-end lg:pr-2 xl:pr-6">
              <EvidencePiece
                item={asesoria}
                index={2}
                className="sm:translate-x-0 lg:-translate-x-2"
              />
            </div>

            {/* Fila 3 — eje (sin margen negativo: evita que las polaroids de arriba pisen este texto) */}
            <div className="mt-4 flex justify-center sm:mt-6 lg:col-span-12 lg:row-start-3 lg:mt-10">
              <EvidencePiece
                item={ingenieria}
                index={3}
                className="max-sm:translate-x-0 translate-x-2 sm:translate-x-3 lg:translate-x-5"
              />
            </div>

            {/* Fila 4 — comercio, desplazado */}
            <div className="flex justify-center lg:col-span-12 lg:row-start-4 lg:mt-3 lg:justify-end lg:pr-6 xl:pr-12">
              <EvidencePiece
                item={comercio}
                index={4}
                className="max-sm:translate-x-0 translate-x-3 sm:translate-x-5 lg:translate-x-7"
              />
            </div>
          </div>
        </div>

        <motion.footer
          className="mx-auto mt-12 max-w-lg px-1 text-center sm:mt-16"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.32, 1] }}
        >
          <p className="font-serif text-[clamp(1.15rem,2.8vw,1.45rem)] font-normal leading-[1.35] tracking-[-0.02em] text-zinc-100">
            Menos tiempo apagando fuegos.
            <br />
            Más tiempo haciendo crecer algo.
          </p>

          <p className="mx-auto mt-8 max-w-md text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
            Tu tiempo vuelve a estar donde importa.
          </p>
        </motion.footer>
      </div>
    </section>
  );
}
