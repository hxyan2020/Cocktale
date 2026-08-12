"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { TriedModal } from "@/components/TriedModal";
import { getCocktail } from "@/lib/cocktails";
import type { Cocktail } from "@/lib/types";

export default function BookPage() {
  const { ready, data, collect, markTried, isCollected, requireAuth } = useAuth();
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<Cocktail | null>(null);
  const [triedOpen, setTriedOpen] = useState(false);

  const items = useMemo(
    () =>
      data.collected
        .map((c) => ({ meta: c, cocktail: getCocktail(c.cocktailId) }))
        .filter((x): x is { meta: (typeof data.collected)[0]; cocktail: Cocktail } => !!x.cocktail),
    [data.collected],
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {t("book.title")}
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">{t("book.subtitle")}</p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{t("book.empty")}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ cocktail, meta }) => (
              <button
                key={cocktail.id}
                type="button"
                onClick={() => setSelected(cocktail)}
                className="overflow-hidden rounded-[1.25rem] bg-[var(--surface)] text-left ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={cocktail.image || "/cocktail-fallback.svg"}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {cocktail.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--ink-muted)]">
                    {cocktail.origin}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    {t("book.collectedOn", { date: formatDate(meta.collectedAt) })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <CocktailDetail
          cocktail={selected}
          collected={isCollected(selected.id)}
          onClose={() => setSelected(null)}
          onCollect={() => collect(selected.id)}
          onTried={() => requireAuth(() => setTriedOpen(true))}
        />
      )}

      {triedOpen && selected && (
        <TriedModal
          cocktail={selected}
          onClose={() => setTriedOpen(false)}
          onSave={(triedAt, note) => {
            markTried(selected.id, triedAt, note);
            setTriedOpen(false);
          }}
        />
      )}
    </>
  );
}
