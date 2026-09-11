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

const SITUATIONS = [
  {
    title: "Captar",
    body: "Formulario → registro → aviso → seguimiento.",
  },
  {
    title: "Gestionar",
    body: "Reserva → confirmación → registro → aviso.",
  },
  {
    title: "Administrar",
    body: "Datos → documentos → emails → actualizaciones.",
  },
  {
    title: "Conectar",
    body: "Una herramienta → otra, sin copiar información a mano.",
  },
] as const;

const FLOW_STEPS = [
  "Entrada",
  "Datos",
  "Sistema",
  "Decisión",
  "Acción",
  "Seguimiento",
] as const;

const WHEN_SIGNALS = [
  "Haces lo mismo muchas veces",
  "Copias información entre herramientas",
  "Recibes solicitudes por varios canales",
  "Dependes de procesos manuales para cosas repetibles",
] as const;

const PROCESS_STEPS = [
  "Entender el proceso",
  "Diseñar el flujo",
  "Implementar",
  "Probar",
] as const;

const FAQ_ITEMS = [
  {
    question: "¿Qué procesos se pueden automatizar?",
    answer: [
      "Los que se repiten con reglas claras: formularios, reservas, avisos, sincronización entre herramientas o tareas administrativas.",
      "Si cada caso es distinto y depende de criterio humano, a veces conviene simplificar antes de automatizar.",
    ],
  },
  {
    question: "¿Necesito utilizar IA?",
    answer: [
      "No. Muchas automatizaciones se resuelven con reglas, integraciones, bases de datos o APIs. La IA entra cuando aporta valor real al proceso.",
    ],
  },
  {
    question: "¿Podéis conectar herramientas que ya utilizo?",
    answer: [
      "Sí, cuando la herramienta lo permite y el alcance está claro. Primero el proceso; después la forma de conectar.",
    ],
  },
  {
    question: "¿Se pueden automatizar reservas?",
    answer: [
      "Sí, cuando el flujo de reserva, confirmación y aviso está bien definido. Puede vivir junto a la web o conectarse a un sistema existente.",
    ],
  },
  {
    question: "¿Podéis trabajar con una web existente?",
    answer: [
      "Sí. A veces se automatiza alrededor de lo que ya tienes. Otras veces conviene ajustar la web para que el flujo sea más limpio.",
    ],
  },
  {
    question: "¿Cómo sé si merece la pena automatizar algo?",
    answer: [
      "Si el proceso se repite, consume tiempo y se puede describir con pasos claros, suele merecer mirarlo. Si ocurre rara vez o cada caso es distinto, a veces es mejor dejarlo manual.",
    ],
  },
] as const;

