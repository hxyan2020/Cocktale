import type { Metadata } from "next";
import Link from "next/link";
import {
  createPageMetadata,
  HOME_FAQS,
  PAGE_SEO,
  cocktailSeoPath,
  absoluteUrl,
  breadcrumbJsonLd,
  itemListJsonLd,
} from "@/lib/seo";
import { getAllResolvedCocktails } from "@/lib/cocktails-server";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.home);

const FEATURES = [
  {
    title: "Tonight’s picks",
    body: "Ranked cocktails for your local weather, mood, flavors, and what you have already tried.",
    href: "/feed",
    cta: "Get recommendations",
  },
  {
    title: "Recipe library",
    body: "Search classics and modern drinks by spirit, ingredient, glass, origin, or name.",
    href: "/catalogue",
    cta: "Browse recipes",
  },
  {
    title: "Home bar shop",
    body: "Buy spirits, mixers, glassware, and tools linked to the cocktails you want to make.",
    href: "/market",
    cta: "Shop the market",
  },
] as const;

export default function HomePage() {
  const popular = getAllResolvedCocktails()
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12);

  const listLd = itemListJsonLd(
    "Popular cocktails on Cocktale",
    "Highly rated classic and modern cocktail recipes for home bartenders.",
    popular.map((c, i) => ({
      name: c.name,
      url: absoluteUrl(cocktailSeoPath(c)),
      image: c.image?.startsWith("http") ? c.image : undefined,
      position: i + 1,
    })),
  );

  return (
    <main className="relative flex flex-1 flex-col text-[var(--on-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Home", path: "/" }]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />

      <section className="relative mx-auto flex min-h-[min(92dvh,920px)] w-full max-w-5xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
        <p className="mb-3 font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--on-bg)] sm:text-7xl md:text-8xl">
          Cocktale
        </p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--on-bg-soft)] sm:text-3xl">
          What cocktail should you drink tonight?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--on-bg-muted)] sm:text-lg">
          Personalized recommendations from weather and mood, a searchable recipe library, a
          tasting journal, and a market for ingredients and bar tools.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/feed"
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--foam)] px-6 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
          >
            Start discovering
          </Link>
          <Link
            href="/catalogue"
            className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm text-[var(--on-bg)] transition hover:bg-white/10"
          >
            Browse recipes
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/35 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
          {FEATURES.map((feature) => (
            <div key={feature.href} className="flex flex-col gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--on-bg)]">
                {feature.title}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--on-bg-muted)]">{feature.body}</p>
              <Link
                href={feature.href}
                className="mt-auto text-sm text-[var(--on-bg-accent)] underline-offset-4 hover:underline"
              >
                {feature.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)]">
            Popular cocktail recipes
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--on-bg-muted)]">
            Jump into full recipes with ingredients and steps — then save favorites on your
            journey.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((cocktail) => (
              <li key={cocktail.id}>
                <Link
                  href={cocktailSeoPath(cocktail)}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <span className="font-medium text-[var(--on-bg)]">{cocktail.name}</span>
                  <span className="mt-1 block text-xs text-[var(--on-bg-muted)]">
                    {[cocktail.glass, cocktail.category].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/catalogue"
            className="mt-8 inline-flex text-sm text-[var(--on-bg-accent)] underline-offset-4 hover:underline"
          >
            See the full catalogue
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/25">
        <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--on-bg)]">
            Frequently asked questions
          </h2>
          <dl className="mt-8 space-y-6">
            {HOME_FAQS.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-[var(--on-bg)]">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--on-bg-muted)]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
