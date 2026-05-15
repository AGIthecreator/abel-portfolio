const fs = require("fs");
const p = "src/components/sections/StrategicProfile.tsx";
let s = fs.readFileSync(p, "utf8");

const block = `/** Sacos — profundidad y solape */
function VisualAutoridad() {
  return (
    <div className="relative mt-3 flex min-h-[100px] items-end justify-center pb-1" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sacodinero.png"
        alt=""
        className="relative z-10 h-10 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] -rotate-14 sm:h-11"
        draggable={false}
      />
      <ArrowFlow />
      <motion.div className="relative flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sacodinero.png"
          alt=""
          className="relative z-20 h-16 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)] rotate-11 sm:h-17"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sacodinero.png"
          alt=""
          className="relative z-30 -ml-10 h-18 w-auto object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)] -rotate-7 sm:-ml-12 sm:h-20"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}

/** Móvil con notificaciones + panel CRM */
function VisualMotor() {
  return (
    <div className="relative mt-3 grid min-h-[120px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 sm:gap-3" aria-hidden>
      <div className="flex flex-col items-center justify-end pb-1">
        <div className="relative w-[86px] rounded-[18px] border-[2.5px] border-zinc-600 bg-zinc-950 p-1 shadow-[0_12px_28px_rgba(0,0,0,0.55)] sm:w-[94px]">
          <div className="absolute top-1.5 left-1/2 z-10 h-3 w-10 -translate-x-1/2 rounded-full bg-black" />
          <div className="overflow-hidden rounded-[14px] bg-[#0a0a0a]">
            <div className="flex items-center justify-between px-2 pt-4 pb-1 text-[6px] text-zinc-500">
              <span>23:47</span>
              <span>●●●</span>
            </motion.div>
            <div className="space-y-1 px-1.5 pb-2">
              {[
                { t: "Llamada perdida", c: "hace 2 min", hot: true },
                { t: "WhatsApp (14)", c: "ahora", hot: true },
                { t: "Cliente esperando", c: "23:41", hot: false },
              ].map((n) => (
                <div
                  key={n.t}
                  className={\`rounded-md px-1.5 py-1 \${n.hot ? "bg-red-950/80 ring-1 ring-red-500/40" : "bg-zinc-900/80"}\`}
                >
                  <p className="text-[6px] font-medium text-zinc-200">{n.t}</p>
                  <p className="text-[5px] text-zinc-500">{n.c}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
            14
          </span>
        </motion.div>
        <p className="mt-1.5 text-center text-[9px] text-zinc-500">Sin sistema</p>
      </motion.div>
      <div className="flex flex-col justify-end">
        <div className="overflow-hidden rounded-lg border border-emerald-500/25 bg-[#0a0f0a] shadow-[0_0_24px_rgba(16,185,129,0.12)]">
          <div className="border-b border-emerald-500/20 bg-emerald-950/40 px-2 py-1">
            <p className="text-[8px] font-semibold tracking-wide text-emerald-400">PANEL · AUTOMÁTICO</p>
          </motion.div>
          <ul className="space-y-0.5 px-2 py-1.5">
            {["Cita 09:00 ✓", "Email enviado ✓", "Factura ✓", "Stock OK ✓"].map((line) => (
              <li key={line} className="flex items-center gap-1 text-[7px] text-emerald-300/90 sm:text-[8px]">
                <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                {line}
              </li>
            ))}
          </ul>
          <p className="border-t border-emerald-500/15 px-2 py-1 text-[6px] text-emerald-600/80">Trabajando 24/7</p>
        </motion.div>
        <p className="mt-1.5 text-center text-[9px] text-emerald-600/70">Con sistema</p>
      </motion.div>
    </motion.div>
  );
}

`;

const fixed = block
  .replace(/<motion\.div/g, "<div")
  .replace(/<\/motion\.div>/g, "</motion.div>")
  .replace(/<\/motion\.div>/g, "</div>")
  .replace(/<\/motion\.motion\.div>/g, "</div>");

