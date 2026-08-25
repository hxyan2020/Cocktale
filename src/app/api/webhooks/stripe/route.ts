import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { ShippingAddress } from "@/lib/commerce-types";
import {
  getOrderById,
  getOrderByStripeSession,
  listOrders,
  patchOrder,
  upsertOrder,
} from "@/lib/orders-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function addressFromStripe(addr: Stripe.Address | null | undefined): ShippingAddress | undefined {
  if (!addr?.line1 || !addr.city || !addr.postal_code || !addr.country) return undefined;
  return {
    line1: addr.line1,
    line2: addr.line2 || undefined,
    city: addr.city,
    state: addr.state || undefined,
    postalCode: addr.postal_code,
    country: addr.country,
  };
}

function applyPaidSession(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const draftId = session.metadata?.orderDraftId || undefined;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const raw = session as unknown as {
    shipping_details?: {
      name?: string | null;
      address?: Stripe.Address | null;
    } | null;
  };
  const shipping = raw.shipping_details;

  const shippingName =
    shipping?.name || session.customer_details?.name || session.metadata?.customerName || undefined;
  const shippingEmail = session.customer_details?.email || session.customer_email || undefined;
  const shippingPhone = session.customer_details?.phone || undefined;
  const shippingAddress = addressFromStripe(
    shipping?.address || session.customer_details?.address,
  );

  const existing =
    getOrderByStripeSession(sessionId) || (draftId ? getOrderById(draftId) : undefined);

  if (existing) {
    patchOrder(existing.id, {
      status: existing.status === "fulfilled" ? "fulfilled" : "paid",
      paymentStatus: "paid",
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      subtotalCents: session.amount_total ?? existing.subtotalCents,
      totalCents: session.amount_total ?? existing.totalCents,
      shippingName: shippingName || existing.shippingName,
      shippingEmail: shippingEmail || existing.shippingEmail,
      shippingPhone: shippingPhone || existing.shippingPhone,
      shippingAddress: shippingAddress || existing.shippingAddress || null,
    });
    return;
  }

  upsertOrder({
    id: draftId || `ord_${Date.now().toString(36)}`,
    userId: session.metadata?.userId || session.client_reference_id || "guest",
    createdAt: new Date((session.created || Date.now() / 1000) * 1000).toISOString(),
    status: "paid",
    paymentStatus: "paid",
    currency: "usd",
    subtotalCents: session.amount_total || 0,
    totalCents: session.amount_total || 0,
    items: [],
    stripeSessionId: sessionId,
    stripePaymentIntentId: paymentIntentId,
    shippingName,
    shippingEmail,
    shippingPhone,
    shippingAddress,
  });
}

export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook secret missing (STRIPE_WEBHOOK_SECRET)" },
      { status: 400 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" || session.status === "complete") {
        applyPaidSession(session);
      }
    }
    if (event.type === "checkout.session.async_payment_succeeded") {
      applyPaidSession(event.data.object as Stripe.Checkout.Session);
    }
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const pi =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (pi) {
        const match = listOrders().find((o) => o.stripePaymentIntentId === pi);
        if (match) {
          patchOrder(match.id, { status: "refunded", paymentStatus: "refunded" });
        }
      }
    }
  } catch (err) {
    console.error("stripe webhook handler", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
