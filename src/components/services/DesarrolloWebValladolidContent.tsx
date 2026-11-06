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

const PROJECT_TYPES = [
  {
    label: "Páginas web para negocios",
    href: "/desarrollo-web",
  },
  {
    label: "Diseño y rediseño web",
    href: "/desarrollo-web",
  },
  {
    label: "Automatización de procesos",
    href: "/automatizacion-de-procesos",
  },
  {
    label: "Precios públicos",
    href: "/precios",
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "¿Trabajáis solo en Valladolid?",
    answer: [
      "No. Trabajo desde aquí, pero también con clientes de toda España.",
    ],
  },
  {
    question: "¿Podemos reunirnos presencialmente?",
    answer: [
      "Cuando el proyecto y la logística lo permiten, sí. No es un requisito ni cambia el precio.",
    ],
  },
  {
    question: "¿Trabajáis con empresas de otras ciudades?",
    answer: [
      "Sí. El proceso está pensado para funcionar en remoto: diagnóstico, alcance, desarrollo y revisión.",
    ],
  },
  {
    question: "¿Cuánto cuesta una web en Valladolid?",
    answer: [
      "Lo mismo que en el resto de España. Una página web en Valladolid no tiene tarifa local distinta. Las referencias públicas están en precios.",
    ],
  },
  {
    question: "¿Podéis renovar una web existente?",
    answer: [
      "Sí. Se revisa qué conservar, qué reconstruir y se presupuesta el alcance con claridad.",
    ],
  },
] as const;

export function DesarrolloWebValladolidContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const track = useCallback((location: string, destination: string) => {
    trackEvent("service_page_cta", {
      page: "desarrollo-web-valladolid",
      location,
      destination,
    });
  }, []);

  return (
    <ServicePageRoot>
      <ServiceHero
        eyebrow="Valladolid · España"
        headingId="dwv-hero-heading"
        title="Desarrollo web en Valladolid"
        titleAccent="Páginas web y automatización para negocios de aquí y de toda España."
        lead={
          <p>
            Hago páginas web, diseño web y automatizaciones para negocios de
            Valladolid. Trabajas directamente con quien diseña y desarrolla el
            proyecto.
          </p>
        }
        leadExtra={
          <p>
            Si el negocio está aquí, podemos verlo en persona. Si está en otra
            ciudad, el mismo proceso va en remoto.
          </p>
        }
        image={{
          src: "/ValladolidHero.webp",
          alt: "Vistas de Valladolid al atardecer.",
          fit: "padded",
        }}
        primary={{
          label: "Preparar presupuesto",
          href: "/presupuesto",
          onClick: () => track("hero", "presupuesto"),
        }}
        secondary={{
          label: "Ver precios",
          href: "/precios",
          onClick: () => track("hero", "precios"),
        }}
      />

      <ServiceSection
        id="dwv-independent-heading"
        eyebrow="Trato"
        title="Trabajar con un estudio independiente"
        lead={
          <>
            <p>
              Trato directo, menos intermediarios y comunicación clara. Si una
              reunión presencial aporta, se puede plantear. Si el proyecto va
              mejor en remoto, también.
            </p>
            <p>El criterio de trabajo es el mismo en ambos casos.</p>
          </>
        }
        surface
        stripes="down"
      />

      <ServiceSection
        id="dwv-near-heading"
        eyebrow="Cercanía"
        title="Cerca cuando aporta"
        lead={
          <>
            <p>
              Reuniones presenciales cuando el proyecto lo necesita. Seguimiento
              remoto cuando resulta más práctico.
            </p>
            <p>La ubicación no limita el alcance.</p>
          </>
        }
        framed
      />

      <ServiceSection
        id="dwv-projects-heading"
        eyebrow="Proyectos"
        title="Qué hago en Valladolid"
        lead={
          <p>
            Páginas web, diseño web y automatización de procesos. El detalle de
            cada uno está en su página.
          </p>
        }
        surface
        stripes="up"
      >
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PROJECT_TYPES.map((item) => (
            <li key={item.label}>
              <TextLink href={item.href}>{item.label}</TextLink>
            </li>
          ))}
        </ul>
      </ServiceSection>

      <ServiceSection
        id="dwv-prices-heading"
        eyebrow="Transparencia"
        title="Sin tarifa local inventada"
        lead={
          <p>
            Los precios son los mismos aquí que en el resto de España. Las
            referencias públicas están en{" "}
            <TextLink href="/precios">precios</TextLink>.
          </p>
        }
        framed
      />

      <ServiceFaq
        headingId="dwv-faq-heading"
        title="Preguntas locales"
        lead="Lo habitual sobre trabajar desde aquí o a distancia."
        items={FAQ_ITEMS}
        openIndex={openFaq}
        onToggle={(i) => setOpenFaq((cur) => (cur === i ? null : i))}
      />

      <ServiceClosing
        headingId="dwv-close-heading"
        stripes="close"
        title={
          <>
            Si estás en Valladolid, podemos verlo en persona.{" "}
            <span className="text-violet-300">
              Si estás en cualquier otra ciudad, también.
            </span>
          </>
        }
        body={
          <>
            <p>Prepara un presupuesto o mira los precios públicos.</p>
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
          label: "Ver desarrollo web",
          href: "/desarrollo-web",
          onClick: () => track("cierre", "desarrollo-web"),
        }}
      />
    </ServicePageRoot>
  );
}