const a0 = s.indexOf("/** Sacos");
const a1 = s.indexOf("function useExcelColumns");
s = s.slice(0, a0) + fixed + s.slice(a1);

// DarkClosedCard
s = s.replace(
  /function DarkClosedCard\(\{[\s\S]*?\n\}/,
  `function DarkClosedCard({
  title,
  body,
  children,
  compact = false,
}: {
  title: string;
  body?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={\`\${CARD_DARK}\${compact ? " !p-3 sm:!p-4" : ""}\`}>
      <BpCornerTicksOverlay />
      <div className="relative z-10 flex flex-1 flex-col">
        <h3 className="text-base font-medium leading-snug tracking-[-0.02em] text-zinc-50 sm:text-[1.05rem]">{title}</h3>
        {body ? <p className="mt-1.5 max-w-[95%] text-[12px] leading-relaxed text-zinc-400">{body}</p> : null}
        <div className="mt-auto">{children}</div>
      </div>
    </article>
  );
}`,
);

// HeroCard compact + taller excel slot
s = s.replace(
  /function HeroCard\(\{[\s\S]*?\n\}/,
  `function HeroCard({
  title,
  body,
  diagram,
  bgImage,
  diagramFixed = false,
  compact = false,
}: {
  title: string;
  body: string;
  diagram: ReactNode;
  bgImage?: string;
  diagramFixed?: boolean;
  compact?: boolean;
}) {
  return (
    <article className={\`\${CARD_HERO}\${compact ? " !p-3 sm:!p-4" : ""}\`}>
      {bgImage ? <CardBgImage src={bgImage} /> : null}
      <BpCornerTicksOverlay light />
      <motion.div className={\`relative z-10 flex flex-1 flex-col \${diagramFixed ? "pb-[158px] sm:pb-[164px]" : ""}\`}>
        <h3 className={\`font-semibold leading-snug tracking-[-0.03em] text-zinc-950 \${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}\`}>{title}</h3>
        <p className="mt-1.5 max-w-[92%] text-[12px] leading-relaxed text-zinc-700 sm:text-[13px]">{body}</p>
        {!diagramFixed ? <div className="relative mt-auto w-full pt-2">{diagram}</div> : null}
      </motion.div>
      {diagramFixed ? (
        <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 sm:px-4 sm:pb-4">
          {diagram}
        </motion.div>
      ) : null}
    </article>
  );
}`.replace(/<motion\.motion\.motion\.div/g, "<motion.div").replace(/<\/motion\.motion\.motion\.div>/g, "</motion.div>").replace(
  `<motion.div className={\`relative z-10 flex flex-1 flex-col`,
  `<div className={\`relative z-10 flex flex-1 flex-col`,
).replace(
  `{!diagramFixed ? <div className="relative mt-auto w-full pt-2">{diagram}</div> : null}
      </motion.div>`,
  `{!diagramFixed ? <motion.div className="relative mt-auto w-full pt-2">{diagram}</motion.div> : null}
      </div>`,
).replace(
  `{diagram}
        </motion.div>
      ) : null}`,
  `{diagram}
        </div>
      ) : null}`,
),

// VisualPercepcion smaller + IE div fix
s = s.replace(
  `className="relative mx-auto mt-auto h-[158px] w-full max-w-lg sm:h-[168px]"`,
  `className="relative mx-auto mt-auto h-[136px] w-full max-w-lg sm:h-[144px]"`,
);
s = s.replace(
  `<motion.div className="flex h-4 items-center justify-center bg-[#000080] px-1">
          <span className="text-[5px] leading-none text-white">Internet Explorer</span>
        </motion.div>`,
  `<div className="flex h-4 items-center justify-center bg-[#000080] px-1">
          <span className="text-[5px] leading-none text-white">Internet Explorer</span>
        </div>`,
);

// Excel grid - no clip row 5
s = s.replace(
  `      <div className="grid h-[91px] shrink-0 grid-cols-[18px_repeat(3,minmax(0,1fr))] grid-rows-[15px_repeat(5,17px)] text-[10px] leading-none sm:text-[11px]">`,
  `      <div className="grid shrink-0 grid-cols-[18px_repeat(3,minmax(0,1fr))] text-[10px] leading-tight sm:text-[11px]">`,
);

// Split bento grid
const oldGrid = `            {/* Bento filas 1–2: misma altura entre filas */}
            <motion.div
              className="mt-6 grid grid-cols-1 items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-2 lg:row-start-1">
                <HeroCard
                  bgImage="/programador.png"
                  title="El cliente te juzga antes de hablar contigo."
                  body="Buscan en Google. Ven tu web. Ven la del vecino. Si la tuya parece antigua, asumen que tu negocio también lo es."
                  diagram={<VisualPercepcion />}
                />
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1 lg:col-start-3 lg:row-start-1">
                <DarkClosedCard
                  title="Si te ves mejor, puedes permitirte cobrar más."
                  body="La calidad visual evita tener que justificar tu precio."
                >
                  <VisualAutoridad />
                </DarkClosedCard>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="order-2 flex h-full lg:order-0 lg:col-span-1 lg:col-start-1 lg:row-start-2 lg:z-20"
              >
                <DarkClosedCard
                  title="Tu competencia no descansa. Tu sistema tampoco debería."
                  body="Mientras duermes, el sistema sigue trabajando."
                >
                  <VisualMotor />
                </DarkClosedCard>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="order-1 flex h-full lg:order-0 lg:col-span-2 lg:col-start-2 lg:row-start-2"
              >
                <HeroCard
                  bgImage="/gestoria.png"
                  title="El trabajo manual es un coste que no deberías asumir."
                  body="Copiar datos a mano no hace crecer tu negocio. Un motor lo hace en segundos."
                  diagramFixed={true}
                  diagram={<VisualExcel />}
                />
              </motion.div>
            </motion.div>`;

const newGrid = `            <motion.div
              className="mt-6 grid grid-cols-1 items-stretch gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-2">
                <HeroCard
                  compact
                  bgImage="/programador.png"
                  title="El cliente te juzga antes de hablar contigo."
                  body="Buscan en Google. Ven tu web. Ven la del vecino. Si la tuya parece antigua, asumen que tu negocio también lo es."
                  diagram={<VisualPercepcion />}
                />
              </motion.div>
              <motion.div variants={fadeUp} className="flex h-full lg:col-span-1">
                <DarkClosedCard
                  compact
                  title="Si te ves mejor, puedes permitirte cobrar más."
                  body="La calidad visual evita tener que justificar tu precio."
                >
                  <VisualAutoridad />
                </DarkClosedCard>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } }}
            >
              <motion.div variants={fadeUp} className="order-2 flex h-full lg:order-0 lg:col-span-1">
                <DarkClosedCard
                  compact
                  title="Tu competencia no descansa. Tu sistema tampoco debería."
                  body="Mientras duermes, el sistema sigue trabajando."
                >
                  <VisualMotor />
                </DarkClosedCard>
              </motion.div>
              <motion.div variants={fadeUp} className="order-1 flex h-full lg:order-0 lg:col-span-2">
                <HeroCard
                  bgImage="/gestoria.png"
                  title="El trabajo manual es un coste que no deberías asumir."
                  body="Copiar datos a mano no hace crecer tu negocio. Un motor lo hace en segundos."
                  diagramFixed={true}
                  diagram={<VisualExcel />}
                />
              </motion.div>
            </motion.div>`;

s = s.replace(oldGrid, newGrid);

// compact boolean shorthand fix
s = s.replace(/\n                  compact\n                  bgImage/g, "\n                  compact={true}\n                  bgImage");
s = s.replace(/\n                  compact\n                  title/g, "\n                  compact={true}\n                  title");

fs.writeFileSync(p, s);
console.log("restored");
