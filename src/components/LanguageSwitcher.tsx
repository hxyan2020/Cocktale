"use client";

import Image from "next/image";
import { ChevronDown, Languages } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, localeFlagUrl, type LocaleCode } from "@/i18n/locales";
import { useI18n } from "@/components/LanguageProvider";

type Props = {
  compact?: boolean;
  className?: string;
  /** Inline scrollable list with flags (best inside Preference). */
  variant?: "dropdown" | "list";
};

function FlagIcon({ flag, name, size = 18 }: { flag: string; name: string; size?: number }) {
  return (
    <Image
      src={localeFlagUrl(flag, 40)}
      alt=""
      width={size}
      height={Math.round(size * 0.75)}
      className="shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
      title={name}
    />
  );
}

export function LanguageSwitcher({
  compact = false,
  className = "",
  variant = "dropdown",
}: Props) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (variant !== "dropdown") return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [variant]);

  function choose(code: LocaleCode) {
    setLocale(code);
    setOpen(false);
  }

  const options = (
    <ul
      id={listId}
      role="listbox"
      aria-label={t("language.choose")}
      className={
        variant === "list"
          ? "max-h-52 space-y-0.5 overflow-auto rounded-xl bg-[var(--bg)] p-1 ring-1 ring-[var(--line)]"
          : "absolute inset-x-0 top-[calc(100%+0.35rem)] z-[60] max-h-64 overflow-auto rounded-2xl bg-[var(--surface)] p-1.5 shadow-lg ring-1 ring-[var(--line)]"
      }
    >
      {LOCALES.map((l) => {
        const selected = l.code === locale;
        return (
          <li key={l.code} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => choose(l.code)}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm transition ${
                selected
                  ? "bg-[var(--ink)] text-[var(--foam)]"
                  : "text-[var(--ink)] hover:bg-[var(--chip)]"
              }`}
            >
              <FlagIcon flag={l.flag} name={l.name} />
              <span className="min-w-0 truncate">{l.nativeName}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "list") {
    return (
      <div className={`min-w-0 ${className}`}>
        {options}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex min-w-0 items-center gap-1.5 text-sm text-[var(--ink-soft)] sm:gap-2 ${className}`}
    >
      <Languages className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" aria-hidden />
      {!compact && (
        <span className="hidden text-xs font-medium tracking-wide uppercase sm:inline">
          {t("language.label")}
        </span>
      )}
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          aria-label={t("language.choose")}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-start text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:px-3 sm:text-sm"
        >
          <FlagIcon flag={current.flag} name={current.name} />
          <span className="min-w-0 flex-1 truncate">{current.nativeName}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)] transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && options}
      </div>
    </div>
  );
}
