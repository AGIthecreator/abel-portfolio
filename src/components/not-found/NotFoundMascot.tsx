"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const MASCOT_SRC = "/mascot/peacock-404.png";

type LoadState = "pending" | "ready" | "missing";

export function NotFoundMascot() {
  const [loadState, setLoadState] = useState<LoadState>("pending");

  useEffect(() => {
    const img = new window.Image();
    img.src = MASCOT_SRC;
    img.onload = () => setLoadState("ready");
    img.onerror = () => setLoadState("missing");
  }, []);

  return (
    <div
      className="not-found-mascot relative w-[min(210px,72vw)] sm:w-[min(230px,58vw)] md:w-[min(310px,42vw)] lg:w-[min(340px,36vw)]"
      aria-hidden
    >
      {loadState === "ready" ? (
        <Image
          src={MASCOT_SRC}
          alt=""
          width={340}
          height={340}
          priority
          sizes="(max-width: 640px) 210px, (max-width: 1024px) 310px, 340px"
          className="h-auto w-full object-contain object-center"
        />
      ) : (
        <div
          className={`mx-auto aspect-square w-full max-w-[340px] rounded-2xl border border-dashed border-white/8 bg-white/2 ${
            loadState === "pending" ? "animate-pulse" : ""
          }`}
        />
      )}
    </div>
  );
}
