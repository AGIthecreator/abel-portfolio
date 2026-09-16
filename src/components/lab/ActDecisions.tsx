"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { CLINIC_DECISIONS, EXCEPTION_FLOW } from "@/lib/lab/decisions";
import type { LabDecision, LabDecisionOption } from "@/lib/lab/types";
import { LabButton, LabEyebrow, LabHeading, LabPanel, ProcessRail } from "./LabUi";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const STAGE_MARKS = [
  "Solicitud",
  "Hora ocupada",
  "Dato",
  "Sin categoría",
  "Persona",
] as const;

function initialStage(answers: Record<string, string>): number {
  let index = 0;
  for (const decision of CLINIC_DECISIONS) {
    if (!answers[decision.id]) break;
    index += 1;
  }
  return Math.min(index, CLINIC_DECISIONS.length - 1);
}

function DecisionBlock({
  decision,
  selectedId,
  onSelect,
  showExceptionFlow,
}: {
  decision: LabDecision;
  selectedId: string | undefined;
  onSelect: (option: LabDecisionOption) => void;
  showExceptionFlow?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const selected = decision.options.find((o) => o.id === selectedId);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = decision.options.findIndex((o) => o.id === selectedId);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const selectedLetter =
    selectedIndex >= 0 ? OPTION_LETTERS[selectedIndex] : undefined;

  const move = (from: number, delta: number) => {
    const total = decision.options.length;
    const next = (from + delta + total) % total;
    onSelect(decision.options[next]);
    optionRefs.current[next]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    i: number,
  ) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        move(i, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        move(i, -1);
        break;
      case "Home":
        event.preventDefault();
        onSelect(decision.options[0]);
        optionRefs.current[0]?.focus();
        break;
      case "End": {
        event.preventDefault();
        const last = decision.options.length - 1;
        onSelect(decision.options[last]);
        optionRefs.current[last]?.focus();
        break;
      }
      case " ":
      case "Enter":
        event.preventDefault();
        onSelect(decision.options[i]);
        break;
      default:
        break;
    }
  };

  const groupId = `lab-decision-${decision.id}`;

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        Situación
      </p>
      <p
        id={`${groupId}-context`}
        className="mt-2 text-[16px] leading-relaxed text-zinc-100"
      >
        {decision.context}
      </p>
      <p
        id={`${groupId}-label`}
        className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300/90"
      >
        {decision.question}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={`${groupId}-context`}
        className="mt-3 flex flex-col gap-2"
      >
        {decision.options.map((option, i) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[i] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={i === focusIndex ? 0 : -1}
              onClick={() => onSelect(option)}
              onKeyDown={(event) => handleKeyDown(event, i)}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                isSelected
                  ? "border-violet-400/60 bg-violet-400/10 text-zinc-50"
                  : "border-white/10 bg-white/2 text-zinc-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border ${
                  isSelected
                    ? "border-violet-300 bg-violet-300/25"
                    : "border-white/30"
                }`}
              >
                {isSelected ? (
                  <span className="size-1.5 rounded-full bg-violet-200" />
                ) : null}
              </span>
              <span className="mt-px font-mono text-[11px] text-violet-300">
                {OPTION_LETTERS[i]}
              </span>
              <span className="text-[13.5px] leading-relaxed">{option.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mt-5 border-t border-white/8 pt-4"
          >
            <p className="text-[14px] leading-relaxed text-zinc-100">
              Has elegido {selectedLetter}.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Esto significa que
            </p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-300">
              {selected.consequence}
            </p>
            {selected.handsOff ? (
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
                En este camino el proceso espera a una persona.
              </p>
            ) : null}
            {showExceptionFlow ? (
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  Cuando el proceso necesita criterio
                </p>
                <ProcessRail steps={EXCEPTION_FLOW} className="mt-2" />
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
                  Automatizar también significa saber cuándo parar. Cuando el
                  proceso necesita criterio, interviene una persona.
                </p>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface ActDecisionsProps {
  answers: Record<string, string>;
  onAnswer: (decisionId: string, option: LabDecisionOption) => void;
  onContinue: () => void;
}

export function ActDecisions({
  answers,
  onAnswer,
  onContinue,
}: ActDecisionsProps) {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(() => initialStage(answers));
  const lastIndex = CLINIC_DECISIONS.length - 1;
  const decision = CLINIC_DECISIONS[stage];
  const answeredCurrent = Boolean(decision && answers[decision.id]);
  const allAnswered = CLINIC_DECISIONS.every((item) => Boolean(answers[item.id]));
  const chainComplete = allAnswered && stage >= lastIndex;

  useEffect(() => {
    trackEvent("decision_started");
  }, []);

  useEffect(() => {
    if (allAnswered) trackEvent("decision_completed");
  }, [allAnswered]);

  const goNext = () => setStage((current) => Math.min(current + 1, lastIndex));

  return (
    <div>
      <LabEyebrow>02 · Lo decides</LabEyebrow>
      <LabHeading className="mt-3 max-w-2xl">
        Decide qué ocurre cuando cambian las circunstancias
      </LabHeading>

      <ProcessRail
        steps={STAGE_MARKS}
        activeIndex={stage}
        className="mt-5"
      />

      <LabPanel className="mt-6 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={decision.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Decisión {String(stage + 1).padStart(2, "0")}
            </p>
            <DecisionBlock
              decision={decision}
              selectedId={answers[decision.id]}
              onSelect={(option) => onAnswer(decision.id, option)}
              showExceptionFlow={stage === lastIndex}
            />
          </motion.div>
        </AnimatePresence>
      </LabPanel>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {answeredCurrent && stage < lastIndex ? (
          <LabButton onClick={goNext}>Siguiente situación</LabButton>
        ) : null}
        {chainComplete ? (
          <LabButton onClick={onContinue}>Continuar</LabButton>
        ) : null}
      </div>
    </div>
  );
}
