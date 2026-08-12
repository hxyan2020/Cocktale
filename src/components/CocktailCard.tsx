"use client";

import Image from "next/image";
import { Bookmark, Check } from "lucide-react";
import type { Cocktail } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";

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

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--surface)] shadow-[0_24px_60px_rgba(28,22,16,0.18)] ring-1 ring-[var(--line)]">
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-[58%] w-full overflow-hidden text-left"
        aria-label={`${t("detail.theTale")}: ${cocktail.name}`}
      >
        <Image
          src={cocktail.image || "/cocktail-fallback.svg"}
          alt={cocktail.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,22,16,0.72)] via-transparent to-transparent" />
        <div className="absolute bottom-4 start-5 end-5">
          <p className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--foam)] sm:text-3xl">
            {cocktail.name}
          </p>
          <p className="mt-1 text-sm text-[rgba(247,242,233,0.85)]">{cocktail.origin}</p>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5">
        <p className="line-clamp-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
          {cocktail.description}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCollect();
            }}
            className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium transition sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${
              collected
                ? "bg-[var(--accent)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink)] hover:bg-[var(--chip-hover)]"
            }`}
          >
            <Bookmark className="h-4 w-4 shrink-0" fill={collected ? "currentColor" : "none"} />
            {collected ? t("card.collected") : t("card.collect")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTried();
            }}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] px-3 py-2.5 text-xs font-medium text-[var(--foam)] transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <Check className="h-4 w-4 shrink-0" />
            {t("card.tried")}
          </button>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="text-center text-xs font-medium tracking-[0.14em] uppercase text-[var(--accent-deep)]"
        >
          {t("card.openFullTale")}
        </button>
      </div>
    </article>
  );
}
