import { Suspense } from "react";
import type { Metadata } from "next";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";
import AdminLoginPage from "./login-client";

export const metadata: Metadata = createPageMetadata({
  ...PAGE_SEO.admin,
  title: "Admin login",
  path: "/admin/login",
});

export default function AdminLoginRoute() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center p-8 text-[var(--ink-soft)]">
          Loading…
        </main>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
