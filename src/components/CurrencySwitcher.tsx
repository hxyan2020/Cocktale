"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/LanguageProvider";
import type { CurrencyCode } from "@/lib/currency";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function CurrencySwitcher({ className = "", size = "md" }: Props) {
  const { currency, setCurrency, currencies } = useCurrency();
  const { t } = useI18n();
  const pad =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
      : "px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-xs";

  return (
    <div
      className={`mobile-scrollbar-none flex max-h-28 flex-wrap gap-1 overflow-y-auto rounded-2xl bg-[var(--chip)] p-1 ${className}`}
      role="group"
      aria-label={t("nav.currency")}
    >
      {currencies.map((code: CurrencyCode) => (
        <button
          key={code}
          type="button"
          onClick={() => setCurrency(code)}
          className={`min-h-10 shrink-0 rounded-full font-medium uppercase tracking-wide transition ${pad} ${
            currency === code
              ? "bg-[var(--ink)] text-[var(--foam)]"
              : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
