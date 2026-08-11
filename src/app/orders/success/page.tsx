import { Suspense } from "react";
import OrderSuccessClient from "./success-client";

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
