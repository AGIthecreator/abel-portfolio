"use client";

import { useCookieConsent } from "@/components/cookies/CookieConsentContext";

export function CookieSettingsControl() {
  const { consent, ready, resetConsent } = useCookieConsent();

  if (!ready || consent === null) return null;

  return (
    <p>
      <button
        type="button"
        onClick={resetConsent}
        className="text-zinc-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-zinc-100"
      >
        Cambiar preferencias de estadísticas
      </button>
      . Si Analytics ya se había cargado en esta visita, recarga la página
      después de elegir «solo necesarias».
    </p>
  );
}
