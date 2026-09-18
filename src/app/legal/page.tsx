import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_HOLDER_ADDRESS,
  LEGAL_HOLDER_FULL_NAME,
  LEGAL_HOLDER_NIF,
  LEGAL_HOLDER_PENDING,
  LEGAL_OPERATOR_PUBLIC_NAME,
  LEGAL_PUBLIC_LOCATION,
  LEGAL_SITE_HOST,
  LEGAL_SITE_URL,
  LEGAL_TRADE_NAME,
} from "@/lib/legal/identity";

export const metadata: Metadata = {
  title: "Aviso legal | AGI TheCreator",
  description: "Información legal del sitio AGI TheCreator.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Aviso legal | AGI TheCreator",
    description: "Información legal del sitio AGI TheCreator.",
    url: "https://agithecreator.com/legal",
  },
  twitter: {
    title: "Aviso legal | AGI TheCreator",
    description: "Información legal del sitio AGI TheCreator.",
  },
};

const mail = `mailto:${LEGAL_CONTACT_EMAIL}`;
const linkClass =
  "text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100";

export default function LegalPage() {
  return (
    <LegalPageShell title="Aviso legal">
      <p>
        Este texto describe el sitio{" "}
        <a href={LEGAL_SITE_URL} className={linkClass}>
          {LEGAL_SITE_HOST}
        </a>
        . No sustituye un dictamen jurídico. Los datos identificativos
        marcados como pendientes no están verificados aquí.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Titular
      </h2>
      <p>
        El sitio se presenta bajo el nombre comercial{" "}
        <strong className="font-medium text-zinc-300">{LEGAL_TRADE_NAME}</strong>
        , actividad profesional de {LEGAL_OPERATOR_PUBLIC_NAME}. El sitio
        comunica {LEGAL_PUBLIC_LOCATION} como ubicación operativa. Eso no es,
        por sí solo, un domicilio a efectos legales.
      </p>
      <p>
        {LEGAL_HOLDER_PENDING}
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Nombre completo: {LEGAL_HOLDER_FULL_NAME}</li>
        <li>NIF/DNI: {LEGAL_HOLDER_NIF}</li>
        <li>Domicilio a efectos legales: {LEGAL_HOLDER_ADDRESS}</li>
        <li>
          Email de contacto:{" "}
          <a href={mail} className={linkClass}>
            {LEGAL_CONTACT_EMAIL}
          </a>
        </li>
      </ul>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Qué es este sitio
      </h2>
      <p>
        Informa sobre el desarrollo de páginas web, sistemas y automatizaciones
        para negocios. El alcance de cada encargo se concreta en el
        presupuesto. Los precios públicos son orientativos y no son una oferta
        vinculante hasta confirmar ese alcance.
      </p>
      <p>
        Este sitio no es una tienda online, no tiene checkout, no tiene
        cuentas de usuario, no tiene panel de cliente, no tiene newsletter y
        no vende suscripciones propias.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Laboratorio
      </h2>
      <p>
        En{" "}
        <a href="/laboratorio" className={linkClass}>
          /laboratorio
        </a>{" "}
        hay una demostración interactiva de automatización. No es un producto
        SaaS, no sustituye un sistema en producción y no usa un modelo de IA
        para clasificar: son reglas del servidor. Probarla no crea una cuenta.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Condiciones de uso
      </h2>
      <p>
        El contenido se ofrece para informar. No uses el laboratorio ni los
        formularios para enviar datos de terceros sin base, ni para saturar las
        rutas técnicas del sitio. Los textos, diseño y código de esta web
        pertenecen a {LEGAL_TRADE_NAME} salvo que se indique lo contrario.
      </p>
      <p>
        La legislación aplicable es la española. Datos personales:{" "}
        <a href="/privacy" className={linkClass}>
          política de privacidad
        </a>
        . Cookies y almacenamiento local:{" "}
        <a href="/cookies" className={linkClass}>
          política de cookies
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
