"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/feed");
  }, [ready, user, router]);

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
          <AuthForm onSuccess={() => router.push("/feed")} />
        </section>
      </div>
    </main>
  );
}
