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
    href: "https://www.agithecreator.com/",
    imageSrc: "/projects/aguarras.jpg",
    ctaLabel: "Visitar Demo",
    ctaHref: "https://www.agithecreator.com/",
    highlightTag: "Automatización: Airtable API",
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