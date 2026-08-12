"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";

type Props = {
  onSuccess?: () => void;
};

export function AuthForm({ onSuccess }: Props) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@cocktale.app");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

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
      onSuccess?.();
    } catch (err) {
      setError(mapError((err as Error).message));
    }
  }

  return (
    <>
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
    </>
  );
}
