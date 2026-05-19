import fs from "fs";

const p = "src/components/sections/StrategicProfile.tsx";
let s = fs.readFileSync(p, "utf8");

const excelGridOld =
  '      <motion.div className="relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] grid-rows-[14px_repeat(5,22px)] text-[13px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]">';

const excelGridNew = `      <div
        className={\`relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] leading-none antialiased tabular-nums \${
          large
            ? "grid-rows-[16px_repeat(5,28px)] text-[14px] sm:grid-cols-[26px_repeat(3,minmax(0,1fr))] sm:grid-rows-[14px_repeat(5,26px)] sm:text-[13px]"
            : "grid-rows-[14px_repeat(5,22px)] text-[13px] sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]"
        }\`}
      >`;

if (!s.includes(excelGridOld)) {
  const alt =
    '      <div className="relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] grid-rows-[14px_repeat(5,22px)] text-[13px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]">';
  if (s.includes(alt)) s = s.replace(alt, excelGridNew);
  else console.warn("excel grid not found");
} else {
  s = s.replace(excelGridOld, excelGridNew);
}

s = s.replace(
  'className="flex items-center justify-center border-r border-b border-white/10 bg-white/5 px-0.5 text-[10px] font-semibold tracking-tight text-zinc-400 sm:text-[8px] sm:font-medium"',
  'className={`flex items-center justify-center border-r border-b border-white/10 bg-white/5 px-0.5 font-semibold tracking-tight text-zinc-400 sm:font-medium ${large ? "text-[11px] sm:text-[10px]" : "text-[10px] sm:text-[8px]"}`}',
);

s = s.replace(
  '<div className="flex items-center justify-center border-r border-b border-white/8 bg-white/[0.03] text-[10px] tabular-nums text-zinc-500 sm:text-[8px]">',
  '<motion.div className={`flex items-center justify-center border-r border-b border-white/8 bg-white/[0.03] tabular-nums text-zinc-500 ${large ? "text-[11px] sm:text-[10px]" : "text-[10px] sm:text-[8px]"}`}>',
);
s = s.replace(
  '<motion.div className={`flex items-center justify-center border-r border-b border-white/8 bg-white/[0.03] tabular-nums text-zinc-500 ${large ? "text-[11px] sm:text-[10px]" : "text-[10px] sm:text-[8px]"}`}>',
  '<motion.div className={`flex items-center justify-center border-r border-b border-white/8 bg-white/[0.03] tabular-nums text-zinc-500 ${large ? "text-[11px] sm:text-[10px]" : "text-[10px] sm:text-[8px]"}`}'.replace(
    "<motion.div",
    "<div",
  ),
);

if (s.includes('bg-white/[0.03] tabular-nums text-zinc-500 ${large')) {
  // already fixed
} else {
  s = s.replace(
    /className="flex items-center justify-center border-r border-b border-white\/8 bg-white\/\[0\.03\] text-\[10px\] tabular-nums text-zinc-500 sm:text-\[8px\]"/,
    'className={`flex items-center justify-center border-r border-b border-white/8 bg-white/[0.03] tabular-nums text-zinc-500 ${large ? "text-[11px] sm:text-[10px]" : "text-[10px] sm:text-[8px]"}`}',
  );
}

s = s.replace(
  `              const isEngineFill = isEngine && val.length > 0;
              return (
                <div
                  key={\`\${r}-\${c}\`}
                  className={\`relative flex h-[22px] items-center`,
  `              const isEngineFill = isEngine && val.length > 0;
              const rowH = large ? "h-[28px] sm:h-[26px]" : "h-[22px] sm:h-[20px]";
              return (
                <div
                  key={\`\${r}-\${c}\`}
                  className={\`relative flex items-center \${rowH}`,
);

s = s.replace(
  `                  className={\`relative flex items-center \${rowH} overflow-hidden border-r border-b border-white/8 px-1 font-mono tracking-tight sm:h-[20px] \${`,
  `                  className={\`relative flex items-center overflow-hidden border-r border-b border-white/8 px-1 font-mono tracking-tight \${rowH} \${`,
);

