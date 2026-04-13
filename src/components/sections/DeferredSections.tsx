"use client";

import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/utils/DeferredMount";

// --- IMPORTS DINÁMICOS ---

const Manifesto = dynamic(
  () => import("@/components/sections/Manifesto").then((m) => m.Manifesto),
  { ssr: false }
);

const TechStack = dynamic(
  () => import("@/components/sections/TechStack").then((m) => m.TechStack),
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

export function DeferredManifesto() {
  return (
    <DeferredMount fallback={<Skeleton h={300} />}>
      <Manifesto />
    </DeferredMount>
  );
}

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
    <DeferredMount fallback={<Skeleton h={520} />}>
      <StrategicProfile />
    </DeferredMount>
  );
}
