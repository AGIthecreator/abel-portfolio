import type { LabActivationState } from "./session";
import type { LabDecision } from "./types";

/**
 * Casos de la ruta corta. El mensaje está escrito para que el clasificador
 * real elija la ruta que corresponde. No inventan cifras.
 */
export type LabCaseId = "reservas" | "correos" | "documentos" | "presupuestos";

export interface LabFlowStep {
  title: string;
  line: string;
}

export interface LabCase {
  id: LabCaseId;
  title: string;
  pain: string;
  /** Lo que le llega a cualquiera, sin un caso inventado. */
  inbound: string;
  /** Lo que alguien acabaría copiando a mano. */
  manual: readonly [string, string, string];
  /** Qué queda resuelto cuando el envío real ha salido. */
  result: string;
  /** Tres hechos concretos de ese trabajo ya resuelto. */
  kept: readonly [string, string, string];
  /** Camino visible, de izquierda a derecha. */
  flow: readonly [LabFlowStep, LabFlowStep, LabFlowStep, LabFlowStep];
  time: string;
  day: string;
  hands: string;
  message: string;
  twist: LabDecision;
}

export const LAB_CASES: readonly LabCase[] = [
  {
    id: "reservas",
    title: "Reservas y citas",
    pain: "Llegan por el móvil y luego las pasas a la agenda.",
    inbound: "Hola, ¿tenéis hueco esta semana?",
    manual: ["Nombre", "Día y hora", "Cuántos vienen"],
    result: "La reserva queda apuntada. Ya no hay que copiarla.",
    kept: [
      "Hueco pedido esta semana",
      "Nombre, día y hora anotados",
      "Sin pasarla del móvil a la agenda",
    ],
    flow: [
      { title: "Mensaje", line: "Piden un hueco." },
      { title: "Agenda", line: "El hueco se anota solo." },
      { title: "Correo", line: "Sale la confirmación." },
      { title: "Listo", line: "La reserva queda guardada." },
    ],
    time: "Dejas de copiar cada reserva a mano y de acordarte del recordatorio.",
    day: "Entra un mensaje pidiendo hora. Se queda ahí hasta que alguien lo ve, lo anota y responde.",
    hands: "Hoy lo hace quien tenga el teléfono delante.",
    message:
      "Tengo muchas reservas y citas que apunto a mano en la agenda.",
    twist: {
      id: "caso-reservas",
      context: "La hora que piden ya está ocupada.",
      question: "¿Qué debería hacer el sistema?",
      reading:
        "Cuando el hueco no existe, el proceso tiene que decir algo. Si no, el cliente se queda sin respuesta.",
      options: [
        {
          id: "alternatives",
          label: "Ofrecer otro hueco cercano.",
          consequence:
            "La persona sigue adelante sin esperar a que alguien mire la agenda.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "notify",
          label: "Avisar a alguien del equipo, con la hora ya anotada.",
          consequence:
            "Se resuelve bien, pero vuelve a ocupar el rato de una persona.",
          handsOff: true,
          raisesException: true,
        },
        {
          id: "reject",
          label: "Decir que no hay sitio y cerrar.",
          consequence: "Se ahorra el mensaje, y se pierde la reserva.",
          handsOff: false,
          raisesException: true,
        },
      ],
    },
  },
  {
    id: "correos",
    title: "Correos y solicitudes",
    pain: "Se acumulan, y a veces contestas dos veces.",
    inbound: "Buenos días, quería información.",
    manual: ["Quién escribe", "Qué pide", "Si ya contesté"],
    result: "La solicitud queda guardada y no sale dos veces.",
    kept: [
      "Quién escribió, anotado",
      "Pedía información",
      "Una respuesta, no dos",
    ],
    flow: [
      { title: "Mensaje", line: "Alguien pide información." },
      { title: "Bandeja", line: "La solicitud se guarda una vez." },
      { title: "Correo", line: "Sale una sola respuesta." },
      { title: "Listo", line: "Nadie contesta dos veces." },
    ],
    time: "Dejas de revisar el buzón para saber quién escribió y quién sigue esperando.",
    day: "Entra un correo. Si nadie lo ve, se enfría. Si lo ven dos personas, salen dos respuestas.",
    hands: "Hoy depende de quién abra el correo primero.",
    message:
      "Los clientes me escriben y a veces contesto dos veces o se me olvida el mensaje.",
    twist: {
      id: "caso-correos",
      context: "El mismo email vuelve a escribir a los pocos minutos.",
      question: "¿Qué debería hacer el sistema?",
      reading:
        "Repetir el aviso no ayuda. El proceso puede reconocer el correo y parar.",
      options: [
        {
          id: "stop",
          label: "No enviar otro aviso ni otra confirmación.",
          consequence:
            "Nadie recibe dos veces lo mismo. La solicitud que ya estaba sigue en su sitio.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "again",
          label: "Tratarlo como si fuera nuevo.",
          consequence:
            "El equipo recibe otro aviso del mismo asunto y el cliente, otro correo.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "person",
          label: "Parar y pedir que lo mire una persona.",
          consequence:
            "Nada se duplica, pero alguien tiene que decidir si responde.",
          handsOff: true,
          raisesException: true,
        },
      ],
    },
  },
  {
    id: "documentos",
    title: "Facturas y documentos",
    pain: "El PDF entra y el dato lo copias tú.",
    inbound: "Adjuntamos la factura de este mes.",
    manual: ["De quién es", "Importe", "Dónde guardarla"],
    result: "La factura queda registrada. Nadie la copia a una hoja.",
    kept: [
      "Factura de este mes",
      "Importe y origen anotados",
      "Sin copiarla a una hoja",
    ],
    flow: [
      { title: "Factura", line: "Llega el documento." },
      { title: "Registro", line: "El dato se apunta solo." },
      { title: "Correo", line: "Sale el aviso." },
      { title: "Listo", line: "La factura queda archivada." },
    ],
    time: "Dejas de abrir cada factura para copiarla en una hoja o en una carpeta.",
    day: "Llega una factura. Alguien la abre y pasa el dato a mano.",
    hands: "Hoy lo hace quien lleve los papeles, cuando saca el rato.",
    message:
      "Cada semana me llegan facturas y documentos y los copio a mano en una hoja.",
    twist: {
      id: "caso-documentos",
      context: "La factura llega, pero falta el importe o no se lee bien.",
      question: "¿Qué debería hacer el sistema?",
      reading:
        "Un papel a medias no se archiva como si estuviera bien. El proceso puede pedirlo o pasarlo a una persona.",
      options: [
        {
          id: "ask",
          label: "Pedir el dato que falta antes de archivarla.",
          consequence:
            "No entra una factura incompleta. Cuando llega el dato, sigue sola.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "file",
          label: "Archivarla igual y seguir.",
          consequence:
            "El montón baja, y luego hay que rehacer la que no cuadraba.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "person",
          label: "Dejarla aparte y avisar a quien lleva las cuentas.",
          consequence:
            "La factura no se pierde. Alguien la revisa con el correo ya guardado.",
          handsOff: true,
          raisesException: true,
        },
      ],
    },
  },
  {
    id: "presupuestos",
    title: "Presupuestos sin respuesta",
    pain: "Mandas el precio y, si no contestan, se enfría.",
    inbound: "¿Me pasas el presupuesto cuando puedas?",
    manual: ["A quién", "Qué enviaste", "Cuándo insistir"],
    result: "El presupuesto queda anotado, con un solo aviso después.",
    kept: [
      "Presupuesto pedido",
      "A quién y qué se envió, anotado",
      "Un aviso después, sin acordarse",
    ],
    flow: [
      { title: "Petición", line: "Piden el precio." },
      { title: "Ficha", line: "El presupuesto queda anotado." },
      { title: "Aviso", line: "Sale un solo recordatorio." },
      { title: "Listo", line: "El seguimiento ya no depende de acordarse." },
    ],
    time: "Dejas de llevar en la cabeza a quién hay que escribir otra vez.",
    day: "Sale un presupuesto. Si nadie lo apunta, no hay segundo aviso.",
    hands: "Hoy el seguimiento sale solo si alguien se acuerda.",
    message:
      "Envié un presupuesto y una propuesta, y se me olvida hacer el seguimiento.",
    twist: {
      id: "caso-presupuestos",
      context: "Han pasado unos días y el presupuesto sigue sin respuesta.",
      question: "¿Qué debería hacer el sistema?",
      reading:
        "Un solo aviso basta. Insistir cada día, o no decir nada, son las dos formas de perder el trabajo.",
      options: [
        {
          id: "once",
          label: "Enviar un solo recordatorio y anotarlo.",
          consequence:
            "El cliente recibe un aviso. Tú no tienes que acordarte de la fecha.",
          handsOff: false,
          raisesException: false,
        },
        {
          id: "wait",
          label: "No escribir y esperar.",
          consequence:
            "No molestas. Tampoco recuperas el presupuesto que se enfrió.",
          handsOff: false,
          raisesException: true,
        },
        {
          id: "person",
          label: "Avisar a una persona para que decida si insiste.",
          consequence:
            "El caso no se pierde. El rato de pensar el texto sigue siendo de alguien.",
          handsOff: true,
          raisesException: true,
        },
      ],
    },
  },
] as const;

