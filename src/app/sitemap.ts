import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllResolvedCocktails } from "@/lib/cocktails-server";
import { SITE_URL, cocktailSeoPath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${SITE_URL}/catalogue`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/market`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/journey`, lastModified: now, changeFrequency: "weekly", priority: 0.55 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const cocktailRoutes: MetadataRoute.Sitemap = getAllResolvedCocktails().map((cocktail) => ({
    url: `${SITE_URL}${cocktailSeoPath(cocktail)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: `${SITE_URL}/market/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...cocktailRoutes, ...productRoutes];
}
