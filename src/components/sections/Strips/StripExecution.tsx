import React from "react";

const StripExecution = () => {
  return (
    <section
      id="proceso"
      aria-label="Consulta gratuita"
      className="strip-tech-paper relative isolate z-0 scroll-mt-24 w-full overflow-hidden"
    >
      <div className="relative px-3 pb-5 pt-4 sm:px-4 md:pb-7 md:pt-6">
        <div className="flex h-[2.975rem] items-center justify-center gap-[clamp(18px,4vw,42px)] font-semibold tracking-[-0.02em] text-zinc-900 md:h-[3.4rem]">
          <span>Consulta gratuita</span>
          <span className="opacity-[0.65]">Hablamos claro</span>
          <span className="opacity-80">Sin compromiso</span>
        </div>
      </div>
    </section>
  );
};

export default StripExecution;