s = s.replace(
  `          phase={phase}
          flashCol={flashCol}
        />
        <ArrowFlow prominent />`,
  `          phase={phase}
          flashCol={flashCol}
          large
        />
        <ArrowFlow prominent />`,
);

s = s.replace(`          phase={phase}
        />
      </motion.div>`,
  `          phase={phase}
          large
        />
      </motion.div>`);

// only fix engine sheet - manual already has large from above if duplicated fix manually

s = s.replace(
  `import { Caveat } from "next/font/google";\n`,
  "",
);
s = s.replace(
  /const caveat = Caveat\(\{[\s\S]*?\}\);\n\n/,
  "",
);

const waStart = "const WA_CHAOS = [";
const waEnd = "function WhatsAppCaosIntegrado()";
const waEndClose = "\n\nconst TESTIMONIALS = [";

const newWaBlock = `const WA_CONVERSATION = [
  { text: "Hola, ¿seguís abiertos?", fromThem: true, time: "18:41" },
  { text: "Sí, claro 🙂", fromThem: false, time: "18:42" },
  { text: "Perfecto, una cosa, ¿cuánto costaría más o menos?", fromThem: true, time: "18:43" },
  { text: "Depende un poco de lo que necesites.", fromThem: false, time: "18:44" },
  { text: "Vale", fromThem: true, time: "18:51" },
  { text: "¿Me puedes pasar info?", fromThem: true, time: "19:08" },
  { text: "Perdona, acabo de salir del trabajo", fromThem: true, time: "20:14" },
  { text: "¿Me lo vuelves a pasar? No encuentro el mensaje", fromThem: true, time: "21:02" },
  { text: "Y otra cosa, ¿hacéis también fines de semana?", fromThem: true, time: "21:03" },
  { text: "??", fromThem: true, time: "22:17" },
  { text: "Lo necesito para hoy si puede ser", fromThem: true, time: "22:48" },
  { text: "Perdón por insistir 😅", fromThem: true, time: "23:01" },
] as const;

const EDITORIAL_FACTS = [
  {
    title: "Lo que se ve, se paga.",
    lines: ["La gente paga más tranquila cuando siente", "que está en buenas manos."],
    marginLeft: 0,
  },
  {
    title: "Tu competencia no necesita ser mejor.",
    lines: ["Solo necesita parecer más seria", "durante diez segundos."],
    marginLeft: 28,
  },
  {
    title: "Una web fea no pierde visitas.",
    lines: ["Pierde ventas."],
    marginLeft: 10,
  },
  {
    title: "Hay negocios que parecen tranquilos",
    lines: ["porque tienen sistema.", "No trabajan menos.", "Persiguen menos cosas."],
    marginLeft: 42,
  },
  {
    title: "Cuando todo depende de ti,",
    lines: ["tienes un cuello de botella.", "No un negocio."],
    marginLeft: 10,
  },
] as const;

function ReadTicks() {
  return (
    <span className="ml-1 inline-flex text-[#53bdeb]" aria-hidden>
      <svg width="12" height="9" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.2 0L5.6 6.4 3.2 4 0 7.2l5.6 5.6L16 2.4z" opacity="0.45" />
        <path d="M16 0L9.6 6.4 7.2 4 4 7.2l5.6 5.6L20.8 2.4z" transform="translate(-4.8)" />
      </svg>
    </span>
  );
}

/** iPhone completo con notificaciones (mock original, sin recortes) */
function IphoneNotificacionesCompleto() {
  return (
    <div className="relative z-30 shrink-0 -translate-x-1 self-start sm:-translate-x-2" aria-hidden>
      <div className="relative w-[108px] rounded-[22px] border-[2.5px] border-zinc-500/90 bg-zinc-950 p-1 shadow-[0_20px_48px_rgba(0,0,0,0.75)] sm:w-[118px]">
        <div className="absolute top-2 left-1/2 z-10 h-3.5 w-11 -translate-x-1/2 rounded-full bg-black" />
        <div className="overflow-hidden rounded-[18px] bg-[#0a0a0a]">
          <motion.div className="flex items-center justify-between px-2.5 pb-0.5 pt-5 text-[7px] text-zinc-500">
            <span>23:47</span>
            <span className="tracking-[0.2em]">●●●</span>
          </motion.div>
          <div className="space-y-1 px-1.5 pb-2.5">
            {[
              { t: "Llamada perdida", c: "hace 2 min", hot: true },
              { t: "WhatsApp", c: "ahora · 14", hot: true },
              { t: "Cliente esperando", c: "23:41", hot: false },
            ].map((n) => (
              <div
                key={n.t}
                className={\`rounded-md px-1.5 py-1 \${n.hot ? "bg-red-950/85 ring-1 ring-red-500/40" : "bg-zinc-900/85"}\`}
              >
                <p className="text-[7px] font-medium leading-tight text-zinc-100">{n.t}</p>
                <p className="text-[6px] text-zinc-500">{n.c}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          14
        </span>
      </motion.div>
    </motion.div>
  );
}

function WhatsAppCaosIntegrado() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      className="flex min-h-[200px] w-full items-stretch gap-2 sm:gap-3"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      aria-hidden
    >
      <IphoneNotificacionesCompleto />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
        <div className="flex h-6 items-center justify-between bg-[#075e54] px-3 text-[9px] font-medium text-white/90">
          <span>23:52</span>
          <span className="flex gap-1 opacity-90">
            <span className="h-2 w-2 rounded-full bg-white/80" />
            <span className="h-2 w-2 rounded-full bg-white/50" />
          </span>
        </motion.div>
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#0a5c52] bg-[#075e54] px-2">
          <svg className="h-4 w-4 shrink-0 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-[11px] font-semibold text-white">
            C
          </motion.div>
          <p className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">Cliente</p>
          <div className="flex shrink-0 items-center gap-2.5 text-white/85">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7a5 5 0 00-10 0v3.5H5v10h14v-10h-2zm-8-3.5a3 3 0 016 0V10H9V7z" />
            </svg>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
          </motion.div>
        </motion.div>
        <div
          className="flex max-h-[min(52vh,400px)] min-h-[220px] flex-1 flex-col gap-1.5 overflow-y-auto px-2 py-2.5 sm:min-h-[260px]"
          style={{ backgroundColor: "#ece5dd" }}
        >
          {WA_CONVERSATION.map((msg, i) => (
            <motion.div
              key={\`\${msg.time}-\${i}\`}
              className={\`flex max-w-[92%] flex-col \${msg.fromThem ? "self-start" : "self-end items-end"}\`}
              initial={{ opacity: 0, y: 3 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.04 + i * 0.05 }}
            >
              <div
                className={\`rounded-lg px-2.5 py-1.5 text-[11px] leading-snug shadow-sm sm:text-[10px] \${
                  msg.fromThem ? "bg-white text-[#111b21]" : "bg-[#d9fdd3] text-[#111b21]"
                }\`}
              >
                {msg.text}
              </motion.div>
              <span className="mt-0.5 flex items-center text-[9px] text-[#667781]">
                {msg.time}
                {!msg.fromThem ? <ReadTicks /> : null}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <p className="hidden shrink-0 self-center text-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180 sm:flex sm:text-[10px]">
        ¿TE SUENA?
      </p>
    </motion.div>
  );
}

function EditorialFactsColumn() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <div ref={ref} className="flex flex-col gap-14 py-2 sm:gap-16 lg:py-4">
      {EDITORIAL_FACTS.map((fact, i) => (
        <motion.article
          key={fact.title}
          className="max-w-[260px] border-l border-white/[0.08] pl-4 sm:pl-5"
          style={{ marginLeft: fact.marginLeft }}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.32, 1] }}
        >
          <h4 className="text-[clamp(1.35rem,2.8vw,2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50/95">
            {fact.title}
          </h4>
          {fact.lines.length > 0 ? (
            <div className="mt-3 space-y-0.5">
              {fact.lines.map((line) => (
                <p key={line} className="text-[14px] leading-[1.7] text-zinc-500">
                  {line}
                </p>
              ))}
            </motion.div>
          ) : null}
        </motion.article>
      ))}
    </motion.div>
  );
}

`;

