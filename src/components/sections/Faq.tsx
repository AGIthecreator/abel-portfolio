"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useId, useState, type ReactNode } from "react";
import { Stagger, StaggerChild } from "@/components/motion/Stagger";
import {
  FAQ_EDITORIAL_BODY,
  FAQ_EDITORIAL_LEAD,
  FAQ_ITEMS,
  FAQ_TRUST_LINE,
  type FaqLink,
  type FaqTextPart,
} from "@/lib/data/faq";

const SECTION_SURFACE =
  "linear-gradient(180deg, #0c121c 0%, #131b2a 48%, #0c121c 100%)";

const FAQ_BONE = "#F3F1EB";
/** Casi negro para que la barra contraste con el fondo de la sección. */
const FAQ_BAR_DARK = "#06080d";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const HIGHLIGHT_CLASS = {
  bone: "text-[#F3F1EB]/88",
  violet: "text-violet-300/85",
} as const;

function RichText({ parts }: { parts: FaqTextPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.kind === "text" ? (
          <Fragment key={index}>{part.value}</Fragment>
        ) : (
          <span key={index} className={HIGHLIGHT_CLASS[part.accent]}>
            {part.value}
          </span>
        ),
      )}
    </>
  );
}

/** Mascota recortada (`mascot-faqs-hero.webp`), a la derecha del titular — mismo criterio que el hero. */
/** Barra bajo el titular: ancho hasta la «a» de «claro»; 80% casi negro + 20% hueso. */
function FaqHeadlineAccentBar() {
  return (
    <div
      aria-hidden
      className="mt-2.5 flex h-2 w-[11.2ch] max-w-full overflow-hidden sm:mt-3 sm:h-2.5"
    >
      <span className="h-full w-[80%] shrink-0" style={{ backgroundColor: FAQ_BAR_DARK }} />
      <span className="h-full w-[20%] shrink-0" style={{ backgroundColor: FAQ_BONE }} />
    </div>
  );
}

/** Móvil FAQ: misma altura visual que hero móvil; props propias (no compartir constantes). */
const FAQ_MASCOT_MOBILE_IMG =
  "max-lg:h-36 max-lg:max-h-36 max-lg:w-auto max-lg:max-w-[min(33vw,9.5rem)]";

function FaqHeadlineMascot({ className }: { className?: string }) {
  return (
    <div
      className={`relative flex w-fit max-w-full shrink-0 min-h-0 flex-col justify-center self-center max-lg:min-h-0 ${className ?? ""}`}
      aria-hidden
    >
      <div className="pointer-events-none relative flex w-fit max-w-full items-center justify-center overflow-hidden max-lg:min-h-0 min-h-20 sm:min-h-23 lg:min-h-25">
        <Image
          src="/logos/mascot-faqs-hero.webp"
          alt=""
          width={217}
          height={188}
          quality={85}
          sizes="(max-width: 1023px) 176px, 217px"
          className={`h-full max-h-full w-auto object-contain object-center lg:max-w-full ${FAQ_MASCOT_MOBILE_IMG}`}
        />
      </div>
    </div>
  );
}

const FAQ_LINK_CLASS =
  "text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] transition-colors hover:text-white";

function FaqAnswer({
  answer,
  links,
}: {
  answer: string;
  links?: readonly FaqLink[];
}) {
  if (!links?.length) return answer;

  const nodes: ReactNode[] = [];
  let rest = answer;

  for (const link of links) {
    const index = rest.indexOf(link.phrase);
    if (index === -1) continue;
    if (index > 0) nodes.push(rest.slice(0, index));
    nodes.push(
      <Link key={link.href} href={link.href} className={FAQ_LINK_CLASS}>
        {link.phrase}
      </Link>,
    );
    rest = rest.slice(index + link.phrase.length);
  }

  if (rest) nodes.push(rest);
  return nodes;
}

