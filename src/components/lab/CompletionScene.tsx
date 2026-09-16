"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRIMARY_CTA } from "@/components/services/ServicePagePrimitives";
import { getLabBlock, isLabBlockId } from "@/lib/lab/blocks";
import { LAB_FEATURED_SCENARIOS } from "@/lib/lab/scenarios";
import type { LabActivationState, LabStats } from "@/lib/lab/session";
import type { LabBlockId } from "@/lib/lab/types";

/** Tres colores de la web. El hueso es el «blanco» de marca, nunca #fff. */
const C = {
  bg: "#070b13",
  violet: "#a78bfa",
  gray: "#9ca3af",
  bone: "#F3F1EB",
} as const;

type Ink = "violet" | "gray" | "bone";

const INK: Record<Ink, string> = {
  violet: C.violet,
  gray: C.gray,
  bone: C.bone,
};

const WORDS = ["ENTRA", "DECIDE", "ACTÚA", "SIGUE"] as const;
const WORD_FILL = [C.violet, C.gray, C.bone, C.violet] as const;

const WORD_FORM = 520;
const WORD_HOLD = 500;
const WORD_BURST = 820;
const WORD_GAP = 240;
const VOID_MS = 380;
const CONVERGE_MS = 2200;
const LOGO_HOLD_MS = 700;

function wordStart(index: number): number {
  return VOID_MS + index * (WORD_FORM + WORD_HOLD + WORD_BURST + WORD_GAP);
}

const LAST_BURST_END =
  wordStart(WORDS.length - 1) + WORD_FORM + WORD_HOLD + WORD_BURST;

const T = {
  voidEnd: VOID_MS,
  convergeStart: LAST_BURST_END + 180,
  convergeEnd: LAST_BURST_END + 180 + CONVERGE_MS,
  logoHoldEnd: LAST_BURST_END + 180 + CONVERGE_MS + LOGO_HOLD_MS,
  titleEnd: LAST_BURST_END + 180 + CONVERGE_MS + LOGO_HOLD_MS + 900,
  copyEnd: LAST_BURST_END + 180 + CONVERGE_MS + LOGO_HOLD_MS + 1800,
  statsEnd: LAST_BURST_END + 180 + CONVERGE_MS + LOGO_HOLD_MS + 2600,
  end: LAST_BURST_END + 180 + CONVERGE_MS + LOGO_HOLD_MS + 3400,
} as const;

const VW = 76;
const VH = 42;
const CX = (VW - 1) / 2;
const CY = (VH - 1) / 2;

type Cell = readonly [number, number];

const FONT: Record<string, readonly string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".###.", "#...#", "#....", ".###.", "....#", "#...#", ".###."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  Ú: ["..#..", "#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
};

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function ramp(elapsed: number, start: number, duration: number): number {
  return clamp01((elapsed - start) / Math.max(duration, 1));
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (2 * t - 2) * (2 * t - 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function fract(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function keyOf(cell: Cell): string {
  return `${cell[0]},${cell[1]}`;
}

function stampGlyph(
  ox: number,
  oy: number,
  rows: readonly string[],
  scale: number,
): Cell[] {
  const cells: Cell[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== "#") return;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          cells.push([ox + x * scale + dx, oy + y * scale + dy]);
        }
      }
    });
  });
  return cells;
}

function textSize(text: string, gap: number, scale: number): {
  w: number;
  h: number;
} {
  const glyphs = [...text].map((ch) => FONT[ch] ?? FONT.A);
  const w =
    glyphs.reduce((sum, rows) => sum + (rows[0]?.length ?? 5) * scale, 0) +
    Math.max(0, glyphs.length - 1) * gap;
  const h = Math.max(...glyphs.map((rows) => rows.length)) * scale;
  return { w, h };
}

function stampText(
  text: string,
  ox: number,
  oy: number,
  gap: number,
  scale: number,
): Cell[] {
  const glyphs = [...text].map((ch) => FONT[ch] ?? FONT.A);
  const maxH = Math.max(...glyphs.map((rows) => rows.length));
  const cells: Cell[] = [];
  let x = ox;
  for (const rows of glyphs) {
    const y = oy + (maxH - rows.length) * scale;
    cells.push(...stampGlyph(x, y, rows, scale));
    x += (rows[0]?.length ?? 5) * scale + gap;
  }
  return cells;
}

function neighbors(cell: Cell, set: Set<string>): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      if (set.has(`${cell[0] + dx},${cell[1] + dy}`)) n += 1;
    }
  }
  return n;
}

