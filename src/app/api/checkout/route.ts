import { NextResponse } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/products";
import { getStripe, randomSuffix, stripeConfigured } from "@/lib/stripe";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
  userId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function GET() {
  return NextResponse.json({
    mode: stripeConfigured() ? "stripe" : "demo",
  });
}

export async function POST(req: Request) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const { items, userId, email, name, successUrl, cancelUrl } = parsed.data;

    const lineItems = [];
    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Unknown product ${item.productId}` }, { status: 400 });
      }
      if (product.stock <= 0) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
      }
      if (item.quantity > product.stock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 },
        );
      }
      lineItems.push({ product, quantity: item.quantity });
    }

    const orderDraftId = `ord_${Date.now().toString(36)}_${randomSuffix(4)}`;

    if (!stripeConfigured()) {
      const subtotal = lineItems.reduce(
        (sum, li) => sum + li.product.priceCents * li.quantity,
        0,
      );
      return NextResponse.json({
        mode: "demo",
        orderId: orderDraftId,
        demoCheckoutUrl: `/orders/success?demo=1&orderId=${orderDraftId}`,
        subtotalCents: subtotal,
        currency: "usd",
        lineItems: lineItems.map((li) => ({
          productId: li.product.id,
          name: li.product.name,
          unitAmountCents: li.product.priceCents,
          quantity: li.quantity,
          image: li.product.images[0]?.url || "",
        })),
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: userId,
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items: lineItems.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: "usd",
          unit_amount: li.product.priceCents,
          product_data: {
            name: li.product.name,
            description: li.product.description.slice(0, 400),
            images: li.product.images[0]?.url.startsWith("http")
              ? [li.product.images[0].url]
              : undefined,
            metadata: {
              productId: li.product.id,
            },
          },
        },
      })),
      metadata: {
        userId,
        orderDraftId,
        customerName: name || "",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.json({
      mode: "stripe",
      sessionId: session.id,
      url: session.url,
      orderId: orderDraftId,
    });
  } catch (error) {
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
