"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics";
import { reportLabProgress } from "@/lib/lab/client";
import {
  PRIMARY_CTA,
  SERVICE_FONT_VARS,
} from "@/components/services/ServicePagePrimitives";
import type { LabActivationState, LabStats } from "@/lib/lab/session";
import { LabButton } from "./LabUi";
import { ProcessSignature } from "./ProcessSignature";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ActResult({
  stats,
  activation,
  onRestart,
}: {
  stats: LabStats;
  activation: LabActivationState | null;
  onRestart: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const reveal = useCallback(() => {
    setShowResult(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    trackEvent("demo_completed", {
      decisions: stats.decisions,
      real_actions: stats.realActions,
      simulated_actions: stats.simulatedActions,
      exceptions: stats.exceptions,
      flows: stats.flows,
    });
    reportLabProgress({ event: "demo_completed" });
    // Solo al entrar en el resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted || showResult) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [mounted, showResult]);

  const ctaClick = (target: string) => () => {
    trackEvent("demo_cta_clicked", { target });
    reportLabProgress({ event: "cta_clicked" });
  };

  const copy = (
    <motion.div
      className="mt-8 w-full max-w-[22rem] text-center min-[400px]:max-w-sm sm:mt-14 sm:max-w-md"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <h2
        id="lab-finale-title"
        className="text-balance font-(family-name:--font-svc-display) text-[clamp(1.55rem,6.4vw,2.8rem)] leading-[1.12] font-medium text-zinc-50"
      >
        Esto es una automatización
      </h2>
      <p
        className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-zinc-300 sm:mt-5 sm:max-w-none sm:text-[17px]"
        aria-live="polite"
      >
        Entra una solicitud. El sistema decide. Actúa. Y hace el seguimiento.
      </p>

      <p className="mt-8 text-[15px] leading-snug text-zinc-100 sm:mt-10 sm:text-[17px]">
        ¿Lo hacemos con uno de tus procesos?
      </p>
      <div className="mt-5 flex w-full flex-col items-stretch gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Link
          href="/presupuesto"
          onClick={ctaClick("presupuesto_principal")}
          className={`${PRIMARY_CTA} w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70`}
        >
          <span className="relative z-10">Quiero automatizar algo →</span>
        </Link>
        <LabButton
          variant="secondary"
          onClick={onRestart}
          className="w-full sm:w-auto"
        >
          Volver a empezar
        </LabButton>
      </div>
    </motion.div>
  );

  if (!mounted) {
    return (
      <div className="min-h-[40vh]" aria-busy="true">
        <h2 id="lab-finale-title" className="sr-only">
          Ejecutando el proceso
        </h2>
      </div>
    );
  }

  if (!showResult) {
    return createPortal(
      <div
        className={`${SERVICE_FONT_VARS} fixed inset-0 z-[110] overflow-x-hidden overflow-y-auto overscroll-contain bg-[#070b13] font-(family-name:--font-svc-ui) text-zinc-300`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-finale-title"
      >
        <div className="flex min-h-[100svh] w-full flex-col items-center justify-center pt-[max(1.5rem,env(safe-area-inset-top,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] sm:px-8">
          <div className="flex w-full max-w-[40rem] flex-col items-center lg:max-w-3xl">
            <ProcessSignature
              variant="scene"
              activation={activation}
              onComplete={reveal}
            />
            <h2 id="lab-finale-title" className="sr-only">
              Ejecutando el proceso
            </h2>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <ProcessSignature variant="summary" activation={activation} />
      {copy}
    </div>
  );
}
