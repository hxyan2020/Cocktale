import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center p-8 text-[var(--on-bg-soft)]">
          Loading…
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
