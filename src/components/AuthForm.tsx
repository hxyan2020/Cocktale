"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PhoneSignIn } from "@/components/PhoneSignIn";
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
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/google/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setGoogleConfigured(Boolean(data?.configured));
      })
      .catch(() => {
        if (!cancelled) setGoogleConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function mapError(code: string) {
    if (code === "EMAIL_EXISTS") return t("errors.emailExists");
    if (code === "PASSWORD_SHORT") return t("errors.passwordShort");
    if (code === "INVALID_CREDENTIALS") return t("errors.invalidCredentials");
    if (code === "GOOGLE_ONLY") return t("errors.googleOnly");
    if (code === "SMS_ONLY") return t("errors.smsOnly");
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
      <GoogleSignInButton configured={googleConfigured} />
      {googleConfigured === false && (
        <p className="mt-2 text-center text-xs text-[var(--ink-muted)]">
          {t("login.googleUnavailable")}
        </p>
      )}
      <PhoneSignIn onSuccess={onSuccess} />
      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        {t("login.orUseEmail")}
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="mb-6 flex gap-2 rounded-full bg-[var(--chip)] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`min-h-11 flex-1 rounded-full py-2 text-sm font-medium ${
            mode === "login" ? "bg-[var(--ink)] text-[var(--foam)]" : "text-[var(--ink-soft)]"
          }`}
        >
          {t("login.signIn")}
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`min-h-11 flex-1 rounded-full py-2 text-sm font-medium ${
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
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
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
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
          />
        </label>
        <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
          {t("login.password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          className="min-h-12 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] transition hover:opacity-90"
        >
          {mode === "login" ? t("login.submitSignIn") : t("login.submitRegister")}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-[var(--ink-muted)]">{t("login.demoHint")}</p>
    </>
  );
}
