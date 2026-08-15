"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { CocktailDetail } from "@/components/CocktailDetail";
import { TriedModal } from "@/components/TriedModal";
import { getCocktail } from "@/lib/cocktails";
import type { Cocktail, JournalEntry } from "@/lib/types";

type Tab = "collected" | "tried";

export default function JourneyPageClient() {
  const { ready, data, collect, markTried, isCollected, requireAuth, editJournal, deleteJournal } =
    useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const [tab, setTab] = useState<Tab>(search.get("tab") === "tried" ? "tried" : "collected");
  const [selected, setSelected] = useState<Cocktail | null>(null);
  const [triedOpen, setTriedOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setTab(search.get("tab") === "tried" ? "tried" : "collected");
  }, [search]);

  const items = useMemo(
    () =>
      data.collected
        .map((c) => ({ meta: c, cocktail: getCocktail(c.cocktailId) }))
        .filter((x): x is { meta: (typeof data.collected)[0]; cocktail: Cocktail } => !!x.cocktail),
    [data.collected],
  );

  const entries = useMemo(
    () =>
      data.journal
        .map((entry) => ({ entry, cocktail: getCocktail(entry.cocktailId) }))
        .filter((x): x is { entry: JournalEntry; cocktail: Cocktail } => !!x.cocktail),
    [data.journal],
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(next === "tried" ? "/journey?tab=tried" : "/journey", { scroll: false });
  }

  if (!ready) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
          {t("journey.title")}
        </h1>

        <div className="mt-5 inline-flex w-full max-w-lg rounded-full bg-[var(--chip)] p-1">
          <button
            type="button"
            onClick={() => selectTab("collected")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
              tab === "collected" ? "bg-[var(--ink)] text-[var(--foam)]" : "text-[var(--ink-soft)]"
            }`}
          >
            {t("journey.collected")}
          </button>
          <button
            type="button"
            onClick={() => selectTab("tried")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
              tab === "tried" ? "bg-[var(--ink)] text-[var(--foam)]" : "text-[var(--ink-soft)]"
            }`}
          >
            {t("journey.tried")}
          </button>
        </div>

        {tab === "collected" ? (
          items.length === 0 ? (
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
          )
        ) : entries.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{t("journal.empty")}</p>
          </div>
        ) : (
          <ul className="mx-auto mt-8 max-w-3xl space-y-4">
            {entries.map(({ entry, cocktail }) => (
              <li
                key={entry.id}
                className="flex gap-4 rounded-[1.25rem] bg-[var(--surface)] p-4 ring-1 ring-[var(--line)]"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={cocktail.image || "/cocktail-fallback.svg"}
                    alt={cocktail.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                        {cocktail.name}
                      </h2>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {t("journal.triedOn", { date: formatDate(entry.triedAt) })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteJournal(entry.id)}
                      className="rounded-full p-2 text-[var(--ink-muted)] hover:bg-[var(--chip)]"
                      aria-label={t("journal.deleteEntry")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {editing === entry.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            editJournal(entry.id, draft);
                            setEditing(null);
                          }}
                          className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--foam)]"
                        >
                          {t("journal.saveNote")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                        >
                          {t("journal.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(entry.id);
                        setDraft(entry.note);
                      }}
                      className="mt-2 w-full text-left text-sm text-[var(--ink-soft)]"
                    >
                      {entry.note || (
                        <span className="italic text-[var(--ink-muted)]">{t("journal.addNote")}</span>
                      )}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
