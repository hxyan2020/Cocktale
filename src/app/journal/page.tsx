import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.journal);

export default function JournalRedirect() {
  redirect("/journey?tab=tried");
}
