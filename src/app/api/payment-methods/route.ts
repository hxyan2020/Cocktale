import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders-store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const METHOD_KEYS = [
  "card",
  "link",
  "apple_pay",
  "google_pay",
  "paypal",
  "paynow",
  "grabpay",
  "alipay",
  "wechat_pay",
  "klarna",
  "cashapp",
  "amazon_pay",
  "revolut_pay",
  "zip",
] as const;

function customerFor(userId: string) {
  return listOrders({ userId }).find((order) => order.stripeCustomerId)?.stripeCustomerId || null;
}

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId")?.trim() || "";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const customerId = customerFor(userId);
  if (!stripeConfigured()) {
    return NextResponse.json({
      configured: false,
      customerId,
      methods: [],
      enabledTypes: [],
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false, customerId, methods: [], enabledTypes: [] });
  }

  const enabledTypes: string[] = [];
  try {
    const configs = await stripe.paymentMethodConfigurations.list({ limit: 5 });
    for (const config of configs.data) {
      if (!config.active) continue;
      const record = config as unknown as Record<string, { available?: boolean } | unknown>;
      for (const key of METHOD_KEYS) {
        const value = record[key];
        if (value && typeof value === "object" && "available" in value && value.available) {
          if (!enabledTypes.includes(key)) enabledTypes.push(key);
        }
      }
    }
  } catch (error) {
    console.error("payment method configurations", error);
  }

  if (!customerId) {
    return NextResponse.json({ configured: true, customerId: null, methods: [], enabledTypes });
  }

  try {
    const listed = await stripe.customers.listPaymentMethods(customerId, { limit: 20 });
    return NextResponse.json({
      configured: true,
      customerId,
      enabledTypes,
      methods: listed.data.map((method) => ({
        id: method.id,
        type: method.type,
        brand: method.card?.brand || method.type,
        last4: method.card?.last4 || null,
        expMonth: method.card?.exp_month || null,
        expYear: method.card?.exp_year || null,
      })),
    });
  } catch (error) {
    console.error("list payment methods", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not list payment methods" },
      { status: 502 },
    );
  }
}
