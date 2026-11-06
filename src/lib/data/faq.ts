export type FaqTextPart =
  | { kind: "text"; value: string }
  | { kind: "highlight"; value: string; accent: "bone" | "violet" };

export type FaqLink = {
  phrase: string;
  href: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  links?: readonly FaqLink[];
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Cuánto tarda una web?",
    answer:
      "Depende del alcance y del material disponible. Los plazos se acuerdan al cerrar el presupuesto, no hay una cifra única.",
  },
  {
    question: "¿Solo trabajas en Valladolid?",
    answer:
      "No. Trabajo con negocios de toda España. La base está en Valladolid, y el detalle de desarrollo web en Valladolid está en su página cuando el proyecto es de aquí.",
    links: [
      {
        phrase: "desarrollo web en Valladolid",
        href: "/desarrollo-web-valladolid",
      },
    ],
  },
  {
    question: "¿La web funciona bien en móvil?",
    answer:
      "Sí. La experiencia móvil se trabaja desde el principio, no se adapta cuando todo está terminado.",
  },
  {
    question: "¿Puedo pedir cambios después?",
    answer:
      "Sí. Los ajustes pequeños se pueden ver después de publicar. Si el alcance crece, se presupuesta aparte.",
  },
  {
    question: "¿Incluyes dominio y hosting?",
    answer:
      "Ayudo con la configuración. El coste de dominio e infraestructura va en el presupuesto; no se asume gratis.",
  },
  {
    question: "¿También haces automatizaciones?",
    answer:
      "Sí. Hago automatizaciones: formularios, reservas, procesos y sistemas que reduzcan trabajo repetitivo.",
    links: [{ phrase: "automatizaciones", href: "/automatizacion-de-procesos" }],
  },
];

export const FAQ_EDITORIAL_LEAD: FaqTextPart[] = [
  {
    kind: "text",
    value:
      "Elegir quién va a construir algo para tu ",
  },
  { kind: "highlight", value: "negocio", accent: "bone" },
  {
    kind: "text",
    value:
      " no debería sentirse como entrar en una reunión llena de palabras raras y promesas enormes.",
  },
];

export const FAQ_EDITORIAL_BODY: FaqTextPart[] = [
  { kind: "text", value: "Al final buscas algo bastante más simple:\n\nque te entiendan, que te digan las cosas " },
  { kind: "highlight", value: "claras", accent: "violet" },
  {
    kind: "text",
    value: " y que aquello que se construya tenga sentido para tu ",
  },
  { kind: "highlight", value: "negocio", accent: "bone" },
  { kind: "text", value: ".\n\nEl resto viene después." },
];

export const FAQ_TRUST_LINE: FaqTextPart[] = [
  { kind: "text", value: "Cuestión de " },
  { kind: "highlight", value: "confianza", accent: "violet" },
  { kind: "text", value: "." },
];
