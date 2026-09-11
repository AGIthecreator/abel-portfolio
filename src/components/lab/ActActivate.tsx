"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { labFetch } from "@/lib/lab/client";
import { LAB_MAX_MESSAGE_LENGTH } from "@/lib/lab/schema";
import type { LabActivationState } from "@/lib/lab/session";
import type {
  LabAction,
  LabFollowupResponse,
  LabRunResponse,
  LabStatusResponse,
  LabStep,
} from "@/lib/lab/types";
import {
  ActionChip,
  ActionStatusLabel,
  ExecutionBadge,
  LabButton,
  LabEyebrow,
  LabHeading,
  LabPanel,
} from "./LabUi";
import { ProcessTimeline } from "./ProcessTimeline";
import { useManagedTimers } from "./useManagedTimers";

const FIELD_CLASS =
  "w-full rounded-lg border border-white/12 bg-[#0c121c] px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-500 transition-colors duration-200 focus:border-violet-400/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/60";

const LABEL_CLASS =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400";

/** Pasos provisionales mientras el servidor responde. */
const PENDING_STEPS: LabStep[] = [
  {
    id: "entrada",
    type: "input",
    label: "Entrada",
    description: "Solicitud recibida",
    status: "running",
    executionMode: "real",
  },
  {
    id: "registro",
    type: "record",
    label: "Registro",
    description: "Datos guardados",
    status: "pending",
    executionMode: "real",
  },
  {
    id: "clasificacion",
    type: "classify",
    label: "Clasificación",
    description: "Reglas deterministas sobre el texto",
    status: "pending",
    executionMode: "real",
  },
  {
    id: "decision",
    type: "decision",
    label: "Decisión",
    description: "Eligiendo la ruta que corresponde",
    status: "pending",
    executionMode: "real",
  },
  {
    id: "accion",
    type: "action",
    label: "Acción",
    description: "Ejecutando el siguiente paso",
    status: "pending",
    executionMode: "real",
  },
];

/** Etiqueta corta de cada acción para el resumen de chips. */
const CHIP_LABEL: Partial<Record<LabAction["id"], string>> = {
  email_internal: "Aviso interno",
  email_visitor: "Email enviado",
  email_status: "Estado consultado",
  record: "Solicitud registrada",
  pdf: "PDF generado",
  followup: "Seguimiento programado",
  followup_cancel: "Seguimiento cancelado",
  followup_reschedule: "Seguimiento movido",
  whatsapp: "WhatsApp",
  crm: "CRM",
};

type PendingAction = "status" | "pdf" | "followup" | "cancel" | "reschedule";

interface ActActivateProps {
  activation: LabActivationState | null;
  onActivated: (activation: LabActivationState) => void;
  onActivationChange: (activation: LabActivationState) => void;
  onContinue: () => void;
}

