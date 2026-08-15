import type { Metadata } from "next";
import { createPageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata(PAGE_SEO.login);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
