import type { Metadata } from "next";
import Link from "next/link";
import { NotFoundMascot } from "@/components/not-found/NotFoundMascot";

export const metadata: Metadata = {
  title: "Página no encontrada | AGI TheCreator",
  description:
    "Esta ruta no existe. Vuelve al inicio o consulta precios y servicios de AGI TheCreator.",
  robots: {
    index: false,
    follow: false,
  },
};

const PRIMARY_BTN =
  "inline-flex items-center justify-center rounded-lg bg-[#F3F1EB] px-6 py-2.5 text-sm font-medium text-[#070b13] no-underline transition-[opacity,background-color] duration-200 hover:bg-[#F3F1EB]/88 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b13]";

const SECONDARY_LINK =
  "font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-300";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#070b13] px-6 py-20 sm:py-24">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 22% 28%, rgba(80, 50, 200, 0.1), transparent 48%), radial-gradient(circle at 78% 72%, rgba(0, 200, 255, 0.06), transparent 44%)",
          }}
        />
        <div className="footer-grain-overlay absolute inset-0" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <NotFoundMascot />

        <div className="flex w-full flex-col items-center gap-6 sm:gap-7">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500/70">
            PÁGINA NO ENCONTRADA
          </p>

          <h1 className="max-w-[480px] text-balance text-[clamp(1.65rem,4.2vw,2.35rem)] font-semibold leading-[1.12] tracking-tight text-zinc-50">
            <span className="text-[#F3F1EB]">Hemos seguido un </span>
            <span className="text-violet-300/90">camino</span>
            <span className="text-[#F3F1EB]"> que no existe.</span>
          </h1>

          <p className="max-w-[480px] text-[15px] leading-[1.75] text-zinc-400 sm:text-base sm:leading-[1.8]">
            El pavo estaba revisando el mapa y parece que acabamos fuera de
            ruta.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
          <Link href="/" className={PRIMARY_BTN}>
            Volver al inicio
          </Link>
          <Link href="/precios" className={SECONDARY_LINK}>
            Ver precios
          </Link>
        </div>
      </div>
    </div>
  );
}
