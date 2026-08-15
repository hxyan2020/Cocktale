import type { Metadata } from "next";
import { Suspense } from "react";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";
import OrderSuccessClient from "./success-client";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.orderSuccess);

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center p-8 text-[var(--ink-soft)]">
          Loading…
        </main>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
