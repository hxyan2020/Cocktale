"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      })
      .catch(() => undefined);
  }, [nextPath, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-[var(--bg)] px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[1.75rem] bg-[var(--surface)] p-6 shadow-xl ring-1 ring-[var(--line)] sm:p-8"
      >
        <BrandLogo size={56} className="h-12 w-12" priority />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Sign in to manage cocktail images and translations.
        </p>
        <label className="mt-6 block text-sm font-medium text-[var(--ink)]">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="mt-1.5 w-full rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-[var(--ink)]">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            required
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-[var(--foam)] disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
