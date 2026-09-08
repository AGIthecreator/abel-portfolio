"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  ServiceClosing,
  ServiceFaq,
  ServiceHero,
  ServicePageRoot,
  ServiceSection,
  TextLink,
} from "@/components/services/ServicePagePrimitives";

const CARE_POINTS = [
  {
    title: "Claridad",
    body: "Que se entienda qué ofreces y para quién, sin rodeos ni ruido.",
  },
  {
    title: "Contenido",
    body: "Textos e información pensados para tu actividad, no relleno genérico.",
  },
  {
    title: "Experiencia",
    body: "Móvil, ritmo y un siguiente paso evidente: contacto, reserva o lo que el proyecto necesite.",
  },
  {
    title: "Base técnica",
    body: "Velocidad, accesibilidad, SEO técnico básico y analítica cuando corresponde.",
  },
] as const;

const PROCESS_STEPS = [
  "Entender",
  "Definir alcance",
  "Diseñar",
  "Desarrollar",
  "Probar",
  "Publicar",
] as const;

const FAQ_ITEMS = [
  {
    question: "¿Podéis trabajar sobre una web que ya existe?",
    answer: [
      "Sí. Se puede revisar qué sirve, qué sobra y qué conviene reconstruir. A veces merece migrar; a veces conviene partir de cero. Eso se decide con el alcance encima de la mesa.",
    ],
  },
  {
    question: "¿Podéis integrar herramientas que ya utilizo?",
    answer: [
      "Sí, cuando la herramienta lo permite y el alcance está claro. Primero se mira el proceso; después la forma de conectar.",
    ],
  },
  {
    question: "¿Qué pasa si el proyecto necesita funcionalidades propias?",
    answer: [
      "Se plantea como desarrollo a medida o como parte de un sistema mayor: lógica propia, bases de datos, áreas privadas o automatizaciones cuando hacen falta.",
      "El detalle comercial está en precios; el alcance se cierra en el presupuesto.",
    ],
  },
  {
    question: "¿Trabajáis con webs pensadas para móvil desde el principio?",
    answer: [
      "Sí. La experiencia móvil se trabaja desde el inicio, no se adapta al final.",
    ],
  },
  {
    question:
      "¿Una web puede conectarse después con automatizaciones o sistemas?",
    answer: [
      "Sí. Muchas webs empiezan como presencia y, más adelante, se conectan a flujos, avisos o herramientas internas.",
      "Si eso es lo que buscas ahora, también puedes mirar automatización de procesos.",
    ],
  },
] as const;

