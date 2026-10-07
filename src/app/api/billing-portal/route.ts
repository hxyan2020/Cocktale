import { NextResponse } from "next/server";
import { z } from "zod";
import { listOrders } from "@/lib/orders-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().min(1),
  returnUrl: z.string().url(),
});

export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const customerId = listOrders({ userId: parsed.data.userId }).find(
    (order) => order.stripeCustomerId,
  )?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json(
      { error: "Complete a Stripe payment first, then you can manage saved methods." },
      { status: 404 },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: parsed.data.returnUrl,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("billing portal", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not open payment settings" },
      { status: 502 },
    );
  }
}
