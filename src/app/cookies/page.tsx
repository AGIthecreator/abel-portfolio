import type { Metadata } from "next";
import { CookieSettingsControl } from "@/components/cookies/CookieSettingsControl";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";
import { ONCE_STORAGE_KEY } from "@/lib/analytics";
import { QUOTE_FLOW_KEY, QUOTE_SNAPSHOT_KEY } from "@/lib/commerce/diagnostic";
import { LAB_ACCESS_COOKIE } from "@/lib/lab/db/cookie";
import { LAB_SESSION_STORAGE_KEY } from "@/lib/lab/session";
import { LAB_RUN_TTL_HOURS } from "@/lib/legal/identity";

export const metadata: Metadata = {
  title: "Cookies | AGI TheCreator",
  description: "Cookies y almacenamiento local que usa realmente AGI TheCreator.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookies | AGI TheCreator",
    description: "Cookies y almacenamiento local que usa realmente AGI TheCreator.",
    url: "https://agithecreator.com/cookies",
  },
  twitter: {
    title: "Cookies | AGI TheCreator",
    description: "Cookies y almacenamiento local que usa realmente AGI TheCreator.",
  },
};

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookies">
      <p>
        Solo declaro lo que el código de este sitio usa. No hay publicidad
        personalizada, no hay newsletter y no hay cookies de marketing. Las
        fuentes se sirven desde este dominio (next/font); no cargo Google Fonts
        en el navegador.
      </p>
      <p>
        Este texto describe el comportamiento actual. No sustituye un dictamen
        jurídico.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Necesarias
      </h2>
      <p>
        <strong className="font-medium text-zinc-300">{LAB_ACCESS_COOKIE}</strong>{" "}
        es una cookie HTTP técnica del Laboratorio. Es httpOnly, SameSite=Lax,
        Secure en producción, path <code>/api/laboratorio</code>, duración como
        máximo la de la ejecución (unas {LAB_RUN_TTL_HOURS} horas). Sirve para
        reconocer tu ejecución y permitir reentrada, informe y seguimiento.
        Sin ella esas acciones no pueden asociarse a tu demo. No es analítica
        ni de marketing. No es opcional si usas el Laboratorio.
      </p>
      <p>
        La elección del aviso de cookies se guarda en almacenamiento local (
        <code>{COOKIE_CONSENT_KEY}</code>), no como cookie HTTP. Recuerda si
        aceptaste o rechazaste las estadísticas.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Funcionales (navegador, no HTTP)
      </h2>
      <p>
        Almacenamiento de sesión (se borra al cerrar la pestaña):
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <code>{LAB_SESSION_STORAGE_KEY}</code>: progreso de la demo. No ejecuta
          acciones por sí solo.
        </li>
        <li>
          <code>{QUOTE_SNAPSHOT_KEY}</code> y <code>{QUOTE_FLOW_KEY}</code>:
          borrador del presupuesto. Puede incluir nombre, email y teléfono si
          has llegado a esa pantalla.
        </li>
        <li>
          <code>{ONCE_STORAGE_KEY}</code>: evita repetir ciertos eventos de
          medición en la misma pestaña. No identifica a una persona.
        </li>
      </ul>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Analíticas (opcionales, de terceros)
      </h2>
      <p>
        Solo si aceptas estadísticas. Entonces se carga Google Analytics desde
        googletagmanager.com. Google puede instalar cookies propias (de la
        familia <code>_ga</code> / <code>_ga_*</code>, según su
        implementación). Sirven para uso general de la web. No las uso para
        identificarte con nombre o email ni para publicidad personalizada.
      </p>
      <p>
        Si eliges solo las necesarias, ese script no se carga. En el aviso, las
        estadísticas salen desactivadas hasta que las activas o pulsas
        «Aceptar».
      </p>
      <CookieSettingsControl />

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Lo que este código no crea
      </h2>
      <p>
        No hay cookies de login, de carrito, de checkout ni de campaña. El
        hosting o un proxy delante del dominio podrían añadir las suyas; eso
        no lo define este repositorio y el titular debe comprobarlo en el
        entorno publicado.
      </p>
      <p>
        Detalle del tratamiento:{" "}
        <a
          href="/privacy"
          className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
        >
          política de privacidad
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
