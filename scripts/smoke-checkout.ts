/**
 * Smoke-test the checkout API contract used by the cart page.
 * Run: npx tsx scripts/smoke-checkout.ts
 */
const base = process.argv[2] || "https://cocktale.vercel.app";

async function main() {
  const modeRes = await fetch(`${base}/api/checkout`);
  const mode = await modeRes.json();
  console.log("GET /api/checkout", modeRes.status, mode);
  if (!modeRes.ok || !["demo", "stripe"].includes(mode.mode)) {
    throw new Error("checkout mode endpoint failed");
  }

  const bad = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [] }),
  });
  console.log("POST invalid", bad.status, await bad.json());

  const body = {
    items: [{ productId: "ing-151-proof-rum", quantity: 1 }],
    userId: "guest",
    email: "guest@cocktale.app",
    name: "Guest",
    successUrl: `${base}/orders/success`,
    cancelUrl: `${base}/cart`,
  };
  const ok = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await ok.json();
  console.log("POST checkout", ok.status, data.mode, data.orderId, data.subtotalCents);
  if (!ok.ok) throw new Error(data.error || "checkout failed");
  if (data.mode === "demo") {
    if (!data.orderId || !data.lineItems?.length) throw new Error("demo payload incomplete");
  } else if (data.mode === "stripe") {
    if (!data.url || !data.sessionId) throw new Error("stripe payload incomplete");
  } else {
    throw new Error(`unexpected mode ${data.mode}`);
  }

  const overstock = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      items: [{ productId: "ing-151-proof-rum", quantity: 20 }],
    }),
  });
  // stock is 33 for this product so 20 should succeed; try 99
  const over = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      items: [{ productId: "ing-151-proof-rum", quantity: 99 }],
    }),
  });
  console.log("POST qty20", overstock.status);
  console.log("POST qty99", over.status, await over.json());
  if (over.status !== 400) throw new Error("expected stock rejection");

  console.log("OK", base);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