export function DesarrolloWebContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const track = useCallback((location: string, destination: string) => {
    trackEvent("service_page_cta", {
      page: "desarrollo-web",
      location,
      destination,
    });
  }, []);

  return (
    <ServicePageRoot>
      <ServiceHero
        eyebrow="Desarrollo web"
        headingId="dw-hero-heading"
        title="Desarrollo web para negocios"
        titleAccent="Con una función clara, no solo presencia."
        lead={
          <p>
            Una web no debería limitarse a estar online. Debería ayudar a
            entender qué haces, transmitir confianza y hacer sencillo el
            siguiente paso.
          </p>
        }
        leadExtra={
          <p>
            Eso es lo que cuido: criterio, claridad y una base técnica que
            aguante el día a día.
          </p>
        }
        image={{
          src: "/DesarrolloHero.webp",
          alt: "Escritorio de trabajo con pantallas y diseño web en progreso.",
          fit: "cover",
        }}
        primary={{
          label: "Ver precios",
          href: "/precios",
          onClick: () => track("hero", "precios"),
        }}
        secondary={{
          label: "Preparar presupuesto",
          href: "/presupuesto",
          onClick: () => track("hero", "presupuesto"),
        }}
      />

      <ServiceSection
        id="dw-function-heading"
        eyebrow="Enfoque"
        title="Una web tiene una función"
        lead={
          <>
            <p>
              El diseño importa, pero no es el único trabajo. Una buena
              presencia ayuda a entender qué ofrece la actividad, para quién es
              y por qué confiar.
            </p>
            <p>
              También facilita lo que viene después: escribir, llamar, reservar
              o pedir información sin que el visitante se pierda.
            </p>
          </>
        }
        surface
        stripes="down"
      />

      <ServiceSection
        id="dw-care-heading"
        eyebrow="Criterio"
        title="Qué cuidamos"
        lead={
          <p>
            Cuatro cosas que se notan en cuanto alguien llega. Sin checklist
            interminable.
          </p>
        }
        framed
      >
        <ul className="grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-2">
          {CARE_POINTS.map((point) => (
            <li
              key={point.title}
              className="border-l border-violet-400/30 pl-4"
            >
              <h3 className="text-[15px] font-semibold text-zinc-200">
                {point.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-[1.7] text-zinc-500">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </ServiceSection>

      <ServiceSection
        id="dw-grows-heading"
        eyebrow="Evolución"
        title="Cuando una web crece"
        lead={
          <>
            <p>
              Hay proyectos en los que la web deja de ser solo una web. Aparece
              lógica propia, integraciones, bases de datos, áreas privadas,
              reservas, automatizaciones o herramientas internas.
            </p>
            <p>
              Entonces deja de ser solo escaparate y pasa a formar parte de un
              sistema mayor. Si ese es tu caso, mira{" "}
              <TextLink href="/automatizacion-de-procesos">
                automatización de procesos
              </TextLink>
              .
            </p>
          </>
        }
        surface
        stripes="up"
      />

      <ServiceSection
        id="dw-process-heading"
        eyebrow="Proceso"
        title="Cómo se desarrolla"
        lead={
          <p>
            Un resumen. El detalle está en{" "}
            <TextLink href="/como-trabajamos">cómo trabajamos</TextLink>.
          </p>
        }
        framed
        framedWide
      >
        <div
          className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap sm:gap-3"
          aria-label="Entender, definir alcance, diseñar, desarrollar, probar, publicar"
        >
          {PROCESS_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex min-h-10 items-center rounded-md border border-white/10 bg-white/3 px-3.5 py-2 text-[13px] font-medium text-zinc-200 sm:text-[14px]">
                {step}
              </span>
              {index < PROCESS_STEPS.length - 1 ? (
                <span aria-hidden className="font-mono text-violet-300/70">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </ServiceSection>

      <ServiceFaq
        headingId="dw-faq-heading"
        title="Preguntas sobre desarrollo web"
        lead="Dudas concretas sobre cómo se construye y qué se puede conectar después."
        items={FAQ_ITEMS}
        openIndex={openFaq}
        onToggle={(i) => setOpenFaq((cur) => (cur === i ? null : i))}
      />

      <ServiceClosing
        headingId="dw-close-heading"
        stripes="close"
        title={
          <>
            Si sabes que necesitas una web pero todavía no tienes claro el
            alcance,{" "}
            <span className="text-violet-300">podemos verlo.</span>
          </>
        }
        body={
          <>
            <p>
              Prepara un presupuesto con tu caso o mira los precios públicos
              cuando quieras orientarte.
            </p>
            <p className="text-zinc-300">
              También puedes escribir desde{" "}
              <Link
                href="/contacto"
                className="text-zinc-100 underline decoration-violet-400/35 underline-offset-[3px]"
                onClick={() => track("cierre", "contacto")}
              >
                contacto
              </Link>
              .
            </p>
          </>
        }
        primary={{
          label: "Preparar presupuesto",
          href: "/presupuesto",
          onClick: () => track("cierre", "presupuesto"),
        }}
        secondary={{
          label: "Ver precios",
          href: "/precios",
          onClick: () => track("cierre", "precios"),
        }}
      />
    </ServicePageRoot>
  );
}
