import Image from "next/image";
import Link from "next/link";
import {
  ARTICLES,
  articlePath,
  categoryTitle,
  readingMinutes,
} from "@/lib/content/articles";

export function HomeResources() {
  const featured = ARTICLES.find((article) => article.featured) ?? ARTICLES[0];
  const rest = ARTICLES.filter((article) => article.slug !== featured.slug).slice(0, 2);

  return (
    <section
      aria-labelledby="home-recursos-heading"
      className="relative z-10 px-5 py-16 sm:px-8"
      style={{ background: "linear-gradient(180deg, #0c121c 0%, #131b2a 52%, #0c121c 100%)" }}
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative aspect-4/3 overflow-hidden bg-[#12151f]">
          <Image
            src="/recursos/home.jpg"
            alt="Un pasillo oscuro que termina en una abertura de luz cálida."
            fill
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
            Recursos
          </p>
          <h2
            id="home-recursos-heading"
            className="mt-3 max-w-[18ch] font-serif text-[clamp(1.5rem,3vw,2.1rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#F3F1EB]"
          >
            Para decidir antes de encargar.
          </h2>
          <Link href={articlePath(featured.slug)} className="mt-6 block bg-[#12151f] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300/75">
              {categoryTitle(featured.categoryId)} · {readingMinutes(featured)} min
            </p>
            <p className="mt-3 font-serif text-[1.35rem] leading-snug text-[#F3F1EB]">{featured.title}</p>
            <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.7] text-zinc-400">{featured.description}</p>
          </Link>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {rest.map((article) => (
              <li key={article.slug} className="bg-[#12151f] px-4 py-3">
                <Link href={articlePath(article.slug)} className="text-[14px] text-zinc-200 hover:text-white">
                  {article.title}
                </Link>
              </li>
            ))}
            <li className="bg-[#12151f] px-4 py-3">
              <Link
                href="/herramientas/calculadora-tiempo"
                className="text-[14px] text-zinc-200 hover:text-white"
              >
                Calculadora de tiempo en tareas repetitivas
              </Link>
            </li>
            <li className="bg-[#12151f] px-4 py-3">
              <Link href="/recursos" className="text-[14px] text-zinc-200 underline decoration-violet-400/35 underline-offset-[3px] hover:text-white">
                Ver recursos
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
