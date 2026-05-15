const fs = require("fs");
const p = "src/components/sections/StrategicProfile.tsx";
let s = fs.readFileSync(p, "utf8");

const motor = [
  "/** Móvil con notificaciones + panel CRM */",
  "function VisualMotor() {",
  "  return (",
  '    <div className="relative mt-3 grid min-h-[120px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 sm:gap-3" aria-hidden>',
  '      <motion.div className="flex flex-col items-center justify-end pb-1">',
].join("\n");

// Build without motion - use array
const lines = `/** Móvil con notificaciones + panel CRM */
function VisualMotor() {
  return (
    <div className="relative mt-3 grid min-h-[120px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 sm:gap-3" aria-hidden>
      <div className="flex flex-col items-center justify-end pb-1">
        <div className="relative w-[86px] rounded-[18px] border-[2.5px] border-zinc-600 bg-zinc-950 p-1 shadow-[0_12px_28px_rgba(0,0,0,0.55)] sm:w-[94px]">
          <div className="absolute top-1.5 left-1/2 z-10 h-3 w-10 -translate-x-1/2 rounded-full bg-black" />
          <div className="overflow-hidden rounded-[14px] bg-[#0a0a0a]">
            <motion.div className="flex items-center justify-between px-2 pt-4 pb-1 text-[6px] text-zinc-500">
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
        <motion.div className="overflow-hidden rounded-lg border border-emerald-500/25 bg-[#0a0f0a] shadow-[0_0_24px_rgba(16,185,129,0.12)]">
          <motion.div className="border-b border-emerald-500/20 bg-emerald-950/40 px-2 py-1">
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

// Replace all motion.div with div in this block only
const fixed = lines.replace(/motion\.div/g, "div");

const m0 = s.indexOf("/** Móvil con notificaciones");
const m1 = s.indexOf("function useExcelColumns");
s = s.slice(0, m0) + fixed + "\n" + s.slice(m1);

s = s.replace(
  /      <\/motion\.div>\n    <\/motion\.div>\n  \);\n}\n\n\/\*\* Móvil con notificaciones/,
  "      </div>\n    </motion.div>\n  );\n}\n\n/** Móvil con notificaciones",
);

// fix autoridad - simpler replace wrong closings before motor
s = s.replace("      </motion.div>\n    </motion.div>\n  );\n}\n\n/** Móvil", "      </div>\n    </motion.div>\n  );\n}\n\n/** Móvil");

fs.writeFileSync(p, s);
console.log("done");
