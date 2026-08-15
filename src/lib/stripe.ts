import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function stripeConfigured() {
  // Hosted Checkout Sessions only need the secret key.
  // Publishable key is optional until Stripe.js / Payment Element is used.
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function randomSuffix(len = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
