/** Public customer-service channel. Same Telegram line as the rest of the bar. */
export const SITE_NAME = "Cocktale";
export const SUPPORT_EMAIL = "hello@cocktale.app";
export const CUSTOMER_SERVICE_PHONE = "+65 8802 3346";
export const CUSTOMER_SERVICE_URL = "https://t.me/+6588023346";
export const CUSTOMER_SERVICE_LABEL = `Telegram ${CUSTOMER_SERVICE_PHONE}`;

export function publicSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://cocktale.vercel.app";
  return raw.replace(/\/$/, "");
}
