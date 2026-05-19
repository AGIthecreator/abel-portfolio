import fs from "fs";

const T = ["d", "i", "v"].join("");

// Fix insert file iphone with template tag
let insert = fs.readFileSync("scripts/wa-facts-insert.txt", "utf8");
const fnStart = insert.indexOf("function IphoneNotificacionesCompleto");
const fnEnd = insert.indexOf("function WhatsAppCaosIntegrado");

const iphone = `function IphoneNotificacionesCompleto() {
  return (
    <${T} className="relative z-30 shrink-0 -translate-x-1 self-start sm:-translate-x-3" aria-hidden>
      <${T} className="relative w-[108px] rounded-[22px] border-[2.5px] border-zinc-500/90 bg-zinc-950 p-1 shadow-[0_20px_48px_rgba(0,0,0,0.75)] sm:w-[118px]">
        <${T} className="absolute top-2 left-1/2 z-10 h-3.5 w-11 -translate-x-1/2 rounded-full bg-black" />
        <${T} className="overflow-hidden rounded-[18px] bg-[#0a0a0a]">
          <${T} className="flex items-center justify-between px-2.5 pb-0.5 pt-5 text-[7px] text-zinc-500">
            <span>23:47</span>
            <span className="tracking-[0.2em]">●●●</span>
          </${T}>
          <${T} className="space-y-1 px-1.5 pb-2.5">
            {[
              { t: "Llamada perdida", c: "hace 2 min", hot: true },
              { t: "WhatsApp", c: "ahora · 14", hot: true },
              { t: "Cliente esperando", c: "23:41", hot: false },
            ].map((n) => (
              <${T}
                key={n.t}
                className={\`rounded-md px-1.5 py-1 \${n.hot ? "bg-red-950/85 ring-1 ring-red-500/40" : "bg-zinc-900/85"}\`}
              >
                <p className="text-[7px] font-medium leading-tight text-zinc-100">{n.t}</p>
                <p className="text-[6px] text-zinc-500">{n.c}</p>
              </${T}>
            ))}
          </${T}>
        </${T}>
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          14
        </span>
      </${T}>
    </${T}>
  );
}

`;

insert = insert.slice(0, fnStart) + iphone + insert.slice(fnEnd);

// Fix facts lines wrapper to div
insert = insert.replace(
  '<motion.div className="mt-3 space-y-0.5">',
  '<motion.div className="mt-3 space-y-0.5">'.replace("motion.div", "div"),
);
insert = insert.replace("</motion.div>\n          ) : null}", "</motion.div>\n          ) : null}".replace("motion.div", "motion.div"));
insert = insert.replace(
  `            <motion.div className="mt-3 space-y-0.5">`,
  `            <motion.div className="mt-3 space-y-0.5">`,
);

// Manual fix facts
insert = insert.replace(
  /(\{fact\.lines\.length > 0 \? \(\s*)<[^>]+className="mt-3 space-y-0\.5">/,
  `$1<div className="mt-3 space-y-0.5">`,
);
insert = insert.replace(
  /(\s*)<\/motion\.div>(\s*\) : null\}\s*<\/motion\.article>)/,
  `$1</motion.div>$2`.replace("motion.div", "div"),
);

// Fix whatsapp static shells to div
insert = insert.replaceAll("<motion.div className=\"flex min-w-0 flex-1", "<motion.div className=\"flex min-w-0 flex-1");
insert = insert.replace(
  `<motion.div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
        <motion.div className="flex h-6`,
  `<motion.div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg shadow-[0_20px_48px_-12px_rgba(0,0,0,0.85)]">
        <motion.div className="flex h-6`,
);

fs.writeFileSync("scripts/wa-facts-insert.txt", insert);

const mainPath = "src/components/sections/StrategicProfile.tsx";
let main = fs.readFileSync(mainPath, "utf8");
const start = main.indexOf("const WA_CHAOS = [");
const end = main.indexOf("\nconst TESTIMONIALS = [");
main = main.slice(0, start) + insert + main.slice(end);

// Excel
const gridOld =
  '      <motion.div className="relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] grid-rows-[14px_repeat(5,22px)] text-[13px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]">';
