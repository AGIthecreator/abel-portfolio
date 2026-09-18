import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import { DesarrolloWebContent } from "@/components/services/DesarrolloWebContent";

const faqEntities = [
  {
    "@type": "Question",
    name: "¿Podéis trabajar sobre una web que ya existe?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. Se puede revisar qué sirve, qué sobra y qué conviene reconstruir. A veces merece migrar; a veces conviene partir de cero. Eso se decide con el alcance encima de la mesa.",
    },
  },
  {
    "@type": "Question",
    name: "¿Podéis integrar herramientas que ya utilizo?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí, cuando la herramienta lo permite y el alcance está claro. Primero se mira el proceso; después la forma de conectar.",
    },
  },
  {
    "@type": "Question",
    name: "¿Qué pasa si el proyecto necesita funcionalidades propias?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Se plantea como desarrollo a medida o como parte de un sistema mayor: lógica propia, bases de datos, un área privada sencilla para tus clientes o equipo, o automatizaciones cuando hacen falta. El detalle comercial está en precios; el alcance se cierra en el presupuesto.",
    },
  },
  {
    "@type": "Question",
    name: "¿Trabajáis con webs pensadas para móvil desde el principio?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. La experiencia móvil se trabaja desde el inicio, no se adapta al final.",
    },
  },
  {
    "@type": "Question",
    name: "¿Una web puede conectarse después con automatizaciones o sistemas?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Sí. Muchas webs empiezan como presencia y, más adelante, se conectan a flujos, avisos o herramientas internas. Si eso es lo que buscas ahora, también puedes mirar automatización de procesos.",
    },
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Desarrollo web para negocios",
      url: "https://agithecreator.com/desarrollo-web",
      description:
        "Cómo entiende AGI TheCreator el desarrollo web: claridad, confianza, siguiente paso y base técnica sólida.",
      provider: {
        "@type": "ProfessionalService",
        name: "AGI TheCreator",
        url: "https://agithecreator.com",
      },
      areaServed: {
        "@type": "Country",
        name: "España",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://agithecreator.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Desarrollo web",
          item: "https://agithecreator.com/desarrollo-web",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqEntities,
    },
  ],
};

export const metadata: Metadata = {
  title: "Desarrollo web para negocios | AGI TheCreator",
  description:
    "Cómo entendemos el desarrollo web: claridad, confianza y un siguiente paso sencillo. Criterio, base técnica y evolución hacia sistemas cuando hace falta.",
  alternates: { canonical: "/desarrollo-web" },
  openGraph: {
    title: "Desarrollo web para negocios | AGI TheCreator",
    description:
      "Una web con función clara: entender qué haces, transmitir confianza y facilitar el siguiente paso.",
    url: "https://agithecreator.com/desarrollo-web",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: desarrollo web para negocios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desarrollo web para negocios | AGI TheCreator",
    description:
      "Criterio, claridad y base técnica. Sin relleno disfrazado de contenido.",
    images: ["/og-image.png"],
  },
};

export default function DesarrolloWebPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <DesarrolloWebContent />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
