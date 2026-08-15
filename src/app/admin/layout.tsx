import type { Metadata } from "next";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.admin);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
