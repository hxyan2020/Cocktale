"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  Compass,
  LogIn,
  LogOut,
  PencilLine,
  Store,
  ShoppingCart,
  Package,
  Library,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UnitSwitcher } from "@/components/UnitSwitcher";
import { useShop } from "@/components/useShop";

export function AppNav() {
  const pathname = usePathname();
  const { user, logout, requireAuth } = useAuth();
  const { t } = useI18n();
  const shop = useShop();
  const { count } = useCart();

  const links = [
    { href: "/feed", label: t("nav.discover"), icon: Compass },
    { href: "/catalogue", label: t("nav.catalogue"), icon: Library },
    { href: "/market", label: shop.market, icon: Store },
    { href: "/journey", label: t("nav.journey"), icon: BookMarked },
    { href: "/orders", label: shop.orders, icon: Package },
  ];

  const navLinkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm transition sm:flex-none sm:px-3 ${
      active
        ? "bg-[var(--ink)] text-[var(--foam)]"
        : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
    }`;
  };

  const navItems = (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={navLinkClass(href)} aria-label={label}>
          <Icon className="h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
        </Link>
      ))}
      <Link
        href="/cart"
        className={`relative ${navLinkClass("/cart")}`}
        aria-label={shop.cart}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden lg:inline">{shop.cart}</span>
        {count > 0 && (
          <span className="absolute -top-1 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-[var(--foam)]">
            {count}
          </span>
        )}
      </Link>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center rounded-full px-2 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--chip)] sm:px-3"
        title="Translations"
        aria-label="Translations"
      >
        <PencilLine className="h-4 w-4" />
      </Link>
      {user ? (
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center rounded-full px-2 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--chip)] sm:px-3"
          title={`${t("nav.signOut")} ${user.name}`}
          aria-label={t("nav.signOut")}
        >
          <LogOut className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => requireAuth()}
          className="inline-flex items-center justify-center rounded-full px-2 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--chip)] sm:px-3"
          title={t("login.signIn")}
          aria-label={t("login.signIn")}
        >
          <LogIn className="h-4 w-4" />
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between md:gap-3">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link
            href="/feed"
            className="shrink-0 font-[family-name:var(--font-display)] text-xl text-[var(--ink)] sm:text-2xl"
          >
            {t("brand")}
          </Link>
          <div className="flex min-w-0 items-center gap-1.5">
            <UnitSwitcher />
            <LanguageSwitcher compact />
          </div>
        </div>
        <nav className="flex min-w-0 items-center justify-between gap-0.5 overflow-x-auto md:justify-end md:gap-1.5">
          {navItems}
        </nav>
      </div>
    </header>
  );
}
