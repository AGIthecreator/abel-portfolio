import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Aviso legal | AGI TheCreator",
  description: "Información legal del sitio AGI TheCreator.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <LegalPageShell title="Aviso legal">
      <p>
        Este sitio web es operado por <strong className="font-medium text-zinc-300">AGI TheCreator</strong>
        , especializado en desarrollo web y sistemas para negocios.
      </p>
      <p>
        La finalidad de esta web es ofrecer información, facilitar el contacto
        con personas o negocios interesados y, en{" "}
        <a
          href="/laboratorio"
          className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
        >
          /laboratorio
        </a>
        , permitir probar una experiencia interactiva de automatización. El
        detalle del tratamiento de datos de esa experiencia está en la{" "}
        <a
          href="/privacy"
          className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
        >
          política de privacidad
        </a>
        .
      </p>
      <p>
        Para cualquier consulta relacionada con este sitio puedes escribir a{" "}
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
