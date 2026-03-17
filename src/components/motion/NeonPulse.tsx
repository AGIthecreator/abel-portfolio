"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type NeonPulseProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Soft neon pulse every ~3 seconds (no layout shift).
 * Wrap buttons/CTAs with this component.
 */
export function NeonPulse({ children, className }: NeonPulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        filter: [
          "drop-shadow(0 0 0px rgba(139,92,246,0))",
          "drop-shadow(0 0 14px rgba(139,92,246,0.32))",
          "drop-shadow(0 0 0px rgba(139,92,246,0))",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
