"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const EVIDENCE_TESTIMONIALS = [
  {
    src: "/testimonio1.PNG",
    name: "Laura Méndez",
    business: "Cafetería",
    quote: "Ahora las reservas entran solas y no tengo que estar pendiente del móvil.",
  },
  {
    src: "/testimonio2.PNG",
    name: "Jordi Planas",
    business: "Tienda",
    quote: "Antes me daba vergüenza enseñar mi web.",
  },
  {
    src: "/testimonio3.PNG",
    name: "Elena Vázquez",
    business: "Clínica",
    quote: "He dejado de perder tardes enteras organizando citas.",
  },
] as const;

function initialsFromName(name: string) {
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function EvidenceTestimonialCard({
  src,
  name,
  business,
  quote,
}: {
  src: string;
  name: string;
  business: string;
  quote: string;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <article className="rounded-lg border border-white/5 bg-[#0a0f1d] p-3.5 sm:p-4">
      <figure className="flex min-h-0 items-start gap-2.5 text-left sm:gap-3">
        <motion.div
          className="relative h-12 w-12 shrink-0 scale-[0.85] overflow-hidden rounded-full border border-white/10 bg-zinc-900"
          whileHover={{ scale: 0.9 }}
          transition={{ duration: 0.25 }}
        >
          {imgOk ? (
            <Image
              src={src}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover object-[50%_35%]"
              onError={() => setImgOk(false)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-zinc-500">
              {initialsFromName(name)}
            </span>
          )}
        </motion.div>
        <div className="min-w-0 flex-1">
          <blockquote className="text-[11px] leading-snug text-zinc-300 sm:text-[12px]">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <figcaption className="mt-1 text-[10px] text-zinc-500 sm:text-[11px]">
            {name} · {business}
          </figcaption>
        </div>
      </figure>
    </article>
  );
}

export function EvidenceTestimonialsGrid({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 ${className}`}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.32, 1] }}
    >
      {EVIDENCE_TESTIMONIALS.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 + i * 0.1, duration: 0.7 }}
        >
          <EvidenceTestimonialCard {...t} />
        </motion.div>
      ))}
    </motion.div>
  );
}
