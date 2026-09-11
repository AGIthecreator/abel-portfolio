import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacidad | AGI TheCreator",
  description: "Cómo tratamos los datos personales en AGI TheCreator.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacidad">
      <p>
        Si rellenas el formulario de contacto, uso tu nombre, email y mensaje
        únicamente para responderte. No los empleo para otra finalidad.
      </p>
      <p>
        No vendo datos, no los comparto con terceros con fines comerciales y no
        los uso para enviar spam. Conservo la información el tiempo necesario
        para atender tu consulta y, si hace falta, retomar la conversación
        contigo.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Laboratorio de automatización
      </h2>
      <p>
        En{" "}
        <a
          href="/laboratorio"
          className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
        >
          /laboratorio
        </a>{" "}
        puedes probar una experiencia interactiva. Si envías el formulario
        inicial, recogemos el nombre y el email que indiques, y las respuestas
        que tú mismo escribes sobre el proceso (el texto de la solicitud). Ese
        texto se usa para clasificar la petición con reglas del servidor y, si
        corresponde, para ejecutar o demostrar acciones de la demo — por
        ejemplo, un aviso o una confirmación por email.
      </p>
      <p>
        El email es necesario para esas funciones de la demo. Dejarlo no
        equivale a aceptar comunicaciones comerciales. No hay una casilla de
        marketing en el laboratorio y no trato esa dirección como
        consentimiento publicitario.
      </p>
      <p>
        A partir de esa misma entrada mantengo un registro interno de
        participantes: quién ha probado el laboratorio, la clasificación o ruta
        que produjo la experiencia, si recorrió los actos, si llegó al
        resultado y si pulsó el CTA comercial. No guardo en ese registro la
        IP, el user-agent ni el mensaje completo. Los datos técnicos de
        seguridad (límites, deduplicación, caducidad de la ejecución) viven en
        tablas distintas y se tratan aparte.
      </p>
      <p>
        La traza técnica de cada ejecución caduca a las dos horas y el nombre,
        email y mensaje de esa traza se anulan. El registro de participantes no
        usa ese plazo: si desapareciera a las dos horas no podría cumplir su
        finalidad. Se conserva el tiempo necesario para gestionar la
        experiencia y, como máximo, doce meses desde la última actividad en el
        laboratorio, salvo que una obligación legal pida más.
      </p>
      <p>
        Para persistir el laboratorio y enviar los emails de la demo intervienen
        Supabase y Resend, como proveedores del servidor. No tienen un acceso
        público desde el navegador a estos datos.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Estadísticas
      </h2>
      <p>
        Este sitio puede usar Google Analytics para entender de forma general
        cómo se usa la web — páginas visitadas, origen del tráfico e
        interacción general — sin identificarte personalmente. Es información
        agregada. Solo se carga si aceptas las cookies de estadísticas. Los
        eventos del laboratorio (por ejemplo, que se ha completado la demo) van
        a Analytics de forma anónima: no incluyen nombre ni email.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Derechos
      </h2>
      <p>
        Puedes pedir acceso, rectificación, supresión u oposición al tratamiento
        de tus datos, y retirar el consentimiento de estadísticas cuando
        quieras. Escríbeme a{" "}
        <a
          href="mailto:contacto@agithecreator.com"
          className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
        >
          contacto@agithecreator.com
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
