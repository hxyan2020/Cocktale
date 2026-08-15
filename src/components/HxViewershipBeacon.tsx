"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const COLLECT_PATH = "/api/hx-viewership";
const SLUG = "cocktale";
const NAME = "Cocktale";

/** Fire a pageview to HX viewership (Vercel + DO traffic). */
export function HxViewershipBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({
      slug: SLUG,
      name: NAME,
      path: pathname || "/",
      host: window.location.host,
      referer: document.referrer || "",
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          COLLECT_PATH,
          new Blob([payload], { type: "application/json" }),
        );
        return;
      }
    } catch {
      /* fall through */
    }
    void fetch(COLLECT_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
