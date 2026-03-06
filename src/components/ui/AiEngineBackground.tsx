"use client";

import { motion } from "framer-motion";

    type AiEngineBackgroundProps = {
    /** base brand color (hex/rgb) used to tint the engine */
    color: string;
    accelerated?: boolean;
    };

    export function AiEngineBackground({
    color,
    accelerated = false,
    }: AiEngineBackgroundProps) {
    const duration = accelerated ? 4 : 9;

    return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      {/* subtle mask */}
      <div className="absolute inset-0 bg-black/10" />

      {/*
        Persistent "data-fluid": subtle animated ribbons + scanning lines.
        Kept intentionally soft to avoid distracting the label.
      */}
      <motion.div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          background: `repeating-linear-gradient(90deg, transparent 0 18px, ${color}22 18px 19px, transparent 19px 38px)`,
          mixBlendMode: "screen",
        }}
        animate={{ x: ["-20%", "20%", "-20%"] }}
        transition={{ duration: duration * 1.2, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute -inset-[40%] opacity-55"
        style={{
          background: `radial-gradient(closest-side at 30% 30%, ${color}55, transparent 60%), radial-gradient(closest-side at 70% 70%, ${color}35, transparent 62%), linear-gradient(120deg, transparent 20%, ${color}26 45%, transparent 70%)`,
          filter: "blur(18px)",
        }}
        animate={{ x: ["-6%", "6%", "-6%"], y: ["4%", "-4%", "4%"] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -inset-[40%] opacity-35"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}22 45%, transparent 90%)`,
          filter: "blur(20px)",
        }}
        animate={{ rotate: [0, 12, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: duration * 1.15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -inset-[20%] opacity-40"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, ${color}22 80deg, transparent 140deg, ${color}18 220deg, transparent 360deg)`,
          filter: "blur(26px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: accelerated ? 6 : 12, repeat: Infinity, ease: "linear" }}
      />

      {/* glass sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10),transparent_45%,rgba(0,0,0,0.10))] opacity-40" />
    </div>
  );
}
