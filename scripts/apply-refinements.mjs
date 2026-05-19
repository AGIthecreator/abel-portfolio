import fs from "fs";

const p = "src/components/sections/StrategicProfile.tsx";
let s = fs.readFileSync(p, "utf8");

// VisualExcel glow + height
s = s.replace(
  /      \{isGlowing \? \(\s*<div\s*className="pointer-events-none absolute -inset-8[^"]*"[^/]*\/>\s*\) : null\}\s*<div className="relative z-10 flex min-h-\[168px\][^"]*">/,
  `      {isGlowing ? (
        <>
          <div
            className="pointer-events-none absolute -inset-4 left-0 z-0 w-[48%] rounded-2xl bg-red-500/10 blur-2xl"
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -inset-4 right-0 z-0 w-[48%] rounded-2xl bg-emerald-500/8 blur-2xl"
            aria-hidden
          />
        </>
      ) : null}
      <motion.div className="relative z-10 flex w-full items-stretch gap-2 sm:gap-3">`,
);

if (s.includes("min-h-[168px]")) {
  s = s.replace(
    'className="relative z-10 flex min-h-[168px] w-full items-stretch gap-2 sm:min-h-[178px] sm:gap-3"',
    'className="relative z-10 flex w-full items-stretch gap-2 sm:gap-3"',
  );
}

const wa = `/** WhatsApp + notificaciones integradas */
function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div ref={ref} className="flex items-end justify-start gap-3 sm:gap-5" aria-hidden>
      <motion.div
        className="relative w-full max-w-[280px]"
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        <motion.div className="absolute -top-2 -right-2 z-40 w-[68px] sm:w-[74px]">
          <motion.div className="relative rounded-[14px] border-2 border-zinc-600 bg-zinc-950 p-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
            <motion.div className="absolute top-1 left-1/2 z-10 h-2 w-7 -translate-x-1/2 rounded-full bg-black" />
            <motion.div className="overflow-hidden rounded-[10px] bg-[#0a0a0a] pt-2.5">
              <motion.div className="space-y-0.5 px-1 pb-1.5">
                {[
                  { t: "WhatsApp", n: 14 },
                  { t: "Llamada", n: 3 },
                ].map((item) => (
                  <motion.div
                    key={item.t}
                    className="flex items-center justify-between rounded bg-red-950/90 px-1 py-0.5 ring-1 ring-red-500/40"
                  >
                    <span className="text-[5px] font-medium text-red-100">{item.t}</span>
                    <span className="flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[5px] font-bold text-white">
                      {item.n}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
          <motion.div className="flex h-5 items-center justify-between bg-[#075e54] px-2.5 text-[8px] font-medium text-white/90">
            <span>23:52</span>
            <span className="flex items-center gap-1 opacity-80" aria-hidden>
              <span className="h-1 w-2 rounded-sm bg-white/70" />
              <span className="h-1 w-1 rounded-full bg-white/70" />
            </span>
          </motion.div>
          <motion.div className="flex h-9 items-center gap-2 border-b border-[#0a5c52] bg-[#075e54] px-2">
            <span className="text-white/75" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            <motion.div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[10px] font-semibold text-white">
              C
            </motion.div>
            <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-white">Cliente</p>
          </motion.div>
          <motion.div className="flex min-h-[120px] flex-col gap-1 px-2 py-2" style={{ backgroundColor: "#ece5dd" }}>
            {WA_CHAOS.map((msg, i) => (
              <motion.div
                key={msg.text}
                className={\`flex max-w-[88%] flex-col \${msg.fromThem ? "self-start" : "self-end items-end"}\`}
                initial={{ opacity: 0, y: 4 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.3 }}
              >
                <motion.div
                  className={\`rounded-lg px-2 py-1 text-[10px] leading-snug shadow-sm \${
                    msg.fromThem ? "bg-white text-[#111b21]" : "bg-[#d9fdd3] text-[#111b21]"
                  }\`}
                >
                  {msg.text}
                </motion.div>
                <span className="mt-px flex items-center text-[8px] text-[#667781]">
                  {msg.time}
                  {!msg.fromThem ? <ReadTicks /> : null}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <p className="shrink-0 pb-2 text-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180 sm:text-[10px]">
        ¿TE SUENA?
      </p>
    </motion.div>
  );
}
`;

// Clean WA - all div
const waClean = `/** WhatsApp + notificaciones integradas */
function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="flex items-end justify-start gap-3 sm:gap-5" aria-hidden>
      <motion.div
        className="relative w-full max-w-[280px]"
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        <motion.div className="absolute -top-2 -right-2 z-40 w-[68px] sm:w-[74px]">
          <motion.div className="relative rounded-[14px] border-2 border-zinc-600 bg-zinc-950 p-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
            <motion.div className="absolute top-1 left-1/2 z-10 h-2 w-7 -translate-x-1/2 rounded-full bg-black" />
            <motion.div className="overflow-hidden rounded-[10px] bg-[#0a0a0a] pt-2.5">
              <motion.div className="space-y-0.5 px-1 pb-1.5">
                {[
                  { t: "WhatsApp", n: 14 },
                  { t: "Llamada", n: 3 },
                ].map((item) => (
                  <motion.div
                    key={item.t}
                    className="flex items-center justify-between rounded bg-red-950/90 px-1 py-0.5 ring-1 ring-red-500/40"
                  >
                    <span className="text-[5px] font-medium text-red-100">{item.t}</span>
                    <span className="flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[5px] font-bold text-white">
                      {item.n}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
          <motion.div className="flex h-5 items-center justify-between bg-[#075e54] px-2.5 text-[8px] font-medium text-white/90">
            <span>23:52</span>
            <span className="flex items-center gap-1 opacity-80" aria-hidden>
              <span className="h-1 w-2 rounded-sm bg-white/70" />
              <span className="h-1 w-1 rounded-full bg-white/70" />
            </span>
          </motion.div>
          <motion.div className="flex h-9 items-center gap-2 border-b border-[#0a5c52] bg-[#075e54] px-2">
            <span className="text-white/75" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            <motion.div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[10px] font-semibold text-white">
              C
            </motion.div>
            <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-white">Cliente</p>
          </motion.div>
          <motion.div className="flex min-h-[120px] flex-col gap-1 px-2 py-2" style={{ backgroundColor: "#ece5dd" }}>
            {WA_CHAOS.map((msg, i) => (
              <motion.div
                key={msg.text}
                className={\`flex max-w-[88%] flex-col \${msg.fromThem ? "self-start" : "self-end items-end"}\`}
                initial={{ opacity: 0, y: 4 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.3 }}
              >
                <motion.div
                  className={\`rounded-lg px-2 py-1 text-[10px] leading-snug shadow-sm \${
                    msg.fromThem ? "bg-white text-[#111b21]" : "bg-[#d9fdd3] text-[#111b21]"
                  }\`}
                >
                  {msg.text}
                </motion.div>
                <span className="mt-px flex items-center text-[8px] text-[#667781]">
                  {msg.time}
                  {!msg.fromThem ? <ReadTicks /> : null}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <p className="shrink-0 pb-2 text-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180 sm:text-[10px]">
        ¿TE SUENA?
      </p>
    </motion.div>
  );
}
`;

// Write waClean properly with div only - I'll build it in code
const lines = [];
lines.push(`/** WhatsApp + notificaciones integradas */
function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="flex items-end justify-start gap-3 sm:gap-5" aria-hidden>
      <motion.div
        className="relative w-full max-w-[280px]"
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >`);
lines.push(`        <motion.div className="absolute -top-2 -right-2 z-40 w-[68px] sm:w-[74px]">
          <motion.div className="relative rounded-[14px] border-2 border-zinc-600 bg-zinc-950 p-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
            <motion.div className="absolute top-1 left-1/2 z-10 h-2 w-7 -translate-x-1/2 rounded-full bg-black" />
            <motion.div className="overflow-hidden rounded-[10px] bg-[#0a0a0a] pt-2.5">
              <motion.div className="space-y-0.5 px-1 pb-1.5">
                {[
                  { t: "WhatsApp", n: 14 },
                  { t: "Llamada", n: 3 },
                ].map((item) => (
                  <motion.div key={item.t} className="flex items-center justify-between rounded bg-red-950/90 px-1 py-0.5 ring-1 ring-red-500/40">
                    <span className="text-[5px] font-medium text-red-100">{item.t}</span>
                    <span className="flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[5px] font-bold text-white">{item.n}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>`);

// STOP - this is getting too complex. Let me read file and do direct StrReplace on export section only, and manually write WhatsApp to a separate file... 

// Simpler: replace VisualMotor function body only, keep structure

s = s.replace(
  /\/\*\* Móvil con notificaciones \+ panel CRM \*\/\nfunction VisualMotor\(\) \{[\s\S]*?\n\}\n\nfunction useExcelColumns/,
  `function useExcelColumns`,
);

// Remove IphoneChaosOverlay and Row3StressControl
s = s.replace(/function IphoneChaosOverlay\(\) \{[\s\S]*?\n\}\n\nfunction Row3StressControl\(\) \{[\s\S]*?\n\}\n\n/, "");

// Insert WhatsApp before useExcelColumns - read WA_CHAOS is after VisualExcel so insert before WA_CHAOS
const waFinal = `function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <div ref={ref} className="flex items-end justify-start gap-3 sm:gap-5" aria-hidden>
      <div className="relative w-full max-w-[280px]">
        <motion.div className="absolute -top-2 -right-2 z-40 w-[68px] sm:w-[74px]" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
          <motion.div className="relative rounded-[14px] border-2 border-zinc-600 bg-zinc-950 p-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.7)]">
            <motion.div className="absolute top-1 left-1/2 z-10 h-2 w-7 -translate-x-1/2 rounded-full bg-black" />
            <motion.div className="overflow-hidden rounded-[10px] bg-[#0a0a0a] pt-2.5">
              <motion.div className="space-y-0.5 px-1 pb-1.5">
                {[{ t: "WhatsApp", n: 14 }, { t: "Llamada", n: 3 }].map((item) => (
                  <motion.div key={item.t} className="flex items-center justify-between rounded bg-red-950/90 px-1 py-0.5 ring-1 ring-red-500/40">
                    <span className="text-[5px] font-medium text-red-100">{item.t}</span>
                    <span className="flex h-2.5 min-w-2.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[5px] font-bold text-white">{item.n}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]" initial={{ opacity: 0, y: 6 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <motion.div className="flex h-5 items-center justify-between bg-[#075e54] px-2.5 text-[8px] font-medium text-white/90"><span>23:52</span></motion.div>
          <motion.div className="flex h-9 items-center gap-2 border-b border-[#0a5c52] bg-[#075e54] px-2">
            <motion.div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[10px] font-semibold text-white">C</motion.div>
            <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-white">Cliente</p>
          </motion.div>
          <motion.div className="flex min-h-[120px] flex-col gap-1 px-2 py-2" style={{ backgroundColor: "#ece5dd" }}>
            {WA_CHAOS.map((msg, i) => (
              <motion.div key={msg.text} className={\`flex max-w-[88%] flex-col \${msg.fromThem ? "self-start" : "self-end items-end"}\`} initial={{ opacity: 0, y: 4 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + i * 0.3 }}>
                <motion.div className={\`rounded-lg px-2 py-1 text-[10px] leading-snug shadow-sm \${msg.fromThem ? "bg-white text-[#111b21]" : "bg-[#d9fdd3] text-[#111b21]"}\`}>{msg.text}</motion.div>
                <span className="mt-px flex items-center text-[8px] text-[#667781]">{msg.time}{!msg.fromThem ? <ReadTicks /> : null}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
      <p className="shrink-0 pb-2 text-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180">¿TE SUENA?</p>
    </motion.div>
  );
}

`;

// Too broken. Let me read current file and apply edits with search_replace in the tool directly on key sections only.

fs.writeFileSync(p, s);
console.log("partial");
