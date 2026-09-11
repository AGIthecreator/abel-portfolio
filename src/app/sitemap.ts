import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agithecreator.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://agithecreator.com/desarrollo-web",
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: "https://agithecreator.com/automatizacion-de-procesos",
      lastModified: new Date(),
      priority: 0.88,
    },
    {
      url: "https://agithecreator.com/desarrollo-web-valladolid",
      lastModified: new Date(),
      priority: 0.82,
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
    {
      url: "https://agithecreator.com/laboratorio",
      lastModified: new Date(),
      priority: 0.78,
    },
    {
      url: "https://agithecreator.com/contacto",
      lastModified: new Date(),
      priority: 0.75,
    },
  ];
}
