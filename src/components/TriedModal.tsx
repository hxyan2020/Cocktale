"use client";

import { useState } from "react";
import type { Cocktail } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";
import { useLocalizedCocktail } from "@/components/useTranslatedContent";

type Props = {
  cocktail: Cocktail;
  onClose: () => void;
  onSave: (triedAt: string, note: string) => void;
};

export function TriedModal({ cocktail, onClose, onSave }: Props) {
  const { t } = useI18n();
  const localized = useLocalizedCocktail(cocktail);
  const [triedAt, setTriedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center overscroll-contain bg-[rgba(20,16,12,0.55)] p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label={t("detail.close")} onClick={onClose} />
      <div className="relative z-10 max-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md overflow-y-auto rounded-t-[1.5rem] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[1.5rem] sm:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight text-[var(--ink)] sm:text-2xl">
          {t("triedModal.title", { name: localized.name })}
        </h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{t("triedModal.subtitle")}</p>

        <label className="mt-5 block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
          {t("triedModal.dateTried")}
          <input
            type="date"
            value={triedAt}
            onChange={(e) => setTriedAt(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
          />
        </label>

        <label className="mt-4 block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
          {t("triedModal.note")}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder={t("triedModal.notePlaceholder")}
            className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
          />
        </label>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 rounded-full bg-[var(--chip)] px-4 py-3 text-sm font-medium text-[var(--ink)]"
          >
            {t("triedModal.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onSave(triedAt, note)}
            className="min-h-12 flex-1 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-medium text-[var(--foam)]"
          >
            {t("triedModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
