"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { productImageUnoptimized } from "@/lib/products";

type AdminCocktail = {
  id: string;
  name: string;
  category: string;
  glass: string;
  image: string;
  catalogImage: string;
  overrideImage?: string | null;
  gallery: string[];
  hasOverride: boolean;
};

export default function AdminImagesPage() {
  const [cocktails, setCocktails] = useState<AdminCocktail[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [galleryDraft, setGalleryDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cocktails?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load cocktails");
      setCocktails(data.cocktails || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => cocktails.find((c) => c.id === selectedId) || null,
    [cocktails, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setImageUrl(selected.image || "");
    setGalleryDraft(selected.gallery.join("\n"));
    setStatus("");
  }, [selected]);

  async function refreshAndSelect(id: string) {
    const res = await fetch(`/api/admin/cocktails?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      setCocktails(data.cocktails || []);
      setSelectedId(id);
    }
  }

  async function savePrimary() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/admin/cocktails/${selected.id}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStatus("Primary image saved.");
      await refreshAndSelect(selected.id);
      window.dispatchEvent(new Event("cocktale:cocktail-images-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveGallery() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const gallery = galleryDraft
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/cocktails/${selected.id}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStatus("Gallery updated.");
      await refreshAndSelect(selected.id);
      window.dispatchEvent(new Event("cocktale:cocktail-images-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function clearPrimary() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/admin/cocktails/${selected.id}/image`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setStatus("Primary image cleared to fallback.");
      await refreshAndSelect(selected.id);
      window.dispatchEvent(new Event("cocktale:cocktail-images-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function restoreCatalog() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`/api/admin/cocktails/${selected.id}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setStatus("Restored catalog images.");
      await refreshAndSelect(selected.id);
      window.dispatchEvent(new Event("cocktale:cocktail-images-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(file: File, target: "primary" | "gallery") {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("target", target);
      const res = await fetch(`/api/admin/cocktails/${selected.id}/image`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus(target === "gallery" ? "Gallery photo uploaded." : "Primary photo uploaded.");
      await refreshAndSelect(selected.id);
      window.dispatchEvent(new Event("cocktale:cocktail-images-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminAuthGate>
    <div className="flex min-h-full flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-[var(--ink-soft)] hover:bg-[var(--chip)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Link>
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Cocktail images
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  {cocktails.length} drinks · click a card to edit, upload, or remove photos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void load(query)}
              className="rounded-full bg-[var(--chip)] px-4 py-2 text-sm text-[var(--ink)]"
            >
              Refresh
            </button>
          </div>
          <label className="relative max-w-xl">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(query);
              }}
              placeholder="Search by name, id, category, or glass…"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2 ps-9 pe-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[90rem] flex-1 gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_24rem] sm:px-6">
        <section>
          {loading ? (
            <div className="flex items-center gap-2 py-16 text-[var(--ink-soft)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading cocktails…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {cocktails.map((cocktail) => (
                <button
                  key={cocktail.id}
                  type="button"
                  onClick={() => setSelectedId(cocktail.id)}
                  className={`overflow-hidden rounded-2xl bg-[var(--surface)] text-start ring-1 transition ${
                    selectedId === cocktail.id
                      ? "ring-[var(--accent)]"
                      : "ring-[var(--line)] hover:ring-[var(--accent)]/60"
                  }`}
                >
                  <div className="relative aspect-[4/5] bg-[var(--chip)]">
                    <Image
                      src={cocktail.image || "/cocktail-fallback.svg"}
                      alt={cocktail.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 50vw, 20vw"
                      unoptimized={productImageUnoptimized(cocktail.image || "")}
                    />
                    {cocktail.hasOverride && (
                      <span className="absolute start-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
                        Edited
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium text-[var(--ink)]">
                      {cocktail.name}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-[var(--ink-muted)]">
                      {cocktail.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-[1.5rem] bg-[var(--surface)] p-4 ring-1 ring-[var(--line)] lg:sticky lg:top-28 lg:h-fit">
          {!selected ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Select a cocktail to review and manage its images.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                  {selected.name}
                </h2>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{selected.id}</p>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--chip)]">
                <Image
                  src={selected.image || "/cocktail-fallback.svg"}
                  alt={selected.name}
                  fill
                  className="object-cover"
                  sizes="384px"
                  unoptimized={productImageUnoptimized(selected.image || "")}
                />
              </div>

              <label className="block text-sm font-medium text-[var(--ink)]">
                Primary image URL
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://… or /cocktails/…"
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void savePrimary()}
                  className="rounded-full bg-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--foam)] disabled:opacity-50"
                >
                  Save primary
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-2 text-xs font-medium text-[var(--ink)]">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadFile(file, "primary");
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void clearPrimary()}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--chip)] px-3 py-2 text-xs font-medium text-[var(--ink)] disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void restoreCatalog()}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--chip)] px-3 py-2 text-xs font-medium text-[var(--ink)] disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-[var(--ink-muted)]">
                Catalog default: {selected.catalogImage || "(none)"}
              </p>

              <label className="block text-sm font-medium text-[var(--ink)]">
                Extra gallery URLs (one per line)
                <textarea
                  value={galleryDraft}
                  onChange={(e) => setGalleryDraft(e.target.value)}
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveGallery()}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--foam)] disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Save gallery
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-2 text-xs font-medium text-[var(--ink)]">
                  <Upload className="h-3.5 w-3.5" />
                  Upload to gallery
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadFile(file, "gallery");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {status && <p className="text-sm text-[var(--accent-deep)]">{status}</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
    </AdminAuthGate>
  );
}
