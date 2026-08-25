import { NextResponse } from "next/server";
import { z } from "zod";
import type { Order, OrderLine } from "@/lib/commerce-types";
import { createPendingOrder } from "@/lib/orders-store";
import { loadProductPriceOverrides } from "@/lib/product-price-overrides";
import { resolveProductUsdCents } from "@/lib/product-price-types";
import { getProduct } from "@/lib/products";
import { getStripe, randomSuffix, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

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

    const priceOverrides = loadProductPriceOverrides();
    const built: { product: NonNullable<ReturnType<typeof getProduct>>; quantity: number; unitAmountCents: number }[] =
      [];
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
      const unitAmountCents = resolveProductUsdCents(
        product.id,
        product.priceCents,
        priceOverrides,
      );
      built.push({ product, quantity: item.quantity, unitAmountCents });
    }

    const orderId = `ord_${Date.now().toString(36)}_${randomSuffix(4)}`;
    const orderLines: OrderLine[] = built.map((li) => ({
      productId: li.product.id,
      name: li.product.name,
      unitAmountCents: li.unitAmountCents,
      quantity: li.quantity,
      image: li.product.images[0]?.url || "",
    }));
    const subtotal = orderLines.reduce((sum, li) => sum + li.unitAmountCents * li.quantity, 0);
    const now = new Date().toISOString();

    if (!stripeConfigured()) {
      const order: Order = {
        id: orderId,
        userId,
        createdAt: now,
        status: "paid",
        paymentStatus: "paid",
        currency: "usd",
        subtotalCents: subtotal,
        totalCents: subtotal,
        items: orderLines,
        shippingEmail: email,
        shippingName: name,
        demo: true,
      };
      createPendingOrder(order);
      return NextResponse.json({
        mode: "demo",
        orderId,
        demoCheckoutUrl: `/orders/success?demo=1&orderId=${orderId}`,
        subtotalCents: subtotal,
        currency: "usd",
        lineItems: orderLines,
        order,
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
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "SG",
          "HK",
          "CN",
          "FR",
          "JP",
          "GB",
          "AU",
          "CA",
          "DE",
          "KR",
          "TW",
          "MY",
          "TH",
        ],
      },
      phone_number_collection: { enabled: true },
      line_items: built.map((li) => ({
        quantity: li.quantity,
        price_data: {
          currency: "usd",
          unit_amount: li.unitAmountCents,
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
        orderDraftId: orderId,
        customerName: name || "",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    const pending: Order = {
      id: orderId,
      userId,
      createdAt: now,
      status: "pending",
      paymentStatus: "unpaid",
      currency: "usd",
      subtotalCents: subtotal,
      totalCents: subtotal,
      items: orderLines,
      stripeSessionId: session.id,
      shippingEmail: email,
      shippingName: name,
    };
    createPendingOrder(pending);

    return NextResponse.json({
      mode: "stripe",
      sessionId: session.id,
      url: session.url,
      orderId,
      order: pending,
    });
  } catch (error) {
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
