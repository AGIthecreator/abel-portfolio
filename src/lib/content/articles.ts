import { OPERATOR } from "@/lib/contact/info";

export const RESOURCE_CATEGORIES = [
  {
    id: "web",
    title: "Web y presencia digital",
  },
  {
    id: "automatizacion",
    title: "Automatización",
  },
  {
    id: "sistemas",
    title: "Sistemas para negocios",
  },
] as const;

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"];

export type InlinePart =
  | string
  | { href: string; label: string }
  | { accent: string };

export type ArticleBlock =
  | { type: "p"; parts: InlinePart[] }
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "ul"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  categoryId: ResourceCategoryId;
  featured?: boolean;
  author: string;
  image: { src: string; alt: string };
  blocks: ArticleBlock[];
};

const AUTHOR = `${OPERATOR.fullName}, AGI TheCreator`;

function textOf(part: InlinePart): string {
  if (typeof part === "string") return part;
  if ("accent" in part) return part.accent;
  return part.label;
}

export function articlePlainText(article: Article): string {
  return article.blocks
    .flatMap((block) => {
      if (block.type === "p") return block.parts.map(textOf);
      if (block.type === "ul") return block.items;
      return [block.text];
    })
    .join(" ");
}

/** Palabras reales del artículo, a un ritmo de lectura en español. */
export function readingMinutes(article: Article): number {
  const words = articlePlainText(article).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 210));
}

export function categoryTitle(id: ResourceCategoryId): string {
  return RESOURCE_CATEGORIES.find((category) => category.id === id)?.title ?? id;
}

