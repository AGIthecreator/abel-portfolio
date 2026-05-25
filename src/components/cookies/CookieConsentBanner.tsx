"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { useCookieConsent } from "@/components/cookies/CookieConsentContext";
import {
  OPTIONAL_COOKIES,
  createDefaultOptionalPreferences,
  createEssentialOnlyPreferences,
  hasOptionalConsent,
  type OptionalCookieId,
} from "@/lib/cookie-preferences";

const PRIMARY_BTN =
  "rounded-lg bg-[#F3F1EB] px-3.5 py-2 text-xs font-medium text-[#070b13] transition-[opacity,background-color] duration-200 hover:bg-[#F3F1EB]/88 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,24,0.92)]";

const SECONDARY_BTN =
  "rounded-lg border border-white/10 bg-transparent px-3.5 py-2 text-xs font-medium text-zinc-300 transition-[border-color,background-color,color] duration-200 hover:border-white/14 hover:bg-white/3 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,24,0.92)]";

const TERTIARY_BTN =
  "px-1 py-2 text-xs text-zinc-400 transition-colors duration-200 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,24,0.92)]";

function PreferenceSwitch({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-white/3 px-3.5 py-3">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={disabled ? undefined : id}
          className={`block text-sm text-zinc-200 ${disabled ? "" : "cursor-pointer"}`}
        >
          {label}
        </label>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,24,0.92)] disabled:cursor-not-allowed ${
          checked ? "bg-[#F3F1EB]/90" : "bg-white/10"
        } ${disabled ? "opacity-70" : "cursor-pointer"}`}
      >
        <span
          aria-hidden
          className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[18px]" : "translate-x-1"
          } ${checked && !disabled ? "bg-[#070b13]" : ""}`}
        />
      </button>
    </div>
  );
}

export function CookieConsentBanner() {
  const reduceMotion = useReducedMotion();
  const analyticsToggleId = useId();
  const {
    consent,
    ready,
    showPreferences,
    setShowPreferences,
    acceptAll,
    savePreferences,
  } = useCookieConsent();
  const [optionalPreferences, setOptionalPreferences] = useState(
    createDefaultOptionalPreferences,
  );

  const visible = ready && consent === null;

  useEffect(() => {
    if (showPreferences) {
      setOptionalPreferences(createDefaultOptionalPreferences());
    }
  }, [showPreferences]);

  const setOptionalPreference = (id: OptionalCookieId, enabled: boolean) => {
    setOptionalPreferences((current) => ({ ...current, [id]: enabled }));
  };

  const acceptEssentialOnly = () => {
    setOptionalPreferences(createEssentialOnlyPreferences());
    savePreferences(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          aria-label="Preferencias de privacidad"
          className="fixed bottom-6 left-6 z-70 w-[calc(100%-3rem)] max-w-[420px] sm:w-full"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, transition: { duration: 0.22, ease: "easeOut" } }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.div
            layout={reduceMotion ? false : "position"}
            className="rounded-2xl border border-white/8 bg-[rgba(10,15,24,0.92)] p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-5"
          >
            <p
              id="cookie-consent-title"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500"
            >
              Privacidad
            </p>

            {!showPreferences ? (
              <p
                id="cookie-consent-description"
                className="mt-2.5 text-sm leading-relaxed text-zinc-400"
              >
                Uso cookies para estadísticas y mejorar la experiencia de la web.
                Puedes cambiar tus preferencias cuando quieras.
              </p>
            ) : (
              <p id="cookie-consent-description" className="sr-only">
                Configuración de cookies del sitio
              </p>
            )}

            <AnimatePresence initial={false}>
              {showPreferences ? (
                <motion.div
                  key="preferences"
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={
                    reduceMotion ? undefined : { opacity: 1, height: "auto" }
                  }
                  exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    layout={reduceMotion ? false : "position"}
                    className="mt-4 space-y-2.5"
                  >
                    <PreferenceSwitch
                      id={`${analyticsToggleId}-essential`}
                      label="Necesarias"
                      description="Imprescindibles para que la web funcione."
                      checked
                      disabled
                    />
                    {(Object.keys(OPTIONAL_COOKIES) as OptionalCookieId[]).map(
                      (cookieId) => {
                        const cookie = OPTIONAL_COOKIES[cookieId];
                        return (
                          <PreferenceSwitch
                            key={cookieId}
                            id={`${analyticsToggleId}-${cookieId}`}
                            label={cookie.label}
                            description={cookie.description}
                            checked={optionalPreferences[cookieId]}
                            onChange={(enabled) =>
                              setOptionalPreference(cookieId, enabled)
                            }
                          />
                        );
                      },
                    )}
                    <Link
                      href="/privacy"
                      className="inline-block pt-0.5 text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(10,15,24,0.92)]"
                    >
                      Ver política de privacidad
                    </Link>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.div
              layout={reduceMotion ? false : "position"}
              className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5"
            >
              {showPreferences ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      savePreferences(hasOptionalConsent(optionalPreferences))
                    }
                    className={PRIMARY_BTN}
                    aria-label="Guardar preferencias de cookies"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={acceptEssentialOnly}
                    className={SECONDARY_BTN}
                    aria-label="Aceptar solo cookies necesarias"
                  >
                    Solo necesarias
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(false)}
                    className={TERTIARY_BTN}
                    aria-label="Volver al aviso de cookies"
                  >
                    Volver
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className={PRIMARY_BTN}
                    aria-label="Aceptar cookies"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={acceptEssentialOnly}
                    className={SECONDARY_BTN}
                    aria-label="Aceptar solo cookies necesarias"
                  >
                    Solo necesarias
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className={TERTIARY_BTN}
                    aria-label="Configurar preferencias de cookies"
                  >
                    Configurar
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
