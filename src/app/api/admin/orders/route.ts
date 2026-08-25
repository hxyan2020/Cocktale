import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { ORDER_STATUSES } from "@/lib/commerce-types";
import { listOrders } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const statusParam = searchParams.get("status") || "all";
  const status =
    statusParam === "all" || (ORDER_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as "all" | (typeof ORDER_STATUSES)[number])
      : "all";

  const orders = listOrders({ q, status });
  const counts = {
    all: listOrders().length,
    pending: listOrders({ status: "pending" }).length,
    paid: listOrders({ status: "paid" }).length,
    fulfilled: listOrders({ status: "fulfilled" }).length,
    cancelled: listOrders({ status: "cancelled" }).length,
    refunded: listOrders({ status: "refunded" }).length,
  };

  return NextResponse.json(
    { count: orders.length, counts, orders },
    { headers: { "Cache-Control": "no-store" } },
  );
}
