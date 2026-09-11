"use client";

import { LabButton } from "./LabUi";

export function LabIntro({
  onStart,
  onResume,
  canResume,
}: {
  onStart: () => void;
  onResume: () => void;
  canResume: boolean;
}) {
  return (
    <div className="flex flex-col py-2 sm:py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
        Laboratorio de automatización
      </p>

      <h1 className="mt-4 max-w-3xl font-(family-name:--font-svc-display) text-[clamp(1.75rem,6.2vw,3.4rem)] leading-[1.15] font-medium text-zinc-50 sm:mt-5">
        ¿Qué pasaría si tu negocio trabajara un poco distinto?
      </h1>

      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-300 sm:mt-5">
        Prueba tres situaciones reales y descubre qué ocurre cuando un proceso
        deja de depender de alguien delante del ordenador.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
        <LabButton onClick={onStart}>Empezar</LabButton>
        {canResume ? (
          <LabButton variant="secondary" onClick={onResume}>
            Continuar
          </LabButton>
        ) : null}
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          5–7 min
        </span>
      </div>

      {canResume ? (
        <p className="mt-5 text-[13px] text-zinc-400">
          Tu flujo sigue aquí. No se ha ejecutado nada mientras no estabas.
        </p>
      ) : null}
    </div>
  );
}