export function AutomatizacionProcesosContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const track = useCallback((location: string, destination: string) => {
    trackEvent("service_page_cta", {
      page: "automatizacion-de-procesos",
      location,
      destination,
    });
  }, []);

  return (
    <ServicePageRoot>
      <ServiceHero
        eyebrow="Automatización"
        headingId="ap-hero-heading"
        title="Automatización de procesos para negocios"
        titleAccent={
          <>
            Menos tareas repetidas. Más tiempo para el{" "}
            <span className="text-violet-300/95 italic">negocio.</span>
          </>
        }
        lead={
          <p>
            Primero el proceso. Después la herramienta. Si algo se repite y ya
            sabes cómo debería funcionar, se puede convertir en un flujo que
            trabaje por ti.
          </p>
        }
        leadExtra={
          <p>
            La lógica suele ser sencilla: entrada, decisión, acción y
            seguimiento.
          </p>
        }
        image={{
          src: "/AutomatizacionHero.webp",
          alt: "Espacio de trabajo con pantallas y flujos de automatización.",
        }}
        primary={{
          label: "Cuéntanos qué quieres automatizar",
          href: "/presupuesto",
          onClick: () => track("hero", "presupuesto"),
        }}
        secondary={{
          label: "Probar el laboratorio",
          href: "/laboratorio",
          onClick: () => track("hero", "laboratorio"),
        }}
      />

      <ServiceSection
        id="ap-situations-heading"
        eyebrow="Alcance"
        title="Qué tiene sentido automatizar"
        lead={
          <p>
            No hace falta cubrirlo todo. Estas cuatro situaciones suelen ser
            donde más se nota el cambio.
          </p>
        }
        surface
        stripes="down"
      >
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SITUATIONS.map((item) => (
            <li
              key={item.title}
              className="border-l border-violet-400/30 pl-4"
            >
              <h3 className="text-[15px] font-semibold text-zinc-200">
                {item.title}
              </h3>
              <p className="mt-1.5 font-mono text-[13px] leading-[1.7] text-zinc-500">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </ServiceSection>

      <ServiceSection
        id="ap-flow-heading"
        eyebrow="Flujo"
        title="De una tarea a un flujo"
        lead={
          <p>
            Una automatización no es solo «cuando pasa X, haz Y». Hay datos,
            reglas y un seguimiento después de la acción.
          </p>
        }
        framed
        framedWide
      >
        <div
          className="flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap sm:gap-3"
          aria-label="Entrada, datos, sistema, decisión, acción, seguimiento"
        >
          {FLOW_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex min-h-10 items-center rounded-md border border-white/10 bg-white/3 px-3.5 py-2 text-[13px] font-medium text-zinc-200 sm:text-[14px]">
                {step}
              </span>
              {index < FLOW_STEPS.length - 1 ? (
                <span aria-hidden className="font-mono text-violet-300/70">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[52ch] text-center text-[14px] leading-[1.7] text-zinc-500">
          Ejemplo: llega una solicitud, se ordena la información, el sistema
          aplica la regla, se dispara la acción y alguien puede hacer
          seguimiento sin rebuscarlo a mano.
        </p>
      </ServiceSection>

      <ServiceSection
        id="ap-no-ai-heading"
        eyebrow="Criterio"
        title="No todo necesita IA"
        lead={
          <>
            <p>
              Una automatización puede apoyarse en reglas, integraciones, APIs,
              bases de datos, código o herramientas no-code. La IA entra cuando
              de verdad aporta.
            </p>
            <p>
              La tecnología se decide después de entender el proceso.
            </p>
          </>
        }
        surface
        stripes="up"
      />

      <ServiceSection
        id="ap-web-heading"
        eyebrow="Web y sistemas"
        title="Lo visible y lo que ocurre detrás"
        lead={
          <>
            <p>
              Puedo trabajar la parte pública y también lo que pasa después del
              clic: formulario, base de datos, aviso y seguimiento. O reserva,
              confirmación, registro y aviso interno.
            </p>
            <p>
              Si también necesitas la presencia pública, mira{" "}
              <TextLink href="/desarrollo-web">desarrollo web</TextLink>.
            </p>
          </>
        }
        framed
      />

      <ServiceSection
        id="ap-when-heading"
        eyebrow="Señales"
        title="Cuándo merece la pena"
        lead={
          <p>Si te reconoces en varias, suele merecer una conversación.</p>
        }
        surface
        stripes="down"
      >
        <ul className="space-y-3">
          {WHEN_SIGNALS.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[15px] leading-[1.65] text-zinc-400"
            >
              <span
                aria-hidden
                className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-400/70"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ServiceSection>

      <ServiceSection
        id="ap-custom-heading"
        eyebrow="A medida"
        title="Cuando hace falta un sistema propio"
        lead={
          <>
            <p>
              Algunos procesos caben en un flujo ligero. Otros necesitan bases
              de datos, paneles, APIs, lógica personalizada o herramientas
              internas.
            </p>
            <p>
              Eso se presupuesta según el alcance. La referencia comercial está
              en <TextLink href="/precios">precios</TextLink>.
            </p>
          </>
        }
        framed
      />

      <ServiceSection
        id="ap-process-heading"
        eyebrow="Proceso"
        title="Cómo se trabaja"
        lead={
          <p>
            Un resumen. El detalle está en{" "}
            <TextLink href="/como-trabajamos">cómo trabajamos</TextLink>.
          </p>
        }
        surface
        stripes="up"
      >
        <div
          className="flex flex-wrap items-center gap-2 sm:gap-3"
          aria-label="Entender el proceso, diseñar el flujo, implementar, probar"
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
        headingId="ap-faq-heading"
        title="Preguntas sobre automatización"
        lead="Lo habitual antes de convertir un proceso manual en un flujo."
        items={FAQ_ITEMS}
        openIndex={openFaq}
        onToggle={(i) => setOpenFaq((cur) => (cur === i ? null : i))}
      />

      <ServiceClosing
        headingId="ap-close-heading"
        stripes="close"
        title={
          <>
            Si el proceso se repite,{" "}
            <span className="text-violet-300">podemos dejar de hacerlo a mano.</span>
          </>
        }
        body={
          <>
            <p>
              Cuéntame qué quieres automatizar y vemos si merece la pena y cómo.
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
          label: "Cuéntanos qué quieres automatizar",
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
