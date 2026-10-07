"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { DIAL_COUNTRIES, defaultCountryIso, toE164 } from "@/lib/phone";

type Props = {
  onSuccess?: () => void;
};

export function PhoneSignIn({ onSuccess }: Props) {
  const { loginSms } = useAuth();
  const { t } = useI18n();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [iso, setIso] = useState(defaultCountryIso());
  const [national, setNational] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const preview = useMemo(() => toE164(iso, national), [iso, national]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setEnabled(Boolean(data.smsEnabled));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendCode() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iso, national }),
      });
      const data = await res.json();
      if (!res.ok || !data.phone) {
        setMsg(data.error || t("login.smsFailed"));
        return;
      }
      setPhone(data.phone);
      setMsg(t("login.smsCodeSent"));
    } catch {
      setMsg(t("login.smsFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!phone) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.identity?.phone) {
        setMsg(data.error || t("login.smsFailed"));
        return;
      }
      loginSms(data.identity.phone);
      onSuccess?.();
    } catch {
      setMsg(t("login.smsFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (enabled === false) return null;

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          disabled={enabled !== true}
          onClick={() => setOpen(true)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--chip)] disabled:opacity-60"
        >
          {t("login.continueWithSms")}
        </button>
      ) : (
        <form
          className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void (phone ? verify() : sendCode());
          }}
        >
          <p className="text-sm font-medium text-[var(--ink)]">{t("login.smsTitle")}</p>
          <p className="text-xs leading-relaxed text-[var(--ink-soft)]">{t("login.smsHint")}</p>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
              {t("login.smsCountry")}
              <select
                value={iso}
                disabled={busy || Boolean(phone)}
                onChange={(e) => setIso(e.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] disabled:opacity-60"
              >
                {DIAL_COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.name} (+{country.dial})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
              {t("login.smsNumber")}
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("login.smsNumberPlaceholder")}
                disabled={busy || Boolean(phone)}
                value={national}
                onChange={(e) => setNational(e.target.value)}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] disabled:opacity-60 sm:text-sm"
              />
            </label>
          </div>
          <p className="text-[11px] text-[var(--ink-muted)]">
            {t("login.smsWillText")} {preview || "—"}
          </p>
          {phone && (
            <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
              {t("login.smsCode")}
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                required
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-base tracking-[0.3em] text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
              />
            </label>
          )}
          {msg && <p className="text-sm text-[var(--ink)]">{msg}</p>}
          <button
            type="submit"
            disabled={busy || (!phone && !preview)}
            className="min-h-12 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] transition hover:opacity-90 disabled:opacity-60"
          >
            {phone ? t("login.smsVerify") : t("login.smsSend")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (phone) {
                setPhone(null);
                setCode("");
                setMsg("");
                return;
              }
              setOpen(false);
            }}
            className="min-h-10 w-full text-center text-sm text-[var(--ink-muted)] underline"
          >
            {phone ? t("login.smsChangeNumber") : t("login.smsCancel")}
          </button>
        </form>
      )}
    </div>
  );
}
