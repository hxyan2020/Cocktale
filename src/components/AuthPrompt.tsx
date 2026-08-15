"use client";

import { X } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { useI18n } from "@/components/LanguageProvider";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthPrompt({ open, onClose }: Props) {
  const { t } = useI18n();
  useBodyScrollLock(open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center overscroll-contain bg-[rgba(20,16,12,0.55)] p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={t("detail.close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        className="relative z-10 max-h-[calc(100dvh-env(safe-area-inset-top))] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[1.5rem] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[1.75rem] sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="auth-prompt-title" className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
              {t("login.signIn")}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{t("login.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--chip)]"
            aria-label={t("detail.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
