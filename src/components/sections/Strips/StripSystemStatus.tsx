"use client";

import React from "react";

/** Extensible: añade `{ kind: "name", label: "Marca" }` cuando tengas marcas solo en texto. */
type StripTechItem =
  | { kind: "logo"; src: string; alt: string }
  | { kind: "name"; label: string };

const STRIP_TECH_ITEMS: StripTechItem[] = [
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-plain.svg",
    alt: "Next.js",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original-wordmark.svg",
    alt: "React",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg",
    alt: "TypeScript",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain-wordmark.svg",
    alt: "Node.js",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-plain-wordmark.svg",
    alt: "PostgreSQL",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-plain.svg",
    alt: "Supabase",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-plain-wordmark.svg",
    alt: "Tailwind CSS",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudflare/cloudflare-plain-wordmark.svg",
    alt: "Cloudflare",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original-wordmark.svg",
    alt: "Vercel",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-plain-wordmark.svg",
    alt: "Docker",
  },
  {
    kind: "logo",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
    alt: "GitHub",
  },
];

function StripLogo({ src }: { src: string }) {
  return (
    <span className="strip-tech-logo-wrap strip-tech-logo-wrap--tint inline-flex shrink-0 cursor-default items-center motion-safe:animate-strip-logo-float">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        role="presentation"
        loading="lazy"
        decoding="async"
        className="h-[2.975rem] w-auto shrink-0 object-contain md:h-[3.4rem]"
      />
    </span>
  );
}

/** Texto de marca: sin animación (evita pelear con el carrusel); solo opacidad al hover */
function StripName({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 cursor-default whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-[#415762]/55 opacity-90 transition-opacity duration-200 ease-out hover:opacity-100 md:text-[0.8125rem]">
      {label}
    </span>
  );
}

function renderItem(item: StripTechItem, key: React.Key) {
  if (item.kind === "name") {
    return <StripName key={key} label={item.label} />;
  }
  return <StripLogo key={key} src={item.src} />;
}

function LogoTrack({ idPrefix }: { idPrefix: string }) {
  return (
    <div
      className="flex shrink-0 items-center gap-[2.72rem] pr-[2.72rem] md:gap-[6.12rem] md:pr-[6.12rem]"
      aria-hidden={idPrefix === "b" ? true : undefined}
    >
      {STRIP_TECH_ITEMS.map((item, i) => renderItem(item, `${idPrefix}-${i}`))}
    </div>
  );
}

const StripSystemStatus = () => {
  return (
    <section
      aria-label="Stack tecnológico"
      className="strip-tech-paper relative isolate z-0 w-full overflow-hidden"
    >
      <div className="relative px-3 pb-5 pt-4 sm:px-4 md:pb-7 md:pt-6">
        <div className="strip-tech-marquee-mask w-full overflow-hidden">
          <div className="flex w-max animate-strip-tech-marquee">
            <LogoTrack idPrefix="a" />
            <LogoTrack idPrefix="b" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StripSystemStatus;
