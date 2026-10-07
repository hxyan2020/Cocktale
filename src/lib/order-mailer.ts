import nodemailer from "nodemailer";
import { buildOrderEmail, type OrderEmailInput } from "@/lib/order-email-content";

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

function transport() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASSWORD || "";
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
    requireTLS: process.env.SMTP_TLS !== "0" && port !== 465,
  });
}

export async function verifySmtp() {
  if (!smtpConfigured()) return { ok: false, reason: "SMTP is not configured" };
  await transport().verify();
  return { ok: true as const };
}

export async function sendOrderEmail(to: string, input: OrderEmailInput) {
  if (!smtpConfigured()) {
    throw new Error("SMTP is not configured");
  }
  const from = process.env.SMTP_FROM || "";
  const message = buildOrderEmail(input);
  await transport().sendMail({
    from,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return message.subject;
}
