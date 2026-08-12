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
      className={`inline-flex min-w-0 items-center gap-1.5 text-sm text-[var(--ink-soft)] sm:gap-2 ${className}`}
    >
      <Languages className="hidden h-4 w-4 shrink-0 text-[var(--accent-deep)] sm:block" aria-hidden />
      {!compact && (
        <span className="hidden sm:inline text-xs font-medium tracking-wide uppercase">
          {t("language.label")}
        </span>
      )}
      <select
        aria-label={t("language.choose")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="w-[7.25rem] max-w-[42vw] truncate rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:w-auto sm:max-w-[11rem] sm:px-3 sm:py-1.5 sm:text-sm"
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
