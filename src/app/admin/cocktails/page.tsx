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
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { WEATHER_BUCKETS } from "@/lib/cocktail-profile-types";
import type { Cocktail } from "@/lib/types";
import { productImageClass, productImageUnoptimized } from "@/lib/products";

type ListRow = {
  id: string;
  name: string;
  category: string;
  glass: string;
  origin: string;
  image: string;
  alcoholic: boolean;
  isCustom: boolean;
  isDeleted: boolean;
  hasContentOverride: boolean;
  hasImageOverride: boolean;
};

type Draft = {
  name: string;
  alternateName: string;
  image: string;
  category: string;
  iba: string;
  alcoholic: boolean;
  glass: string;
  origin: string;
  description: string;
  story: string;
  ingredients: { name: string; measure: string }[];
  instructions: string[];
  tags: string;
  moods: string;
  situations: string;
  suitableFor: string;
  weatherAffinity: string[];
  popularity: number;
  flavorProfile: string;
};

function cocktailToDraft(c: Cocktail): Draft {
  return {
    name: c.name,
    alternateName: c.alternateName || "",
    image: c.image || "",
    category: c.category,
    iba: c.iba || "",
    alcoholic: c.alcoholic,
    glass: c.glass,
    origin: c.origin,
    description: c.description,
    story: c.story,
    ingredients: c.ingredients.map((i) => ({
      name: i.name,
      measure: i.measure || "",
    })),
    instructions: c.instructions.length ? [...c.instructions] : [""],
    tags: c.tags.join(", "),
    moods: c.moods.join(", "),
    situations: c.situations.join(", "),
    suitableFor: c.suitableFor.join(", "),
    weatherAffinity: [...c.weatherAffinity],
    popularity: c.popularity,
    flavorProfile: c.flavorProfile.join(", "),
  };
}

