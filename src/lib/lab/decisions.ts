import type { LabDecision, LabException } from "./types";

/**
 * Acto 2. Escenario de reservas en una clínica.
 *
 * No hay respuesta correcta: cada opción tiene una consecuencia distinta y el
 * sistema reacciona a ella. Lo que se aprende es la lógica, no el acierto.
 */
export const CLINIC_DECISIONS: readonly LabDecision[] = [
  {
    id: "clinic-1",
    context: "Laura solicita una primera consulta para el martes a las 17:00.",
    question: "¿Qué debería hacer el sistema?",
    reading:
      "Una primera consulta no es una revisión: dura más y a veces necesita criterio humano. La decisión cambia el resto del flujo.",
    options: [
      {
        id: "auto",
        label: "Comprobar disponibilidad y confirmar automáticamente.",
        consequence:
          "Laura recibe la confirmación en segundos. A cambio, el proceso asume que una primera consulta cabe en cualquier hueco libre.",
        handsOff: false,
        raisesException: false,
      },
      {
        id: "register",
        label: "Registrar la solicitud y avisar al equipo.",
        consequence:
          "Nada se pierde y nadie confirma algo que no debería. La contrapartida es que Laura espera a que alguien mire la agenda.",
        handsOff: false,
        raisesException: false,
      },
      {
        id: "hold",
        label: "No continuar hasta que intervenga una persona.",
        consequence:
          "Máximo control, pero el proceso deja de aportar: vuelve a depender de que alguien esté delante del ordenador.",
        handsOff: true,
        raisesException: false,
      },
    ],
  },
  {
    id: "clinic-2",
    context: "La hora solicitada ya está ocupada.",
    question: "¿Qué debería ocurrir ahora?",
    reading:
      "Aquí es donde se ve si la automatización sirve: lo esperado ya no se puede hacer y el proceso tiene que saber qué hacer igualmente.",
    options: [
      {
        id: "alternatives",
        label: "Ofrecer alternativas automáticamente.",
        consequence:
          "El proceso propone dos huecos cercanos. Laura sigue avanzando sin que nadie intervenga y la excepción se resuelve sola.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "notify",
        label: "Avisar al equipo.",
        consequence:
          "La solicitud llega a una persona con el contexto ya preparado. Se resuelve bien, pero consume tiempo de alguien.",
        handsOff: true,
        raisesException: true,
      },
      {
        id: "reject",
        label: "Rechazar la solicitud.",
        consequence:
          "El proceso cierra el caso y Laura se va. Automatizar así ahorra trabajo y pierde clientes.",
        handsOff: false,
        raisesException: true,
      },
    ],
  },
  {
    id: "clinic-3",
    context: "Falta el teléfono de contacto y sin él no se puede confirmar la cita.",
    question: "¿Qué debería ocurrir ahora?",
    reading:
      "Un dato que falta es una excepción resoluble: el proceso puede pedir lo que necesita y seguir.",
    options: [
      {
        id: "continue",
        label: "Seguir igual y confirmar sin el teléfono.",
        consequence:
          "El proceso no se detiene, pero confirma algo que luego no se puede avisar. La excepción se empuja hacia adelante.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "ask",
        label: "Pedir el dato que falta antes de continuar.",
        consequence:
          "Laura recibe una pregunta concreta. Cuando responde, el proceso sigue solo. La excepción se resuelve dentro de la automatización.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "pause",
        label: "Parar y esperar a que alguien lo complete a mano.",
        consequence:
          "Nada se rompe, pero el proceso deja de avanzar hasta que una persona mire el caso.",
        handsOff: true,
        raisesException: true,
      },
    ],
  },
  {
    id: "clinic-4",
    context:
      "Laura escribe: «No es una revisión, es otra cosa. No sé cómo explicarlo.» El motivo no encaja en ninguna categoría.",
    question: "¿Qué debería hacer el sistema?",
    reading:
      "Clasificar mal es peor que no clasificar. Si la regla no alcanza, el proceso tiene que reconocerlo.",
    options: [
      {
        id: "force",
        label: "Forzar la categoría más cercana.",
        consequence:
          "El caso entra en un cubo que no le corresponde. El equipo recibe algo ordenado… y equivocado.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "list",
        label: "Pedir que elija de una lista cerrada.",
        consequence:
          "A veces basta. Otras veces Laura no encuentra su caso y el proceso se queda a medias.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "unclassified",
        label: "Marcarlo como no clasificable y avisar a una persona.",
        consequence:
          "El proceso admite el límite de sus reglas y entrega el contexto. Una persona decide el siguiente paso.",
        handsOff: true,
        raisesException: true,
      },
    ],
  },
  {
    id: "clinic-5",
    context:
      "El caso necesita criterio clínico. Ninguna regla cierra esto con seguridad.",
    question: "¿Qué debería hacer el sistema ahora?",
    reading:
      "Automatizar también significa saber cuándo parar. Cuando el proceso necesita criterio, interviene una persona.",
    options: [
      {
        id: "generic",
        label: "Cerrar el caso con una respuesta genérica.",
        consequence:
          "El proceso termina rápido y responde mal. Seguir a toda costa genera errores con cara de eficiencia.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "retry",
        label: "Pedir más datos y reintentar.",
        consequence:
          "A veces desbloquea. Otras veces solo retrasa el momento en que una persona tenía que entrar.",
        handsOff: false,
        raisesException: true,
      },
      {
        id: "handoff",
        label: "Parar y pasar el caso a una persona, con el contexto ya reunido.",
        consequence:
          "El proceso no insiste. Una persona decide; la automatización le entrega lo que ya ha hecho.",
        handsOff: true,
        raisesException: true,
      },
    ],
  },
] as const;

/** Excepciones que el Acto 2 modela de forma explícita. */
export const CLINIC_EXCEPTIONS: readonly LabException[] = [
  {
    id: "slot-taken",
    trigger: "La hora pedida ya está ocupada",
    resolvable: true,
    resolution: "El proceso ofrece los dos huecos más cercanos.",
  },
  {
    id: "missing-data",
    trigger: "Falta el teléfono de contacto",
    resolvable: true,
    resolution: "El proceso lo pide antes de seguir.",
  },
  {
    id: "clinical-doubt",
    trigger: "El motivo de la consulta no encaja en ninguna categoría",
    resolvable: false,
    resolution: "Pasa a una persona con todo el contexto ya reunido.",
  },
] as const;

export const EXCEPTION_FLOW = [
  "Automatización",
  "Excepción",
  "¿Se puede resolver?",
  "Sí · Acción",
  "No · Persona",
] as const;