// Fix typos in newWaBlock - I accidentally used motion.div in wrong places. Let me fix the block string before inserting

const i0 = s.indexOf(waStart);
const i1 = s.indexOf(waEndClose);
if (i0 === -1 || i1 === -1) {
  console.error("WA block markers not found", i0, i1);
  process.exit(1);
}

// Remove duplicate ReadTicks - new block includes it, old has ReadTicks before WhatsApp
const beforeWa = s.slice(0, i0);
const afterWa = s.slice(i1);
s = beforeWa + newWaBlock + afterWa;

const layoutOld = `            {/* Fila 1 — altura independiente de la fila 2 */}
            <motion.div
              className="mt-6 grid grid-cols-1 items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-2">
                <FloatingBlock title={COPY.row1Title} body={COPY.row1Body}>
                  <BpPercepcion />
                </FloatingBlock>
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1">
                <DarkOpenBlock
                  title={COPY.row1AsideTitle}
                  body={COPY.row1AsideBody}
                  bodyClassName="mt-2 max-w-[98%] text-[13px] font-medium leading-snug text-zinc-300/95 sm:text-[14px]"
                >
                  <VisualAutoridad />
                </DarkOpenBlock>
              </motion.div>
            </motion.div>

            {/* Fila 2 — misma proporción que fila 1: texto ancho cols 2–3 */}
            <motion.div
              className="mt-10 grid grid-cols-1 items-stretch gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="order-1 flex min-h-0 h-full lg:order-0 lg:col-span-1 lg:z-20">
                <DarkOpenBlock title={COPY.row2AsideTitle} body={COPY.row2AsideBody}>
                  <WhatsAppCaosIntegrado />
                </DarkOpenBlock>
              </motion.div>
              <motion.div variants={fadeUp} className="order-2 flex min-h-0 h-full lg:order-0 lg:col-span-2 lg:col-start-2">
                <FloatingBlock title={COPY.row2ExcelTitle} body={COPY.row2ExcelBody}>
                  <VisualExcel />
                </FloatingBlock>
              </motion.div>
            </motion.div>`;

