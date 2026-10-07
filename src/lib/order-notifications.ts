import "server-only";

import type { Order } from "@/lib/commerce-types";
import { sendOrderEmail, smtpConfigured } from "@/lib/order-mailer";
import { patchOrder } from "@/lib/orders-store";

function deliverable(email: string | undefined) {
  const value = (email || "").trim().toLowerCase();
  if (!value.includes("@")) return false;
  if (value === "guest@cocktale.app" || value === "demo@cocktale.app") return false;
  return true;
}

function emailInput(order: Order) {
  return {
    orderId: order.id,
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
    preferences: order.preferences || "",
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    shippingAddress: order.shippingAddress,
  };
}

export async function notifyOrderPaid(order: Order) {
  if (order.confirmationEmailSentAt || !deliverable(order.shippingEmail) || !smtpConfigured()) {
    return { sent: false as const };
  }
  if (!order.preferences?.trim()) return { sent: false as const };
  try {
    await sendOrderEmail(order.shippingEmail!, emailInput(order));
    patchOrder(order.id, { confirmationEmailSentAt: new Date().toISOString() });
    return { sent: true as const };
  } catch (error) {
    console.error("order confirmation email", error);
    return {
      sent: false as const,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}

export async function notifyOrderShipped(order: Order) {
  const tracking = (order.trackingNumber || "").trim();
  if (!tracking || order.shippingNoticeSentFor === tracking) return { sent: false as const };
  if (!smtpConfigured()) return { sent: false as const, error: "SMTP is not configured" };
  if (!deliverable(order.shippingEmail)) {
    return { sent: false as const, error: "No customer email on the order" };
  }
  if (!order.preferences?.trim()) {
    return { sent: false as const, error: "Order has no preference to include" };
  }
  try {
    await sendOrderEmail(order.shippingEmail!, emailInput(order));
    patchOrder(order.id, { shippingNoticeSentFor: tracking });
    return { sent: true as const };
  } catch (error) {
    console.error("shipping email", error);
    return {
      sent: false as const,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}
