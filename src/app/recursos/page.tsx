import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import {
  EditorialImage,
  StripeBand,
  SurfaceBand,
} from "@/components/resources/ResourceBands";
import {
  ARTICLES,
  articlePath,
  categoryTitle,
  readingMinutes,
} from "@/lib/content/articles";

const INDEX_VISUALS: Record<string, { src: string; alt: string }> = {
  "que-tareas-automatizar": {
    src: "/recursos/destacado.jpg",
    alt: "Una carpeta en color hueso adelantada entre carpetas azul noche.",
  },
  "web-a-medida-o-herramienta": {
    src: "/recursos/sistemas.jpg",
    alt: "Un portátil cerrado junto a una carpeta en color hueso, sobre una mesa azul.",
  },
  "rediseno-o-mejora": {
    src: "/recursos/rediseno.jpg",
    alt: "Dos láminas, una en hueso y otra oscura, superpuestas sobre una mesa.",
  },
};

const TITLE = "Recursos para negocios | AGI TheCreator";
const DESCRIPTION =
  "Artículos para entender la presencia digital, las webs y los procesos de un negocio antes de encargar nada.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/recursos" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://agithecreator.com/recursos",
    siteName: "AGI TheCreator",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AGI TheCreator: recursos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RecursosPage() {
  const featured = ARTICLES.find((article) => article.featured) ?? ARTICLES[0];
  const rest = ARTICLES.filter((article) => article.slug !== featured.slug);

  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#070b13] text-zinc-300">
        <StripeBand variant="down" className="pt-24 sm:pt-28">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-16">
            <header>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                Recursos
              </p>
              <div className="mt-4 h-px w-12 bg-[#F3F1EB]/70" />
              <h1 className="mt-5 font-serif text-[clamp(2.15rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[#F3F1EB]">
                Para entender la web y los procesos antes de encargarlos.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.75] text-zinc-400">
                Textos cortos sobre presencia digital, automatización y sistemas.
                Sirven para decidir con más criterio, no para rellenar un blog.
              </p>
            </header>
            <EditorialImage
              src="/recursos/hero.jpg"
              alt="Un panel en color hueso cruzado por una franja de luz violeta, en un estudio oscuro."
              priority
              wide
            />
          </div>
        </StripeBand>

        <section className="bg-[#12151f]">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-16">
            <EditorialImage src={INDEX_VISUALS[featured.slug].src} alt={INDEX_VISUALS[featured.slug].alt} />
            <div>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                Artículo destacado
              </h2>
              <Link href={articlePath(featured.slug)} className="group mt-4 block">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/70">
                  {categoryTitle(featured.categoryId)} · {readingMinutes(featured)} min
                </p>
                <p className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.3rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[#F3F1EB]">
                  {featured.title}
                </p>
                <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.7] text-zinc-400">
                  {featured.description}
                </p>
              </Link>
            </div>
          </div>
        </section>

        <SurfaceBand>
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-16">
            <h2 className="sr-only">Más artículos</h2>
            {rest.map((article, index) => (
              <Link
                key={article.slug}
                href={articlePath(article.slug)}
                className="flex h-full flex-col bg-[#12151f] p-6 transition-colors hover:bg-[#171b28] sm:p-8"
              >
                {index === 0 ? (
                  <div className="mb-6">
                    <EditorialImage src={INDEX_VISUALS[article.slug].src} alt={INDEX_VISUALS[article.slug].alt} />
                  </div>
                ) : null}
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/75">
                  {categoryTitle(article.categoryId)} · {readingMinutes(article)} min
                </p>
                <p className="mt-3 font-serif text-[1.35rem] font-normal leading-snug tracking-[-0.02em] text-[#F3F1EB]">
                  {article.title}
                </p>
                <p className="mt-3 text-[14px] leading-[1.65] text-zinc-400">{article.description}</p>
                {index === 1 ? (
                  <div className="mt-6">
                    <EditorialImage src={INDEX_VISUALS[article.slug].src} alt={INDEX_VISUALS[article.slug].alt} />
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </SurfaceBand>

        <StripeBand variant="up">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-end px-5 py-14 text-right sm:px-8 lg:py-16">
            <p className="max-w-[22ch] font-serif text-[clamp(1.45rem,2.8vw,2rem)] font-normal leading-snug text-[#F3F1EB]">
              Si el caso ya está claro, el siguiente paso no es otro artículo.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-x-6 gap-y-3 text-[14px]">
              <Link
                href="/desarrollo-web"
                className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white"
              >
                Desarrollo web
              </Link>
              <Link
                href="/presupuesto"
                className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white"
              >
                Preparar presupuesto
              </Link>
            </div>
          </div>
        </StripeBand>
      </main>
      <Footer />
    </>
  );
}
