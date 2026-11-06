"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ServicePageRoot } from "@/components/services/ServicePagePrimitives";
import { trackEvent } from "@/lib/analytics";
import { inferLabCaseId, labCaseById, type LabCaseId } from "@/lib/lab/cases";
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
import { CasePain, CasePicker, CaseTwist, CaseWalk } from "./CaseFlow";
import { DemoProgress, type LabProgressStep } from "./DemoProgress";

type LabScreen =
  | "pick"
  | "pain"
  | "trial"
  | "twist"
  | "walk"
  | "clinic"
  | "builder"
  | "finale";

function progressOf(screen: LabScreen): LabProgressStep {
  if (screen === "finale") return "cierre";
  if (screen === "walk") return "recorrido";
  if (screen === "pick" || screen === "pain") return "caso";
  return "prueba";
}

export function LaboratorioShell() {
  const [state, setState] = useState<LabSessionState>(createLabSession);
  const [restorable, setRestorable] = useState(false);
  const [screen, setScreen] = useState<LabScreen>("pick");
  const [caseId, setCaseId] = useState<LabCaseId | null>(null);
  const [boundCaseId, setBoundCaseId] = useState<LabCaseId | null>(null);
  const startTracked = useRef(false);

  useEffect(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

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
      const inferred = next.activation
        ? inferLabCaseId(next.activation.input.message)
        : null;
      if (inferred) {
        setCaseId(inferred);
        setBoundCaseId(inferred);
      }
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
        const inferred = inferLabCaseId(activation.input.message);
        if (inferred) {
          setCaseId(inferred);
          setBoundCaseId(inferred);
        }
        setRestorable(true);
      } catch {
        /* sin red o sesión lenta: la elección de caso ya está en pantalla */
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
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [update],
  );

  const openScreen = (next: LabScreen) => {
    if (!startTracked.current && next !== "pick") {
      startTracked.current = true;
      trackEvent("demo_started");
    }
    setRestorable(false);
    setScreen(next);
    const act: LabAct =
      next === "finale"
        ? 4
        : next === "walk" || next === "builder"
          ? 3
          : next === "pick" || next === "pain"
            ? 1
            : 2;
    goToAct(act);
  };

  const restart = () => {
    void labFetch("/api/laboratorio/sesion", { method: "DELETE" });
    clearLabSession();
    startTracked.current = false;
    setRestorable(false);
    setCaseId(null);
    setBoundCaseId(null);
    setScreen("pick");
    setState(createLabSession());
  };

  const resume = () => {
    if (!startTracked.current) {
      startTracked.current = true;
      trackEvent("demo_started", { resumed: true });
    }
    setRestorable(false);
    if (state.visitedActs.includes(4)) openScreen("finale");
    else if (state.activation) openScreen("trial");
    else if (Object.keys(state.decisions).length > 0 && caseId) openScreen("twist");
    else openScreen("pick");
  };

  const handleActivated = (activation: LabActivationState) => {
    setBoundCaseId(caseId);
    update((prev) => ({
      ...prev,
      activation,
      pastRuns: prev.activation
        ? [...prev.pastRuns, summarizeActivation(prev.activation)]
        : prev.pastRuns,
    }));
  };

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

  const selected = caseId ? labCaseById(caseId) : null;
  const trialActivation =
    state.activation && boundCaseId === caseId ? state.activation : null;
  const stats = useMemo(() => computeLabStats(state), [state]);
  const progress = progressOf(screen);
  const visitedProgress: LabProgressStep[] = ["caso"];
  if (
    screen === "trial" ||
    screen === "twist" ||
    screen === "clinic" ||
    screen === "builder" ||
    screen === "finale" ||
    state.activation
  ) {
    visitedProgress.push("prueba");
  }
  if (
    screen === "walk" ||
    screen === "builder" ||
    screen === "finale" ||
    state.visitedActs.includes(3)
  ) {
    visitedProgress.push("recorrido");
  }
  if (screen === "finale" || state.visitedActs.includes(4)) {
    visitedProgress.push("cierre");
  }

  return (
    <ServicePageRoot>
      <div className="relative min-h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_8%_0%,rgba(90,72,168,0.34),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_12%,rgba(37,28,73,0.5),transparent_50%)]"
        />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-28 pb-20 sm:px-8 sm:pt-36 sm:pb-24 lg:px-10 lg:pt-32 lg:pb-32">
        {screen !== "finale" ? (
          <div className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
            <DemoProgress
              current={progress}
              visited={visitedProgress}
              onNavigate={(step) => {
                if (step === "caso") openScreen("pick");
                else if (step === "prueba" && (caseId || state.activation)) openScreen("trial");
                else if (step === "recorrido" && caseId) openScreen("walk");
                else if (step === "cierre") openScreen("finale");
              }}
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

        {screen === "pick" ? (
          <CasePicker
            selectedId={caseId}
            canResume={restorable}
            onResume={resume}
            onSelect={(id) => {
              setCaseId(id);
              openScreen("pain");
            }}
          />
        ) : null}

        {screen === "pain" && selected ? (
          <CasePain
            item={selected}
            onBack={() => openScreen("pick")}
            onContinue={() => openScreen("trial")}
          />
        ) : null}

        {screen === "trial" && selected ? (
          <ActActivate
            key={selected.id}
            activation={trialActivation}
            presetMessage={selected.message}
            scene={{
              title: selected.title,
              pain: selected.pain,
              inbound: selected.inbound,
              manual: selected.manual,
              flow: selected.flow,
            }}
            onActivated={handleActivated}
            onActivationChange={handleActivationChange}
            onBack={() => openScreen("pain")}
            onContinue={() => openScreen("twist")}
          />
        ) : null}

        {screen === "twist" && selected ? (
          <CaseTwist
            item={selected}
            selectedId={state.decisions[selected.twist.id]}
            onSelect={(option) => handleAnswer(selected.twist.id, option)}
            onBack={() => openScreen("trial")}
            onContinue={() => openScreen("walk")}
            onOtherCase={() => openScreen("pick")}
            onMore={() => openScreen("clinic")}
            onBuild={() => openScreen("builder")}
          />
        ) : null}

        {screen === "clinic" ? (
          <ActDecisions
            answers={state.decisions}
            onAnswer={handleAnswer}
            onBack={() => openScreen("twist")}
            onContinue={() => {
              reportLabProgress({
                event: "experience",
                experience: "decisions",
              });
              openScreen(selected ? "walk" : "finale");
            }}
          />
        ) : null}

        {screen === "walk" && selected ? (
          <CaseWalk
            item={selected}
            activation={trialActivation}
            chosen={
              selected.twist.options.find(
                (option) => option.id === state.decisions[selected.twist.id],
              )?.consequence ?? null
            }
            onBack={() => openScreen("twist")}
            onContinue={() => openScreen("finale")}
          />
        ) : null}

        {screen === "builder" ? (
          <div>
            <button
              type="button"
              onClick={() => openScreen(selected ? "twist" : "pick")}
              className="mb-4 cursor-pointer text-[13px] text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-zinc-200"
            >
              Volver
            </button>
            <ActBuilder
              builder={state.builder}
              onBuilderChange={handleBuilderChange}
              onContinue={() => {
                reportLabProgress({
                  event: "experience",
                  experience: "builder",
                });
                openScreen(selected ? "walk" : "finale");
              }}
            />
          </div>
        ) : null}

        {screen === "finale" ? (
          <ActResult
            stats={stats}
            activation={state.activation}
            flow={state.builder.flow}
            onRestart={restart}
            onBack={() => openScreen(selected ? "walk" : "pick")}
          />
        ) : null}
        </div>
      </div>
    </ServicePageRoot>
  );
}
