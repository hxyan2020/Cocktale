import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { getAllResolvedCocktails } from "@/lib/cocktails-server";
import {
  COCKTAIL_HUBS,
  cocktailHubSeo,
  cocktailsForHub,
  getCocktailHub,
} from "@/lib/cocktail-hubs";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  cocktailSeoPath,
  collectionPageJsonLd,
  createPageMetadata,
  itemListJsonLd,
} from "@/lib/seo";

type Props = { params: Promise<{ hub: string }> };

export function generateStaticParams() {
  return COCKTAIL_HUBS.map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = getCocktailHub(slug);
  if (!hub) {
    return createPageMetadata({
      title: "Cocktail guide not found",
      description: "This cocktail guide could not be found on Cocktale.",
      path: `/cocktails/${slug}`,
      index: false,
    });
  }
  return createPageMetadata(cocktailHubSeo(hub));
}

export default async function CocktailHubPage({ params }: Props) {
  const { hub: slug } = await params;
  const hub = getCocktailHub(slug);
  if (!hub) notFound();

  const drinks = cocktailsForHub(hub, getAllResolvedCocktails());
  const listLd = itemListJsonLd(
    hub.h1,
    hub.description,
    drinks.slice(0, 50).map((c, i) => ({
      name: `${c.name} cocktail recipe`,
      url: absoluteUrl(cocktailSeoPath(c)),
      image: c.image?.startsWith("http") ? c.image : undefined,
      position: i + 1,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Recipes", path: "/catalogue" },
              { name: hub.h1, path: `/cocktails/${hub.slug}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd(hub.h1, hub.description, `/cocktails/${hub.slug}`)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6 text-[var(--on-bg)]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--on-bg-muted)]">Cocktail guide</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{hub.h1}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--on-bg-muted)] sm:text-base">
          {hub.intro}
        </p>
        <p className="mt-3 text-xs text-[var(--on-bg-muted)]">{drinks.length} recipes</p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drinks.map((cocktail) => (
            <li key={cocktail.id}>
              <Link
                href={cocktailSeoPath(cocktail)}
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
              >
                <span className="font-medium">{cocktail.name}</span>
                <span className="mt-1 block text-xs text-[var(--on-bg-muted)]">
                  {[cocktail.glass, cocktail.category].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <nav className="mt-12 flex flex-wrap gap-3 text-sm text-[var(--on-bg-accent)]">
          <Link href="/catalogue" className="underline-offset-4 hover:underline">
            Full catalogue
          </Link>
          {COCKTAIL_HUBS.filter((item) => item.slug !== hub.slug).map((item) => (
            <Link
              key={item.slug}
              href={`/cocktails/${item.slug}`}
              className="underline-offset-4 hover:underline"
            >
              {item.keywords[0]}
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
