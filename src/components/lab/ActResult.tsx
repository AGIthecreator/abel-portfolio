"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { reportLabProgress } from "@/lib/lab/client";
import { PRIMARY_CTA } from "@/components/services/ServicePagePrimitives";
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
  const [showResult, setShowResult] = useState(Boolean(reduceMotion));

  const reveal = useCallback(() => {
    setShowResult(true);
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
    if (reduceMotion) setShowResult(true);
  }, [reduceMotion]);

  useEffect(() => {
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
  }, []);

  const ctaClick = (target: string) => () => {
    trackEvent("demo_cta_clicked", { target });
    reportLabProgress({ event: "cta_clicked" });
  };

  return (
    <div
      className="fixed inset-0 z-[110] overflow-y-auto bg-[#070b13]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-finale-title"
    >
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 sm:px-8">
        <ProcessSignature activation={activation} onComplete={reveal} />

        {showResult ? (
          <motion.div
            className="mt-12 max-w-md text-center sm:mt-14"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <h2
              id="lab-finale-title"
              className="font-(family-name:--font-svc-display) text-[clamp(1.9rem,5vw,2.8rem)] leading-[1.08] font-medium text-zinc-50"
            >
              Esto es una automatización
            </h2>
            <p
              className="mt-5 text-[17px] leading-relaxed text-zinc-300"
              aria-live="polite"
            >
              Entra una solicitud. El sistema decide. Actúa. Y hace el
              seguimiento.
            </p>

            <p className="mt-10 text-[17px] leading-snug text-zinc-100">
              ¿Lo hacemos con uno de tus procesos?
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/presupuesto"
                onClick={ctaClick("presupuesto_principal")}
                className={`${PRIMARY_CTA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70`}
              >
                <span className="relative z-10">Quiero automatizar algo →</span>
              </Link>
              <LabButton variant="secondary" onClick={onRestart}>
                Volver a empezar
              </LabButton>
            </div>
          </motion.div>
        ) : (
          <h2 id="lab-finale-title" className="sr-only">
            Ejecutando el proceso
          </h2>
        )}
      </div>
    </div>
  );
}
