"use client";

import Image from "next/image";
import { Bookmark, Check } from "lucide-react";
import type { Cocktail } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";
import { useLocalizedCocktail } from "@/components/useTranslatedContent";

type Props = {
  cocktail: Cocktail;
  collected: boolean;
  onOpen: () => void;
  onCollect: () => void;
  onTried: () => void;
};

export function CocktailCard({
  cocktail,
  collected,
  onOpen,
  onCollect,
  onTried,
}: Props) {
  const { t } = useI18n();
  const localized = useLocalizedCocktail(cocktail);

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] bg-[var(--surface)] shadow-[0_18px_45px_rgba(28,22,16,0.18)] ring-1 ring-[var(--line)] sm:rounded-[1.75rem] sm:shadow-[0_24px_60px_rgba(28,22,16,0.18)]">
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-[55%] w-full overflow-hidden text-left sm:h-[58%]"
        aria-label={`${t("detail.theTale")}: ${localized.name}`}
      >
        <Image
          src={cocktail.image || "/cocktail-fallback.svg"}
          alt={localized.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,22,16,0.72)] via-transparent to-transparent" />
        <div className="absolute bottom-3 start-4 end-4 sm:bottom-4 sm:start-5 sm:end-5">
          <p className="line-clamp-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--foam)] sm:text-3xl">
            {localized.name}
          </p>
          <p className="mt-1 truncate text-sm text-[rgba(247,242,233,0.85)]">{localized.origin}</p>
        </div>
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3.5 sm:gap-4 sm:p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)] sm:line-clamp-3 sm:text-[15px]">
          {localized.description}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onCollect();
            }}
            className={`inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium transition sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${
              collected
                ? "bg-[var(--accent)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink)] hover:bg-[var(--chip-hover)]"
            }`}
          >
            <Bookmark className="h-4 w-4 shrink-0" fill={collected ? "currentColor" : "none"} />
            <span className="min-w-0 truncate">{collected ? t("card.collected") : t("card.collect")}</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onTried();
            }}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3 py-2.5 text-xs font-medium text-[var(--foam)] transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <Check className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{t("card.tried")}</span>
          </button>
        </div>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onOpen}
          className="inline-flex min-h-10 items-center justify-center text-center text-xs font-medium tracking-[0.12em] uppercase text-[var(--accent-deep)]"
        >
          {t("card.openFullTale")}
        </button>
      </div>
    </article>
  );
}
