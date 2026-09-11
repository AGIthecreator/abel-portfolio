"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LabActivationState } from "@/lib/lab/session";
import { useManagedTimers } from "./useManagedTimers";

const BEATS = [
  { id: "entra", word: "Entra" },
  { id: "decide", word: "Decide" },
  { id: "actua", word: "Actúa" },
  { id: "sigue", word: "Sigue" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const FINALE_PREFIX = "agi_lab_finale_v4_";
const BEAT_MS = 900;
const HOLD_MS = 720;

type Phase = "spotlight" | "line" | "done";

function finaleKey(activation: LabActivationState | null): string {
  return `${FINALE_PREFIX}${activation?.runId ?? "schema"}`;
}

function alreadyPlayed(activation: LabActivationState | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(finaleKey(activation)) === "1";
  } catch {
    return false;
  }
}

function markPlayed(activation: LabActivationState | null): void {
  try {
    sessionStorage.setItem(finaleKey(activation), "1");
  } catch {
    /* modo privado */
  }
}

function fromThisRun(activation: LabActivationState | null): boolean {
  return Boolean(activation?.steps.some((step) => step.status === "done"));
}

/**
 * Cierre de marketing: cuatro palabras ocupan la pantalla, luego se quedan
 * como el proceso. No inventa pasos; resume la automatización en verbo.
 */
export function ProcessSignature({
  activation,
  onComplete,
}: {
  activation: LabActivationState | null;
  onComplete?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { schedule, clear } = useManagedTimers();
  const completed = useRef(false);
  const activationRef = useRef(activation);
  const skip = reduceMotion === true || alreadyPlayed(activation);
  const [phase, setPhase] = useState<Phase>(skip ? "done" : "spotlight");
  const [beat, setBeat] = useState(skip ? BEATS.length - 1 : 0);
  const [lit, setLit] = useState(skip ? BEATS.length : 0);

  useEffect(() => {
    activationRef.current = activation;
  }, [activation]);

  useEffect(() => {
    const finish = () => {
      if (completed.current) return;
      completed.current = true;
      markPlayed(activationRef.current);
      onComplete?.();
    };

    clear();

    if (skip) {
      setPhase("done");
      setBeat(BEATS.length - 1);
      setLit(BEATS.length);
      finish();
      return;
    }

    setPhase("spotlight");
    setBeat(0);
    setLit(0);

    BEATS.forEach((_, index) => {
      schedule(() => {
        setBeat(index);
        setLit(index + 1);
      }, 180 + index * BEAT_MS);
    });

    const lineAt = 180 + BEATS.length * BEAT_MS + 80;
    schedule(() => setPhase("line"), lineAt);
    schedule(() => {
      setPhase("done");
      finish();
    }, lineAt + HOLD_MS);
  }, [clear, onComplete, schedule, skip]);

  const skipAhead = () => {
    if (skip || completed.current) return;
    clear();
    setBeat(BEATS.length - 1);
    setLit(BEATS.length);
    setPhase("done");
    completed.current = true;
    markPlayed(activationRef.current);
    onComplete?.();
  };

  const current = BEATS[beat] ?? BEATS[0];
  const showingLine = phase === "line" || phase === "done";

  return (
    <div className="w-full">
      <p className="sr-only">
        {fromThisRun(activation)
          ? "El proceso que acabas de ejecutar: entra, decide, actúa y sigue."
          : "Así funciona una automatización: entra, decide, actúa y sigue."}
      </p>

      <div
        className={`relative flex w-full flex-col items-center justify-center ${
          showingLine ? "min-h-0" : "min-h-[58dvh] sm:min-h-[64dvh]"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-20%] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.16),transparent_58%)]"
        />

        <AnimatePresence mode="wait">
          {!showingLine ? (
            <motion.button
              key={current.id}
              type="button"
              onClick={skipAhead}
              className="relative cursor-default border-0 bg-transparent p-0 text-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-violet-400/70"
              initial={skip ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.42, ease: EASE }}
              aria-label={`${current.word}. Continuar.`}
            >
              <span className="font-(family-name:--font-svc-display) text-[clamp(4.2rem,18vw,9rem)] leading-none font-medium tracking-[-0.03em] text-zinc-50">
                {current.word}
              </span>
            </motion.button>
          ) : (
            <motion.ol
              key="line"
              className="relative flex w-full max-w-3xl list-none flex-wrap items-center justify-center gap-x-5 gap-y-3 p-0 sm:gap-x-8"
              initial={skip ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {BEATS.map((item, index) => (
                <li key={item.id} className="flex items-center gap-5 sm:gap-8">
                  <span
                    className={`font-(family-name:--font-svc-display) text-[clamp(1.35rem,3.6vw,1.85rem)] leading-none font-medium ${
                      lit > index ? "text-zinc-50" : "text-zinc-600"
                    }`}
                  >
                    {item.word}
                  </span>
                  {index < BEATS.length - 1 ? (
                    <span
                      aria-hidden
                      className="hidden h-px w-8 bg-violet-200/40 sm:block md:w-12"
                    />
                  ) : null}
                </li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
