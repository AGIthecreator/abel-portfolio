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

const Faq = dynamic(() =>
  import("@/components/sections/Faq").then((m) => ({
    default: m.Faq,
  })),
);

export function DeferredStrategicProfile() {
  return <StrategicProfile />;
}

export function DeferredWhatIBuild() {
  return <WhatIBuild />;
}

export function DeferredFaq() {
  return <Faq />;
}
