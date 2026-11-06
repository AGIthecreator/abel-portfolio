"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  describeLabSend,
  LAB_CASES,
  type LabCase,
  type LabCaseId,
} from "@/lib/lab/cases";
import { labVisitorPreview } from "@/lib/lab/email-template";
import type { LabActivationState } from "@/lib/lab/session";
import type { LabDecisionOption } from "@/lib/lab/types";
import { DecisionBlock } from "./ActDecisions";
import { LabFlow } from "./LabFlow";
import { LabButton, LabEyebrow, LabHeading, LabPanel } from "./LabUi";
import { useManagedTimers } from "./useManagedTimers";

export function CasePicker({
  selectedId,
  onSelect,
  onResume,
  canResume,
}: {
  selectedId: LabCaseId | null;
  onSelect: (id: LabCaseId) => void;
  onResume?: () => void;
  canResume?: boolean;
}) {
  return (
    <div>
      <LabEyebrow>Tu caso</LabEyebrow>
      <LabHeading as="h1" className="mt-3 max-w-2xl">
        ¿Qué se te atasca en el día a día?
      </LabHeading>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-300">
        Elige uno. Verás ese trabajo, cómo se resuelve y en qué termina.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {LAB_CASES.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`cursor-pointer rounded-xl border px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70 ${
                selected
                  ? "border-violet-400/50 bg-violet-400/10"
                  : "border-white/10 bg-[#101826] hover:border-white/20"
              }`}
            >
              <span className="block text-[16px] text-[#F3F1EB]">{item.title}</span>
              <span className="mt-1.5 block text-[13.5px] leading-relaxed text-zinc-400">
                {item.pain}
              </span>
              <span className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11.5px] text-zinc-400">
                {item.flow.map((step, index) => (
                  <span key={step.title} className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="size-1 rounded-full bg-violet-300/80" />
                    {step.title}
                    {index < item.flow.length - 1 ? (
                      <span aria-hidden className="text-zinc-600">
                        →
                      </span>
                    ) : null}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {canResume && onResume ? (
        <div className="mt-6">
          <LabButton variant="ghost" onClick={onResume}>
            Continuar la prueba
          </LabButton>
        </div>
      ) : null}
    </div>
  );
}

export function CasePain({
  item,
  onBack,
  onContinue,
}: {
  item: LabCase;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <LabEyebrow>Tu caso</LabEyebrow>
      <LabHeading as="h1" className="mt-3">
        {item.title}
      </LabHeading>
      <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">{item.pain}</p>
      <LabFlow className="mt-6" steps={item.flow} active={0} />
      <div className="mt-5 max-w-sm rounded-2xl border border-white/10 bg-[#101826] px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Te llega esto
        </p>
        <p className="mt-2 text-[18px] leading-snug text-[#F3F1EB]">«{item.inbound}»</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LabButton onClick={onContinue}>Probarlo con mi correo</LabButton>
        <LabButton variant="ghost" onClick={onBack}>
          Volver
        </LabButton>
      </div>
    </div>
  );
}

export function CaseTwist({
  item,
  selectedId,
  onSelect,
  onBack,
  onContinue,
  onOtherCase,
  onMore,
  onBuild,
}: {
  item: LabCase;
  selectedId: string | undefined;
  onSelect: (option: LabDecisionOption) => void;
  onBack: () => void;
  onContinue: () => void;
  onOtherCase: () => void;
  onMore: () => void;
  onBuild: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <LabEyebrow>La prueba</LabEyebrow>
      <LabHeading as="h1" className="mt-3">
        Y cuando no sale como siempre
      </LabHeading>
      <LabFlow className="mt-6" steps={item.flow} active={2} />
      <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
        Es el mismo caso. Una sola situación. No es un examen.
      </p>
      <LabPanel className="mt-6">
        <DecisionBlock
          decision={item.twist}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </LabPanel>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LabButton disabled={!selectedId} onClick={onContinue}>
          Continuar
        </LabButton>
        <LabButton variant="ghost" onClick={onBack}>
          Volver
        </LabButton>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <button type="button" onClick={onOtherCase} className={LINK_CLASS}>
          Ver otro caso
        </button>
        <button type="button" onClick={onMore} className={LINK_CLASS}>
          Ver más situaciones
        </button>
        <button type="button" onClick={onBuild} className={LINK_CLASS}>
          Montar un proceso
        </button>
      </div>
    </div>
  );
}

export function LabMailProof({
  activation,
}: {
  activation: LabActivationState;
}) {
  const preview = labVisitorPreview(activation.route.id);
  const name = activation.input.name.trim();

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e4dfd4] bg-[#F3F1EB] text-[#070b13] shadow-[0_12px_32px_-18px_rgba(243,241,235,0.45)]">
      <div className="border-b border-[#070b13]/8 px-4 py-3">
        <p className="font-(family-name:--font-svc-ui) text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5c6370]">
          Correo enviado
        </p>
        <p className="mt-2 text-[12px] text-[#5c6370]">Para</p>
        <p className="text-[14px] text-[#070b13]">{activation.input.email}</p>
        <p className="mt-2 text-[12px] text-[#5c6370]">Asunto</p>
        <p className="font-(family-name:--font-svc-display) text-[17px] leading-snug text-[#070b13]">
          {preview.subject}
        </p>
      </div>
      <div className="px-4 py-4 text-[15px] leading-relaxed">
        <p>{name ? `Hola ${name},` : "Hola,"}</p>
        <p className="mt-2">{preview.opening}</p>
        <p className="mt-3 text-[12.5px] text-[#5c6370]">Acaba de salir hacia tu correo.</p>
      </div>
    </article>
  );
}

export function GuidedProof({
  inbound,
  manual,
  activation,
  loading,
}: {
  inbound: string;
  manual: readonly string[];
  activation: LabActivationState | null;
  loading: boolean;
}) {
  const send = activation ? describeLabSend(activation) : null;
  const settled = Boolean(send?.sent);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-[#101826] px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          {settled ? "Esto ya no está pendiente" : "Te llega esto"}
        </p>
        <p className="mt-2 text-[18px] leading-snug text-[#F3F1EB]">«{inbound}»</p>
        <ul className="mt-4 space-y-2">
          {manual.map((field) => (
            <li key={field} className="flex items-baseline justify-between gap-3">
              <span
                className={`text-[14px] ${
                  settled ? "text-zinc-500 line-through" : "text-zinc-100"
                }`}
              >
                {field}
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                A mano
              </span>
            </li>
          ))}
        </ul>
        {loading ? (
          <p className="mt-4 text-[13.5px] text-zinc-300">Saliendo hacia tu correo…</p>
        ) : send && !send.sent ? (
          <p className="mt-4 text-[13.5px] leading-relaxed text-amber-100">
            {send.title}. {send.line}
          </p>
        ) : send ? null : (
          <p className="mt-4 text-[13.5px] text-zinc-400">
            El correo sale cuando pulses Enviar.
          </p>
        )}
      </div>

      {settled && activation ? <LabMailProof activation={activation} /> : null}
    </div>
  );
}

export function CaseWalk({
  item,
  activation,
  chosen,
  onBack,
  onContinue,
}: {
  item: LabCase;
  activation: LabActivationState | null;
  chosen: string | null;
  onBack: () => void;
  onContinue: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const { schedule, clear } = useManagedTimers();
  const [stage, setStage] = useState(0);
  const send = describeLabSend(activation);
  const done = stage >= 3;

  useEffect(() => {
    if (reduceMotion) {
      setStage(3);
      return;
    }
    clear();
    setStage(0);
    schedule(() => setStage(1), 400);
    schedule(() => setStage(2), 1400);
    schedule(() => setStage(3), 2400);
  }, [item.id, reduceMotion, clear, schedule]);

  const resolved = done && send.sent;

  return (
    <div className="max-w-4xl">
      <LabEyebrow>El recorrido</LabEyebrow>
      <LabHeading as="h1" className="mt-3">
        {done ? "Así queda resuelto" : "Está entrando"}
      </LabHeading>

      <LabFlow className="mt-8" steps={item.flow} active={stage} />

      <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-2">
        <div
          className={`flex h-full flex-col rounded-2xl border px-5 py-5 ${
            stage === 2 && !done
              ? "border-amber-200/30 bg-[#101826]"
              : "border-white/10 bg-[#101826]"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            {resolved ? "Esto ya no está pendiente" : "Acaba de llegar"}
          </p>
          <p className="mt-2 text-[18px] leading-snug text-[#F3F1EB]">«{item.inbound}»</p>
          {stage >= 1 ? (
            <ul className="mt-4 space-y-2">
              {item.manual.map((field) => (
                <li key={field} className="flex items-baseline justify-between gap-3">
                  <span
                    className={`text-[14px] ${
                      resolved ? "text-zinc-500 line-through" : "text-zinc-100"
                    }`}
                  >
                    {field}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                    A mano
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {stage === 2 && !done ? (
            <p className="mt-4 text-[13px] text-amber-100">Alguien lo estaría copiando ahora.</p>
          ) : null}
        </div>

        <div
          className={`flex h-full flex-col rounded-2xl border px-5 py-5 ${
            resolved
              ? "border-emerald-300/25 bg-[#101826]"
              : "border-white/10 bg-[#101826]"
          }`}
        >
          {done && send.sent ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                Queda así
              </p>
              <ul className="mt-3 space-y-2">
                {item.kept.map((line) => (
                  <li key={line} className="text-[15px] text-[#F3F1EB]">
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-300">{item.result}</p>
              {chosen ? (
                <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-400">
                  Si vuelve a pasar: {chosen}
                </p>
              ) : null}
            </>
          ) : done ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200">
                {send.title}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-200">{send.line}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                Hasta que el correo salga, el trabajo sigue siendo a mano.
              </p>
            </>
          ) : (
            <p className="text-[14px] leading-relaxed text-zinc-400">
              {stage < 2
                ? "Todavía hay que apuntarlo a mano."
                : "El trabajo a mano se está sustituyendo."}
            </p>
          )}
        </div>
      </div>

      {resolved && activation ? (
        <motion.div
          className="mx-auto mt-8 w-full max-w-md"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <LabMailProof activation={activation} />
        </motion.div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LabButton disabled={!done} onClick={onContinue}>
          Continuar
        </LabButton>
        <LabButton variant="ghost" onClick={onBack}>
          Volver
        </LabButton>
      </div>
    </div>
  );
}

const LINK_CLASS =
  "cursor-pointer text-[13px] text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70";
