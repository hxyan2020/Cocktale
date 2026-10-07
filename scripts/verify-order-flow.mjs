import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\n/)) {
  const eq = line.indexOf("=");
  if (eq <= 0 || line.startsWith("#")) continue;
  let value = line.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[line.slice(0, eq).trim()] = value;
}

const base = "http://localhost:3456";
const email = "order-test@example.com";

const res = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    items: [{ productId: "checkout-test-pour", quantity: 1 }],
    userId: "e2e-user",
    email,
    name: "E2E",
    preferences: "No ice, extra lime",
    successUrl: `${base}/orders/success`,
    cancelUrl: `${base}/cart`,
  }),
});
const data = await res.json();
if (!res.ok) {
  console.error("checkout failed", res.status, data.error);
  process.exit(1);
}
if (data.mode !== "demo") {
  console.error("expected demo without a live Stripe key, got", data.mode);
  process.exit(1);
}
if (data.subtotalCents !== 10 || data.order.preferences !== "No ice, extra lime") {
  console.error("order payload mismatch");
  process.exit(1);
}

const missing = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    items: [{ productId: "checkout-test-pour", quantity: 1 }],
    userId: "e2e-user",
    email,
    name: "E2E",
    successUrl: `${base}/orders/success`,
    cancelUrl: `${base}/cart`,
  }),
});
if (missing.status !== 400) {
  console.error("checkout without preferences should be rejected", missing.status);
  process.exit(1);
}

const login = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
  }),
});
const setCookie = login.headers.get("set-cookie") || "";
const cookie = setCookie.split(";")[0];
if (!login.ok || !cookie.includes("=")) {
  console.error("admin login", login.status);
  process.exit(1);
}

const patch = await fetch(`${base}/api/admin/orders/${data.orderId}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie },
  body: JSON.stringify({
    shippingName: "Ada",
    shippingEmail: email,
    shippingPhone: "+6588023346",
    shippingAddress: {
      line1: "1 Test St",
      city: "Singapore",
      postalCode: "123456",
      country: "SG",
    },
    carrier: "SingPost",
    trackingNumber: "SGTEST100",
    status: "fulfilled",
    paymentStatus: "paid",
  }),
});
const patched = await patch.json();
if (!patch.ok) {
  console.error("patch", patched.error);
  process.exit(1);
}
const order = patched.order;
if (
  order.preferences !== "No ice, extra lime" ||
  order.trackingNumber !== "SGTEST100" ||
  order.shippingAddress?.line1 !== "1 Test St" ||
  !order.items.some(
    (item) => item.name === "Checkout test pour" && item.quantity === 1 && item.unitAmountCents === 10,
  )
) {
  console.error("saved order is missing preference, shipping, or the test line");
  process.exit(1);
}

const pub = await fetch(
  `${base}/api/orders?id=${encodeURIComponent(order.id)}&userId=e2e-user`,
);
const shown = await pub.json();
if (shown.order?.trackingNumber !== "SGTEST100" || shown.order?.preferences !== "No ice, extra lime") {
  console.error("storefront order does not show admin shipping or the preference");
  process.exit(1);
}

console.log(
  "flow ok",
  order.id,
  "emailSent",
  Boolean(patched.shippingEmailSent),
  "emailError",
  patched.shippingEmailError || "none",
);