/** Ajusta una máscara para usar exactamente `n` celdas. */
function fitToMask(mask: readonly Cell[], n: number): Cell[] {
  if (n <= 0) return [];
  if (n === mask.length) return mask.map((cell) => [cell[0], cell[1]] as Cell);
  if (n < mask.length) {
    const set = new Set(mask.map(keyOf));
    return [...mask]
      .sort((a, b) => neighbors(a, set) - neighbors(b, set))
      .slice(0, n)
      .map((cell) => [cell[0], cell[1]] as Cell);
  }

  const cells: Cell[] = mask.map((cell) => [cell[0], cell[1]] as Cell);
  const set = new Set(cells.map(keyOf));
  const dirs: Cell[] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let guard = 0;
  while (cells.length < n && guard < 8000) {
    guard += 1;
    const extra: Cell[] = [];
    for (const [x, y] of cells) {
      for (const [dx, dy] of dirs) {
        const next: Cell = [x + dx, y + dy];
        const key = keyOf(next);
        if (set.has(key)) continue;
        set.add(key);
        extra.push(next);
      }
    }
    if (extra.length === 0) break;
    for (const cell of extra) {
      if (cells.length >= n) break;
      cells.push(cell);
    }
  }
  return cells.slice(0, n);
}

function splitCounts(weights: readonly number[], total: number): number[] {
  const sum = weights.reduce((acc, value) => acc + value, 0);
  const raw = weights.map((value) => (value / sum) * total);
  const floors = raw.map((value) => Math.floor(value));
  let remain = total - floors.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - floors[index] }))
    .sort((a, b) => b.frac - a.frac);
  const counts = [...floors];
  for (const item of order) {
    if (remain <= 0) break;
    counts[item.index] += 1;
    remain -= 1;
  }
  return counts;
}

function layoutLogo(): { dest: Cell; ink: Ink }[] {
  const agi = stampText("AGI", 0, 0, 2, 2);
  const the = stampText("THE", 0, 0, 1, 1);
  const creator = stampText("CREATOR", 0, 0, 1, 1);
  const agiBox = textSize("AGI", 2, 2);
  const theBox = textSize("THE", 1, 1);
  const creatorBox = textSize("CREATOR", 1, 1);
  const lineW = theBox.w + 1 + creatorBox.w;
  const agiX = Math.round((VW - agiBox.w) / 2);
  const agiY = 4;
  const lineX = Math.round((VW - lineW) / 2);
  const lineY = agiY + agiBox.h + 4;
  const creatorX = lineX + theBox.w + 1;

  return [
    ...agi.map((cell) => ({
      dest: [cell[0] + agiX, cell[1] + agiY] as Cell,
      ink: "violet" as const,
    })),
    ...the.map((cell) => ({
      dest: [cell[0] + lineX, cell[1] + lineY] as Cell,
      ink: "gray" as const,
    })),
    ...creator.map((cell) => ({
      dest: [cell[0] + creatorX, cell[1] + lineY] as Cell,
      ink: "bone" as const,
    })),
  ];
}

type Particle = {
  id: number;
  ink: Ink;
  word: number;
  origin: Cell;
  rest: Cell;
  dest: Cell;
};

function uniqueRest(index: number, taken: Set<string>): Cell {
  const angle = fract(index * 1.6180339887) * Math.PI * 2;
  const dist = 11 + fract(index * 3.711) * 16;
  let x = CX + Math.cos(angle) * dist * 1.35;
  let y = CY + Math.sin(angle) * dist * 0.92;
  for (let step = 0; step < 80; step += 1) {
    const cell: Cell = [
      Math.max(1, Math.min(VW - 2, Math.round(x))),
      Math.max(1, Math.min(VH - 2, Math.round(y))),
    ];
    const key = keyOf(cell);
    if (!taken.has(key)) {
      taken.add(key);
      return cell;
    }
    const spin = step * 0.47;
    x += Math.cos(angle + spin) * 1.1;
    y += Math.sin(angle + spin) * 1.1;
  }
  const fallback: Cell = [1 + (index % (VW - 2)), 1 + (Math.floor(index / VW) % (VH - 2))];
  taken.add(keyOf(fallback));
  return fallback;
}

