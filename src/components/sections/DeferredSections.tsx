"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/utils/DeferredMount";

// --- IMPORTS DINÁMICOS ---
// Corregidos para manejar exportaciones por defecto o nombradas según corresponda

// ELIMINAMOS el .then() porque TechStack ahora usa export default
const TechStack = dynamic(
  () => import("@/components/sections/TechStack"), 
  { ssr: false }
);

const Projects = dynamic(
  () => import("@/components/sections/Projects").then((m) => m.Projects),
  { ssr: false }
);

const StrategicProfile = dynamic(
  () => import("@/components/sections/StrategicProfile").then((m) => m.StrategicProfile),
  { ssr: false }
);

// --- COMPONENTE SKELETON ---

function Skeleton({ h }: { h: number }) {
  return (
    <div
      className="rounded-3xl border border-white/10 bg-white/5 w-full"
      style={{ height: h }}
      aria-hidden="true"
    />
  );
}

// --- COMPONENTES DIFERIDOS (EXPORTADOS) ---

export function DeferredTechStack() {
  return (
    <DeferredMount fallback={<Skeleton h={520} />}>
      <TechStack />
    </DeferredMount>
  );
}

export function DeferredProjects() {
  return (
    <DeferredMount fallback={<Skeleton h={620} />}>
      <Projects />
    </DeferredMount>
  );
}

export function DeferredStrategicProfile() {
  return (
    <DeferredMount fallback={<Skeleton h={1100} />}>
      <StrategicProfile />
    </DeferredMount>
  );
}
