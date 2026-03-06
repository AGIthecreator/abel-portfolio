"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type TypewriterProps = {
  text: string;
  /** When provided, cycles through phrases sequentially */
  phrases?: string[];
  className?: string;
  /** ms per character when typing */
  typeSpeedMs?: number;
  /** ms per character when deleting */
  deleteSpeedMs?: number;
  /** pause after fully typed */
  pauseAfterTypedMs?: number;
  /** pause after fully deleted */
  pauseAfterDeletedMs?: number;
};

export function Typewriter({
  text,
  phrases,
  className,
  typeSpeedMs = 28,
  deleteSpeedMs = 18,
  pauseAfterTypedMs = 2000,
  pauseAfterDeletedMs = 350,
}: TypewriterProps) {
  const phraseList = useMemo(
    () => (phrases && phrases.length > 0 ? phrases : [text]),
    [phrases, text]
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  const fullText = useMemo(
    () => phraseList[phraseIdx] ?? "",
    [phraseIdx, phraseList]
  );
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<
    "typing" | "pauseTyped" | "deleting" | "pauseDeleted"
  >("typing");

  const last = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (last.current === null) {
      last.current = t;
      return;
    }
    const dt = t - last.current;

    const step = () => {
      if (phase === "typing") {
        if (count >= fullText.length) {
          setPhase("pauseTyped");
          return;
        }
        setCount((c) => Math.min(fullText.length, c + 1));
      } else if (phase === "deleting") {
        if (count <= 0) {
          setPhase("pauseDeleted");
          return;
        }
        setCount((c) => Math.max(0, c - 1));
      }
    };

    const speed = phase === "deleting" ? deleteSpeedMs : typeSpeedMs;
    if (phase === "typing" || phase === "deleting") {
      if (dt >= speed) {
        last.current = t;
        step();
      }
    }
  });

  useEffect(() => {
    if (phase === "pauseTyped") {
      const id = window.setTimeout(() => {
        last.current = null;
        setPhase("deleting");
      }, pauseAfterTypedMs);
      return () => window.clearTimeout(id);
    }

    if (phase === "pauseDeleted") {
      const id = window.setTimeout(() => {
        last.current = null;
        setPhraseIdx((i) => (i + 1) % phraseList.length);
        setPhase("typing");
      }, pauseAfterDeletedMs);
      return () => window.clearTimeout(id);
    }
  }, [phase, pauseAfterDeletedMs, pauseAfterTypedMs, phraseList.length]);

  const visible = fullText.slice(0, count);

  return (
    <span className={className}>
      <span>{visible}</span>
      <motion.span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[1em] w-[0.55em] bg-[rgba(139,92,246,1)] align-[-0.1em]"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}
