import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { ONCE_STORAGE_KEY } from "@/lib/analytics";
import { QUOTE_FLOW_KEY, QUOTE_SNAPSHOT_KEY } from "@/lib/commerce/diagnostic";
import { LAB_ACCESS_COOKIE } from "@/lib/lab/db/cookie";
import { LAB_SESSION_STORAGE_KEY } from "@/lib/lab/session";
import {
  LAB_CONTACT_RETENTION_DEFAULT_DAYS,
  LAB_RUN_TTL_HOURS,
  LEGAL_BASIS_PENDING,
  LEGAL_CONTACT_EMAIL,
  LEGAL_HOLDER_ADDRESS,
  LEGAL_HOLDER_FULL_NAME,
  LEGAL_HOLDER_NIF,
  LEGAL_HOLDER_PENDING,
  LEGAL_OPERATOR_PUBLIC_NAME,
  LEGAL_PUBLIC_LOCATION,
  LEGAL_RETENTION_PENDING,
  LEGAL_TRADE_NAME,
  LEGAL_TRANSFERS_PENDING,
  getLabContactRetentionDays,
} from "@/lib/legal/identity";

export const metadata: Metadata = {
  title: "Privacidad | AGI TheCreator",
  description: "Cómo trata AGI TheCreator los datos personales en este sitio.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacidad | AGI TheCreator",
    description: "Cómo trata AGI TheCreator los datos personales en este sitio.",
    url: "https://agithecreator.com/privacy",
  },
  twitter: {
    title: "Privacidad | AGI TheCreator",
    description: "Cómo trata AGI TheCreator los datos personales en este sitio.",
  },
};

const mail = `mailto:${LEGAL_CONTACT_EMAIL}`;
const linkClass =
  "text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100";

