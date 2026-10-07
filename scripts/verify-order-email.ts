import assert from "node:assert/strict";
import { buildOrderEmail } from "../src/lib/order-email-content";

const message = buildOrderEmail({
  orderId: "ord_test_1",
  items: [{ name: "Checkout test pour", quantity: 2 }],
  preferences: "No ice, gift wrap please",
  trackingNumber: "SG123456789",
  carrier: "SingPost",
  shippingAddress: {
    line1: "1 Test Street",
    city: "Singapore",
    postalCode: "123456",
    country: "SG",
  },
  siteUrl: "https://cocktale.vercel.app",
});

assert.match(message.subject, /ord_test_1/);
assert.match(message.subject, /Cocktale/);
assert.match(message.html, /logo\.png/);
assert.match(message.html, /Cocktale/);
assert.match(message.html, /ord_test_1/);
assert.match(message.html, /Checkout test pour/);
assert.match(message.html, />2</);
assert.match(message.html, /No ice, gift wrap please/);
assert.match(message.html, /SG123456789/);
assert.match(message.html, /t\.me\/\+6588023346/);
assert.match(message.html, /\+65 8802 3346/);
assert.match(message.html, /1 Test Street/);
assert.match(message.text, /Checkout test pour × 2/);
assert.match(message.text, /SG123456789/);

const pending = buildOrderEmail({
  orderId: "ord_test_2",
  items: [{ name: "Checkout test pour", quantity: 1 }],
  preferences: "Extra lime",
  siteUrl: "https://cocktale.vercel.app",
});
assert.match(pending.subject, /confirmed/);
assert.match(pending.html, /when the parcel leaves/);
assert.doesNotMatch(pending.html, /<script/i);

console.log("order email content ok");
