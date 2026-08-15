"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  ChevronDown,
  Compass,
  LogIn,
  LogOut,
  Package,
  PencilLine,
  Settings2,
  ShoppingCart,
  Store,
  Library,
  UserRound,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { useCart } from "@/components/CartProvider";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UnitSwitcher } from "@/components/UnitSwitcher";
import { useShop } from "@/components/useShop";

type MenuId = "hub" | "preferences" | null;

function NavMenu({
  id,
  open,
  onOpenChange,
  label,
  icon: Icon,
  active,
  children,
}: {
  id: Exclude<MenuId, null>;
  open: boolean;
  onOpenChange: (id: MenuId) => void;
  label: string;
  icon: typeof Settings2;
  active?: boolean;
  children: ReactNode;
}) {
  const panelId = useId();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(open ? null : id)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm transition sm:px-3 ${
          active || open
            ? "bg-[var(--ink)] text-[var(--foam)]"
            : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          id={panelId}
          role="menu"
          className="absolute end-0 top-[calc(100%+0.4rem)] z-50 min-w-[14.5rem] rounded-2xl bg-[var(--surface)] p-2 shadow-lg ring-1 ring-[var(--line)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const { user, logout, requireAuth } = useAuth();
  const { t } = useI18n();
  const shop = useShop();
  const { count } = useCart();
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const primaryLinks = [
    { href: "/feed", label: t("nav.discover"), icon: Compass },
    { href: "/catalogue", label: t("nav.catalogue"), icon: Library },
    { href: "/market", label: shop.market, icon: Store },
  ];

  const hubActive =
    pathname.startsWith("/journey") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

  const navLinkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-sm transition sm:flex-none sm:px-3 ${
      active
        ? "bg-[var(--ink)] text-[var(--foam)]"
        : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
    }`;
  };

  const menuItemClass =
    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] transition hover:bg-[var(--chip)]";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <Link
          href="/feed"
          className="inline-flex min-w-0 shrink-0 items-center gap-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)] sm:text-2xl"
        >
          <BrandLogo size={36} className="h-8 w-8 sm:h-9 sm:w-9" priority alt="" />
          <span className="truncate">{t("brand")}</span>
        </Link>

        <nav
          ref={navRef}
          className="flex min-w-0 items-center justify-between gap-0.5 overflow-x-auto p-0.5 md:justify-end md:gap-1.5"
        >
          {primaryLinks.map(({ href, label, icon: Icon }) => (
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

          <NavMenu
            id="hub"
            open={openMenu === "hub"}
            onOpenChange={setOpenMenu}
            label={t("nav.hub")}
            icon={UserRound}
            active={hubActive}
          >
            <Link href="/journey" className={menuItemClass} onClick={() => setOpenMenu(null)}>
              <BookMarked className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
              {t("nav.journey")}
            </Link>
            <Link href="/orders" className={menuItemClass} onClick={() => setOpenMenu(null)}>
              <Package className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
              {shop.orders}
            </Link>
            <Link href="/admin" className={menuItemClass} onClick={() => setOpenMenu(null)}>
              <PencilLine className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
              {t("nav.account")}
            </Link>
            <div className="my-1 border-t border-[var(--line)]" />
            {user ? (
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  setOpenMenu(null);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
                <span className="min-w-0 truncate">
                  {t("nav.signOut")}
                  {user.name ? ` · ${user.name}` : ""}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  setOpenMenu(null);
                  requireAuth();
                }}
              >
                <LogIn className="h-4 w-4 shrink-0 text-[var(--accent-deep)]" />
                {t("login.signIn")}
              </button>
            )}
          </NavMenu>

          <NavMenu
            id="preferences"
            open={openMenu === "preferences"}
            onOpenChange={setOpenMenu}
            label={t("nav.preferences")}
            icon={Settings2}
          >
            <div className="space-y-3 px-2 py-2">
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
                  {t("nav.measure")}
                </p>
                <UnitSwitcher size="md" className="w-full justify-between" />
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
                  {t("language.label")}
                </p>
                <LanguageSwitcher compact className="w-full" />
              </div>
            </div>
          </NavMenu>
        </nav>
      </div>
    </header>
  );
}
