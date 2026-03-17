export type Project = {
  key: "callguard" | "aguarras" | "pucelaticketing";
  title: string;
  description: string;
  status?: "live" | "coming-soon";
  href?: string;
  imageSrc?: string;
  ctaLabel?: string;
  ctaHref?: string;
  securityTag?: string;
  highlightTag?: string;
  architectureSlides?: { url: string; caption: string }[];
  tags: string[];
};

export const projects: Project[] = [
  {
    key: "callguard",
    title: "Callguard",
    description:
      "Arquitectura de privacidad 'Zero-Trust' en app nativa. Filtrado de spam procesado 100% en local, eliminando latencias de nube y garantizando seguridad absoluta del usuario.",
    status: "live",
    href: "#",
    imageSrc: "/projects/callguard.png",
    ctaLabel: "Ver en Play Store",
    ctaHref: "https://play.google.com/store/apps/details?id=com.agithecreator.callguard",
    securityTag: "Privacidad: Procesamiento 100% Local",
    tags: ["React Native", "Privacidad", "Mobile"],
  },
  {
    key: "aguarras",
    title: "Aguarrás Estudio",
    description:
      "Ecosistema digital automatizado para gestión artística. Integración de flujos de trabajo que conectan la plataforma con bases de datos dinámicas, optimizando la gestión de contenido en tiempo real.",
    status: "live",
    href: "https://aguarr-s-estudio-the-artful-space.vercel.app/",
    imageSrc: "/projects/aguarras.jpg",
    ctaLabel: "Visitar Demo",
    ctaHref: "https://aguarr-s-estudio-the-artful-space.vercel.app/",
    highlightTag: "Automatización: Airtable API",
    architectureSlides: [
      {
        url: "/projects/aguarras/10.png",
        caption:
          "Gestión Centralizada: Panel de control y tracking de estados en Airtable.",
      },
      {
        url: "/projects/aguarras/11.png",
        caption:
          "Automatización de Flujos: Escenarios de Make para formularios, login y registros.",
      },
      {
        url: "/projects/aguarras/12.png",
        caption:
          "Orquestación de Procesos: Integración end-to-end de reservas y pagos.",
      },
      {
        url: "/projects/aguarras/13.png",
        caption:
          "Capa de Seguridad: Hashing PBKDF2 y verificación con Cloudflare Workers.",
      },
      {
        url: "/projects/aguarras/14.png",
        caption:
          "Impacto de Negocio: CRM centralizado, logs automáticos y estructura escalable.",
      },
    ],
    tags: ["Vue.js", "Portfolio", "Web"],
  },
  {
    key: "pucelaticketing",
    title: "PucelaTicketing",
    description:
      "Sistema de ticketing de alta seguridad con cifrado End-to-End. Implementación de arquitectura Cloud escalable para garantizar transacciones íntegras en entornos de alta demanda.",
    status: "coming-soon",
    href: "#",
    imageSrc: "/projects/pucelaticketing.jpg",
    ctaLabel: "Solicitar Review Técnico",
    ctaHref: "mailto:contacto@agithecreator.com?subject=Review%20t%C3%A9cnico%20-%20PucelaTicketing",
    securityTag: "Seguridad: Cifrado End-to-End",
    tags: ["Supabase", "Airtable", "Cifrado"],
  },
];

export type SocialLink = {
  label: string;
  href: string;
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/AGIthecreator" },
  { label: "LinkedIn", href: "#" },
];