function buildParticles(): Particle[] {
  const logo = layoutLogo();
  const masks = WORDS.map((word) => {
    const box = textSize(word, 1, 1);
    const ox = Math.round((VW - box.w) / 2);
    const oy = Math.round((VH - box.h) / 2);
    return stampText(word, ox, oy, 1, 1);
  });
  const alloc = splitCounts(
    masks.map((mask) => mask.length),
    logo.length,
  );

  const byInk: Record<Ink, typeof logo> = {
    violet: logo.filter((item) => item.ink === "violet"),
    gray: logo.filter((item) => item.ink === "gray"),
    bone: logo.filter((item) => item.ink === "bone"),
  };
  const queue: typeof logo = [];
  const maxLen = Math.max(byInk.violet.length, byInk.gray.length, byInk.bone.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (i < byInk.violet.length) queue.push(byInk.violet[i]);
    if (i < byInk.gray.length) queue.push(byInk.gray[i]);
    if (i < byInk.bone.length) queue.push(byInk.bone[i]);
  }

  const taken = new Set<string>();
  const particles: Particle[] = [];
  let cursor = 0;
  WORDS.forEach((_, word) => {
    const count = alloc[word];
    const origins = fitToMask(masks[word], count);
    for (let i = 0; i < count; i += 1) {
      const item = queue[cursor];
      cursor += 1;
      if (!item || !origins[i]) {
        throw new Error("Finale: partícula sin origen o destino.");
      }
      particles.push({
        id: particles.length,
        ink: item.ink,
        word,
        origin: origins[i],
        rest: uniqueRest(particles.length + word * 97, taken),
        dest: item.dest,
      });
    }
  });

  const countInk = (ink: Ink) => particles.filter((item) => item.ink === ink).length;
  if (
    particles.length !== logo.length ||
    countInk("violet") !== byInk.violet.length ||
    countInk("gray") !== byInk.gray.length ||
    countInk("bone") !== byInk.bone.length
  ) {
    throw new Error("Finale: los píxeles de las palabras no coinciden con AGI TheCreator.");
  }

  return particles;
}

const PARTICLES = buildParticles();

function particlePos(
  particle: Particle,
  elapsed: number,
): { x: number; y: number; opacity: number } {
  const start = wordStart(particle.word);
  const hold = start + WORD_FORM;
  const burst = hold + WORD_HOLD;
  const burstEnd = burst + WORD_BURST;

  if (elapsed < start) {
    return { x: CX, y: CY, opacity: 0 };
  }
  if (elapsed < hold) {
    const t = easeOut(ramp(elapsed, start, WORD_FORM));
    return {
      x: lerp(CX, particle.origin[0], t),
      y: lerp(CY, particle.origin[1], t),
      opacity: 1,
    };
  }
  if (elapsed < burst) {
    return { x: particle.origin[0], y: particle.origin[1], opacity: 1 };
  }
  if (elapsed < burstEnd) {
    const t = easeOut(ramp(elapsed, burst, WORD_BURST));
    return {
      x: lerp(particle.origin[0], particle.rest[0], t),
      y: lerp(particle.origin[1], particle.rest[1], t),
      opacity: 1,
    };
  }
  if (elapsed < T.convergeStart) {
    return { x: particle.rest[0], y: particle.rest[1], opacity: 1 };
  }
  const t = easeInOut(ramp(elapsed, T.convergeStart, CONVERGE_MS));
  return {
    x: lerp(particle.rest[0], particle.dest[0], t),
    y: lerp(particle.rest[1], particle.dest[1], t),
    opacity: 1,
  };
}

function particleFill(particle: Particle, elapsed: number): string {
  const burst = wordStart(particle.word) + WORD_FORM + WORD_HOLD;
  if (elapsed < burst) return WORD_FILL[particle.word];
  return INK[particle.ink];
}

function activeWordIndex(elapsed: number): number {
  if (elapsed < T.voidEnd) return -1;
  for (let i = 0; i < WORDS.length; i += 1) {
    const start = wordStart(i);
    const end = start + WORD_FORM + WORD_HOLD + WORD_BURST + WORD_GAP;
    if (elapsed < end) return i;
  }
  return -1;
}

export interface FinaleNode {
  id: string;
  label: string;
}

export function resolveFinaleNodes(
  flow: readonly LabBlockId[],
  activation: LabActivationState | null,
): FinaleNode[] {
  if (flow.length > 0) {
    return flow.filter(isLabBlockId).map((id, index) => ({
      id: `${id}-${index}`,
      label: getLabBlock(id).label,
    }));
  }
  if (activation?.steps.length) {
    return activation.steps.map((step) => ({
      id: step.id,
      label: step.label,
    }));
  }
  return [];
}

