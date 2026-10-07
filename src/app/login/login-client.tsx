"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { AuthForm } from "@/components/AuthForm";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/LanguageProvider";
import { ProfilePanel } from "@/components/ProfilePanel";

export default function LoginClient() {
  const { user, ready, loginGoogle } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    const title = user ? t("profile.title") : t("login.pageTitle");
    document.title = `${title} · Cocktale`;
  }, [user, t]);

  useEffect(() => {
    if (!ready) return;
    const status = searchParams.get("google");
    if (status === "error") {
      setGoogleError(t("login.googleFailed"));
      router.replace("/login");
      return;
    }
    if (status !== "ok") return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/google/complete", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.identity) throw new Error("GOOGLE_FAILED");
        if (!cancelled) {
          loginGoogle(data.identity);
          router.replace("/login");
        }
      } catch {
        if (!cancelled) {
          setGoogleError(t("login.googleFailed"));
          router.replace("/login");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, searchParams, loginGoogle, router, t]);

  if (!ready) return null;

  const heading = user ? t("profile.title") : t("login.pageTitle");
  const subtitle = user ? t("profile.subtitle") : t("login.subtitle");

  return (
    <>
      {user && <AppNav />}
      <main className="relative flex flex-1 flex-col">
        {!user && (
          <div className="absolute end-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 max-w-[calc(100%-1.5rem)]">
            <LanguageSwitcher />
          </div>
        )}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-4 sm:py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <section className="mb-5 sm:mb-10 lg:mb-0">
            <BrandLogo size={72} className="h-12 w-12 sm:h-[4.5rem] sm:w-[4.5rem]" priority />
            <p className="mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--on-bg-accent)] sm:mt-5 sm:text-xs sm:tracking-[0.22em]">
              {t("login.eyebrow")}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-[1.05] text-[var(--on-bg)] sm:mt-4 sm:text-6xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--on-bg-soft)] sm:mt-5 sm:text-lg">
              {subtitle}
            </p>
          </section>

          <section className="rounded-[1.5rem] bg-[var(--surface)] p-4 shadow-[0_20px_50px_rgba(28,22,16,0.12)] ring-1 ring-[var(--line)] sm:rounded-[1.75rem] sm:p-8">
            {googleError && !user && <p className="mb-4 text-sm text-red-700">{googleError}</p>}
            {user ? <ProfilePanel /> : <AuthForm />}
          </section>
        </div>
      </main>
    </>
  );
}
