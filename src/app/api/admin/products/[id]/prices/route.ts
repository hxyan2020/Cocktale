import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { MARKET_LOCATION_CODES } from "@/lib/market-locations";
import { getProduct } from "@/lib/products";
import { upsertProductLocationPrices } from "@/lib/product-price-overrides";

export const dynamic = "force-dynamic";

const priceRow = z.object({
  amountCents: z.number().finite().min(0).max(100_000_000),
});

const schema = z.object({
  prices: z.record(z.string(), priceRow).refine(
    (value) => Object.keys(value).every((key) => (MARKET_LOCATION_CODES as readonly string[]).includes(key)),
    { message: "Unknown location code" },
  ),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const product = getProduct(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid price payload" }, { status: 400 });
  }

  const prices = upsertProductLocationPrices(id, parsed.data.prices);
  return NextResponse.json({ ok: true, id, prices });
}