function buildIndicators(
  stats: LabStats,
  activation: LabActivationState | null,
  flow: readonly LabBlockId[],
): { label: string; value: string; note: string }[] {
  const items: { label: string; value: string; note: string }[] = [];
  if (activation || stats.flows > 0) {
    items.push({
      label: "Solicitud",
      value: activation ? "Procesada" : "Construida",
      note: activation ? "Entró al sistema" : "Flujo montado",
    });
  }
  if (stats.decisions > 0) {
    items.push({
      label: "Decisiones",
      value: "Aplicadas",
      note: `${stats.decisions} en esta sesión`,
    });
  }
  if (stats.realActions + stats.simulatedActions > 0) {
    items.push({
      label: "Acciones",
      value: "Ejecutadas",
      note: stats.realActions > 0 ? "Con ejecución real" : "Recorrido simulado",
    });
  }
  if (
    activation?.followup?.status === "scheduled" ||
    flow.includes("seguimiento")
  ) {
    items.push({
      label: "Seguimiento",
      value: "Preparado",
      note: "El proceso no se olvida",
    });
  }
  return items.slice(0, 4);
}

function HighlightedLine({
  parts,
}: {
  parts: readonly (string | { accent: string })[];
}) {
  return (
    <p className="text-[15px] leading-snug text-[#F3F1EB] sm:text-[16px]">
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <span key={index} className="text-violet-300">
            {part.accent}
          </span>
        ),
      )}
    </p>
  );
}

