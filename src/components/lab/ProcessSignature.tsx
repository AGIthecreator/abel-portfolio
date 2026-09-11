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
const FINALE_PREFIX = "agi_lab_finale_v6_";
const BEAT_MS = 900;
const BEAT_MS_REDUCED = 420;
const HOLD_MS = 720;
const HOLD_MS_REDUCED = 280;

type Phase = "spotlight" | "line" | "done";
type Mode = "boot" | "play" | "skip";

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
  const [mode, setMode] = useState<Mode>("boot");
  const [phase, setPhase] = useState<Phase>("spotlight");
  const [beat, setBeat] = useState(0);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    activationRef.current = activation;
  }, [activation]);

  useEffect(() => {
    setMode(alreadyPlayed(activation) ? "skip" : "play");
  }, [activation]);

  useEffect(() => {
    if (mode === "boot") return;

    const finish = () => {
      if (completed.current) return;
      completed.current = true;
      markPlayed(activationRef.current);
      onComplete?.();
    };

    clear();

    if (mode === "skip") {
      setPhase("done");
      setBeat(BEATS.length - 1);
      setLit(BEATS.length);
      finish();
      return;
    }

    const stepMs = reduceMotion ? BEAT_MS_REDUCED : BEAT_MS;
    const holdMs = reduceMotion ? HOLD_MS_REDUCED : HOLD_MS;

    setPhase("spotlight");
    setBeat(0);
    setLit(0);

    BEATS.forEach((_, index) => {
      schedule(() => {
        setBeat(index);
        setLit(index + 1);
      }, 160 + index * stepMs);
    });

    const lineAt = 160 + BEATS.length * stepMs + 60;
    schedule(() => setPhase("line"), lineAt);
    schedule(() => {
      setPhase("done");
      finish();
    }, lineAt + holdMs);
  }, [clear, mode, onComplete, reduceMotion, schedule]);

  const skipAhead = () => {
    if (mode !== "play" || completed.current) return;
    clear();
    setBeat(BEATS.length - 1);
    setLit(BEATS.length);
    setPhase("done");
    completed.current = true;
    markPlayed(activationRef.current);
    onComplete?.();
  };

  if (mode === "boot") return null;

  const current = BEATS[beat] ?? BEATS[0];
  const showingLine = phase === "line" || phase === "done";
  const instant = Boolean(reduceMotion) || mode === "skip";

  return (
    <div className="w-full max-w-full">
      <p className="sr-only">
        {fromThisRun(activation)
          ? "El proceso que acabas de ejecutar: entra, decide, actúa y sigue."
          : "Así funciona una automatización: entra, decide, actúa y sigue."}
      </p>

      <div
        className={`relative flex w-full max-w-full flex-col items-center justify-center overflow-hidden ${
          showingLine
            ? "min-h-0"
            : "min-h-[42svh] min-[480px]:min-h-[50svh] sm:min-h-[58dvh] lg:min-h-[64dvh]"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-12%] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.16),transparent_58%)]"
        />

        <AnimatePresence mode="wait">
          {!showingLine ? (
            <motion.button
              key={current.id}
              type="button"
              onClick={skipAhead}
              className="relative max-w-full cursor-default border-0 bg-transparent px-1 py-0 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400/70 sm:px-2 sm:focus-visible:outline-offset-8"
              initial={instant ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={instant ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              transition={{ duration: instant ? 0.2 : 0.42, ease: EASE }}
              aria-label={`${current.word}. Continuar.`}
            >
              <span className="block max-w-[min(92vw,16ch)] font-(family-name:--font-svc-display) text-[clamp(2.6rem,22vmin,9rem)] leading-none font-medium tracking-[-0.03em] text-zinc-50">
                {current.word}
              </span>
            </motion.button>
          ) : (
            <motion.ol
              key="line"
              className="relative m-0 flex w-full max-w-[20.5rem] list-none flex-wrap items-center justify-center gap-x-2.5 gap-y-2 p-0 min-[400px]:max-w-md min-[400px]:gap-x-4 sm:max-w-3xl sm:gap-x-6 md:gap-x-8"
              initial={instant ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: instant ? 0.2 : 0.5, ease: EASE }}
            >
              {BEATS.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2.5 min-[400px]:gap-4 sm:gap-6 md:gap-8"
                >
                  <span
                    className={`font-(family-name:--font-svc-display) text-[clamp(1.05rem,4.2vw,1.85rem)] leading-none font-medium ${
                      lit > index ? "text-zinc-50" : "text-zinc-600"
                    }`}
                  >
                    {item.word}
                  </span>
                  {index < BEATS.length - 1 ? (
                    <span
                      aria-hidden
                      className="h-px w-3 shrink-0 bg-violet-200/40 min-[400px]:w-5 sm:w-8 md:w-12"
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
