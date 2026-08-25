import { NextResponse } from "next/server";
import { getOrderById, listOrders } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

/** Public read of a user's orders (userId is client-supplied account id). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = (searchParams.get("userId") || "").trim();
  const orderId = (searchParams.get("id") || "").trim();

  if (orderId) {
    const order = getOrderById(orderId);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (userId && order.userId !== userId && userId !== "guest") {
      // Allow guest/same-user; otherwise hide other users' details.
      if (order.userId !== "guest") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.json(
      { order },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const orders = listOrders({ userId });
  return NextResponse.json(
    { count: orders.length, orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}
