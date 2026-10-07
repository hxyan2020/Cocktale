"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/LanguageProvider";
import { useShop } from "@/components/useShop";
import { useTranslatedTexts } from "@/components/useTranslatedContent";
import type { Order, OrderStatus } from "@/lib/commerce-types";

type TabId = "account" | "password" | "purchases";

function statusLabel(status: OrderStatus, shop: ReturnType<typeof useShop>) {
  if (status === "pending") return shop.trackPending;
  if (status === "paid") return shop.trackPaid;
  if (status === "fulfilled") return shop.trackFulfilled;
  if (status === "cancelled") return shop.trackCancelled;
  if (status === "refunded") return shop.trackRefunded;
  return status;
}

function trackingSteps(status: OrderStatus, shop: ReturnType<typeof useShop>) {
  const paid = status === "paid" || status === "fulfilled";
  const preparing = status === "paid" || status === "fulfilled";
  const fulfilled = status === "fulfilled";
  return [
    { label: shop.trackPlaced, done: true },
    { label: status === "pending" ? shop.trackPending : shop.trackPaid, done: paid },
    { label: shop.trackPreparing, done: preparing },
    { label: shop.trackFulfilled, done: fulfilled },
  ];
}

function OrderCard({ order, itemNames }: { order: Order; itemNames: string[] }) {
  const shop = useShop();
  const { t, locale } = useI18n();
  const { format: formatMoney } = useCurrency();
  const steps = trackingSteps(order.status, shop);

  return (
    <article className="rounded-[1.25rem] bg-[var(--bg)] p-4 ring-1 ring-[var(--line)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-sm font-medium text-[var(--ink)]">{order.id}</p>
          <p className="text-xs text-[var(--ink-muted)]">
            {new Date(order.createdAt).toLocaleString(locale)}
            {order.demo ? ` · ${shop.demoLabel}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <p className="text-sm font-semibold text-[var(--ink)]">{formatMoney(order.totalCents)}</p>
          <p className="text-xs text-[var(--accent-deep)]">
            {shop.orderStatus}: {statusLabel(order.status, shop)}
          </p>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)]">
        {order.items.map((item, index) => `${itemNames[index] || item.name} ×${item.quantity}`).join(" · ")}
      </p>
      {order.preferences && (
        <p className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
          <span className="text-[var(--ink-muted)]">{shop.yourPreference}: </span>
          {order.preferences}
        </p>
      )}

      <div className="mt-4 rounded-xl bg-[var(--surface)] p-3 ring-1 ring-[var(--line)]">
        <p className="text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
          {t("profile.paymentManagement")}
        </p>
        <p className="mt-1 text-sm text-[var(--ink)]">
          {order.paymentStatus === "paid" || order.status === "paid" || order.status === "fulfilled"
            ? shop.trackPaid
            : order.paymentStatus === "refunded" || order.status === "refunded"
              ? shop.trackRefunded
              : shop.trackPending}
        </p>
        {order.stripeSessionId && (
          <p className="mt-1 break-all text-xs text-[var(--ink-muted)]">
            {shop.stripeSession}: {order.stripeSessionId}
          </p>
        )}
        <Link href="/contact" className="mt-2 inline-flex text-xs underline text-[var(--accent-deep)]">
          {t("profile.contactBilling")}
        </Link>
      </div>

      <div className="mt-3 rounded-xl bg-[var(--surface)] p-3 ring-1 ring-[var(--line)]">
        <p className="text-[11px] font-medium tracking-wide text-[var(--ink-muted)] uppercase">
          {t("profile.shippingTracker")}
        </p>
        <ol className="mt-2 space-y-1.5">
          {steps.map((step, index) => (
            <li key={step.label} className="flex items-center gap-2 text-xs">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  step.done ? "bg-[var(--ink)] text-[var(--foam)]" : "bg-[var(--chip)] text-[var(--ink-muted)]"
                }`}
              >
                {index + 1}
              </span>
              <span className={step.done ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"}>{step.label}</span>
            </li>
          ))}
        </ol>
        {order.carrier || order.trackingNumber ? (
          <p className="mt-2 text-xs text-[var(--ink)]">
            {order.carrier || "Shipment"}
            {order.trackingNumber ? ` · ${order.trackingNumber}` : ""}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--ink-muted)]">{t("profile.noTracking")}</p>
        )}
      </div>

      <Link
        href={`/orders/${order.id}`}
        className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-[var(--accent-deep)] underline"
      >
        {t("profile.viewOrder")}
      </Link>
    </article>
  );
}