const layoutNew = `            <motion.div
              className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-14"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.08 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              {/* Centro: percepción + excel */}
              <motion.div
                variants={fadeUp}
                className="mx-auto w-full max-w-[520px] lg:col-span-6 lg:col-start-4 lg:row-start-1"
              >
                <FloatingBlock title={COPY.row1Title} body={COPY.row1Body} centered>
                  <BpPercepcion />
                </FloatingBlock>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mx-auto w-full max-w-[520px] lg:col-span-6 lg:col-start-4 lg:row-start-2 lg:mt-2"
              >
                <FloatingBlock title={COPY.row2ExcelTitle} body={COPY.row2ExcelBody} centered>
                  <div className="flex w-full items-stretch gap-2">
                    <VisualExcel />
                    <p className="hidden shrink-0 self-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180 lg:flex lg:text-[10px]">
                      ¿TE SUENA?
                    </p>
                  </motion.div>
                </FloatingBlock>
              </motion.div>

              {/* Izquierda: competencia + WhatsApp */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col lg:col-span-3 lg:row-span-2 lg:row-start-1 lg:justify-end lg:pr-2"
              >
                <div className="mb-4 lg:mb-5">
                  <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-white sm:text-xl">
                    {COPY.row2AsideTitle}
                  </h3>
                  <p className="mt-2 max-w-[95%] text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                    {COPY.row2AsideBody}
                  </p>
                </motion.div>
                <WhatsAppCaosIntegrado />
              </motion.div>

              {/* Derecha: facts editoriales */}
              <motion.div variants={fadeUp} className="lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1">
                <EditorialFactsColumn />
              </motion.div>
            </motion.div>`;

if (s.includes(layoutOld)) s = s.replace(layoutOld, layoutNew);
else console.warn("layout block not found");

fs.writeFileSync(p, s);
console.log("done");
