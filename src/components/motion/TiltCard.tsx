"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionStyle,
} from "framer-motion";
import type { PropsWithChildren } from "react";

type TiltCardProps = PropsWithChildren<{
  className?: string;
  /** CSS color (hex/rgb/hsl) used for glow */
  glowColor: string;
  /** If true, renders an animated conic-gradient border */
  conicBorder?: boolean;
}>;

export function TiltCard({
  children,
  className,
  glowColor,
  conicBorder = false,
}: TiltCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  const glow = useMotionTemplate`0 0 20px ${glowColor}44`;

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // tilt range
    const max = 10;
    rotateY.set((px - 0.5) * max);
    rotateX.set(-(py - 0.5) * max);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowOpacity.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseEnter={() => glowOpacity.set(1)}
      onMouseLeave={onLeave}
      style={{ perspective: 800 } as MotionStyle}
      className={className}
    >
      {conicBorder && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[inherit]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(139,92,246,0.0), rgba(139,92,246,0.85), rgba(255,255,255,0.22), rgba(139,92,246,0.85), rgba(139,92,246,0.0))",
            opacity: 0.55,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.div
        className="relative rounded-[inherit]"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: glow,
          opacity: 1,
        } as MotionStyle}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            boxShadow: glow,
            opacity: glowOpacity,
          } as MotionStyle}
        />
        {children}
      </motion.div>
    </motion.div>
  );
}