function FaqAccordionItem({
  question,
  answer,
  links,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  links?: readonly FaqLink[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <article>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group flex w-full items-start gap-3 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 sm:gap-4 sm:py-4"
      >
        <h3
          className={`min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-300 sm:text-base ${
            isOpen
              ? "text-violet-300"
              : "text-violet-400 group-hover:text-violet-300"
          }`}
        >
          {question}
        </h3>
        <span
          aria-hidden
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/12 text-violet-300/80 transition-[transform,background-color,border-color] duration-300 ease-out group-hover:border-violet-400/40 group-hover:bg-white/5 sm:size-8 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDown className="size-3.5 sm:size-4" strokeWidth={2} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Respuesta: ${question}`}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={
              reduceMotion ? undefined : { height: "auto", opacity: 1 }
            }
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-[42ch] pb-3.5 pr-10 text-[14px] leading-[1.7] text-zinc-400 sm:pb-4 sm:text-[15px] sm:leading-[1.75]">
              <FaqAnswer answer={answer} links={links} />
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative scroll-mt-24 w-full overflow-x-clip border-t border-white/5 pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
      style={{ background: SECTION_SURFACE }}
      aria-labelledby="faq-heading"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(80, 50, 200, 0.08), transparent 42%), radial-gradient(circle at 82% 78%, rgba(0, 200, 255, 0.05), transparent 40%)",
        }}
      />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.08 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 hidden h-full w-px bg-white/12 lg:block"
            style={{ left: "calc(58% + 0.125rem)" }}
          />

          <motion.div
            className="grid grid-cols-1 gap-12 lg:grid-cols-[58fr_42fr] lg:items-center lg:gap-x-5 xl:gap-x-6"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.aside
              variants={fadeUp}
              className="min-w-0 lg:justify-self-end lg:pr-0 lg:pl-2 xl:pl-0"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em]">
                <span className="text-zinc-500">Preguntas </span>
                <span className="text-[#F3F1EB]/72">frecuentes</span>
              </p>

              <div className="mt-4 flex w-fit max-w-full items-center gap-3 max-lg:flex-nowrap lg:grid lg:grid-cols-[auto_auto] lg:justify-start lg:gap-3">
                <div className="shrink-0 text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-tight">
                  <h2
                    id="faq-heading"
                    className="w-fit text-balance text-zinc-50"
                  >
                    Hablemos claro.
                  </h2>
                  <FaqHeadlineAccentBar />
                </div>
                <FaqHeadlineMascot />
              </div>

              <p className="mt-5 max-w-[42ch] text-[15px] leading-[1.8] text-zinc-400 sm:mt-6 sm:text-base sm:leading-[1.85] lg:max-w-none">
                <RichText parts={FAQ_EDITORIAL_LEAD} />
              </p>

              <p className="mt-5 max-w-[42ch] whitespace-pre-line text-[15px] leading-[1.8] text-zinc-400 sm:text-base sm:leading-[1.85] lg:max-w-none">
                <RichText parts={FAQ_EDITORIAL_BODY} />
              </p>

              <p className="mt-7 max-w-[42ch] text-[15px] font-medium leading-relaxed text-zinc-300 sm:text-base lg:max-w-none">
                <RichText parts={FAQ_TRUST_LINE} />
              </p>

              <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-zinc-500 sm:text-[15px] lg:max-w-none">
                Sin permanencias, sin agobios y sin intentar venderte algo que no
                necesitas.
              </p>
            </motion.aside>

            <motion.div
              variants={fadeUp}
              className="min-w-0 w-full lg:pl-4 lg:pt-2 xl:pl-5 xl:pt-3"
            >
              <Stagger
                className="w-full divide-y divide-white/10"
                stagger={0.04}
              >
                {FAQ_ITEMS.map((item, index) => (
                  <StaggerChild key={item.question}>
                    <FaqAccordionItem
                      question={item.question}
                      answer={item.answer}
                      links={item.links}
                      isOpen={openIndex === index}
                      onToggle={() => handleToggle(index)}
                    />
                  </StaggerChild>
                ))}
              </Stagger>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
