import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBlocks } from "@/components/resources/ArticleBlocks";
import {
  EditorialImage,
  StripeBand,
} from "@/components/resources/ResourceBands";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Footer } from "@/components/sections/Footer";
import {
  ARTICLES,
  articlePath,
  categoryTitle,
  getArticle,
  readingMinutes,
  relatedArticles,
  type Article,
} from "@/lib/content/articles";
import { ORGANIZATION_ID, SITE_NAME, SITE_URL } from "@/lib/seo/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const path = articlePath(article.slug);
  return {
    title: `${article.title} | AGI TheCreator`,
    description: article.description,
    alternates: { canonical: path },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      locale: "es_ES",
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ["/og-image.png"],
    },
  };
}

function articleJsonLd(article: Article) {
  const url = `${SITE_URL}${articlePath(article.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        inLanguage: "es-ES",
        mainEntityOfPage: url,
        author: {
          "@type": "Person",
          name: "Abel González Iglesias",
        },
        publisher: { "@id": ORGANIZATION_ID },
        image: `${SITE_URL}${article.image.src}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Recursos",
            item: `${SITE_URL}/recursos`,
          },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const headings = article.blocks.filter((block) => block.type === "h2");
  const related = relatedArticles(article.slug);
  const jsonLd = articleJsonLd(article);
  const imageFirst = ARTICLES.findIndex((item) => item.slug === article.slug) % 2 === 1;
  const copy = (
    <header>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
        {categoryTitle(article.categoryId)} · {readingMinutes(article)} min
      </p>
      <h1 className="mt-4 font-serif text-[clamp(1.85rem,4.4vw,2.8rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#F3F1EB]">
        {article.title}
      </h1>
      <p className="mt-4 text-[13px] text-zinc-500">{article.author}</p>
    </header>
  );
  const picture = <EditorialImage src={article.image.src} alt={article.image.alt} priority />;

  return (
    <>
      <SiteNavbar />
      <main className="min-h-screen bg-[#070b13] text-zinc-300">
        <article>
          <StripeBand variant={imageFirst ? "up" : "down"} className="pt-24 sm:pt-28">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
              {copy}
              {picture}
            </div>
          </StripeBand>

          <div className="bg-[#070b13]">
            <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
              <p className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.45] text-[#F3F1EB]">
                {article.description}
              </p>
              {headings.length > 2 ? (
                <nav aria-label="Índice" className="mt-10 border-t border-white/10 pt-6">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                    Índice
                  </p>
                  <ol className="mt-4 space-y-2">
                    {headings.map((heading) =>
                      heading.type === "h2" ? (
                        <li key={heading.id}>
                          <a
                            href={`#${heading.id}`}
                            className="text-[15px] text-zinc-300 underline decoration-violet-400/30 underline-offset-[3px] hover:text-[#F3F1EB]"
                          >
                            {heading.text}
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ol>
                </nav>
              ) : null}
              <ArticleBlocks blocks={article.blocks} />
            </div>
          </div>

          <StripeBand variant="close">
            <aside className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-14 text-center sm:px-8 lg:py-16">
              <p className="max-w-[22rem] font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] font-normal leading-snug text-[#F3F1EB] sm:max-w-xl">
                Si esto encaja con tu caso, se puede mirar con el alcance delante.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[14px]">
                <Link
                  href="/automatizacion-de-procesos"
                  className="text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white"
                >
                  Automatización
                </Link>
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
            </aside>
          </StripeBand>
        </article>

        <section className="bg-[#12151f]" aria-labelledby="relacionados">
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
            <h2
              id="relacionados"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80"
            >
              Otros artículos
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug} className="border border-white/10 bg-[#070b13] p-5">
                  <Link
                    href={articlePath(item.slug)}
                    className="font-serif text-[1.15rem] leading-snug text-[#F3F1EB] underline decoration-white/15 underline-offset-[3px] hover:decoration-violet-300/60"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-2 text-[13px] text-zinc-400">{categoryTitle(item.categoryId)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
