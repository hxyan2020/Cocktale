"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Languages, LogOut, Tags } from "lucide-react";
import { AdminAuthGate } from "@/components/AdminAuthGate";

export default function AdminHomePage() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <AdminAuthGate>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase text-[var(--accent-deep)]">
              Cocktale admin
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Control center
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--ink-soft)]">
              Review cocktail photos, city shelf prices, and translations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--chip)] px-4 py-2 text-sm text-[var(--ink)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/images"
            className="rounded-[1.5rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)] transition hover:ring-[var(--accent)]"
          >
            <ImageIcon className="h-7 w-7 text-[var(--accent)]" />
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Cocktail images
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Browse every drink photo, paste a new URL, upload a file, or clear an image.
            </p>
          </Link>
          <Link
            href="/admin/prices"
            className="rounded-[1.5rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)] transition hover:ring-[var(--accent)]"
          >
            <Tags className="h-7 w-7 text-[var(--accent)]" />
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Product prices
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Review and edit SG, HK, Shanghai, NY, Paris, and Tokyo shelf prices.
            </p>
          </Link>
          <Link
            href="/admin/translations"
            className="rounded-[1.5rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)] transition hover:ring-[var(--accent)]"
          >
            <Languages className="h-7 w-7 text-[var(--accent)]" />
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              Translations
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Edit non-English UI strings across locales.
            </p>
          </Link>
        </div>
      </main>
    </AdminAuthGate>
  );
}
