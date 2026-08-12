"use client";

import { useCallback, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import type { Cocktail } from "@/lib/types";
import { CocktailCard } from "@/components/CocktailCard";
import { useI18n } from "@/components/LanguageProvider";

type Props = {
  cocktail: Cocktail | null;
  collected: boolean;
  canGoBack?: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  onOpen: () => void;
  onCollect: () => void;
  onTried: () => void;
};

export function SwipeDeck({
  cocktail,
  collected,
  canGoBack = false,
  onSwipeNext,
  onSwipePrev,
  onOpen,
  onCollect,
  onTried,
}: Props) {
  const { t, dir } = useI18n();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-220, -80, 0, 80, 220], [0.4, 1, 1, 1, 0.4]);
  const [exitX, setExitX] = useState(0);
  const forward = dir === "rtl" ? -1 : 1;

  const finishSwipe = useCallback(
    (direction: 1 | -1, action: () => void) => {
      setExitX(420 * forward * direction);
      action();
      requestAnimationFrame(() => {
        setExitX(0);
        x.set(0);
      });
    },
    [forward, x],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offset = info.offset.x * forward;
      const velocity = info.velocity.x * forward;
      if (offset > 110 || velocity > 700) {
        finishSwipe(1, onSwipeNext);
        return;
      }
      if (canGoBack && (offset < -110 || velocity < -700)) {
        finishSwipe(-1, onSwipePrev);
      }
    },
    [canGoBack, finishSwipe, forward, onSwipeNext, onSwipePrev],
  );

  if (!cocktail) {
    return (
      <div className="flex h-[min(680px,78vh)] items-center justify-center rounded-[1.75rem] bg-[var(--surface)]/70 ring-1 ring-[var(--line)] max-md:h-[min(560px,calc(100dvh-16.5rem))]">
        <p className="text-[var(--ink-soft)]">{t("card.loadingPours")}</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="relative h-[min(680px,78vh)] max-md:h-[min(560px,calc(100dvh-16.5rem))]">
        <div className="absolute inset-0 translate-y-2 rounded-[1.75rem] bg-[var(--chip)]/80 ring-1 ring-[var(--line)] sm:translate-x-2 sm:translate-y-3" />
        <motion.div
          key={cocktail.id}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.96, x: exitX || 40 * forward }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <CocktailCard
            cocktail={cocktail}
            collected={collected}
            onOpen={onOpen}
            onCollect={onCollect}
            onTried={onTried}
          />
        </motion.div>
      </div>
      <p className="mt-3 px-2 text-center text-[11px] leading-snug tracking-wide text-[var(--ink-muted)] sm:text-xs">
        {t("card.swipeHint")}
      </p>
    </div>
  );
}
