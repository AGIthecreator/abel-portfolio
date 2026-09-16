"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/lib/analytics";
import { reportLabProgress } from "@/lib/lab/client";
import { SERVICE_FONT_VARS } from "@/components/services/ServicePagePrimitives";
import type { LabActivationState, LabStats } from "@/lib/lab/session";
import type { LabBlockId } from "@/lib/lab/types";
import { CompletionScene } from "./CompletionScene";

export function ActResult({
  stats,
  activation,
  flow,
  onRestart,
}: {
  stats: LabStats;
  activation: LabActivationState | null;
  flow: readonly LabBlockId[];
  onRestart: () => void;
}) {
  const [mounted, setMounted] = useState(false);

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
    if (!mounted) return;
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
  }, [mounted]);

  const ctaClick = (target: string) => {
    trackEvent("demo_cta_clicked", { target });
    reportLabProgress({ event: "cta_clicked" });
  };

  if (!mounted) {
    return (
      <div className="min-h-[40vh]" aria-busy="true">
        <h2 id="lab-finale-title" className="sr-only">
          Proceso completado
        </h2>
      </div>
    );
  }

  return createPortal(
    <div
      className={`${SERVICE_FONT_VARS} pointer-events-auto fixed inset-0 z-[120] overflow-x-hidden overflow-y-auto overscroll-contain bg-[#070b13] font-(family-name:--font-svc-ui) text-zinc-300`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-finale-title"
    >
      <CompletionScene
        stats={stats}
        activation={activation}
        flow={flow}
        onRestart={onRestart}
        onCta={ctaClick}
      />
    </div>,
    document.body,
  );
}
