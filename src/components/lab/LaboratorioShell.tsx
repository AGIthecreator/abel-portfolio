"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ServicePageRoot } from "@/components/services/ServicePagePrimitives";
import { trackEvent } from "@/lib/analytics";
import { labFetch, reportLabProgress } from "@/lib/lab/client";
import {
  clearLabSession,
  computeLabStats,
  createLabSession,
  hasLabProgress,
  loadLabSession,
  saveLabSession,
  summarizeActivation,
  type LabAct,
  type LabActivationState,
  type LabBuilderState,
  type LabSessionState,
} from "@/lib/lab/session";
import type { LabDecisionOption, LabSessionResponse } from "@/lib/lab/types";
import { ActActivate } from "./ActActivate";
import { ActBuilder } from "./ActBuilder";
import { ActDecisions } from "./ActDecisions";
import { ActResult } from "./ActResult";
import { DemoProgress } from "./DemoProgress";
import { LabIntro } from "./LabIntro";

export function LaboratorioShell() {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<LabSessionState>(createLabSession);
  const [restorable, setRestorable] = useState(false);
  const startTracked = useRef(false);

  useEffect(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

  // Rehidratar nunca ejecuta acciones: solo recupera lo que el visitante hizo.
  // La intro se pinta ya; la API no bloquea el botón Empezar.
  useEffect(() => {
    let cancelled = false;

    const stored = loadLabSession();
    const next: LabSessionState =
      stored && hasLabProgress(stored)
        ? { ...stored, act: 0 }
        : stored ?? createLabSession();

    if (!startTracked.current) {
      saveLabSession(next);
      setState(next);
      setRestorable(hasLabProgress(next));
    }

    void (async () => {
      try {
        const res = await labFetch("/api/laboratorio/sesion", {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return;
        const data = (await res.json()) as LabSessionResponse;
        const activation = data.activation;
        if (!data.ok || !data.found || !activation) return;
        if (cancelled || startTracked.current) return;
        setState((prev) => {
          if (prev.act !== 0) return prev;
          const merged: LabSessionState = { ...prev, act: 0, activation };
          saveLabSession(merged);
          return merged;
        });
        setRestorable(true);
      } catch {
        /* sin red o sesión lenta: la intro ya está en pantalla */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(
    (patch: Partial<LabSessionState> | ((prev: LabSessionState) => LabSessionState)) => {
      setState((prev) => {
        const next =
          typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        saveLabSession(next);
        return next;
      });
    },
    [],
  );

  const goToAct = useCallback(
    (act: LabAct) => {
      update((prev) => ({
        ...prev,
        act,
        visitedActs: prev.visitedActs.includes(act)
          ? prev.visitedActs
          : [...prev.visitedActs, act],
      }));
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    },
    [reduceMotion, update],
  );

  const start = () => {
    if (!startTracked.current) {
      startTracked.current = true;
      trackEvent("demo_started");
    }
    setRestorable(false);
    goToAct(1);
  };

  const restart = () => {
    void labFetch("/api/laboratorio/sesion", { method: "DELETE" });
    clearLabSession();
    startTracked.current = false;
    setRestorable(false);
    setState(createLabSession());
  };

  const resume = () => {
    if (!startTracked.current) {
      startTracked.current = true;
      trackEvent("demo_started", { resumed: true });
    }
    setRestorable(false);
    const target: LabAct = state.visitedActs.includes(4)
      ? 1
      : state.builder.status === "executed"
        ? 4
        : state.builder.flow.length
          ? 3
          : Object.keys(state.decisions).length
            ? 2
            : 1;
    goToAct(target);
  };

  /**
   * Una ejecución nueva cierra la anterior: su resumen pasa al histórico para
   * que los contadores no se pierdan ni se cuenten dos veces cuando una acción
   * posterior actualice la ejecución en curso.
   */
  const handleActivated = (activation: LabActivationState) => {
    update((prev) => ({
      ...prev,
      activation,
      pastRuns: prev.activation
        ? [...prev.pastRuns, summarizeActivation(prev.activation)]
        : prev.pastRuns,
    }));
  };

  /** Actualiza la ejecución en curso con lo que ha devuelto el servidor. */
  const handleActivationChange = (activation: LabActivationState) => {
    update((prev) => ({ ...prev, activation }));
  };

  const handleAnswer = (decisionId: string, option: LabDecisionOption) => {
    update((prev) => ({
      ...prev,
      decisions: { ...prev.decisions, [decisionId]: option.id },
    }));
  };

  const handleBuilderChange = (patch: Partial<LabBuilderState>) => {
    update((prev) => ({ ...prev, builder: { ...prev.builder, ...patch } }));
  };

  const stats = useMemo(() => computeLabStats(state), [state]);

  return (
    <ServicePageRoot>
      <div className="relative mx-auto w-full max-w-5xl px-5 pt-28 pb-20 sm:px-8 sm:pt-36 sm:pb-24 lg:px-10 lg:pt-32 lg:pb-32">
        {state.act > 0 ? (
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
            <DemoProgress
              current={state.act}
              visited={state.visitedActs}
              onNavigate={goToAct}
            />
            <button
              type="button"
              onClick={restart}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70"
            >
              Empezar de nuevo
            </button>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.section
            key={state.act}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {state.act === 0 ? (
              <LabIntro
                onStart={start}
                onResume={resume}
                canResume={restorable}
              />
            ) : null}

            {state.act === 1 ? (
              <ActActivate
                activation={state.activation}
                onActivated={handleActivated}
                onActivationChange={handleActivationChange}
                onContinue={() => goToAct(2)}
              />
            ) : null}

            {state.act === 2 ? (
              <ActDecisions
                answers={state.decisions}
                onAnswer={handleAnswer}
                onContinue={() => {
                  reportLabProgress({
                    event: "experience",
                    experience: "decisions",
                  });
                  goToAct(3);
                }}
              />
            ) : null}

            {state.act === 3 ? (
              <ActBuilder
                builder={state.builder}
                onBuilderChange={handleBuilderChange}
                onContinue={() => {
                  reportLabProgress({
                    event: "experience",
                    experience: "builder",
                  });
                  goToAct(4);
                }}
              />
            ) : null}

            {state.act === 4 ? (
              <ActResult
                stats={stats}
                activation={state.activation}
                onRestart={restart}
              />
            ) : null}
          </motion.section>
        </AnimatePresence>
      </div>
    </ServicePageRoot>
  );
}
