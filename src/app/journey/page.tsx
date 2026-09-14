import { Suspense } from "react";
import JourneyPageClient from "./journey-client";

export default function JourneyPage() {
  return (
    <Suspense fallback={null}>
      <JourneyPageClient />
    </Suspense>
  );
}
