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
        Este sitio utiliza cookies técnicas necesarias para que funcione correctamente, como
        recordar ciertas preferencias básicas de navegación.
      </p>
      <p>
        También utiliza Google Analytics, que emplea cookies para entender de forma anónima cómo se
        utiliza la web: páginas visitadas, origen del tráfico o interacción general con el sitio. No
        se utilizan para identificar usuarios ni para publicidad personalizada.
      </p>
      <p>
        Puedes desactivar o eliminar las cookies desde la configuración de tu navegador en cualquier
        momento. La web seguirá funcionando con normalidad, aunque algunas estadísticas dejarán de
        registrarse.
      </p>
    </LegalPageShell>
  );
}
