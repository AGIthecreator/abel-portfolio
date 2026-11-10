import type { MetadataRoute } from "next";
import { ARTICLES, articlePath } from "@/lib/content/articles";

const SITE = "https://agithecreator.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, priority: 1 },
    { url: `${SITE}/desarrollo-web`, priority: 0.9 },
    { url: `${SITE}/automatizacion-de-procesos`, priority: 0.9 },
    { url: `${SITE}/precios`, priority: 0.88 },
    { url: `${SITE}/desarrollo-web-valladolid`, priority: 0.8 },
    { url: `${SITE}/laboratorio`, priority: 0.8 },
    { url: `${SITE}/como-trabajamos`, priority: 0.75 },
    { url: `${SITE}/presupuesto`, priority: 0.8 },
    { url: `${SITE}/contacto`, priority: 0.75 },
    { url: `${SITE}/recursos`, priority: 0.7 },
    { url: `${SITE}/herramientas/calculadora-tiempo`, priority: 0.68 },
    ...ARTICLES.map((article) => ({
      url: `${SITE}${articlePath(article.slug)}`,
      priority: 0.62,
    })),
    { url: `${SITE}/legal`, priority: 0.3 },
    { url: `${SITE}/privacy`, priority: 0.3 },
    { url: `${SITE}/cookies`, priority: 0.3 },
  ];
}
