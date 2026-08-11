"use client";

import { Languages } from "lucide-react";
import { LOCALES } from "@/i18n/locales";
import { useI18n } from "@/components/LanguageProvider";

type Props = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className = "" }: Props) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label
      className={`inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] ${className}`}
    >
      <Languages className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" aria-hidden />
      {!compact && (
        <span className="hidden sm:inline text-xs font-medium tracking-wide uppercase">
          {t("language.label")}
        </span>
      )}
      <select
        aria-label={t("language.choose")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="max-w-[11rem] rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
