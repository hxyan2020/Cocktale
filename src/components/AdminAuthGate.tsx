"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean; configured?: boolean }) => {
        if (cancelled) return;
        if (!data.authenticated) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center gap-2 p-8 text-[var(--ink-soft)]">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Checking admin session…
      </main>
    );
  }

  return children;
}
