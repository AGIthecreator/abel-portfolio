export type FaqTextPart =
  | { kind: "text"; value: string }
  | { kind: "highlight"; value: string; accent: "bone" | "violet" };

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Cuánto tarda una web?",
    answer:
      "Depende del proyecto, aunque no me gusta alargar procesos innecesarios. Lo normal suele estar entre una y tres semanas.",
  },
  {
    question: "¿Solo trabajas en Valladolid?",
    answer:
      "Trabajo desde Valladolid, aunque puedo trabajar con cualquier proyecto donde haya una buena conexión y una buena idea.",
  },
  {
    question: "¿La web funciona bien en móvil?",
    answer:
      "Sí. La experiencia móvil se trabaja desde el principio, no se adapta cuando todo está terminado.",
  },
  {
    question: "¿Puedo pedir cambios después?",
    answer:
      "Sí. La idea es construir algo que pueda crecer contigo y adaptarse con el tiempo.",
  },
  {
    question: "¿Incluyes dominio y hosting?",
    answer: "Puedo ayudarte con toda la configuración y dejarlo listo para funcionar.",
  },
  {
    question: "¿También haces automatizaciones?",
    answer:
      "Sí. Formularios, reservas, procesos y sistemas que reduzcan trabajo repetitivo.",
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
