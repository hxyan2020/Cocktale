import { NextResponse } from "next/server";
import { notifyOrderPaid } from "@/lib/order-notifications";
import {
  getOrderById,
  getOrderByStripeSession,
  patchOrder,
  upsertOrder,
} from "@/lib/orders-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Confirm a Stripe Checkout session and sync the server order. */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    if (!stripeConfigured()) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe unavailable" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "payment_intent"],
    });

    const paid = session.payment_status === "paid";
    const draftId = session.metadata?.orderDraftId || undefined;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const payerName = session.customer_details?.name || session.metadata?.customerName || undefined;
    const payerEmail = session.customer_details?.email || session.customer_email || undefined;
    const stripeCustomerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id || null;

    let order =
      getOrderByStripeSession(sessionId) || (draftId ? getOrderById(draftId) : undefined);

    if (order) {
      order =
        patchOrder(order.id, {
          status: paid ? (order.status === "fulfilled" ? "fulfilled" : "paid") : order.status,
          paymentStatus: paid ? "paid" : order.paymentStatus || "unpaid",
          stripeSessionId: sessionId,
          stripePaymentIntentId: paymentIntentId,
          stripeCustomerId: stripeCustomerId || order.stripeCustomerId,
          subtotalCents: session.amount_total ?? order.subtotalCents,
          totalCents: session.amount_total ?? order.totalCents,
          shippingName: order.shippingName || payerName,
          shippingEmail: order.shippingEmail || payerEmail,
        }) || order;
    } else {
      const lineItems =
        session.line_items?.data.map((li) => {
          const productObj = li.price?.product;
          const productMeta =
            productObj && typeof productObj === "object" && "metadata" in productObj
              ? (productObj.metadata as { productId?: string })
              : undefined;
          const qty = li.quantity || 1;
          return {
            productId: productMeta?.productId || "stripe-line",
            name: li.description || "Item",
            unitAmountCents: qty ? Math.round((li.amount_total || 0) / qty) : 0,
            quantity: qty,
            image: "",
          };
        }) || [];

      order = upsertOrder({
        id: draftId || `ord_${Date.now().toString(36)}`,
        userId: session.metadata?.userId || session.client_reference_id || "guest",
        createdAt: new Date((session.created || Date.now() / 1000) * 1000).toISOString(),
        status: paid ? "paid" : "pending",
        paymentStatus: paid ? "paid" : "unpaid",
        currency: "usd",
        subtotalCents: session.amount_total || 0,
        totalCents: session.amount_total || 0,
        items: lineItems,
        stripeSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId,
        preferences: session.metadata?.preferences,
        shippingName: payerName,
        shippingEmail: payerEmail,
      });
    }

    if (paid && order) await notifyOrderPaid(order);

    return NextResponse.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: payerEmail,
      customerName: payerName,
      metadata: session.metadata,
      paymentIntentId,
      lineItems:
        session.line_items?.data.map((li) => ({
          name: li.description,
          quantity: li.quantity,
          amountTotal: li.amount_total,
        })) || [],
      order,
    });
  } catch (error) {
    console.error("checkout session error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load checkout session" },
      { status: 500 },
    );
  }
}
