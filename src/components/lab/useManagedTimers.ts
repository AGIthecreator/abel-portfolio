"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Temporizadores del laboratorio, centralizados.
 *
 * El laboratorio revela pasos en secuencia, así que abre varios `setTimeout`
 * por ejecución. El defecto que esto corrige es real: cuando el efecto de
 * limpieza captura el array de timers en el momento del montaje y la ejecución
 * lo reasigna después, al desmontar se limpia un array antiguo y quedan timers
 * huérfanos que llaman a `setState` sobre un componente desmontado, o que
 * pisan el resultado de una ejecución posterior.
 *
 * Aquí los identificadores viven en un `Set` estable dentro de una ref, que es
 * el mismo objeto durante toda la vida del componente. `clear()` cancela todo
 * lo pendiente antes de empezar una ejecución nueva y `isMounted()` permite no
 * actualizar estado después del desmontaje.
 */
export function useManagedTimers() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const pending = timers.current;
    return () => {
      mounted.current = false;
      for (const id of pending) clearTimeout(id);
      pending.clear();
    };
  }, []);

  /** Cancela todo lo pendiente. Se llama al reiniciar una ejecución. */
  const clear = useCallback(() => {
    for (const id of timers.current) clearTimeout(id);
    timers.current.clear();
  }, []);

  /** Programa una acción que no se ejecutará si el componente ya no está montado. */
  const schedule = useCallback((fn: () => void, delayMs: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      if (mounted.current) fn();
    }, delayMs);
    timers.current.add(id);
    return id;
  }, []);

  const isMounted = useCallback(() => mounted.current, []);

  return { schedule, clear, isMounted };
}
