"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  Compass,
  NotebookPen,
  LogOut,
  Store,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UnitSwitcher } from "@/components/UnitSwitcher";
import { useShop } from "@/components/useShop";

export function AppNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const shop = useShop();
  const { count } = useCart();

  const links = [
    { href: "/feed", label: t("nav.discover"), icon: Compass },
    { href: "/market", label: shop.market, icon: Store },
    { href: "/book", label: t("nav.book"), icon: BookMarked },
    { href: "/journal", label: t("nav.journal"), icon: NotebookPen },
    { href: "/orders", label: shop.orders, icon: Package },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/feed" className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          {t("brand")}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <UnitSwitcher />
          <LanguageSwitcher compact />
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition sm:px-3 ${
                    active
                      ? "bg-[var(--ink)] text-[var(--foam)]"
                      : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
            <Link
              href="/cart"
              className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition sm:px-3 ${
                pathname === "/cart"
                  ? "bg-[var(--ink)] text-[var(--foam)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
              }`}
              aria-label={shop.cart}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden md:inline">{shop.cart}</span>
              {count > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-[var(--foam)]">
                  {count}
                </span>
              )}
            </Link>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--chip)]"
                title={`${t("nav.signOut")} ${user.name}`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
