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
] as const;
