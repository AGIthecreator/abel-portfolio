"use client";

import dynamic from "next/dynamic";

export const DeferredStripSystemStatus = dynamic(
  () => import("@/components/sections/Strips/StripSystemStatus"),
  { ssr: false },
);

export const DeferredStripExecution = dynamic(
  () => import("@/components/sections/Strips/StripExecution"),
  { ssr: false },
);
