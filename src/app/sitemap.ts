import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://agithecreator.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://agithecreator.com/blog",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
