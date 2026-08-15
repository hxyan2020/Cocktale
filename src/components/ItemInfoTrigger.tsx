"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Info, X } from "lucide-react";
import { SketchIllustration } from "@/components/SketchIllustration";
import type { ItemInfo } from "@/lib/item-info";
import { useI18n } from "@/components/LanguageProvider";
import { useTranslatedTexts } from "@/components/useTranslatedContent";

type Props = {
  info: ItemInfo;
  children: ReactNode;
  className?: string;
};

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export function ItemInfoTrigger({ info, children, className = "" }: Props) {
  const { t } = useI18n();
  const panelId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const { texts: localizedInfo } = useTranslatedTexts(
    [info.title, info.blurb],
    `item-info:${info.sketch}:${info.title}`,
    open,
  );
  const localizedTitle = localizedInfo[0] || info.title;
  const localizedBlurb = localizedInfo[1] || info.blurb;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setImageFailed(false);
  }, [info.title, info.imageUrl]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const place = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 240;
    const pad = 12;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
    const below = r.bottom + 10;
    const estimatedHeight = 250;
    const top =
      below + estimatedHeight > window.innerHeight - pad
        ? Math.max(pad, r.top - estimatedHeight - 10)
        : below;
    setCoords({ top, left });
  }, []);

  const openPanel = useCallback(() => {
    clearCloseTimer();
    place();
    setOpen(true);
  }, [place, clearCloseTimer]);

  const closePanel = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    const onScroll = () => place();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, closePanel, place]);

  return (
    <span
      ref={wrapRef}
      className={`relative inline-flex max-w-full min-w-0 items-center gap-1.5 ${className}`}
      onMouseEnter={() => {
        if (canHover()) openPanel();
      }}
      onMouseLeave={() => {
        if (canHover()) scheduleClose();
      }}
    >
      <span className="min-w-0">{children}</span>
      <button
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] ring-1 ring-[var(--line)] transition hover:bg-[var(--chip)] hover:text-[var(--ink)] md:hidden"
        aria-label={`${localizedTitle} — ${t("detail.ingredients")}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          if (open) closePanel();
          else openPanel();
        }}
      >
        <Info className="h-4 w-4" strokeWidth={2.25} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[70] cursor-default bg-transparent md:hidden"
              aria-label={t("detail.close")}
              onClick={closePanel}
            />
            <div
              id={panelId}
              role="dialog"
              aria-label={localizedTitle}
              className="fixed z-[80] overflow-hidden rounded-2xl bg-[var(--surface)] text-[var(--ink)] shadow-[0_18px_50px_rgba(28,22,16,0.22)] ring-1 ring-[var(--line)] inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[70dvh] w-auto overflow-y-auto md:inset-x-auto md:bottom-auto md:max-h-none md:w-[min(240px,calc(100vw-24px))] md:overflow-hidden"
              style={desktop ? { top: coords.top, left: coords.left } : undefined}
              onMouseEnter={() => {
                if (canHover()) openPanel();
              }}
              onMouseLeave={() => {
                if (canHover()) scheduleClose();
              }}
            >
              <div className="flex justify-end px-2 pt-2">
                <button
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink-muted)] transition hover:bg-[var(--chip)] hover:text-[var(--ink)]"
                  aria-label={t("detail.close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col items-center px-4 pb-4">
                <div className="relative flex h-[112px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#f3efe6] text-[var(--ink-soft)] ring-1 ring-[var(--line)]">
                  {info.imageUrl && !imageFailed ? (
                    <Image
                      src={info.imageUrl}
                      alt={localizedTitle}
                      fill
                      className={info.imageFit === "cover" ? "object-cover" : "object-contain p-3"}
                      sizes="240px"
                      quality={88}
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <SketchIllustration kind={info.sketch} className="h-[88px] w-[100px]" />
                  )}
                </div>
                <p className="mt-3 text-center font-[family-name:var(--font-display)] text-lg leading-tight text-[var(--ink)]">
                  {localizedTitle}
                </p>
                <p className="mt-1.5 text-center text-[13px] leading-snug text-[var(--ink-soft)]">
                  {localizedBlurb}
                </p>
              </div>
            </div>
          </>,
          document.body,
        )}
    </span>
  );
}