const gridAlt =
  '      <motion.div className="relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] grid-rows-[14px_repeat(5,22px)] text-[13px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]">';
const gridNew = `      <motion.div
        className={\`relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] leading-none antialiased tabular-nums \${
          large
            ? "grid-rows-[16px_repeat(5,28px)] text-[14px] sm:grid-cols-[26px_repeat(3,minmax(0,1fr))] sm:grid-rows-[14px_repeat(5,26px)] sm:text-[13px]"
            : "grid-rows-[14px_repeat(5,22px)] text-[13px] sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]"
        }\`}
      >`;

if (main.includes(gridAlt)) main = main.replace(gridAlt, gridNew);
else if (main.includes(gridOld)) main = main.replace(gridOld, gridNew);

main = main.replace(
  "const isEngineFill = isEngine && val.length > 0;\n              return (\n                <motion.div\n                  key={`${r}-${c}`}\n                  className={`relative flex h-[22px] items-center",
  "const isEngineFill = isEngine && val.length > 0;\n              const rowH = large ? \"h-[28px] sm:h-[26px]\" : \"h-[22px] sm:h-[20px]\";\n              return (\n                <motion.div\n                  key={`${r}-${c}`}\n                  className={`relative flex items-center ${rowH}",
);
main = main.replace("sm:h-[20px] ${", "${");

if (!main.includes("flashCol={flashCol}\n          large")) {
  main = main.replace(
    "flashCol={flashCol}\n        />\n        <ArrowFlow prominent />",
    "flashCol={flashCol}\n          large\n        />\n        <ArrowFlow prominent />",
  );
  main = main.replace(
    "flashCol={flashCol}\n          phase={phase}\n        />\n      </motion.div>",
    "flashCol={flashCol}\n          phase={phase}\n          large\n        />\n      </motion.div>",
  );
}

main = main.replace(/import \{ Caveat \} from "next\/font\/google";\r?\n/, "");
main = main.replace(/const caveat = Caveat\(\{[\s\S]*?\}\);\r?\n\r?\n/, "");

const layoutOldSnippet = "VisualAutoridad";
if (main.includes(layoutOldSnippet)) {
  main = main.replace(
    /            \{\/\* Fila 1[\s\S]*?            <\/motion\.motion.div>\r?\n\r?\n            <FadeIn delay=\{0\.04\}>/,
    `            <motion.div
              className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-14"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.08 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
              <motion.div variants={fadeUp} className="mx-auto w-full max-w-[520px] lg:col-span-6 lg:col-start-4 lg:row-start-1">
                <FloatingBlock title={COPY.row1Title} body={COPY.row1Body} centered>
                  <BpPercepcion />
                </FloatingBlock>
              </motion.div>
              <motion.div variants={fadeUp} className="mx-auto w-full max-w-[520px] lg:col-span-6 lg:col-start-4 lg:row-start-2 lg:mt-2">
                <FloatingBlock title={COPY.row2ExcelTitle} body={COPY.row2ExcelBody} centered>
                  <motion.div className="flex w-full items-stretch gap-2">
                    <VisualExcel />
                    <p className="hidden shrink-0 self-center font-mono text-[9px] font-bold tracking-[0.26em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180 lg:flex lg:text-[10px]">
                      ¿TE SUENA?
                    </p>
                  </motion.div>
                </FloatingBlock>
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-col lg:col-span-3 lg:row-span-2 lg:row-start-1 lg:justify-end lg:pr-2">
                <motion.div className="mb-4 lg:mb-5">
                  <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-white sm:text-xl">{COPY.row2AsideTitle}</h3>
                  <p className="mt-2 max-w-[95%] text-[13px] leading-relaxed text-zinc-500 sm:text-sm">{COPY.row2AsideBody}</p>
                </motion.div>
                <WhatsAppCaosIntegrado />
              </motion.div>
              <motion.div variants={fadeUp} className="lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1">
                <EditorialFactsColumn />
              </motion.div>
            </motion.div>

            <FadeIn delay={0.04}>`,
  );
}

fs.writeFileSync(mainPath, main);
console.log("done");
