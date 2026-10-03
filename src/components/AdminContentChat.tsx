"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import {
  formatStampTime,
  sourceLabel,
  type CocktailEditorial,
  type FieldStamp,
} from "@/lib/cocktail-profile-types";

export type AssistMode = "human" | "enrich" | "verify" | "custom";

export type AssistSelection = {
  field: string;
  label: string;
  text: string;
  start: number;
  end: number;
  surrounding: string;
  top: number;
  left: number;
};

type ChatTurn = { role: "user" | "assistant"; content: string };

const QUICK: { mode: AssistMode; label: string }[] = [
  { mode: "human", label: "Make it sound human" },
  { mode: "enrich", label: "Enrich with details" },
  { mode: "verify", label: "Double-check the details" },
];

export function IdeaProvenance({
  editorial,
  tone = "light",
}: {
  editorial: CocktailEditorial | null;
  tone?: "light" | "dark";
}) {
  const color = tone === "dark" ? "text-[var(--on-bg-muted)]" : "text-[var(--ink-muted)]";
  if (!editorial || (editorial.createdBy === "catalog" && !editorial.updatedAt)) {
    return <p className={`mt-2 text-xs ${color}`}>Created from the catalog · not edited yet</p>;
  }

  const created =
    editorial.createdBy === "catalog" || !editorial.createdAt
      ? "Created from the catalog"
      : `Created ${formatStampTime(editorial.createdAt)} · ${sourceLabel(editorial.createdBy)}`;
  const modified = editorial.updatedAt
    ? `Last modified ${formatStampTime(editorial.updatedAt)} · ${sourceLabel(editorial.updatedBy)}`
    : "Last modified —";

  return (
    <p className={`mt-2 text-xs leading-relaxed ${color}`}>
      {created}
      <span className="px-1.5">·</span>
      {modified}
    </p>
  );
}

export function FieldProvenance({
  stamp,
  tone = "light",
}: {
  stamp?: FieldStamp;
  tone?: "light" | "dark";
}) {
  if (!stamp) return null;
  const color = tone === "dark" ? "text-[var(--on-bg-muted)]" : "text-[var(--ink-muted)]";
  return (
    <span className={`text-[10px] font-normal ${color}`}>
      Created {formatStampTime(stamp.createdAt)} · last modified {formatStampTime(stamp.updatedAt)} ·{" "}
      {sourceLabel(stamp.source)}
    </span>
  );
}

export function AdminContentChat({
  selection,
  cocktailName,
  onClose,
  onAccept,
}: {
  selection: AssistSelection;
  cocktailName: string;
  onClose: () => void;
  onAccept: (replacement: string) => void;
}) {
  const [note, setNote] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNote("");
    setTurns([]);
    setSuggestion("");
    setError("");
  }, [selection.field, selection.start, selection.end, selection.text]);

  async function ask(mode: AssistMode, extra?: string) {
    const instruction = (extra ?? note).trim();
    if (mode === "custom" && !instruction && !suggestion) return;
    setBusy(true);
    setError("");
    const userLine =
      mode === "human"
        ? "Make it sound like a human wrote it."
        : mode === "enrich"
          ? "Enrich it with details."
          : mode === "verify"
            ? "Double-check whether the details are correct."
            : instruction;
    const nextTurns = userLine ? [...turns, { role: "user" as const, content: userLine }] : turns;
    try {
      const res = await fetch("/api/admin/content-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cocktailName,
          fieldLabel: selection.label,
          selectedText: selection.text,
          surroundingText: selection.surrounding,
          mode,
          messages: nextTurns,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI editing failed");
      const text = String(data.suggestion || "").trim();
      if (!text) throw new Error("The model returned an empty suggestion");
      setTurns([...nextTurns, { role: "assistant", content: text }]);
      setSuggestion(text);
      setNote("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const width = 360;
  const left = Math.min(Math.max(12, selection.left), Math.max(12, window.innerWidth - width - 12));
  const top = Math.min(selection.top + 8, Math.max(12, window.innerHeight - 460));

  return (
    <div
      ref={panelRef}
      className="fixed z-50 flex max-h-[min(32rem,calc(100vh-1.5rem))] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-[var(--surface)] text-[var(--ink)] shadow-[0_18px_50px_rgba(0,0,0,0.28)] ring-1 ring-[var(--line)]"
      style={{ top, left }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-3 py-2.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-deep)]">
            <Sparkles className="h-3.5 w-3.5" />
            Edit {selection.label}
          </p>
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[var(--ink-soft)]">
            {selection.text}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-[var(--ink-muted)]" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((item) => (
            <button
              key={item.mode}
              type="button"
              disabled={busy}
              onClick={() => void ask(item.mode)}
              className="rounded-full bg-[var(--chip)] px-2.5 py-1 text-[11px] text-[var(--ink)] disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {suggestion ? (
          <div className="rounded-xl bg-[var(--bg)] p-3 ring-1 ring-[var(--line)]">
            <p className="text-[10px] font-medium tracking-wide text-[var(--accent-deep)] uppercase">
              Suggested by AI
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{suggestion}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onAccept(suggestion)}
                className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--foam)]"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setSuggestion("");
                  setTurns([]);
                  setError("");
                }}
                className="rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="text-xs text-red-700">{error}</p> : null}
      </div>

      <form
        className="border-t border-[var(--line)] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void ask("custom");
        }}
      >
        <label className="block text-[10px] text-[var(--ink-muted)]">
          {suggestion ? "Continue the chat to improve it" : "What’s wrong, or how should it improve?"}
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={suggestion ? "Make the second sentence shorter…" : "Too stiff. Mention the glass."}
            className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !note.trim()}
            className="inline-flex items-center rounded-full bg-[var(--ink)] px-3 py-2 text-xs text-[var(--foam)] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
