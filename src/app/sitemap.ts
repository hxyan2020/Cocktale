import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllResolvedCocktails } from "@/lib/cocktails-server";
import { COCKTAIL_HUBS } from "@/lib/cocktail-hubs";
import { SITE_URL, cocktailSeoPath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const contentStamp = new Date("2026-09-14T00:00:00.000Z");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: contentStamp, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/feed`, lastModified: contentStamp, changeFrequency: "hourly", priority: 0.95 },
    { url: `${SITE_URL}/catalogue`, lastModified: contentStamp, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/market`, lastModified: contentStamp, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/journey`, lastModified: contentStamp, changeFrequency: "weekly", priority: 0.55 },
    { url: `${SITE_URL}/contact`, lastModified: contentStamp, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: contentStamp, changeFrequency: "yearly", priority: 0.3 },
  ];

  const hubRoutes: MetadataRoute.Sitemap = COCKTAIL_HUBS.map((hub) => ({
    url: `${SITE_URL}/cocktails/${hub.slug}`,
    lastModified: contentStamp,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const cocktailRoutes: MetadataRoute.Sitemap = getAllResolvedCocktails().map((cocktail) => ({
    url: `${SITE_URL}${cocktailSeoPath(cocktail)}`,
    lastModified: contentStamp,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: `${SITE_URL}/market/${product.slug}`,
    lastModified: contentStamp,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...hubRoutes, ...cocktailRoutes, ...productRoutes];
}
