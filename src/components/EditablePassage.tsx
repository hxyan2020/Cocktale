"use client";

import { useEffect, useRef, useState } from "react";
import {
  AdminContentChat,
  FieldProvenance,
  IdeaProvenance,
  type AssistSelection,
} from "@/components/AdminContentChat";
import { useCocktailCatalog } from "@/components/CocktailCatalogProvider";
import type { CocktailEditorial, FieldStamp } from "@/lib/cocktail-profile-types";
import type { Cocktail } from "@/lib/types";

type Kind = "cocktail" | "product";

let adminPromise: Promise<boolean> | null = null;

function loadAdmin() {
  if (!adminPromise) {
    adminPromise = fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => Boolean(data?.authenticated))
      .catch(() => false);
  }
  return adminPromise;
}

export function useAdminSession() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void loadAdmin().then((value) => {
      if (!cancelled) setAdmin(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return admin;
}

function cocktailField(cocktail: Cocktail, field: string) {
  if (field === "description" || field === "story" || field === "origin") return cocktail[field] || "";
  if (field.startsWith("instruction:")) {
    return cocktail.instructions[Number(field.slice("instruction:".length))] || "";
  }
  return "";
}

function selectionInside(root: HTMLElement): { text: string; start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const before = range.cloneRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const text = range.toString();
  if (!text.trim()) return null;
  return { text, start, end: start + text.length };
}

export function IdeaStamp({
  kind,
  id,
  tone = "light",
}: {
  kind: Kind;
  id: string;
  tone?: "light" | "dark";
}) {
  const admin = useAdminSession();
  const { profiles } = useCocktailCatalog();
  const [productEditorial, setProductEditorial] = useState<CocktailEditorial | null>(null);

  useEffect(() => {
    if (!admin || kind !== "product") return;
    let cancelled = false;
    const load = () => {
      fetch("/api/product-content", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setProductEditorial(data.editorial?.[id] ?? null);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener("cocktale:product-content-updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("cocktale:product-content-updated", load);
    };
  }, [admin, kind, id]);

  if (!admin) return null;
  const editorial = kind === "cocktail" ? profiles.editorial[id] ?? null : productEditorial;
  return (
    <div>
      <IdeaProvenance editorial={editorial} tone={tone} />
      <p className={`text-[11px] ${tone === "dark" ? "text-[var(--on-bg-muted)]" : "text-[var(--ink-muted)]"}`}>
        Select a word or paragraph to improve it.
      </p>
    </div>
  );
}

export function EditablePassage({
  kind,
  id,
  name,
  field,
  label,
  text,
  source,
  tone = "light",
  className,
  as: Tag = "p",
}: {
  kind: Kind;
  id: string;
  name: string;
  field: string;
  label: string;
  text: string;
  source?: string;
  tone?: "light" | "dark";
  className?: string;
  as?: "p" | "span" | "li";
}) {
  const admin = useAdminSession();
  const { getCocktail, profiles, refresh } = useCocktailCatalog();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [assist, setAssist] = useState<AssistSelection | null>(null);
  const [local, setLocal] = useState<string | null>(null);
  const [productSource, setProductSource] = useState<string | null>(null);
  const [productStamp, setProductStamp] = useState<FieldStamp | undefined>();

  useEffect(() => {
    if (kind !== "product") return;
    let cancelled = false;
    const load = () => {
      fetch("/api/product-content", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          const copy = data.overrides?.[id]?.[field];
          setProductSource(typeof copy === "string" ? copy : null);
          setProductStamp(data.editorial?.[id]?.fields?.[field]);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener("cocktale:product-content-updated", load);
    return () => {
      cancelled = true;
      window.removeEventListener("cocktale:product-content-updated", load);
    };
  }, [kind, id, field]);

  const liveCocktail = kind === "cocktail" ? getCocktail(id) : undefined;
  const stored =
    kind === "cocktail"
      ? liveCocktail
        ? cocktailField(liveCocktail, field)
        : (source ?? text)
      : (productSource ?? source ?? text);
  const shown = admin ? (local ?? stored) : text;
  const stamp: FieldStamp | undefined =
    kind === "cocktail" ? profiles.editorial[id]?.fields?.[field] : productStamp;

  function openFromSelection() {
    if (!admin) return;
    const root = rootRef.current;
    if (!root) return;
    const picked = selectionInside(root);
    if (!picked) return;
    const rect = window.getSelection()?.getRangeAt(0).getBoundingClientRect();
    setAssist({
      field,
      label,
      text: picked.text,
      start: picked.start,
      end: picked.end,
      surrounding: shown,
      top: rect?.bottom ?? root.getBoundingClientRect().bottom,
      left: rect?.left ?? root.getBoundingClientRect().left,
    });
  }

  async function accept(replacement: string) {
    if (!assist) return;
    const res = await fetch("/api/admin/content-passage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        id,
        field,
        start: assist.start,
        end: assist.end,
        selectedText: assist.text,
        replacement,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save the passage");
    setLocal(data.text);
    setAssist(null);
    if (kind === "cocktail") {
      await refresh();
      window.dispatchEvent(new Event("cocktale:cocktail-profiles-updated"));
    } else {
      window.dispatchEvent(new Event("cocktale:product-content-updated"));
    }
  }

  return (
    <>
      <Tag className={className}>
        {admin && stamp ? (
          <span className="mb-1 block">
            <FieldProvenance stamp={stamp} tone={tone} />
          </span>
        ) : null}
        <span ref={rootRef} onMouseUp={openFromSelection} onKeyUp={openFromSelection}>
          {shown}
        </span>
      </Tag>
      {assist ? (
        <AdminContentChat
          selection={assist}
          cocktailName={name}
          onClose={() => setAssist(null)}
          onAccept={(replacement) => {
            void accept(replacement).catch((err: Error) => {
              window.alert(err.message);
            });
          }}
        />
      ) : null}
    </>
  );
}
