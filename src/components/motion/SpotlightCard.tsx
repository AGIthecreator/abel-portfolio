"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionStyle,
} from "framer-motion";
import type { PropsWithChildren } from "react";

type SpotlightCardProps = PropsWithChildren<{
  className?: string;
}>;

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(650px circle at ${x}px ${y}px, rgba(138, 43, 226, 0.20), transparent 55%)`;

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseEnter={() => opacity.set(1)}
      onMouseLeave={() => opacity.set(0)}
      className={className}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background, opacity } as MotionStyle}
        transition={{ type: "tween", duration: 0.2 }}
      />
      {children}
    </div>
  );
}
