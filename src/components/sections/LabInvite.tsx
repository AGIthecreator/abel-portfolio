import Link from "next/link";

const NEAR_BLACK = "#030305";

const CTA =
  "group relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-[rgba(150,142,180,0.26)] bg-[linear-gradient(180deg,#34343b_0%,#1d1d22_44%,#141417_56%,#0b0b0d_100%)] px-4 py-2.5 text-[13px] font-semibold text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.55),0_6px_18px_-9px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-violet-400/45 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.55),0_10px_26px_-10px_rgba(124,58,237,0.45)]";

export function LabInvite() {
  return (
    <section
      id="laboratorio"
      className="relative scroll-mt-24 w-full"
      style={{ backgroundColor: NEAR_BLACK }}
      aria-labelledby="lab-invite-heading"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
        <div className="relative inline-block px-7 py-8 sm:px-10 sm:py-10">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-white/25"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r border-t border-white/25"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b border-l border-white/25"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-white/25"
          />

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Laboratorio
          </p>
          <h2
            id="lab-invite-heading"
            className="mt-5 text-balance font-serif text-[clamp(1.45rem,4.6vw,2.5rem)] font-normal leading-[1.22] tracking-[-0.02em] text-zinc-100"
          >
            ¿Quieres verlo funcionando?
          </h2>
          <p className="mx-auto mt-7 max-w-[36ch] text-balance font-serif text-[clamp(1.05rem,2.8vw,1.35rem)] font-normal leading-[1.4] text-zinc-500 sm:max-w-lg">
            Prueba una demostración: entra una solicitud, el sistema decide y
            ves el proceso seguir.
          </p>
          <p className="mx-auto mt-4 max-w-[40ch] text-[13px] leading-relaxed text-zinc-600 sm:max-w-md">
            Si buscas el servicio, no la demo, está en{" "}
            <Link
              href="/automatizacion-de-procesos"
              className="text-zinc-400 underline decoration-violet-400/30 underline-offset-[3px] transition-colors hover:text-zinc-200"
            >
              automatización de procesos
            </Link>
            .
          </p>
          <div className="mt-9">
            <Link href="/laboratorio" className={CTA}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.55),transparent)] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="relative z-10">Entrar al Laboratorio</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
