import fs from "fs";
const p = "src/components/sections/StrategicProfile.tsx";
let s = fs.readFileSync(p, "utf8");

s = s.replace(
  `          mode="engine"
          flashCol={flashCol}
          phase={phase}
        />`,
  `          mode="engine"
          flashCol={flashCol}
          phase={phase}
          large
        />`,
);

const gridOld =
  '      <div className="relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] grid-rows-[14px_repeat(5,22px)] text-[13px] leading-none antialiased tabular-nums sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]">';

const gridNew = `      <motion.div
        className={\`relative z-10 grid grid-cols-[22px_repeat(3,minmax(0,1fr))] leading-none antialiased tabular-nums \${
          large
            ? "grid-rows-[16px_repeat(5,28px)] text-[14px] sm:grid-cols-[26px_repeat(3,minmax(0,1fr))] sm:grid-rows-[14px_repeat(5,26px)] sm:text-[13px]"
            : "grid-rows-[14px_repeat(5,22px)] text-[13px] sm:grid-cols-[18px_repeat(3,minmax(0,1fr))] sm:grid-rows-[12px_repeat(5,20px)] sm:text-[12px]"
        }\`}
      >`.replace(/motion\.motion/g, "motion");

if (s.includes(gridOld)) s = s.replace(gridOld, gridNew.replace("<motion.div", "<div"));
else console.warn("grid not found");

s = s.replace(
  "const isEngineFill = isEngine && val.length > 0;\n              return (\n                <motion.div\n                  key={`${r}-${c}`}\n                  className={`relative flex h-[22px] items-center",
  "const isEngineFill = isEngine && val.length > 0;\n              const rowH = large ? \"h-[28px] sm:h-[26px]\" : \"h-[22px] sm:h-[20px]\";\n              return (\n                <motion.div\n                  key={`${r}-${c}`}\n                  className={`relative flex items-center ${rowH}",
);

fs.writeFileSync(p, s);
console.log("excel fixed");
