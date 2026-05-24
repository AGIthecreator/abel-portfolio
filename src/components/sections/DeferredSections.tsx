"use client";

import dynamic from "next/dynamic";

/** Code-split sin `ssr: false` → el HTML inicial incluye el contenido (evita CLS en escritorio). */
const StrategicProfile = dynamic(() =>
  import("@/components/sections/StrategicProfile").then((m) => ({
    default: m.StrategicProfile,
  })),
);

const WhatIBuild = dynamic(() =>
  import("@/components/sections/WhatIBuild").then((m) => ({
    default: m.WhatIBuild,
  })),
);

export function DeferredStrategicProfile() {
  return <StrategicProfile />;
}

export function DeferredWhatIBuild() {
  return <WhatIBuild />;
}
