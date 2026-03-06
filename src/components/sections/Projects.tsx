import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerChild } from "@/components/motion/Stagger";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { projects } from "@/lib/data/portfolio";
import Image from "next/image";
import { Play } from "lucide-react";

function ProjectImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/5 via-white/0 to-[rgba(139,92,246,0.12)]">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover opacity-95 transition-transform duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(400px_circle_at_30%_30%,rgba(139,92,246,0.25),transparent_60%)] opacity-70" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,5,5,0.65),transparent_60%)]" />
    </div>
  );
}

export function Projects() {
  return (
    <section id="proyectos">
      <FadeIn className="glass-card neon-border p-4 sm:p-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            PROYECTOS
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-accent/40 to-transparent ml-4" />
        </div>

        <Stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          delay={0.05}
        >
          {projects.map((p) => (
            <StaggerChild key={p.key}>
              <SpotlightCard className="glass-card neon-border group relative h-full rounded-3xl p-4 transition-transform duration-300 will-change-transform hover:scale-[1.02] hover:-translate-y-1">
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      "inset 0 0 18px rgba(139,92,246,0.18), 0 0 42px rgba(139,92,246,0.10)",
                  }}
                />

                <div className="relative flex h-full flex-col gap-4">
                  <ProjectImage src={p.imageSrc} alt={`${p.title} preview`} />

                  {p.securityTag && (
                    <div className="-mt-1">
                      <span className="inline-flex items-center rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] px-3 py-1 text-[11px] font-medium tracking-wide text-white/80">
                        {p.securityTag}
                      </span>
                    </div>
                  )}

                  {p.highlightTag && (
                    <div className="-mt-1">
                      <span className="inline-flex items-center rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] px-3 py-1 text-[11px] font-medium tracking-wide text-white/80">
                        {p.highlightTag}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {p.title}
                    </h3>
                    {p.status === "coming-soon" && (
                      <span className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] px-2 py-1 text-[11px] font-medium tracking-wide text-white/80">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <p className="flex-1 text-sm leading-6 text-white/65">
                    {p.description}
                  </p>

                  <Stagger className="mt-auto flex flex-wrap gap-2 pt-2" delay={0.05}>
                    {p.tags.map((t) => (
                      <StaggerChild key={t}>
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-white/70">
                          {t}
                        </span>
                      </StaggerChild>
                    ))}
                  </Stagger>

                  {p.ctaHref && p.ctaLabel && (
                    <div className="mt-auto pt-4">
                      <a
                        href={p.ctaHref}
                        target={p.ctaHref.startsWith("http") ? "_blank" : undefined}
                        rel={p.ctaHref.startsWith("http") ? "noreferrer" : undefined}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-[rgba(139,92,246,0.18)]"
                      >
                        {p.key === "callguard" && <Play className="h-4 w-4" />}
                        {p.ctaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </StaggerChild>
          ))}
        </Stagger>
      </FadeIn>
    </section>
  );
}
