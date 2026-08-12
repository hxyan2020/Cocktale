"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const { user, ready, login, register } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@cocktale.app");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/feed");
  }, [ready, user, router]);

  function mapError(code: string) {
    if (code === "EMAIL_EXISTS") return t("errors.emailExists");
    if (code === "PASSWORD_SHORT") return t("errors.passwordShort");
    if (code === "INVALID_CREDENTIALS") return t("errors.invalidCredentials");
    return code;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") login(email, password);
      else register(name, email, password);
      router.push("/feed");
    } catch (err) {
      setError(mapError((err as Error).message));
    }
  }

  return (
    <main className="relative flex flex-1 flex-col">
      <div className="absolute end-3 top-3 z-10 max-w-[calc(100%-1.5rem)]">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <section className="mb-10 lg:mb-0">
          <p className="text-xs font-medium tracking-[0.22em] uppercase text-[var(--accent-deep)]">
            {t("login.eyebrow")}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--ink)] sm:text-6xl">
            {t("login.title")}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--ink-soft)]">
            {t("login.subtitle")}
          </p>
        </section>

        <section className="rounded-[1.75rem] bg-[var(--surface)] p-6 shadow-[0_20px_50px_rgba(28,22,16,0.12)] ring-1 ring-[var(--line)] sm:p-8">
          <div className="mb-6 flex gap-2 rounded-full bg-[var(--chip)] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full py-2 text-sm font-medium ${
                mode === "login" ? "bg-[var(--ink)] text-[var(--foam)]" : "text-[var(--ink-soft)]"
              }`}
            >
              {t("login.signIn")}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full py-2 text-sm font-medium ${
                mode === "register" ? "bg-[var(--ink)] text-[var(--foam)]" : "text-[var(--ink-soft)]"
              }`}
            >
              {t("login.createAccount")}
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
                {t("login.name")}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </label>
            )}
            <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
              {t("login.email")}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
              {t("login.password")}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] transition hover:opacity-90"
            >
              {mode === "login" ? t("login.submitSignIn") : t("login.submitRegister")}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--ink-muted)]">{t("login.demoHint")}</p>
        </section>
      </div>
    </main>
  );
}
