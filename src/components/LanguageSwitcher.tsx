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
      <Languages className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" aria-hidden />
      {!compact && (
        <span className="hidden text-xs font-medium tracking-wide uppercase sm:inline">
          {t("language.label")}
        </span>
      )}
      <select
        aria-label={t("language.choose")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="min-w-0 flex-1 truncate rounded-full border border-[var(--line)] bg-[var(--bg)] px-2 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:px-3 sm:text-sm"
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
