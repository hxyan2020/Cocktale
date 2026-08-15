"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useI18n } from "@/components/LanguageProvider";

export default function HomePage() {
  const { ready } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace("/feed");
  }, [ready, router]);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--on-bg)]">
        {t("home.loading")}
      </p>
    </main>
  );
}
