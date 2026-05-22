import type { ReactNode } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";

type LegalPageShellProps = {
  title: string;
  children: ReactNode;
};

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <div className="relative min-h-screen bg-[#070b13]">
      <SiteNavbar />
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-28 sm:px-6 sm:pt-32 lg:max-w-200 lg:pt-36">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest text-zinc-600 no-underline transition-colors hover:text-zinc-400"
        >
          ← Inicio
        </Link>
        <h1 className="mt-10 font-serif text-[clamp(2rem,5vw,2.75rem)] font-normal leading-[1.15] tracking-[-0.03em] text-zinc-100">
          {title}
        </h1>
        <div className="mt-14 space-y-10 text-[1.05rem] leading-[1.75] text-zinc-400">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