export function CompletionScene({
  stats,
  activation,
  flow,
  onRestart,
  onCta,
}: {
  stats: LabStats;
  activation: LabActivationState | null;
  flow: readonly LabBlockId[];
  onRestart: () => void;
  onCta: (target: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const reduce = reduceMotion === true;
  const [skipped, setSkipped] = useState(false);
  const [elapsed, setElapsed] = useState(() => (reduce ? T.end : 0));
  const skippedRef = useRef(false);
  const reduceRef = useRef(reduce);

  const nodes = useMemo(
    () => resolveFinaleNodes(flow, activation),
    [flow, activation],
  );
  const indicators = useMemo(
    () => buildIndicators(stats, activation, flow),
    [stats, activation, flow],
  );

  useEffect(() => {
    skippedRef.current = skipped;
  }, [skipped]);

  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  useEffect(() => {
    if (reduceRef.current || skippedRef.current) {
      setElapsed(T.end);
      return;
    }

    let frame = 0;
    let lastBucket = -1;
    const origin = performance.now();

    const tick = (now: number) => {
      if (reduceRef.current || skippedRef.current) {
        setElapsed(T.end);
        return;
      }
      const next = Math.min(now - origin, T.end);
      const bucket = Math.floor(next / 33);
      if (bucket !== lastBucket) {
        lastBucket = bucket;
        setElapsed(next);
      }
      if (next < T.end) {
        frame = window.requestAnimationFrame(tick);
      } else {
        setElapsed(T.end);
      }
    };

    frame = window.requestAnimationFrame(tick);
    const watchdog = window.setTimeout(() => {
      if (!skippedRef.current) setSkipped(true);
    }, T.end + 4000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(watchdog);
    };
  }, []);

  useEffect(() => {
    if (skipped || reduce) setElapsed(T.end);
  }, [skipped, reduce]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Enter") return;
      skippedRef.current = true;
      setSkipped(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const skip = () => {
    skippedRef.current = true;
    setSkipped(true);
  };

  const playing = elapsed < T.convergeEnd && !skipped && !reduce;
  const showCopy = elapsed >= T.logoHoldEnd;
  const showStats = elapsed >= T.copyEnd;
  const showCta = elapsed >= T.statsEnd;
  const titleOpacity = ramp(elapsed, T.logoHoldEnd, 700);
  const leadOpacity = ramp(elapsed, T.titleEnd - 180, 480);
  const linesOpacity = ramp(elapsed, T.titleEnd + 80, 700);
  const statsOpacity = ramp(elapsed, T.copyEnd, 420);
  const chipsOpacity = ramp(elapsed, T.copyEnd + 240, 420);
  const ctaOpacity = ramp(elapsed, T.statsEnd, 420);
  const word = activeWordIndex(elapsed);
  const liveWord = word >= 0 && elapsed < T.convergeStart ? WORDS[word] : null;

  return (
    <div
      className={`relative flex min-h-svh w-full flex-col bg-[#070b13] px-4 py-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-8 ${
        showCopy ? "justify-center gap-3 sm:gap-4" : ""
      }`}
    >
      <h2 id="lab-finale-title" className="sr-only">
        Proceso completado
      </h2>
      <p className="sr-only">
        {nodes.length
          ? `Proceso construido: ${nodes.map((node) => node.label).join(", ")}.`
          : "Proceso completado."}
      </p>
      <p className="sr-only" aria-live="polite">
        {elapsed >= T.convergeEnd
          ? "AGI TheCreator"
          : liveWord
            ? liveWord
            : ""}
      </p>

      {playing ? (
        <button
          type="button"
          onClick={skip}
          className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-30 cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-[#F3F1EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70"
        >
          Saltar
        </button>
      ) : null}

      <div
        className={`flex w-full items-center justify-center ${
          showCopy ? "shrink-0 pt-2 pb-0 sm:pt-3" : "min-h-[86svh] flex-1"
        }`}
      >
        <svg
          viewBox={showCopy ? `0 2 ${VW} 29` : `0 0 ${VW} ${VH}`}
          className={
            showCopy
              ? "h-[min(26svh,13.5rem)] w-[min(92vw,36rem)] overflow-visible sm:h-[min(28svh,15rem)]"
              : "h-[min(82svh,46rem)] w-[min(96vw,80rem)] overflow-visible"
          }
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          {PARTICLES.map((particle) => {
            const pos = particlePos(particle, elapsed);
            if (pos.opacity < 0.02) return null;
            return (
              <rect
                key={particle.id}
                x={Math.round(pos.x) + 0.08}
                y={Math.round(pos.y) + 0.08}
                width={0.84}
                height={0.84}
                fill={particleFill(particle, elapsed)}
                opacity={pos.opacity}
              />
            );
          })}
        </svg>
      </div>

      {showCopy ? (
        <div
          className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] text-center"
          style={{ opacity: titleOpacity }}
        >
          <p>
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Proceso
            </span>
            <span className="mt-1.5 block font-(family-name:--font-svc-display) text-[clamp(1.85rem,7vw,2.85rem)] leading-[1.05] font-medium tracking-[-0.03em] text-violet-300">
              completado
            </span>
          </p>

          <div className="mt-4 max-w-md" style={{ opacity: leadOpacity }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Ya has visto cómo funciona{" "}
              <span className="text-violet-300/90">por dentro</span>.
            </p>
            <div className="mt-3.5 flex flex-col gap-1.5" style={{ opacity: linesOpacity }}>
              <HighlightedLine parts={["Una solicitud entra."]} />
              <HighlightedLine
                parts={["El ", { accent: "sistema" }, " ", { accent: "decide" }, "."]}
              />
              <HighlightedLine parts={["Las ", { accent: "acciones" }, " ocurren."]} />
              <HighlightedLine
                parts={[
                  "Y una ",
                  { accent: "persona" },
                  " interviene cuando hace falta.",
                ]}
              />
            </div>
          </div>

        {showStats && indicators.length > 0 ? (
          <ul
            className="mt-6 flex list-none flex-wrap items-start justify-center gap-x-8 gap-y-5 p-0"
            style={{ opacity: statsOpacity }}
          >
            {indicators.map((item) => (
              <li key={item.label} className="min-w-20">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-1 text-[13px] text-[#F3F1EB]">{item.value}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{item.note}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {showStats ? (
          <div className="mt-5 w-full max-w-md" style={{ opacity: chipsOpacity }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
              Y esto puede aplicarse a
            </p>
            <ul className="mt-3 flex list-none flex-wrap items-center justify-center gap-1.5 p-0">
              {LAB_FEATURED_SCENARIOS.map((item) => (
                <li
                  key={item.id}
                  className="rounded-sm border border-[#F3F1EB]/16 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400"
                >
                  {item.shortTitle}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showCta ? (
          <div className="mt-6 w-full max-w-sm" style={{ opacity: ctaOpacity }}>
            <p className="text-[16px] leading-snug text-[#F3F1EB]">
              ¿Y si hacemos esto con uno de{" "}
              <span className="text-violet-300">tus procesos</span>?
            </p>
            <div className="mt-5 flex flex-col items-stretch gap-3 sm:items-center">
              <Link
                href="/presupuesto"
                onClick={() => onCta("presupuesto_principal")}
                className={`${PRIMARY_CTA} w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70`}
              >
                <span className="relative z-10">Quiero automatizar algo →</span>
              </Link>
              <button
                type="button"
                onClick={onRestart}
                className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-[#F3F1EB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/70"
              >
                Volver a empezar
              </button>
            </div>
          </div>
        ) : null}
        </div>
      ) : null}
    </div>
  );
}
