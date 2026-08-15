import type { Metadata } from "next";
import { createPageMetadata, orderDetailSeo } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return createPageMetadata(orderDetailSeo(id));
}

export default function OrderDetailLayout({ children }: Props) {
  return children;
}