export function articlePath(slug: string): string {
  return `/recursos/articulos/${slug}`;
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function relatedArticles(slug: string): Article[] {
  return ARTICLES.filter((article) => article.slug !== slug);
}

export const ARTICLES: readonly Article[] = [
  {
    slug: "que-tareas-automatizar",
    title: "Qué tareas de un negocio merece la pena automatizar y cuáles no",
    description:
      "Cómo distinguir un proceso repetible de una decisión que sigue necesitando a una persona, antes de montar un flujo.",
    categoryId: "automatizacion",
    featured: true,
    author: AUTHOR,
    image: {
      src: "/recursos/tareas.jpg",
      alt: "Formularios de papel repetidos en fila sobre una mesa oscura, con uno separado del resto.",
    },
    blocks: [
      {
        type: "p",
        parts: [
          "Automatizar no es quitar personas del negocio. Es dejar de repetir a mano un paso que ya tiene reglas claras. Si el paso cambia cada vez, o depende de un criterio que no sabes explicar, automatizarlo solo esconde el problema.",
        ],
      },
      {
        type: "h2",
        id: "repetitiva",
        text: "Qué tiene una tarea repetitiva",
      },
      {
        type: "p",
        parts: [
          "Una tarea merece mirarse cuando se reconoce sin esfuerzo: entra siempre por el mismo sitio, pide los mismos datos y termina en la misma acción. El contenido cambia. La forma, no.",
        ],
      },
      {
        type: "ul",
        items: [
          "Se hace varias veces por semana, no una vez al año.",
          "Los pasos se pueden contar en voz alta sin excepciones raras en cada frase.",
          "El error habitual es de copia, de olvido o de aviso tardío, no de juicio.",
          "Alguien ya sabe qué debería pasar si la información llega bien.",
        ],
      },
      {
        type: "h2",
        id: "candidatos",
        text: "Procesos que suelen ser buenos candidatos",
      },
      {
        type: "p",
        parts: [
          "En un negocio pequeño, los candidatos de verdad se parecen entre sí. Alguien pide algo, hay que registrarlo, avisar y no perder el hilo.",
        ],
      },
      {
        type: "ul",
        items: [
          "Solicitudes que llegan por formulario, email o WhatsApp y acaban copiadas en otro sitio.",
          "Reservas con confirmación, hueco y recordatorio.",
          "Seguimiento de quien escribió y no recibió respuesta.",
          "Clasificación simple: tipo de consulta, urgencia o a quién le toca.",
          "Avisos internos cuando algo cambia de estado.",
        ],
      },
      {
        type: "p",
        parts: [
          "El detalle de cómo se plantea un flujo así está en ",
          { href: "/automatizacion-de-procesos", label: "automatización de procesos" },
          ".",
        ],
      },
      {
        type: "h2",
        id: "personas",
        text: "Cuándo la decisión sigue siendo humana",
      },
      {
        type: "p",
        parts: [
          "Hay trabajo que se repite y, aun así, no conviene encerrarlo en una regla. Si cada caso pide mirar el contexto, negociar o asumir un riesgo, una automatización solo acelera una respuesta mala.",
        ],
      },
      {
        type: "ul",
        items: [
          "Presupuestos que dependen de ver el sitio, el material o una excepción.",
          "Quejas, conflictos o clientes que no encajan en el servicio.",
          "Decisiones de precio, descuento o prioridad cuando no hay un criterio escrito.",
          "Cualquier paso en el que «depende» sea la respuesta honesta.",
        ],
      },
      {
        type: "p",
        parts: [
          "En esos casos conviene automatizar alrededor: registrar, avisar y dejar la decisión a la persona. No sustituirla.",
        ],
      },
      {
        type: "h2",
        id: "valorar",
        text: "Frecuencia, tiempo, errores y complejidad",
      },
      {
        type: "p",
        parts: [
          "Cuatro preguntas bastan para no enamorarse de una herramienta.",
        ],
      },
      {
        type: "ul",
        items: [
          "Frecuencia. Una tarea de diez minutos al día pesa más que una de dos horas al mes.",
          "Tiempo. Cuenta la ejecución y también el rato de buscar el dato o rehacerlo.",
          "Errores. Si un olvido cuesta una cita, un cliente o una factura, el proceso importa aunque dure poco.",
          "Complejidad. Cuantas más excepciones, más supervisión vas a necesitar después.",
        ],
      },
      {
        type: "p",
        parts: [
          "Un flujo barato de mantener gana a un sistema brillante que solo entiende quien lo construyó. Si no puedes explicar la regla en pocas frases, todavía no está lista para automatizarse.",
        ],
      },
      {
        type: "h2",
        id: "ejemplos",
        text: "Ejemplos que se ven en negocios reales",
      },
      {
        type: "h3",
        id: "solicitudes",
        text: "Solicitudes",
      },
      {
        type: "p",
        parts: [
          "Llega un mensaje, se guarda con nombre y motivo, y la persona responsable recibe un aviso. La respuesta puede seguir siendo tuya. Lo que desaparece es el «se me pasó».",
        ],
      },
      {
        type: "h3",
        id: "reservas",
        text: "Reservas",
      },
      {
        type: "p",
        parts: [
          "El hueco, la confirmación y el recordatorio pueden ir solos si el horario y las normas están definidos. Si cada reserva se negocia, el formulario solo recoge la petición.",
        ],
      },
      {
        type: "h3",
        id: "seguimiento",
        text: "Seguimiento y clasificación",
      },
      {
        type: "p",
        parts: [
          "Clasificar una consulta por tipo y crear un recordatorio a los dos días es un flujo corto. Decidir si ese cliente encaja sigue siendo trabajo de alguien que conoce el negocio.",
        ],
      },
      {
        type: "h2",
        id: "sencilla",
        text: "Cuándo basta una automatización sencilla",
      },
      {
        type: "p",
        parts: [
          "Basta cuando hay una entrada, una regla y una acción. Formulario a aviso. Reserva a confirmación. Estado a email. No hace falta una aplicación propia ni un modelo de inteligencia artificial.",
        ],
      },
      {
        type: "p",
        parts: [
          "Tampoco hace falta conectar cinco herramientas el primer día. Si el proceso cabe en un solo flujo y alguien puede revisarlo cuando falle, empieza por ahí.",
        ],
      },
      {
        type: "h2",
        id: "sistema",
        text: "Cuándo hace falta un sistema más específico",
      },
      {
        type: "p",
        parts: [
          "Hace falta cuando los datos viven en varios sitios, varias personas los modifican y las reglas ya no caben en un aviso. Permisos, historial, estados o un panel interno son señales de sistema, no de un flujo suelto.",
        ],
      },
      {
        type: "p",
        parts: [
          "Automatizar todo es una mala meta. La útil es esta: quitar el trabajo repetido que ya sabes hacer igual, y dejar en manos de una persona lo que de verdad cambia de un caso a otro.",
        ],
      },
    ],
  },
  {
    slug: "web-a-medida-o-herramienta",
    title: "Web a medida o herramienta existente: cómo elegir",
    description:
      "Cuándo una herramienta que ya existe resuelve el problema, y cuándo de verdad hace falta una web, una integración o un sistema propio.",
    categoryId: "sistemas",
    author: AUTHOR,
    image: {
      src: "/recursos/web.jpg",
      alt: "Un portátil apagado de texto junto a un cuaderno y un lápiz, sobre una mesa oscura.",
    },
    blocks: [
      {
        type: "p",
        parts: [
          "La pregunta no es qué tecnología es más moderna. Es qué problema tienes y qué parte de ese problema ya está resuelta por algo que puedes usar mañana.",
        ],
      },
      {
        type: "h2",
        id: "existente",
        text: "Qué puede resolver una herramienta existente",
      },
      {
        type: "p",
        parts: [
          "Reservas, newsletter, cobro simple, un formulario o un catálogo pequeño suelen existir ya, con un precio de suscripción y un límite claro. Si el proceso cabe dentro de ese límite y no necesitas que hable con el resto del negocio, no hace falta desarrollarlo.",
        ],
      },
      {
        type: "ul",
        items: [
          "El flujo es el que la herramienta ya trae, sin excepciones propias.",
          "Los datos no tienen que volver a otro sistema cada día.",
          "Te vale el diseño y el control que ofrece, aunque no sea exactamente el tuyo.",
          "El coste mensual es menor que mantener un desarrollo propio.",
        ],
      },
      {
        type: "h2",
        id: "web",
        text: "Cuándo una web convencional es suficiente",
      },
      {
        type: "p",
        parts: [
          "Si el objetivo es que te encuentren, entiendan qué haces y den un paso ",
          { accent: "-escribir, llamar o reservar-" },
          ", una web bien planteada basta. No necesita un área privada ni una base de datos propia.",
        ],
      },
      {
        type: "p",
        parts: [
          "En ",
          { href: "/desarrollo-web", label: "desarrollo web" },
          " el criterio es ese: claridad, confianza y un siguiente paso. El resto se añade cuando el negocio lo pide, no al revés.",
        ],
      },
      {
        type: "h2",
        id: "integraciones",
        text: "Cuándo hacen falta integraciones o una base de datos",
      },
      {
        type: "p",
        parts: [
          "La señal aparece cuando la web ya no es solo una presentación. Alguien rellena un formulario y ese dato tiene que quedar registrado, clasificado o enviado a otra herramienta sin copiarlo a mano.",
        ],
      },
      {
        type: "ul",
        items: [
          "Hay más de un canal de entrada y la información se pierde entre ellos.",
          "Varias personas consultan el mismo listado y no puede vivir en un chat.",
          "El estado de una solicitud importa: nueva, respondida, cerrada.",
          "El volumen ya no cabe en una hoja que alguien actualiza cuando se acuerda.",
        ],
      },
      {
        type: "p",
        parts: [
          "A veces eso es una integración corta. A veces es una tabla propia. No es lo mismo, y no conviene saltar a la segunda si la primera resuelve el caso.",
        ],
      },
      {
        type: "h2",
        id: "propio",
        text: "Cuándo tiene sentido un sistema propio",
      },
      {
        type: "p",
        parts: [
          "Un sistema propio compensa cuando la forma de trabajar es tuya y las herramientas generales obligan a rodeos constantes. Permisos, reglas de negocio, un panel para el equipo o datos que no quieres dejar en cinco suscripciones distintas.",
        ],
      },
      {
        type: "p",
        parts: [
          "También compensa cuando el coste de adaptar una herramienta ",
          { accent: "-en tiempo, en límites o en trabajo manual-" },
          " ya es mayor que construir la pieza que falta. No antes.",
        ],
      },
      {
        type: "h2",
        id: "preguntas",
        text: "Preguntas antes de invertir",
      },
      {
        type: "ul",
        items: [
          "¿Qué tiene que ocurrir al final, en una frase?",
          "¿Quién lo usa y con qué frecuencia?",
          "¿Qué pasa hoy, paso a paso, y dónde se rompe?",
          "¿Hay una herramienta que ya haga el 80 % sin forzar el proceso?",
          "¿Qué datos tienen que quedarse y quién puede verlos?",
          "¿Qué estarías dispuesto a no tener en la primera versión?",
        ],
      },
      {
        type: "p",
        parts: [
          "Si la primera frase no sale, todavía no hay un encargo. Hay una idea. Se puede hablar, pero no conviene presupuestar un sistema.",
        ],
      },
      {
        type: "h2",
        id: "evitar",
        text: "Cómo no construir de más",
      },
      {
        type: "p",
        parts: [
          "El error habitual es encargar una aplicación porque la web «se queda corta», sin decir en qué. Una página con un formulario bien conectado resuelve más casos que un panel que nadie abre.",
        ],
      },
      {
        type: "p",
        parts: [
          "Empieza por el camino más corto que deje el problema resuelto. Si más adelante el volumen o las reglas crecen, esa versión simple sirve de base. No al revés: no construyas la base por si algún día hace falta.",
        ],
      },
      {
        type: "p",
        parts: [
          "Si ya tienes el caso encima de la mesa, se puede ",
          { href: "/presupuesto", label: "preparar un presupuesto" },
          " con el alcance que de verdad corresponde.",
        ],
      },
    ],
  },
  {
    slug: "rediseno-o-mejora",
    title: "Rediseñar una web o mejorar la actual: cómo saber qué necesitas",
    description:
      "Señales para distinguir un problema de diseño, de contenido, de estructura o de rendimiento antes de tirar la web y empezar de cero.",
    categoryId: "web",
    author: AUTHOR,
    image: {
      src: "/recursos/articulo-rediseno.jpg",
      alt: "Un monitor apagado junto a una lámina en color hueso, sobre una mesa oscura.",
    },
    blocks: [
      {
        type: "p",
        parts: [
          "«Hay que rehacerla» es una conclusión, no un diagnóstico. A veces la web falla en una sola capa. Cambiar las cuatro a la vez cuesta más y puede perder lo que ya funcionaba.",
        ],
      },
      {
        type: "h2",
        id: "senales",
        text: "Señales de que hace falta una revisión",
      },
      {
        type: "ul",
        items: [
          "Quien llega no entiende qué ofreces en los primeros segundos.",
          "El móvil se usa mal: texto pequeño, botones lejos, formularios que no se pueden enviar.",
          "La gente pregunta por teléfono cosas que la web debería responder.",
          "Las páginas importantes no aparecen cuando buscas el nombre del negocio o el servicio.",
          "Tarda, se rompe en el móvil o depende de un acceso que ya no controlas.",
        ],
      },
      {
        type: "p",
        parts: [
          "Una de estas señales no obliga a reconstruir. Varias, sostenidas, sí piden una revisión seria. El orden importa: primero qué falla, después cuánto hay que tocar.",
        ],
      },
      {
        type: "h2",
        id: "capas",
        text: "Diseño, contenido, estructura y rendimiento no son lo mismo",
      },
      {
        type: "h3",
        id: "diseno",
        text: "Diseño",
      },
      {
        type: "p",
        parts: [
          "El diseño falla cuando la página se ve descuidada, no se lee o no dirige la mirada a un paso. Se puede corregir sin cambiar la información de fondo.",
        ],
      },
      {
        type: "h3",
        id: "contenido",
        text: "Contenido",
      },
      {
        type: "p",
        parts: [
          "El contenido falla cuando el texto habla de la empresa y no del problema del cliente, o cuando faltan precios orientativos, servicios y una forma de contacto. Una capa visual nueva no arregla un texto que no dice nada.",
        ],
      },
      {
        type: "h3",
        id: "estructura",
        text: "Estructura",
      },
      {
        type: "p",
        parts: [
          "La estructura falla cuando hay páginas de más, nombres que no se entienden o la información útil está enterrada. A veces basta con reordenar y quitar. A veces el mapa de la web ya no sirve.",
        ],
      },
      {
        type: "h3",
        id: "rendimiento",
        text: "Rendimiento y base técnica",
      },
      {
        type: "p",
        parts: [
          "Si tarda, no se puede editar o el hosting está atado a alguien que ya no responde, el problema no es el color del botón. Hay que mirar la base antes de maquillarla.",
        ],
      },
      {
        type: "h2",
        id: "antes",
        text: "Qué revisar antes de empezar de cero",
      },
      {
        type: "ul",
        items: [
          "Qué páginas reciben visitas y cuáles no abre nadie.",
          "Qué frases ya rankean o ya están enlazadas desde fuera.",
          "Qué textos, fotos y pruebas sirven y cuáles son relleno.",
          "Si puedes entrar al dominio, al correo y a la herramienta con la que se editó.",
          "Qué tiene que seguir pasando igual el día después del cambio: formulario, reserva, tienda, ficha de Google.",
        ],
      },
      {
        type: "p",
        parts: [
          "Esa revisión cabe en ",
          { href: "/desarrollo-web", label: "el planteamiento de una web" },
          " antes de decidir si se toca una parte o se rehace.",
        ],
      },
      {
        type: "h2",
        id: "parcial",
        text: "Cuándo basta una intervención parcial",
      },
      {
        type: "p",
        parts: [
          "Basta cuando la base es sana y el fallo está localizado. Reescribir la portada, arreglar el móvil, cambiar el formulario o ordenar el menú. El resto de las URLs puede quedarse.",
        ],
      },
      {
        type: "p",
        parts: [
          "También basta cuando el negocio no ha cambiado de oferta. Si vendes lo mismo y la gente no lo entiende, el trabajo es de claridad, no de arquitectura nueva.",
        ],
      },
      {
        type: "h2",
        id: "reconstruir",
        text: "Cuándo compensa reconstruir",
      },
      {
        type: "p",
        parts: [
          "Compensa cuando la oferta cambió y la web sigue contando el negocio anterior. O cuando no puedes editarla, cada cambio rompe otra cosa, o el móvil y la velocidad ya no tienen arreglo razonable encima de lo que hay.",
        ],
      },
      {
        type: "p",
        parts: [
          "Reconstruir no significa borrar el historial. Las direcciones que ya usan tus clientes y los buscadores se conservan o se redirigen. El texto que sí explica el servicio se reescribe, no se tira por estar en la web vieja.",
        ],
      },
      {
        type: "h2",
        id: "conservar",
        text: "Qué conviene conservar",
      },
      {
        type: "ul",
        items: [
          "URLs que ya tienen visitas, enlaces o fichas externas.",
          "Contenido que responde una duda real, aunque haya que editarlo.",
          "Pruebas, casos y datos del propio negocio. No hace falta inventar otros.",
          "El dominio y el correo, que son del negocio y no de la web.",
        ],
      },
      {
        type: "p",
        parts: [
          "Una web nueva que cambia todas las direcciones sin avisar puede perder lo poco que ya funcionaba. El rediseño tiene que dejar el sitio encontrable, no solo más bonito.",
        ],
      },
      {
        type: "p",
        parts: [
          "Si ya sabes qué falla y qué quieres conservar, se puede ",
          { href: "/presupuesto", label: "cerrar el alcance en un presupuesto" },
          " sin dar por hecho que hay que empezar de cero.",
        ],
      },
    ],
  },
];
