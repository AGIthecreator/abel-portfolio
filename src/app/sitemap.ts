import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agithecreator.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://agithecreator.com/precios",
      lastModified: new Date(),
      priority: 0.85,
    },
    {
      url: "https://agithecreator.com/presupuesto",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://agithecreator.com/como-trabajamos",
      lastModified: new Date(),
      priority: 0.85,
    },
  ];
}