export function ActActivate({
  activation,
  onActivated,
  onActivationChange,
  onContinue,
}: ActActivateProps) {
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [revealed, setRevealed] = useState(0);
  const { schedule, clear, isMounted } = useManagedTimers();

  const revealSteps = useCallback(
    (steps: readonly LabStep[]) => {
      if (reduceMotion) {
        setRevealed(steps.length);
        return;
      }
      setRevealed(1);
      // Revelado corto: la ejecución real ya terminó, esto solo la hace legible.
      for (let i = 2; i <= steps.length; i += 1) {
        schedule(() => setRevealed(i), (i - 1) * 190);
      }
    },
    [reduceMotion, schedule],
  );

  const submit = async () => {
    setFieldError(null);
    setSubmitError(null);
    setActionError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setFieldError("Escribe tu nombre.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldError("Necesito un email válido para que el proceso pueda actuar.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setFieldError("Cuéntame en una frase qué haces de forma repetida.");
      return;
    }

    setLoading(true);
    setRevealed(0);
    // Cancela el revelado de la ejecución anterior antes de empezar otra.
    clear();
    trackEvent("real_flow_started");

    try {
      const res = await labFetch("/api/laboratorio/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          website,
        }),
      });

      const data = (await res.json()) as LabRunResponse | { error?: string };

      if (!isMounted()) return;

      if (!res.ok || !("ok" in data) || !data.ok) {
        setSubmitError(
          res.status === 429
            ? "Demasiados intentos seguidos. Espera un momento y vuelve a probar."
            : "error" in data && data.error
              ? data.error
              : "No se ha podido ejecutar el proceso.",
        );
        setLoading(false);
        return;
      }

      const next: LabActivationState = {
        runId: data.runId,
        duplicate: data.duplicate,
        classification: data.classification,
        route: data.route,
        steps: data.steps,
        actions: data.actions,
        capabilities: data.capabilities,
        degradedReason: data.degradedReason,
        followup: data.followup ?? null,
        input: {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        },
      };

      if (data.duplicate) {
        trackEvent("duplicate_detected");
      } else {
        trackEvent("real_flow_completed", {
          route: data.route.id,
          real_actions: data.actions.filter(
            (a) => a.executionMode === "real" && a.status === "done",
          ).length,
        });
      }

      onActivated(next);
      revealSteps(data.steps);
    } catch {
      if (isMounted()) setSubmitError("No se ha podido conectar. Inténtalo de nuevo.");
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  // Al volver desde sessionStorage los pasos se muestran ya completos.
  const restoredRunId = useRef<string | null>(null);
  useEffect(() => {
    if (activation && restoredRunId.current !== activation.runId) {
      restoredRunId.current = activation.runId;
      setRevealed(activation.steps.length);
      setName(activation.input.name);
      setEmail(activation.input.email);
      setMessage(activation.input.message);
    }
  }, [activation]);

  /** Añade el paso y la acción que devuelve el servidor, sin inventar nada. */
  const applyServerResult = useCallback(
    (
      current: LabActivationState,
      step: LabStep,
      action: LabAction,
      followup?: LabActivationState["followup"],
    ) => {
      const steps = [...current.steps.filter((s) => s.id !== step.id), step];
      const actions = [
        ...current.actions.filter((a) => a.id !== action.id),
        action,
      ];
      onActivationChange({
        ...current,
        steps,
        actions,
        followup: followup ?? current.followup,
      });
      setRevealed(steps.length);
    },
    [onActivationChange],
  );

  const runAction = useCallback(
    async (kind: PendingAction) => {
      if (!activation) return;
      setActionError(null);
      setPending(kind);

      const { runId, input } = activation;
      const body = { runId, ...input };

      try {
        if (kind === "status") {
          const res = await labFetch("/api/laboratorio/estado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ runId }),
          });
          const data = (await res.json()) as
            | LabStatusResponse
            | { error?: string };
          if (!isMounted()) return;
          if (!res.ok || !("ok" in data)) {
            setActionError(
              ("error" in data && data.error) ||
                "No se ha podido consultar el estado.",
            );
            return;
          }
          trackEvent("lab_status_checked", { event: data.status.event ?? "none" });
          applyServerResult(activation, data.step, data.action);
          return;
        }

        if (kind === "pdf") {
          const res = await labFetch("/api/laboratorio/informe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            if (isMounted()) {
              setActionError(data.error ?? "No se ha podido generar el informe.");
            }
            return;
          }

          const blob = await res.blob();
          const emailedMode =
            res.headers.get("X-Lab-Report-Emailed") === "real"
              ? "real"
              : "simulated";
          const emailDetail = decodeURIComponent(
            res.headers.get("X-Lab-Report-Email-Detail") ?? "",
          );

          const disposition = res.headers.get("Content-Disposition") ?? "";
          const filename =
            /filename="([^"]+)"/.exec(disposition)?.[1] ??
            "informe-automatizacion.pdf";

          if (!isMounted()) return;

          // La descarga se dispara desde el blob que ha generado el servidor.
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);

          trackEvent("lab_report_generated", { emailed: emailedMode });

          applyServerResult(
            activation,
            {
              id: "documento",
              type: "document",
              label: "Documento",
              description: "Informe de la ejecución",
              status: "done",
              executionMode: "real",
              detail: `Informe generado en el servidor y descargado. ${emailDetail}`,
            },
            {
              id: "pdf",
              label: "Informe de automatización en PDF",
              status: "done",
              executionMode: "real",
              detail: `PDF generado en servidor (${Math.round(blob.size / 1024)} KB). ${emailDetail}`,
            },
          );
          return;
        }

        const operation =
          kind === "followup"
            ? "schedule"
            : kind === "cancel"
              ? "cancel"
              : "reschedule";

        const res = await labFetch("/api/laboratorio/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            operation,
            ...(operation === "reschedule" ? { shiftMinutes: 60 } : {}),
          }),
        });

        const data = (await res.json()) as
          | LabFollowupResponse
          | { error?: string };
        if (!isMounted()) return;

        if (!res.ok || !("ok" in data)) {
          setActionError(
            ("error" in data && data.error) ||
              "No se ha podido completar la operación.",
          );
          return;
        }

        trackEvent("lab_followup", {
          operation,
          status: data.followup.status,
        });
        applyServerResult(activation, data.step, data.action, data.followup);
      } catch {
        if (isMounted()) {
          setActionError("No se ha podido conectar con el servidor.");
        }
      } finally {
        if (isMounted()) setPending(null);
      }
    },
    [activation, applyServerResult, isMounted],
  );

  const visibleSteps = activation
    ? activation.steps.map((step, index) =>
        index < revealed ? step : { ...step, status: "pending" as const },
      )
    : loading
      ? PENDING_STEPS
      : [];

  const chips = activation
    ? activation.actions
        .filter(
          (action) =>
            action.status === "done" ||
            action.status === "failed" ||
            action.executionMode === "simulated",
        )
        .map((action) => ({
          id: action.id,
          label: CHIP_LABEL[action.id] ?? action.label,
          mode: action.executionMode,
          failed: action.status === "failed",
        }))
    : [];

  const followupScheduled =
    activation?.followup?.status === "scheduled" &&
    Boolean(activation.followup.scheduledAt);
  const followupCanceled = activation?.followup?.status === "canceled";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div>
        <LabEyebrow>Acto 01 · Activa un proceso</LabEyebrow>
        <LabHeading className="mt-3">
          Rellena esto y mira qué ocurre por dentro
        </LabHeading>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-300">
          Lo que ejecute de verdad llevará la etiqueta{" "}
          <ExecutionBadge mode="real" className="align-middle" /> y lo que solo
          represente algo posible llevará{" "}
          <ExecutionBadge mode="simulated" className="align-middle" />.
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div>
            <label className={LABEL_CLASS} htmlFor="lab-name">
              Nombre
            </label>
            <input
              id="lab-name"
              name="name"
              autoComplete="name"
              className={FIELD_CLASS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lab-email">
              Email
            </label>
            <input
              id="lab-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className={FIELD_CLASS}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lab-message">
              Mensaje
            </label>
            <textarea
              id="lab-message"
              name="message"
              rows={3}
              className={`${FIELD_CLASS} resize-y`}
              placeholder="Tengo muchas reservas que gestiono por WhatsApp."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={LAB_MAX_MESSAGE_LENGTH}
            />
          </div>

          <div className="hidden" aria-hidden>
            <label htmlFor="lab-website">No rellenar</label>
            <input
              id="lab-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {fieldError ? (
            <p role="alert" className="text-[12.5px] text-amber-200">
              {fieldError}
            </p>
          ) : null}
          {submitError ? (
            <p role="alert" className="text-[12.5px] text-amber-200">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <LabButton
              type="submit"
              variant={activation ? "secondary" : "primary"}
              disabled={loading}
            >
              {loading
                ? "Ejecutando…"
                : activation
                  ? "Volver a activar"
                  : "Activar proceso"}
            </LabButton>
            {activation ? (
              <LabButton onClick={onContinue}>Continuar</LabButton>
            ) : null}
          </div>

          <p className="text-[11.5px] leading-relaxed text-zinc-400">
            Tus datos se usan solo para ejecutar este proceso y para que pueda
            responderte. La demo tiene un límite de ejecuciones reales.
          </p>
        </form>
      </div>

      <div className="min-w-0">
        <LabPanel>
          {visibleSteps.length === 0 ? (
            <div className="flex min-h-64 flex-col justify-center gap-2 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                En espera
              </p>
              <p className="text-[13.5px] leading-relaxed text-zinc-300">
                El proceso no hace nada hasta que alguien lo activa.
              </p>
            </div>
          ) : (
            <ProcessTimeline steps={visibleSteps} live />
          )}
        </LabPanel>

        <AnimatePresence>
          {activation ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="mt-4 flex flex-col gap-4"
            >
              {chips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <ActionChip
                      key={chip.id}
                      mode={chip.mode}
                      label={chip.label}
                      failed={chip.failed}
                    />
                  ))}
                </div>
              ) : null}

              {activation.duplicate ? (
                <LabPanel className="border-amber-300/20 bg-amber-400/5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-200">
                    Solicitud ya registrada
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-300">
                    El sistema ha detectado una solicitud reciente y evita
                    ejecutar el mismo proceso otra vez. Tu flujo sigue aquí.
                  </p>
                </LabPanel>
              ) : null}

              {!activation.duplicate || activation.capabilities.pdf ? (
                <LabPanel>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                      Clasificación y ruta
                    </p>
                    <ExecutionBadge
                      mode={activation.classification.executionMode}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Tipo", activation.classification.type],
                      ["Prioridad", activation.classification.priority],
                      ["Ruta", activation.route.label],
                      ["Área", activation.route.team],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-400">
                          {label}
                        </dt>
                        <dd className="mt-1 text-[13.5px] text-zinc-100">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-[12px] leading-relaxed text-zinc-400">
                    {activation.classification.reason} {activation.route.reason}{" "}
                    No hay ningún modelo de IA detrás: son reglas sobre el texto,
                    y la ruta que eligen decide qué plantilla sale.
                  </p>
                </LabPanel>
              ) : null}

              {activation.capabilities.emailStatus ||
              activation.capabilities.pdf ||
              activation.capabilities.followup ? (
                <LabPanel>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                    Sigue el proceso
                  </p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-300">
                    Estas acciones se ejecutan en el servidor cuando las pulsas.
                    Lo que devuelva el proveedor es lo que aparece en el
                    timeline.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {activation.capabilities.emailStatus ? (
                      <LabButton
                        variant="secondary"
                        disabled={pending !== null}
                        onClick={() => void runAction("status")}
                      >
                        {pending === "status"
                          ? "Consultando…"
                          : "Consultar estado del envío"}
                      </LabButton>
                    ) : null}
                    {activation.capabilities.pdf ? (
                      <LabButton
                        variant="secondary"
                        disabled={pending !== null}
                        onClick={() => void runAction("pdf")}
                      >
                        {pending === "pdf"
                          ? "Generando…"
                          : "Generar informe en PDF"}
                      </LabButton>
                    ) : null}
                    {activation.capabilities.followup && !followupScheduled &&
                    !followupCanceled ? (
                      <LabButton
                        variant="secondary"
                        disabled={pending !== null}
                        onClick={() => void runAction("followup")}
                      >
                        {pending === "followup"
                          ? "Programando…"
                          : "Programar seguimiento"}
                      </LabButton>
                    ) : null}
                    {followupScheduled ? (
                      <>
                        <LabButton
                          variant="secondary"
                          disabled={pending !== null}
                          onClick={() => void runAction("reschedule")}
                        >
                          {pending === "reschedule"
                            ? "Moviendo…"
                            : "Retrasar 1 hora"}
                        </LabButton>
                        <LabButton
                          variant="ghost"
                          disabled={pending !== null}
                          onClick={() => void runAction("cancel")}
                        >
                          {pending === "cancel"
                            ? "Cancelando…"
                            : "Cancelar seguimiento"}
                        </LabButton>
                      </>
                    ) : null}
                  </div>
                  {actionError ? (
                    <p role="alert" className="mt-3 text-[12.5px] text-amber-200">
                      {actionError}
                    </p>
                  ) : null}
                </LabPanel>
              ) : null}

              <LabPanel>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                  Acciones
                </p>
                <ul className="mt-3 flex list-none flex-col gap-3 p-0">
                  {activation.actions.map((action) => (
                    <li key={action.id} className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] text-zinc-100">
                          {action.label}
                        </span>
                        <ExecutionBadge mode={action.executionMode} />
                        <span className="ml-auto">
                          <ActionStatusLabel status={action.status} />
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-zinc-400">
                        {action.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </LabPanel>

              {activation.degradedReason ? (
                <p className="text-[12.5px] leading-relaxed text-amber-200">
                  {activation.degradedReason}
                </p>
              ) : null}

              {!activation.duplicate ? (
                <p className="text-[12.5px] leading-relaxed text-zinc-400">
                  Prueba a enviarlo otra vez con el mismo email: el proceso
                  recuerda lo que ya ha hecho.
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
