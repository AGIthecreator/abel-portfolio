import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Cookies | AGI TheCreator",
  description: "Uso de cookies en el sitio AGI TheCreator.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookies">
      <p>
        Este sitio utiliza cookies y un almacenamiento local mínimo. Solo
        declaro las que existen de verdad.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Técnicas (necesarias)
      </h2>
      <p>
        <strong className="font-medium text-zinc-300">agi_lab_at</strong> es la
        cookie de acceso del Laboratorio de Automatización. Es httpOnly, de
        duración corta (como máximo la de la ejecución, dos horas) y solo se
        envía a las rutas <code>/api/laboratorio</code>. Sirve para que el
        servidor reconozca tu sesión de la demo y no se pueda abrir otra
        ejecución con un identificador inventado. Es estrictamente necesaria
        para esa experiencia: sin ella no hay reentrada ni acciones
        posteriores. No es analítica ni publicitaria.
      </p>
      <p>
        La preferencia del aviso de cookies se guarda en el almacenamiento
        local del navegador (<code>agi-cookie-consent</code>), no como cookie
        HTTP.
      </p>

      <h2 className="font-serif text-[1.35rem] font-normal tracking-[-0.02em] text-zinc-200">
        Estadísticas (opcionales)
      </h2>
      <p>
        Si las aceptas, Google Analytics puede instalar sus propias cookies
        para entender de forma anónima el uso de la web: páginas vistas,
        origen del tráfico o interacción general. No las uso para identificarte
        ni para publicidad personalizada. Si eliges solo las necesarias, no se
        carga Analytics.
      </p>

      <p>
        Puedes cambiar o borrar cookies desde el navegador. La web sigue
        funcionando; el laboratorio necesita <code>agi_lab_at</code> mientras
        uses esa sesión.
      </p>
    </LegalPageShell>
  );
}
