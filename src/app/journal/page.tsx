"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { getCocktail } from "@/lib/cocktails";
import type { Cocktail, JournalEntry } from "@/lib/types";

export default function JournalPage() {
  const { ready, data, editJournal, deleteJournal } = useAuth();
  const { t, locale } = useI18n();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const entries = useMemo(
    () =>
      data.journal
        .map((entry) => ({ entry, cocktail: getCocktail(entry.cocktailId) }))
        .filter(
          (x): x is { entry: JournalEntry; cocktail: Cocktail } => !!x.cocktail,
        ),
    [data.journal],
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {t("journal.title")}
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">{t("journal.subtitle")}</p>

        {entries.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] bg-[var(--surface)] p-10 text-center ring-1 ring-[var(--line)]">
            <p className="text-[var(--ink-soft)]">{t("journal.empty")}</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
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
                        <span className="italic text-[var(--ink-muted)]">
                          {t("journal.addNote")}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
