"use client";

import React from "react";

type EcgConnectorProps = {
  /** Accessible label for screen readers (connector is decorative by default). */
  ariaLabel?: string;
  /** Height of the connector area (px). */
  height?: number;
  className?: string;
};

/**
 * ECG-like connector to visually link sections.
 * - Ultra-thin (1px) stroke
 * - Gradient (violet → cyan) + subtle glow
 * - "Draw" animation that loops left → right
 */
export function EcgConnector({ ariaLabel, height = 42, className }: EcgConnectorProps) {
  return (
    <div
      className={
        "relative w-full overflow-hidden pointer-events-none select-none " +
        (className ?? "")
      }
      style={{ height }}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ecg-gradient" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.55" />
          </linearGradient>

          {/* Glow: subtle, not “neon tube” */}
          <filter id="ecg-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.55 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/*
          Single path (we let CSS handle glow via filter and the “live draw” via dashoffset).
          Keeping it single-path also makes syncing the head easier.
        */}
        <path
          className="ecg-connector__path"
          pathLength={1}
          d="M 0 30 L 60 30
             L 100 30 L 120 18 L 140 46 L 160 12 L 180 52 L 200 26 L 220 30
             L 260 30 L 280 18 L 300 46 L 320 12 L 340 52 L 360 26 L 380 30
             L 420 30 L 440 18 L 460 46 L 480 12 L 500 52 L 520 26 L 540 30
             L 580 30 L 600 18 L 620 46 L 640 12 L 660 52 L 680 26 L 700 30
             L 740 30 L 760 18 L 780 46 L 800 12 L 820 52 L 840 26 L 860 30
             L 900 30 L 920 18 L 940 46 L 960 12 L 980 52 L 1000 26 L 1020 30
             L 1060 30 L 1080 18 L 1100 46 L 1120 12 L 1140 52 L 1160 26 L 1170 30
             L 1200 30"
          fill="none"
          stroke="url(#ecg-gradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecg-glow)"
        />

        {/* Head removed: we only show the live-drawing neon line. */}
      </svg>
    </div>
  );
}
