import type { MetadataRoute } from "next";

const SITE = "https://agithecreator.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, priority: 1 },
    { url: `${SITE}/desarrollo-web`, priority: 0.9 },
    { url: `${SITE}/laboratorio`, priority: 0.89 },
    { url: `${SITE}/automatizacion-de-procesos`, priority: 0.88 },
    { url: `${SITE}/precios`, priority: 0.85 },
    { url: `${SITE}/como-trabajamos`, priority: 0.85 },
    { url: `${SITE}/desarrollo-web-valladolid`, priority: 0.82 },
    { url: `${SITE}/presupuesto`, priority: 0.8 },
    { url: `${SITE}/contacto`, priority: 0.75 },
    { url: `${SITE}/legal`, priority: 0.3 },
    { url: `${SITE}/privacy`, priority: 0.3 },
    { url: `${SITE}/cookies`, priority: 0.3 },
  ];
}
