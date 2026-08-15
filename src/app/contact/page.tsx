"use client";

import { Mail, MessageCircle } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { useI18n } from "@/components/LanguageProvider";

const PHONE_DISPLAY = "+65 9131 9481";
const TELEGRAM_URL = "https://t.me/+6591319481";
const EMAIL = "hello@cocktale.app";

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
          {t("contact.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--on-bg-soft)]">{t("contact.subtitle")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[1.5rem] bg-[var(--surface)] p-6 ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--chip)] text-[var(--accent-deep)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-[var(--ink-muted)] uppercase">
              {t("contact.customerService")}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {PHONE_DISPLAY}
            </p>
            <p className="mt-2 text-sm text-[var(--accent-deep)] group-hover:underline">
              {t("contact.telegram")}
            </p>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="group rounded-[1.5rem] bg-[var(--surface)] p-6 ring-1 ring-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--chip)] text-[var(--accent-deep)]">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-medium tracking-wide text-[var(--ink-muted)] uppercase">
              {t("contact.email")}
            </p>
            <p className="mt-1 break-all font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {EMAIL}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{t("contact.hours")}</p>
          </a>
        </div>
      </main>
    </>
  );
}
