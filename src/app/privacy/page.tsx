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
        Si rellenas el formulario de contacto, uso tu nombre, email y mensaje únicamente para
        responderte. No los empleo para otra finalidad.
      </p>
      <p>
        No vendo datos, no los comparto con terceros con fines comerciales y no los uso para enviar
        spam. Conservo la información el tiempo necesario para atender tu consulta y, si hace falta,
        retomar la conversación contigo.
      </p>
      <p>
        Este sitio usa Google Analytics para entender de forma general cómo se usa la web — páginas
        visitadas, origen del tráfico e interacción general con el sitio — sin identificarte
        personalmente. Es información agregada y anónima que ayuda a mejorar la experiencia.
      </p>
      <p>
        Si tienes dudas sobre tus datos, escríbeme a{" "}
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
