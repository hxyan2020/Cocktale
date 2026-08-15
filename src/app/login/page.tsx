"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
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
      <div className="absolute end-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 max-w-[calc(100%-1.5rem)]">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20 sm:px-4 sm:py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <section className="mb-5 sm:mb-10 lg:mb-0">
          <BrandLogo size={72} className="h-12 w-12 sm:h-[4.5rem] sm:w-[4.5rem]" priority />
          <p className="mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--on-bg-accent)] sm:mt-5 sm:text-xs sm:tracking-[0.22em]">
            {t("login.eyebrow")}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--on-bg)] sm:mt-4 sm:text-6xl">
            {t("login.title")}
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--on-bg-soft)] sm:mt-5 sm:text-lg">
            {t("login.subtitle")}
          </p>
        </section>

        <section className="rounded-[1.5rem] bg-[var(--surface)] p-4 shadow-[0_20px_50px_rgba(28,22,16,0.12)] ring-1 ring-[var(--line)] sm:rounded-[1.75rem] sm:p-8">
          <AuthForm onSuccess={() => router.push("/feed")} />
        </section>
      </div>
    </main>
  );
}