function emptyDraft(): Draft {
  return cocktailToDraft({
    id: "new",
    name: "",
    alternateName: null,
    image: "/cocktail-fallback.svg",
    category: "Cocktail",
    iba: null,
    alcoholic: true,
    glass: "Cocktail glass",
    origin: "",
    description: "",
    story: "",
    ingredients: [{ name: "", measure: null }],
    instructions: [""],
    tags: [],
    moods: [],
    situations: [],
    suitableFor: [],
    weatherAffinity: [],
    popularity: 50,
    flavorProfile: [],
  });
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function draftToPayload(draft: Draft) {
  return {
    name: draft.name.trim(),
    alternateName: draft.alternateName.trim() || null,
    image: draft.image.trim() || "/cocktail-fallback.svg",
    category: draft.category.trim(),
    iba: draft.iba.trim() || null,
    alcoholic: draft.alcoholic,
    glass: draft.glass.trim(),
    origin: draft.origin.trim(),
    description: draft.description.trim(),
    story: draft.story.trim(),
    ingredients: draft.ingredients.map((i) => ({
      name: i.name,
      measure: i.measure.trim() || null,
    })),
    instructions: draft.instructions,
    tags: splitCsv(draft.tags),
    moods: splitCsv(draft.moods),
    situations: splitCsv(draft.situations),
    suitableFor: splitCsv(draft.suitableFor),
    weatherAffinity: draft.weatherAffinity,
    popularity: draft.popularity,
    flavorProfile: splitCsv(draft.flavorProfile),
  };
}

export default function AdminCocktailsPage() {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [query, setQuery] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [meta, setMeta] = useState<{
    isCustom: boolean;
    isDeleted: boolean;
    hasContentOverride: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async (q = query, deleted = includeDeleted) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (deleted) params.set("includeDeleted", "1");
      const res = await fetch(`/api/admin/cocktails?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load cocktails");
      setRows(data.cocktails || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, includeDeleted]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDetail = useCallback(async (id: string) => {
    setStatus("");
    setCreating(false);
    const res = await fetch(`/api/admin/cocktails/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed to load cocktail");
      return;
    }
    setSelectedId(id);
    setDraft(cocktailToDraft(data.cocktail));
    setMeta({
      isCustom: Boolean(data.isCustom),
      isDeleted: Boolean(data.isDeleted),
      hasContentOverride: Boolean(data.hasContentOverride),
    });
  }, []);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) || null,
    [rows, selectedId],
  );

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setMeta({ isCustom: true, isDeleted: false, hasContentOverride: false });
    setDraft(emptyDraft());
    setStatus("");
  }

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const payload = draftToPayload(draft);
      if (!payload.name) throw new Error("Name is required");
      const res = creating
        ? await fetch("/api/admin/cocktails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/cocktails/${selectedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStatus(creating ? "Cocktail created." : "Cocktail saved.");
      const id = data.cocktail?.id || selectedId;
      await load();
      if (id) await loadDetail(id);
      window.dispatchEvent(new Event("cocktale:cocktail-profiles-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function restoreContent() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cocktails/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draftToPayload(draft), restoreContent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setStatus("Restored catalog content.");
      await load();
      await loadDetail(selectedId);
      window.dispatchEvent(new Event("cocktale:cocktail-profiles-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function restoreDeleted() {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cocktails/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draftToPayload(draft), restoreDeleted: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setStatus("Cocktail restored.");
      await load();
      await loadDetail(selectedId);
      window.dispatchEvent(new Event("cocktale:cocktail-profiles-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selectedId || creating) return;
    if (!window.confirm(`Delete “${draft.name || selectedId}”?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cocktails/${selectedId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setStatus("Cocktail deleted.");
      setSelectedId(null);
      setMeta(null);
      setDraft(emptyDraft());
      await load();
      window.dispatchEvent(new Event("cocktale:cocktail-profiles-updated"));
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function updateIngredient(index: number, key: "name" | "measure", value: string) {
    setDraft((prev) => {
      const ingredients = [...prev.ingredients];
      ingredients[index] = { ...ingredients[index], [key]: value };
      return { ...prev, ingredients };
    });
  }

  return (
    <AdminAuthGate>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Cocktail profiles
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">
              View, edit, add, or delete full cocktail profiles — recipe, story, tags, and more.
              Image gallery remains under Cocktail images.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]"
          >
            <Plus className="h-4 w-4" />
            Add cocktail
          </button>
        </div>

        <form
          className="mt-6 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cocktails…"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm"
            />
          </div>
          <label className="inline-flex items-center gap-2 rounded-full bg-[var(--chip)] px-3 py-2 text-xs text-[var(--ink)]">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => {
                setIncludeDeleted(e.target.checked);
                void load(query, e.target.checked);
              }}
            />
            Show deleted
          </label>
          <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]">
            Search
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
          <div className="max-h-[75vh] overflow-auto rounded-[1.25rem] bg-[var(--surface)] ring-1 ring-[var(--line)]">
            {loading ? (
              <p className="flex items-center gap-2 p-5 text-sm text-[var(--ink-soft)]">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : (
              <ul>
                {rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => void loadDetail(row.id)}
                      className={`flex w-full items-center gap-3 border-t border-[var(--line)] px-3 py-2.5 text-left first:border-t-0 ${
                        selectedId === row.id && !creating
                          ? "bg-[var(--chip)]"
                          : "hover:bg-[var(--chip)]/60"
                      }`}
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--chip)]">
                        <Image
                          src={row.image || "/cocktail-fallback.svg"}
                          alt=""
                          fill
                          className={productImageClass(row.image || "", "thumb")}
                          sizes="40px"
                          unoptimized={productImageUnoptimized(row.image || "")}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--ink)]">
                          {row.name}
                        </span>
                        <span className="block truncate text-[10px] text-[var(--ink-muted)]">
                          {row.category} · {row.glass}
                          {row.isCustom ? " · custom" : ""}
                          {row.hasContentOverride ? " · edited" : ""}
                          {row.isDeleted ? " · deleted" : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[1.25rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
            {creating || selectedId ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs tracking-[0.14em] text-[var(--accent-deep)] uppercase">
                      {creating ? "New cocktail" : "Edit profile"}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                      {draft.name || "Untitled"}
                    </h2>
                    {selectedId ? (
                      <p className="mt-1 font-mono text-[10px] text-[var(--ink-muted)]">{selectedId}</p>
                    ) : null}
                    {meta?.isDeleted ? (
                      <p className="mt-1 text-xs text-red-700">Soft-deleted — restore to show on site.</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!creating && meta?.hasContentOverride && !meta.isCustom ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void restoreContent()}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore catalog
                      </button>
                    ) : null}
                    {!creating && meta?.isDeleted ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void restoreDeleted()}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs"
                      >
                        Restore
                      </button>
                    ) : null}
                    {!creating ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void remove()}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-red-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-[var(--ink-muted)]">Name</span>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Alternate name</span>
                    <input
                      value={draft.alternateName}
                      onChange={(e) => setDraft((d) => ({ ...d, alternateName: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Category</span>
                    <input
                      value={draft.category}
                      onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Glass</span>
                    <input
                      value={draft.glass}
                      onChange={(e) => setDraft((d) => ({ ...d, glass: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Origin</span>
                    <input
                      value={draft.origin}
                      onChange={(e) => setDraft((d) => ({ ...d, origin: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">IBA</span>
                    <input
                      value={draft.iba}
                      onChange={(e) => setDraft((d) => ({ ...d, iba: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Popularity (0–100)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draft.popularity}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, popularity: Number(e.target.value) || 0 }))
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.alcoholic}
                      onChange={(e) => setDraft((d) => ({ ...d, alcoholic: e.target.checked }))}
                    />
                    Alcoholic
                  </label>
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-[var(--ink-muted)]">Primary image URL</span>
                    <input
                      value={draft.image}
                      onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">Description</span>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">Story</span>
                  <textarea
                    value={draft.story}
                    onChange={(e) => setDraft((d) => ({ ...d, story: e.target.value }))}
                    rows={5}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  />
                </label>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--ink-muted)]">Ingredients</p>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          ingredients: [...d.ingredients, { name: "", measure: "" }],
                        }))
                      }
                      className="text-xs text-[var(--accent-deep)]"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {draft.ingredients.map((ing, index) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input
                          value={ing.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                          placeholder="Name"
                          className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                        />
                        <input
                          value={ing.measure}
                          onChange={(e) => updateIngredient(index, "measure", e.target.value)}
                          placeholder="Measure"
                          className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              ingredients: d.ingredients.filter((_, i) => i !== index),
                            }))
                          }
                          className="rounded-xl px-2 text-xs text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-[var(--ink-muted)]">Instructions</p>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, instructions: [...d.instructions, ""] }))
                      }
                      className="text-xs text-[var(--accent-deep)]"
                    >
                      + Step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {draft.instructions.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={step}
                          onChange={(e) =>
                            setDraft((d) => {
                              const instructions = [...d.instructions];
                              instructions[index] = e.target.value;
                              return { ...d, instructions };
                            })
                          }
                          rows={2}
                          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              instructions: d.instructions.filter((_, i) => i !== index),
                            }))
                          }
                          className="rounded-xl px-2 text-xs text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["tags", "Tags (comma-separated)"],
                      ["moods", "Moods"],
                      ["situations", "Situations"],
                      ["suitableFor", "Suitable for"],
                      ["flavorProfile", "Flavor profile"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block text-xs sm:col-span-2">
                      <span className="text-[var(--ink-muted)]">{label}</span>
                      <input
                        value={draft[key]}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                      />
                    </label>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-[var(--ink-muted)]">Weather affinity</p>
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_BUCKETS.map((bucket) => {
                      const on = draft.weatherAffinity.includes(bucket);
                      return (
                        <button
                          key={bucket}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              weatherAffinity: on
                                ? d.weatherAffinity.filter((w) => w !== bucket)
                                : [...d.weatherAffinity, bucket],
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs capitalize ${
                            on
                              ? "bg-[var(--ink)] text-[var(--foam)]"
                              : "bg-[var(--chip)] text-[var(--ink)]"
                          }`}
                        >
                          {bucket}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selected ? (
                  <p className="text-[10px] text-[var(--ink-muted)]">
                    For gallery uploads, open{" "}
                    <Link href="/admin/images" className="underline">
                      Cocktail images
                    </Link>
                    .
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save()}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--foam)] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {creating ? "Create cocktail" : "Save profile"}
                </button>
                {status ? <p className="text-sm text-[var(--ink-soft)]">{status}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                Select a cocktail to edit, or add a new one.
              </p>
            )}
          </div>
        </div>
      </main>
    </AdminAuthGate>
  );
}
