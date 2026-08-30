import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { getAllResolvedCocktails, getResolvedCocktail } from "@/lib/cocktails-server";
import {
  breadcrumbJsonLd,
  cocktailIdFromSeoSlug,
  cocktailPageSeo,
  cocktailSeoPath,
  createPageMetadata,
  recipeJsonLd,
} from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllResolvedCocktails().map((cocktail) => ({
    slug: cocktailSeoPath(cocktail).replace(/^\/cocktail\//, ""),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = cocktailIdFromSeoSlug(slug);
  const cocktail = id ? getResolvedCocktail(id) : undefined;
  if (!cocktail) {
    return createPageMetadata({
      title: "Cocktail recipe not found",
      description: "This cocktail recipe could not be found on Cocktale.",
      path: `/cocktail/${slug}`,
      index: false,
    });
  }
  return createPageMetadata(cocktailPageSeo(cocktail));
}

export default async function CocktailRecipePage({ params }: Props) {
  const { slug } = await params;
  const id = cocktailIdFromSeoSlug(slug);
  const cocktail = id ? getResolvedCocktail(id) : undefined;
  if (!cocktail) notFound();

  const canonicalSlug = cocktailSeoPath(cocktail).replace(/^\/cocktail\//, "");
  const imageSrc = cocktail.image?.startsWith("http")
    ? cocktail.image
    : cocktail.image || "/cocktail-backdrop.webp";

  const related = getAllResolvedCocktails()
    .filter((c) => c.id !== cocktail.id)
    .filter(
      (c) =>
        c.category === cocktail.category ||
        c.ingredients.some((ing) =>
          cocktail.ingredients.some(
            (base) => base.name.toLowerCase() === ing.name.toLowerCase(),
          ),
        ),
    )
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd(cocktail)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Catalogue", path: "/catalogue" },
              { name: cocktail.name, path: cocktailSeoPath(cocktail) },
            ]),
          ),
        }}
      />
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 text-[var(--on-bg)] sm:px-6">
        {slug !== canonicalSlug ? (
          <p className="mb-4 text-sm text-[var(--on-bg-muted)]">
            Canonical recipe:{" "}
            <Link href={cocktailSeoPath(cocktail)} className="text-[var(--on-bg-accent)] underline">
              {cocktail.name}
            </Link>
          </p>
        ) : null}

        <article>
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--on-bg-muted)]">
              Cocktail recipe
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight sm:text-5xl">
              {cocktail.name}
            </h1>
            <p className="text-sm text-[var(--on-bg-muted)]">
              {[cocktail.glass, cocktail.category, cocktail.origin].filter(Boolean).join(" · ")}
            </p>
            {cocktail.description ? (
              <p className="max-w-2xl text-base leading-relaxed text-[var(--on-bg-soft)]">
                {cocktail.description}
              </p>
            ) : null}
          </header>

          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <Image
              src={imageSrc}
              alt={`${cocktail.name} cocktail`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={
                imageSrc.startsWith("http") ||
                imageSrc.startsWith("data:") ||
                imageSrc.startsWith("/api/")
              }
              priority
            />
          </div>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Ingredients</h2>
            <ul className="mt-4 space-y-2 text-[var(--on-bg-soft)]">
              {cocktail.ingredients.map((ing) => (
                <li key={`${ing.name}-${ing.measure}`} className="flex gap-2 text-sm sm:text-base">
                  <span className="min-w-[5.5rem] text-[var(--on-bg-muted)]">
                    {ing.measure || "—"}
                  </span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">How to make it</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--on-bg-soft)] sm:text-base">
              {cocktail.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          {cocktail.story ? (
            <section className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-2xl">Story</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--on-bg-muted)] sm:text-base">
                {cocktail.story}
              </p>
            </section>
          ) : null}

          {(cocktail.moods.length > 0 || cocktail.flavorProfile.length > 0) && (
            <section className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-2xl">Best for</h2>
              <p className="mt-3 text-sm text-[var(--on-bg-muted)]">
                {[...cocktail.moods, ...cocktail.flavorProfile].filter(Boolean).join(" · ")}
              </p>
            </section>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--foam)] px-5 text-sm font-medium text-[var(--ink)]"
            >
              Get tonight’s picks
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm text-[var(--on-bg)]"
            >
              More recipes
            </Link>
            <Link
              href="/market"
              className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-5 text-sm text-[var(--on-bg)]"
            >
              Shop ingredients
            </Link>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-white/10 pt-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Related cocktails</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={cocktailSeoPath(item)}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="mt-1 block text-xs text-[var(--on-bg-muted)]">
                      {item.glass}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