export function ProfilePanel() {
  const { user, logout, updatePassword } = useAuth();
  const { t, locale } = useI18n();
  const shop = useShop();
  const { orders, hydrated } = useCart();
  const [tab, setTab] = useState<TabId>("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordOk, setPasswordOk] = useState(false);
  const [payError, setPayError] = useState("");
  const [payBusy, setPayBusy] = useState(false);
  const [payInfo, setPayInfo] = useState<{
    configured: boolean;
    enabledTypes: string[];
    methods: { id: string; brand: string; last4: string | null; type: string }[];
  } | null>(null);

  useEffect(() => {
    if (!user || tab !== "purchases") return;
    let cancelled = false;
    void fetch(`/api/payment-methods?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPayInfo(data);
      })
      .catch(() => {
        if (!cancelled) setPayInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  const itemNames = useMemo(() => orders.flatMap((order) => order.items.map((item) => item.name)), [orders]);
  const { texts: localizedItemNames } = useTranslatedTexts(itemNames, "profile-orders");

  if (!user) return null;

  const loginMethod = user.lastLoginMethod || (user.provider === "sms" ? "sms" : user.provider === "google" ? "google" : "password");
  const canResetPassword = loginMethod === "password";
  const providerLabel =
    loginMethod === "sms"
      ? t("profile.signedInWithSms")
      : loginMethod === "google"
        ? t("profile.signedInWithGoogle")
        : t("profile.signedInWithEmail");
  const accountLabel = user.phone || user.email || user.name;

  const tabs: { id: TabId; label: string }[] = [
    { id: "account", label: t("profile.tabAccount") },
    ...(canResetPassword ? [{ id: "password" as const, label: t("profile.tabPassword") }] : []),
    { id: "purchases", label: t("profile.tabPurchases") },
  ];

  function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setPasswordOk(false);
    if (nextPassword !== confirmPassword) {
      setPasswordError(t("errors.passwordMismatch"));
      return;
    }
    try {
      updatePassword(currentPassword, nextPassword);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setPasswordOk(true);
    } catch (err) {
      const code = (err as Error).message;
      if (code === "PASSWORD_SHORT") setPasswordError(t("errors.passwordShort"));
      else if (code === "WRONG_PASSWORD") setPasswordError(t("errors.wrongPassword"));
      else setPasswordError(code);
    }
  }

  let nameOffset = 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-11 flex-1 rounded-full px-3 text-sm font-medium ${
              tab === item.id
                ? "bg-[var(--ink)] text-[var(--foam)]"
                : "bg-[var(--chip)] text-[var(--ink-soft)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <section className="space-y-5">
          <div className="flex items-center gap-4">
            {user.picture ? (
              <Image
                src={user.picture}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-full object-cover ring-1 ring-[var(--line)]"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--chip)] text-xl font-medium text-[var(--ink)]">
                {(user.name || accountLabel).replace("+", "").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                {t("profile.loggedInAs")}
              </p>
              <p className="truncate font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                {user.name}
              </p>
              <p className="truncate text-sm text-[var(--ink-soft)]">{accountLabel}</p>
            </div>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">{providerLabel}</p>
          <p className="text-xs text-[var(--ink-muted)]">
            {t("profile.memberSince", {
              date: new Date(user.createdAt).toLocaleDateString(locale),
            })}
          </p>
          <button
            type="button"
            onClick={logout}
            className="min-h-12 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] transition hover:opacity-90"
          >
            {t("profile.logout")}
          </button>
        </section>
      )}

      {tab === "password" && canResetPassword && (
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
            {t("profile.currentPassword")}
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
            />
          </label>
          <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
            {t("profile.newPassword")}
            <input
              type="password"
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              required
              minLength={4}
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
            />
          </label>
          <label className="block text-xs font-medium tracking-wide uppercase text-[var(--ink-muted)]">
            {t("profile.confirmPassword")}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)] sm:text-sm"
            />
          </label>
          {passwordError && <p className="text-sm text-red-700">{passwordError}</p>}
          {passwordOk && <p className="text-sm text-[var(--accent-deep)]">{t("profile.passwordUpdated")}</p>}
          <button
            type="submit"
            className="min-h-12 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-medium text-[var(--foam)] transition hover:opacity-90"
          >
            {t("profile.savePassword")}
          </button>
        </form>
      )}

      {tab === "purchases" && (
        <section className="space-y-4">
          <div className="rounded-xl bg-[var(--chip)] p-3 text-sm leading-relaxed text-[var(--ink-soft)]">
            <p className="font-medium text-[var(--ink)]">{t("profile.paymentManagement")}</p>
            <p className="mt-1">{t("profile.paymentHint")}</p>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">{t("profile.noMembership")}</p>
            {payInfo?.enabledTypes?.length ? (
              <p className="mt-2 text-xs text-[var(--ink)]">
                {t("profile.enabledPayments")}: {payInfo.enabledTypes.join(", ")}
              </p>
            ) : null}
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
              {t("profile.savedPayments")}
            </p>
            {payInfo?.methods?.length ? (
              <ul className="mt-1 space-y-1 text-sm text-[var(--ink)]">
                {payInfo.methods.map((method) => (
                  <li key={method.id}>
                    {method.brand}
                    {method.last4 ? ` ···· ${method.last4}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs">{t("profile.noSavedPayments")}</p>
            )}
            <button
              type="button"
              disabled={payBusy || payInfo?.configured === false}
              onClick={() => {
                if (!user) return;
                setPayBusy(true);
                setPayError("");
                void fetch("/api/billing-portal", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: user.id,
                    returnUrl: window.location.href,
                  }),
                })
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Could not open payment settings");
                    window.location.href = data.url;
                  })
                  .catch((err: Error) => setPayError(err.message))
                  .finally(() => setPayBusy(false));
              }}
              className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[var(--ink)] px-4 text-xs text-[var(--foam)] disabled:opacity-50"
            >
              {t("profile.managePayments")}
            </button>
            {payError ? <p className="mt-2 text-xs text-red-700">{payError}</p> : null}
          </div>
          {!hydrated ? null : orders.length === 0 ? (
            <div className="rounded-xl bg-[var(--bg)] p-6 text-center ring-1 ring-[var(--line)]">
              <p className="text-sm text-[var(--ink-soft)]">{t("profile.purchasesEmpty")}</p>
              <Link
                href="/market"
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 text-sm text-[var(--foam)]"
              >
                {shop.continueShopping}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const names = order.items.map(() => localizedItemNames[nameOffset++] || "");
                return (
                  <li key={order.id}>
                    <OrderCard order={order} itemNames={names} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
