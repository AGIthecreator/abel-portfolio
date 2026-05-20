/** Marcas de esquina tipo plano técnico (StrategicProfile / BpCornerTicksOverlay). */
export function CornerTicks() {
  const line = "absolute bg-zinc-500/40 pointer-events-none";

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <span className={`${line} top-3 left-3 h-px w-3`} />
      <span className={`${line} top-3 left-3 h-3 w-px`} />
      <span className={`${line} top-3 right-3 h-px w-3`} />
      <span className={`${line} top-3 right-3 h-3 w-px`} />
      <span className={`${line} bottom-3 left-3 h-px w-3`} />
      <span className={`${line} bottom-3 left-3 h-3 w-px`} />
      <span className={`${line} bottom-3 right-3 h-px w-3`} />
      <span className={`${line} bottom-3 right-3 h-3 w-px`} />
    </div>
  );
}