/** Lo que el envío real ha hecho. No convierte un aceptado en un correo ya leído. */
export function describeLabSend(activation: LabActivationState | null): {
  title: string;
  line: string;
  sent: boolean;
} {
  if (!activation) {
    return {
      title: "Aún no hay envío",
      line: "Sin el correo de la prueba no hay automatización que mostrar.",
      sent: false,
    };
  }
  if (activation.duplicate) {
    return {
      title: "Este correo ya se usó",
      line: "Había una solicitud reciente. No sale otra confirmación.",
      sent: false,
    };
  }
  const visitor = activation.actions.find((action) => action.id === "email_visitor");
  const recorded = activation.steps.some(
    (step) => step.id === "registro" && step.status === "done",
  );
  if (visitor?.status === "done" && visitor.executionMode === "real") {
    return {
      title: "Correo enviado",
      line: `La confirmación ha salido hacia ${activation.input.email}. El proveedor la ha aceptado.`,
      sent: true,
    };
  }
  if (visitor?.status === "failed" || visitor?.status === "blocked") {
    return {
      title: "El correo no ha salido",
      line: recorded
        ? "La solicitud sí ha quedado registrada. El envío no se ha aceptado."
        : "El envío no se ha aceptado.",
      sent: false,
    };
  }
  if (recorded) {
    return {
      title: "Solicitud guardada",
      line: "Ha quedado registrada. El correo no figura como enviado.",
      sent: false,
    };
  }
  return {
    title: "No se ha completado",
    line: "El proceso no ha llegado a enviar el correo.",
    sent: false,
  };
}

export function labCaseById(id: LabCaseId): LabCase {
  const found = LAB_CASES.find((item) => item.id === id);
  return found ?? LAB_CASES[0];
}

/** Recupera el caso a partir del mensaje que ya se envió. */
export function inferLabCaseId(message: string): LabCaseId | null {
  const text = message.toLowerCase();
  if (text.includes("factura") || text.includes("documento")) return "documentos";
  if (text.includes("presupuesto") || text.includes("propuesta")) return "presupuestos";
  if (text.includes("reserva") || text.includes("cita") || text.includes("agenda")) {
    return "reservas";
  }
  if (text.trim().length > 0) return "correos";
  return null;
}
