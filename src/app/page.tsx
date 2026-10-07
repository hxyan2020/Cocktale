import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, PAGE_SEO, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.home);

export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col text-[var(--on-bg)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }])),
        }}
      />

      <section className="relative mx-auto flex min-h-[min(92dvh,920px)] w-full max-w-5xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
        <p className="mb-3 font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--on-bg)] sm:text-7xl md:text-8xl">
          Cocktale
        </p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-2xl leading-snug text-[var(--on-bg-soft)] sm:text-3xl">
          What cocktail should you drink tonight?
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--on-bg-muted)] sm:text-lg">
          The world’s fullest Cocktale collection — 440+ drinks, dummy-proof step by step,
          and one-click purchase.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/feed"
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--foam)] px-6 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
          >
            Start discovering
          </Link>
        </div>
      </section>
    </main>
  );
}
