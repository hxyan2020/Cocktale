import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/commerce-types";
import { notifyOrderShipped } from "@/lib/order-notifications";
import { getOrderById, patchOrder } from "@/lib/orders-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2).max(2),
});

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  shippingName: z.string().optional(),
  shippingEmail: z.string().email().optional().or(z.literal("")),
  shippingPhone: z.string().optional(),
  shippingAddress: addressSchema.nullable().optional(),
  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  shippedAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  refreshFromStripe: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const existing = getOrderById(id);
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  }

  const data = parsed.data;

  if (data.refreshFromStripe && existing.stripeSessionId && stripeConfigured()) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(existing.stripeSessionId, {
          expand: ["payment_intent"],
        });
        const paid = session.payment_status === "paid";
        const pi =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        patchOrder(id, {
          status: paid
            ? existing.status === "fulfilled" || existing.status === "cancelled" || existing.status === "refunded"
              ? existing.status
              : "paid"
            : existing.status,
          paymentStatus: paid ? "paid" : existing.paymentStatus || "unpaid",
          stripePaymentIntentId: pi,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id || existing.stripeCustomerId,
          totalCents: session.amount_total ?? existing.totalCents,
          subtotalCents: session.amount_total ?? existing.subtotalCents,
          shippingEmail:
            existing.shippingEmail ||
            session.customer_details?.email ||
            session.customer_email ||
            undefined,
        });
      } catch (err) {
        console.error("refresh from stripe", err);
        return NextResponse.json({ error: "Could not refresh from Stripe" }, { status: 502 });
      }
    }
  }

  const previousTracking = existing.trackingNumber || "";
  const order = patchOrder(id, {
    status: data.status,
    paymentStatus: data.paymentStatus,
    shippingName: data.shippingName,
    shippingEmail: data.shippingEmail === "" ? undefined : data.shippingEmail,
    shippingPhone: data.shippingPhone,
    shippingAddress: data.shippingAddress,
    carrier: data.carrier,
    trackingNumber: data.trackingNumber,
    shippedAt: data.shippedAt,
    notes: data.notes,
  });

  let shippingEmailSent = false;
  let shippingEmailError: string | undefined;
  if (order && (order.trackingNumber || "") !== previousTracking && order.trackingNumber) {
    const notice = await notifyOrderShipped(order);
    shippingEmailSent = notice.sent;
    if ("error" in notice) shippingEmailError = notice.error;
  }

  return NextResponse.json({
    ok: true,
    order: getOrderById(id) || order,
    shippingEmailSent,
    shippingEmailError,
  });
}