export default function PrivacyPage() {
  const contactRetentionDays = getLabContactRetentionDays();

  return (
    <LegalPageShell title="Privacidad">
      <p>
        Este texto describe el tratamiento que hace el código de este sitio.
        No es un dictamen jurídico. La base jurídica de cada tratamiento y los
        plazos legales de conservación están pendientes de confirmación
        profesional: {LEGAL_BASIS_PENDING}. {LEGAL_RETENTION_PENDING}.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Responsable
      </h2>
      <p>
        {LEGAL_TRADE_NAME} ({LEGAL_OPERATOR_PUBLIC_NAME}). Ubicación comunicada
        en el sitio: {LEGAL_PUBLIC_LOCATION}. Eso no equivale a un domicilio
        legal verificado.
      </p>
      <p>{LEGAL_HOLDER_PENDING}</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Nombre completo: {LEGAL_HOLDER_FULL_NAME}</li>
        <li>NIF/DNI: {LEGAL_HOLDER_NIF}</li>
        <li>Domicilio a efectos de privacidad: {LEGAL_HOLDER_ADDRESS}</li>
        <li>
          Contacto:{" "}
          <a href={mail} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
        </li>
      </ul>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Formulario de contacto
      </h2>
      <p>
        Si envías el formulario de{" "}
        <a href="/contacto" className={linkClass}>
          /contacto
        </a>
        , se tratan nombre (opcional), email, empresa (opcional) y mensaje para
        responder a tu consulta. El envío pasa por Resend. Hay un aviso interno
        y una confirmación al email que indiques. No es una suscripción ni un
        consentimiento de marketing. No hay newsletter.
      </p>
      <p>
        Para limitar abusos, el servidor lee la dirección IP de la petición y
        la guarda en memoria de proceso durante una ventana corta (minutos). No
        es un fichero comercial. El campo oculto «website» es un cebo para
        bots: si llega relleno, no se envía el correo.
      </p>
      <p>
        Conservación de esos mensajes: {LEGAL_RETENTION_PENDING}. En la
        práctica se conservan el tiempo necesario para atender y, si hace
        falta, retomar la conversación; no hay un plazo legal fijado en este
        texto.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Presupuesto
      </h2>
      <p>
        Si envías el flujo de{" "}
        <a href="/presupuesto" className={linkClass}>
          /presupuesto
        </a>
        , se tratan nombre, email, teléfono, empresa (opcional), las respuestas
        del diagnóstico y la configuración del pack. Finalidad: enviarte la
        propuesta y avisarme. También pasa por Resend. El servidor puede
        generar un PDF del presupuesto y adjuntarlo a esos correos.
      </p>
      <p>
        La casilla de consentimiento cubre el contacto sobre ese proyecto. No
        es marketing, newsletter ni cesión a terceros con fines comerciales.
      </p>
      <p>
        Mientras no envías o no cierras la pestaña, el borrador puede quedar en
        el almacenamiento de sesión del navegador (
        <code>{QUOTE_SNAPSHOT_KEY}</code>, <code>{QUOTE_FLOW_KEY}</code>), incluido
        el teléfono si lo has escrito. Se borra al cerrar la pestaña.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Laboratorio: ejecución temporal
      </h2>
      <p>
        En{" "}
        <a href="/laboratorio" className={linkClass}>
          /laboratorio
        </a>{" "}
        puedes probar una demostración. Si activas el proceso, se recogen
        nombre, email y mensaje. El texto se clasifica con reglas del
        servidor, no con un modelo de IA. Con esos datos se pueden enviar
        emails operativos de la demo (aviso interno y confirmación), generar un
        informe PDF si lo pides, y programar un seguimiento por email si lo
        pides.
      </p>
      <p>
        Dejar el email para ejecutar la demo no es consentimiento de marketing.
        No hay casilla de newsletter. Los participantes no se convierten en una
        lista de campañas.
      </p>
      <p>
        Esa ejecución vive en <code>lab_runs</code> (u otra persistencia
        equivalente en memoria si no hay base configurada). Incluye, entre
        otros: nombre, email y mensaje de la visita; hashes de email, IP y
        token de acceso; clasificación y ruta; estado, pasos y acciones;
        identificadores de emails y del seguimiento; caducidad. Sirve para
        operar la demo y para reentrar en la misma ejecución.
      </p>
      <p>
        Conservación operativa de esa traza: unas {LAB_RUN_TTL_HOURS} horas.
        Al caducar, el servidor anula nombre, email y mensaje de esa fila
        (scrub). Permanecen hashes y metadatos técnicos. No es un plazo legal
        inventado: es el TTL del código.
      </p>
      <p>
        La cookie técnica <code>{LAB_ACCESS_COOKIE}</code> guarda un token de acceso
        httpOnly, limitada a <code>/api/laboratorio</code>, con esa misma
        duración. Permite reentrar y usar informe o seguimiento de tu
        ejecución. No es una cookie de marketing.
      </p>
      <p>
        En el navegador, el progreso de la demo se recuerda en almacenamiento
        de sesión (<code>{LAB_SESSION_STORAGE_KEY}</code>). No dispara acciones por sí
        solo.
      </p>
      <p>
        La IP se hashea antes de usarla para cuotas y límites del laboratorio.
        No se guarda en claro en <code>lab_runs</code> ni en{" "}
        <code>lab_contacts</code>.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Laboratorio: ficha comercial interna
      </h2>
      <p>
        Aparte de la traza de {LAB_RUN_TTL_HOURS} horas, el servidor puede
        guardar una ficha mínima en <code>lab_contacts</code>: nombre, email,
        hash del email, primera y última ejecución, número de ejecuciones,
        escenario o ruta, clasificación, si se completó la demo, si se pulsó el
        CTA, si se generó informe, si se programó seguimiento, origen
        (pathname del propio sitio, sin query) y una fecha operativa de
        retención.
      </p>
      <p>
        Finalidad: saber internamente quién ha usado la demo, no enviarte
        campañas. No guarda el mensaje, la IP en claro, contraseñas ni
        secretos. No es una cuenta. No hay acceso público a esa lista.
      </p>
      <p>
        Conservación operativa configurada ahora:{" "}
        {contactRetentionDays} días (
        <code>LAB_CONTACT_RETENTION_DAYS</code>; si no hay valor, el código usa{" "}
        {LAB_CONTACT_RETENTION_DEFAULT_DAYS}). Es un tope técnico del
        servidor, no un plazo legal. {LEGAL_RETENTION_PENDING}.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        PDF y seguimiento del laboratorio
      </h2>
      <p>
        El informe PDF se genera en el servidor con los datos de esa ejecución
        (nombre, email, mensaje, clasificación, pasos). Puedes descargarlo. Si
        hay email configurado para la demo, también puede enviarse adjunto.
      </p>
      <p>
        El seguimiento es un email futuro al mismo correo, solo si lo
        programas en la demo. Se puede cancelar o mover dentro de los límites
        de esa ejecución. Sigue siendo operativo, no marketing.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        WhatsApp y otros envíos
      </h2>
      <p>
        Si eliges WhatsApp, sales de este sitio hacia Meta. AGI no recibe ese
        mensaje por un formulario propio.
      </p>
      <p>
        En la portada hay un recuadro decorativo que, si lo usas, abre tu
        cliente de correo hacia {LEGAL_CONTACT_EMAIL} con el texto que hayas
        escrito. Hasta que tú envías ese correo, este servidor no lo guarda.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Estadísticas
      </h2>
      <p>
        Si aceptas las cookies de estadísticas, se carga Google Analytics
        (script de googletagmanager.com) para ver uso general: páginas,
        origen, eventos de interfaz. Los eventos del laboratorio y del
        presupuesto no llevan nombre ni email. En la pestaña,{" "}
        <code>{ONCE_STORAGE_KEY}</code> evita repetir algunos de esos
        eventos. Sin aceptación, Analytics no se carga.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Proveedores
      </h2>
      <p>
        Intervienen, según el caso: Resend (correo del sitio y de la demo,
        cuentas distintas), Supabase (persistencia del laboratorio, solo desde
        el servidor), el hosting donde corre esta web, y Google si aceptas
        estadísticas. WhatsApp/Meta solo si sales por ese enlace.
      </p>
      <p>
        Pueden actuar como encargados del tratamiento respecto de los datos que
        les llegan para prestar ese servicio. {LEGAL_TRANSFERS_PENDING}: no
        afirmo aquí el país de cada centro de datos ni las cláusulas
        contractuales concretas.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Seguridad
      </h2>
      <p>
        El laboratorio no expone la lista de contactos al navegador. La cookie
        de acceso es httpOnly. Las claves de servicio no llevan prefijo
        público. Eso reduce riesgo; no es una certificación de seguridad.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Derechos
      </h2>
      <p>
        Puedes pedir acceso, rectificación, supresión, oposición, limitación o
        portabilidad, y retirar el consentimiento de estadísticas. Escríbeme a{" "}
        <a href={mail} className={linkClass}>
          {LEGAL_CONTACT_EMAIL}
        </a>
        . Si consideras que el tratamiento no se ajusta a la normativa, puedes
        acudir a la autoridad de control competente en España (Agencia Española
        de Protección de Datos).
      </p>
    </LegalPageShell>
  );
}
