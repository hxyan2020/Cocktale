"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/LanguageProvider";

export function AppFooter() {
  const { t } = useI18n();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0b0908]/95 text-[var(--on-bg)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-between sm:py-6">
        <p className="text-center text-xs text-[var(--on-bg-muted)] sm:text-start">{t("footer.rights", { year })}</p>
        <nav
          className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
          aria-label="Site"
        >
          <Link
            href="/feed"
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/feed")
                ? "bg-[var(--foam)] text-[var(--ink)]"
                : "text-[var(--on-bg-soft)] hover:bg-white/10 hover:text-[var(--on-bg)]"
            }`}
          >
            Discover
          </Link>
          <Link
            href="/catalogue"
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/catalogue")
                ? "bg-[var(--foam)] text-[var(--ink)]"
                : "text-[var(--on-bg-soft)] hover:bg-white/10 hover:text-[var(--on-bg)]"
            }`}
          >
            Recipes
          </Link>
          <Link
            href="/market"
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/market")
                ? "bg-[var(--foam)] text-[var(--ink)]"
                : "text-[var(--on-bg-soft)] hover:bg-white/10 hover:text-[var(--on-bg)]"
            }`}
          >
            Market
          </Link>
          <Link
            href="/terms"
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/terms")
                ? "bg-[var(--foam)] text-[var(--ink)]"
                : "text-[var(--on-bg-soft)] hover:bg-white/10 hover:text-[var(--on-bg)]"
            }`}
          >
            {t("footer.terms")}
          </Link>
          <Link
            href="/contact"
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/contact")
                ? "bg-[var(--foam)] text-[var(--ink)]"
                : "text-[var(--on-bg-soft)] hover:bg-white/10 hover:text-[var(--on-bg)]"
            }`}
          >
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
