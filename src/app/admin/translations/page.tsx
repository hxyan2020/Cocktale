"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Search } from "lucide-react";
import { LOCALES, type LocaleCode } from "@/i18n/locales";
import { I18N_UPDATED_EVENT, type TranslationRow } from "@/lib/i18n-catalog";
import { AdminAuthGate } from "@/components/AdminAuthGate";

type Payload = {
  locales: { code: LocaleCode; name: string; nativeName: string }[];
  rows: TranslationRow[];
};

const OTHER_LOCALES = LOCALES.filter((l) => l.code !== "en");

export default function AdminTranslationsPage() {
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [locale, setLocale] = useState<LocaleCode>("zh-CN");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/i18n", { cache: "no-store" });
      const data = (await res.json()) as Payload;
      setRows(data.rows);
    } catch {
      setError("Could not load translations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const row of rows) next[row.path] = row.values[locale] ?? "";
    setDraft(next);
    setSavedAt(null);
  }, [rows, locale]);

  const sections = useMemo(() => {
    const set = new Set(rows.map((r) => r.section));
    return ["all", ...[...set].sort()];
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (section !== "all" && row.section !== section) return false;
      if (!q) return true;
      const en = row.values.en ?? "";
      const other = draft[row.path] ?? "";
      return (
        row.path.toLowerCase().includes(q) ||
        en.toLowerCase().includes(q) ||
        other.toLowerCase().includes(q)
      );
    });
  }, [rows, section, query, draft]);

  const dirtyCount = useMemo(() => {
    let n = 0;
    for (const row of rows) {
      if ((draft[row.path] ?? "") !== (row.values[locale] ?? "")) n += 1;
    }
    return n;
  }, [rows, draft, locale]);

  const grouped = useMemo(() => {
    const map = new Map<string, TranslationRow[]>();
    for (const row of visible) {
      const list = map.get(row.section) || [];
      list.push(row);
      map.set(row.section, list);
    }
    return [...map.entries()];
  }, [visible]);

  const meta = LOCALES.find((l) => l.code === locale) ?? OTHER_LOCALES[0];

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/i18n", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, strings: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setRows(data.rows);
      setSavedAt(new Date().toLocaleTimeString());
      window.dispatchEvent(new Event(I18N_UPDATED_EVENT));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminAuthGate>
    <div className="flex min-h-full flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
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
                  Translations
                </h1>
                <p className="text-xs text-[var(--ink-muted)]">
                  English stays on the left. Edit any other language on the right, then save.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-deep)]">
                  <Check className="h-3.5 w-3.5" />
                  Saved {savedAt}
                </span>
              )}
              <button
                type="button"
                disabled={saving || loading || dirtyCount === 0}
                onClick={() => void save()}
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--foam)] disabled:opacity-40"
              >
                {saving ? "Saving…" : dirtyCount ? `Save ${dirtyCount} edit${dirtyCount === 1 ? "" : "s"}` : "Saved"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keys or copy…"
                className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2 ps-9 pe-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All sections" : s}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[90rem] flex-1">
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
          <div className="mb-3 grid grid-cols-1 gap-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <p>English (original)</p>
            <p className="hidden md:block">
              {meta.nativeName} · {meta.name}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-16 text-[var(--ink-soft)]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading strings…
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([group, list]) => (
                <section key={group}>
                  <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {group}
                  </h2>
                  <div className="space-y-3">
                    {list.map((row) => {
                      const dirty = (draft[row.path] ?? "") !== (row.values[locale] ?? "");
                      return (
                        <div
                          key={row.path}
                          className={`grid grid-cols-1 gap-2 rounded-2xl bg-[var(--surface)] p-3 ring-1 md:grid-cols-2 ${
                            dirty ? "ring-[var(--accent)]" : "ring-[var(--line)]"
                          }`}
                        >
                          <label className="block">
                            <span className="mb-1 block font-mono text-[11px] text-[var(--ink-muted)]">
                              {row.path}
                            </span>
                            <textarea
                              readOnly
                              value={row.values.en ?? ""}
                              rows={row.values.en && row.values.en.length > 80 ? 3 : 2}
                              className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink-soft)]"
                            />
                          </label>
                          <label className="block md:pt-[1.35rem]">
                            <span className="mb-1 block font-mono text-[11px] text-[var(--ink-muted)] md:hidden">
                              {meta.nativeName}
                            </span>
                            <textarea
                              value={draft[row.path] ?? ""}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, [row.path]: e.target.value }))
                              }
                              rows={row.values.en && row.values.en.length > 80 ? 3 : 2}
                              dir={meta.dir}
                              className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
              {visible.length === 0 && (
                <p className="py-16 text-center text-[var(--ink-soft)]">No strings match that filter.</p>
              )}
            </div>
          )}
        </main>

        <aside className="sticky top-[7.5rem] hidden h-[calc(100vh-7.5rem)] w-56 shrink-0 overflow-y-auto border-s border-[var(--line)] bg-[var(--bg)] p-3 xl:block">
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
            Languages
          </p>
          <div className="flex flex-col gap-0.5">
            {OTHER_LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                className={`rounded-xl px-3 py-2 text-start text-sm ${
                  locale === l.code
                    ? "bg-[var(--ink)] text-[var(--foam)]"
                    : "text-[var(--ink-soft)] hover:bg-[var(--chip)]"
                }`}
              >
                <span className="block leading-tight">{l.nativeName}</span>
                <span className="block text-[11px] opacity-70">{l.name}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--bg)] px-4 py-3 xl:hidden">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as LocaleCode)}
          className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
        >
          {OTHER_LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>
      </div>
    </div>
    </AdminAuthGate>
  );
}
