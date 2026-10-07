import type { ShippingAddress } from "@/lib/commerce-types";
import {
  CUSTOMER_SERVICE_LABEL,
  CUSTOMER_SERVICE_URL,
  SITE_NAME,
  publicSiteUrl,
} from "@/lib/support";

export type OrderEmailItem = {
  name: string;
  quantity: number;
};

export type OrderEmailInput = {
  orderId: string;
  items: OrderEmailItem[];
  preferences: string;
  trackingNumber?: string;
  carrier?: string;
  shippingAddress?: ShippingAddress;
  siteUrl?: string;
};

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAddress(address: ShippingAddress | undefined) {
  if (!address) return "";
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrderEmail(input: OrderEmailInput) {
  const siteUrl = (input.siteUrl || publicSiteUrl()).replace(/\/$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const orderUrl = `${siteUrl}/orders/${encodeURIComponent(input.orderId)}`;
  const tracking = (input.trackingNumber || "").trim();
  const carrier = (input.carrier || "").trim();
  const preferences = input.preferences.trim();
  const address = formatAddress(input.shippingAddress);
  const shipped = Boolean(tracking);
  const subject = shipped
    ? `Order ${input.orderId} shipped — ${SITE_NAME}`
    : `Order ${input.orderId} confirmed — ${SITE_NAME}`;

  const itemRows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5c564c">${esc(item.name)}</td><td style="padding:6px 0;text-align:right">${item.quantity}</td></tr>`,
    )
    .join("");
  const itemText = input.items.map((item) => `${item.name} × ${item.quantity}`).join("\n");

  const trackingHtml = tracking
    ? `<tr><td style="padding:6px 12px 6px 0;color:#5c564c">Shipping number</td><td style="padding:6px 0"><strong>${esc(carrier ? `${carrier} ${tracking}` : tracking)}</strong></td></tr>`
    : `<tr><td style="padding:6px 12px 6px 0;color:#5c564c">Shipping number</td><td style="padding:6px 0">We will email this when the parcel leaves.</td></tr>`;
  const trackingText = tracking
    ? `Shipping number: ${carrier ? `${carrier} ` : ""}${tracking}`
    : "Shipping number: we will email this when the parcel leaves.";

  const addressHtml = address
    ? `<p style="margin:16px 0 0"><strong>Ship to</strong><br>${esc(address).replace(/\n/g, "<br>")}</p>`
    : "";

  const html = `<!doctype html>
<html>
<body style="margin:0;background:#f6f1e8;color:#241f1a;font-family:Georgia,serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border-radius:18px;padding:28px 24px">
        <tr><td>
          <img src="${esc(logoUrl)}" alt="${esc(SITE_NAME)}" width="72" height="72" style="display:block;width:72px;height:72px;border-radius:16px">
          <p style="margin:16px 0 0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#8a5a32">${esc(SITE_NAME)}</p>
          <h1 style="margin:8px 0 0;font-size:28px;font-weight:normal">${shipped ? "Your order has shipped" : "Order confirmed"}</h1>
          <p style="margin:12px 0 0;font-size:16px;line-height:1.5">Thank you for your order from ${esc(SITE_NAME)}.</p>
          <table style="width:100%;border-collapse:collapse;font-size:15px;margin:18px 0">
            <tr><td style="padding:6px 12px 6px 0;color:#5c564c">Order number</td><td style="padding:6px 0"><strong>${esc(input.orderId)}</strong></td></tr>
            ${itemRows}
            ${trackingHtml}
          </table>
          <p style="margin:0"><strong>Your preference</strong><br>${esc(preferences).replace(/\n/g, "<br>")}</p>
          ${addressHtml}
          <p style="margin:18px 0 0"><a href="${esc(orderUrl)}" style="color:#8a5a32">View this order</a></p>
          <p style="margin:8px 0 0">Customer service: <a href="${esc(CUSTOMER_SERVICE_URL)}" style="color:#8a5a32">${esc(CUSTOMER_SERVICE_LABEL)}</a></p>
          <p style="margin:22px 0 0">With thanks,<br>${esc(SITE_NAME)}<br><a href="${esc(siteUrl)}" style="color:#8a5a32">${esc(siteUrl)}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    SITE_NAME,
    shipped ? "Your order has shipped" : "Order confirmed",
    "",
    `Thank you for your order from ${SITE_NAME}.`,
    "",
    `Order number: ${input.orderId}`,
    "Products:",
    itemText,
    trackingText,
    "",
    "Your preference:",
    preferences,
    address ? `\nShip to:\n${address}` : "",
    "",
    `View this order: ${orderUrl}`,
    `Customer service: ${CUSTOMER_SERVICE_LABEL}`,
    CUSTOMER_SERVICE_URL,
    "",
    SITE_NAME,
    siteUrl,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text, logoUrl };
}
