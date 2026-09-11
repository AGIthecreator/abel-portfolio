"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { CLINIC_DECISIONS, CLINIC_EXCEPTIONS } from "@/lib/lab/decisions";
import type { LabDecision, LabDecisionOption } from "@/lib/lab/types";
import { LabButton, LabEyebrow, LabHeading, LabPanel } from "./LabUi";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Grupo de opciones con el patrón radiogroup completo.
 *
 * Un solo elemento del grupo es tabulable (tabindex roving): el foco entra una
 * vez y las flechas mueven la selección, que es lo que espera un lector de
 * pantalla. La opción elegida se marca además con un indicador visible y con
 * texto, no solo con color de borde.
 */
function DecisionBlock({
  decision,
  index,
  selectedId,
  onSelect,
}: {
  decision: LabDecision;
  index: number;
  selectedId: string | undefined;
  onSelect: (option: LabDecisionOption) => void;
}) {
  const reduceMotion = useReducedMotion();
  const selected = decision.options.find((o) => o.id === selectedId);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = decision.options.findIndex((o) => o.id === selectedId);
  // Sin selección, el primero es la única parada de tabulación del grupo.
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

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
    <LabPanel>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-violet-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px flex-1 bg-white/8" aria-hidden />
      </div>

      <p
        id={`${groupId}-context`}
        className="mt-4 text-[15px] leading-relaxed text-zinc-200"
      >
        {decision.context}
      </p>
      <p
        id={`${groupId}-label`}
        className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400"
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
              {/* Marca de selección: la elección no depende solo del color. */}
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
            className="mt-4 border-t border-white/8 pt-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300">
              Lo que ocurre entonces
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-300">
              {selected.consequence}
            </p>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-zinc-400">
              {decision.reading}
            </p>
            {selected.handsOff ? (
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-amber-200">
                Este camino devuelve el caso a una persona.
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LabPanel>
  );
}

function ExceptionModel() {
  return (
    <LabPanel>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
        Cuando algo no sale como esperaba
      </p>

      <div className="mt-4 flex flex-col gap-2 font-mono text-[11.5px] tracking-[0.06em] text-zinc-300">
        <span>Automatización</span>
        <span aria-hidden className="text-zinc-400">
          ↓
        </span>
        <span className="text-amber-200">Excepción</span>
        <span aria-hidden className="text-zinc-400">
          ↓
        </span>
        <span>¿Se puede resolver?</span>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          <span className="rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-emerald-200">
            Sí → Acción
          </span>
          <span className="rounded-md border border-white/10 bg-white/2 px-3 py-2 text-zinc-300">
            No → Persona
          </span>
        </div>
      </div>

      <ul className="mt-5 flex list-none flex-col gap-2.5 border-t border-white/8 p-0 pt-4">
        {CLINIC_EXCEPTIONS.map((exception) => (
          <li key={exception.id} className="flex flex-col gap-0.5">
            <span className="text-[13px] text-zinc-200">{exception.trigger}</span>
            <span className="text-[12px] leading-relaxed text-zinc-400">
              {exception.resolvable ? "Se resuelve sola · " : "Pasa a persona · "}
              {exception.resolution}
            </span>
          </li>
        ))}
      </ul>
    </LabPanel>
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
  const answeredCount = CLINIC_DECISIONS.filter((d) => answers[d.id]).length;
  const complete = answeredCount === CLINIC_DECISIONS.length;

  useEffect(() => {
    trackEvent("decision_started");
  }, []);

  useEffect(() => {
    if (complete) trackEvent("decision_completed");
  }, [complete]);

  return (
    <div>
      <LabEyebrow>Acto 02 · Entiende las decisiones</LabEyebrow>
      <LabHeading className="mt-3 max-w-2xl">
        Automatizar no es hacer siempre lo mismo
      </LabHeading>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-300">
        Una clínica recibe solicitudes de cita. No hay respuesta correcta: hay
        consecuencias distintas. Este acto no ejecuta nada: sirve para entender
        de qué depende cada camino.
      </p>

      <div className="mt-7 grid gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-5">
          <DecisionBlock
            decision={CLINIC_DECISIONS[0]}
            index={0}
            selectedId={answers[CLINIC_DECISIONS[0].id]}
            onSelect={(option) => onAnswer(CLINIC_DECISIONS[0].id, option)}
          />

          <AnimatePresence>
            {answers[CLINIC_DECISIONS[0].id] ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DecisionBlock
                  decision={CLINIC_DECISIONS[1]}
                  index={1}
                  selectedId={answers[CLINIC_DECISIONS[1].id]}
                  onSelect={(option) => onAnswer(CLINIC_DECISIONS[1].id, option)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-5">
          <ExceptionModel />

          <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/2 p-5 sm:p-6">
            <p className="font-(family-name:--font-svc-display) text-[17px] leading-snug text-zinc-100">
              Automatizar también significa saber cuándo parar.
            </p>
            <p className="text-[13.5px] leading-relaxed text-zinc-300">
              Automatizar no significa quitar a las personas del proceso.
              Significa reservarlas para lo que realmente necesita criterio.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <LabButton onClick={onContinue} disabled={!complete}>
          Continuar
        </LabButton>
        {!complete ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
            {answeredCount} / {CLINIC_DECISIONS.length} decisiones
          </span>
        ) : null}
      </div>
    </div>
  );
}
