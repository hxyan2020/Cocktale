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
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <p className="text-xs text-[var(--ink-muted)]">{t("footer.rights", { year })}</p>
        <nav
          className="flex flex-wrap items-center gap-1 sm:gap-2"
          aria-label={t("footer.terms")}
        >
          <Link
            href="/terms"
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/terms")
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
            }`}
          >
            {t("footer.terms")}
          </Link>
          <Link
            href="/contact"
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              pathname.startsWith("/contact")
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
            }`}
          >
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
