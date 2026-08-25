"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Package,
  RefreshCw,
  Save,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import type { Order, OrderStatus, PaymentStatus, ShippingAddress } from "@/lib/commerce-types";
import { formatMoneyAmount } from "@/lib/currency";

const STATUS_FILTERS: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
];

type Counts = Record<string, number>;

function money(cents: number) {
  return formatMoneyAmount(cents, "USD", "en");
}

function formatAddress(addr?: ShippingAddress) {
  if (!addr) return "—";
  return [addr.line1, addr.line2, `${addr.city}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode}`, addr.country]
    .filter(Boolean)
    .join(", ");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [draftStatus, setDraftStatus] = useState<OrderStatus>("pending");
  const [draftPayment, setDraftPayment] = useState<PaymentStatus>("unpaid");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingName, setShippingName] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrCountry, setAddrCountry] = useState("");

  const load = useCallback(async (q = query, st = status) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("status", st);
      const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load orders");
      setOrders(data.orders || []);
      setCounts(data.counts || {});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) || null,
    [orders, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setDraftStatus(selected.status);
    setDraftPayment(selected.paymentStatus || (selected.status === "paid" || selected.status === "fulfilled" ? "paid" : "unpaid"));
    setCarrier(selected.carrier || "");
    setTrackingNumber(selected.trackingNumber || "");
    setNotes(selected.notes || "");
    setShippingName(selected.shippingName || "");
    setShippingEmail(selected.shippingEmail || "");
    setShippingPhone(selected.shippingPhone || "");
    setAddrLine1(selected.shippingAddress?.line1 || "");
    setAddrLine2(selected.shippingAddress?.line2 || "");
    setAddrCity(selected.shippingAddress?.city || "");
    setAddrState(selected.shippingAddress?.state || "");
    setAddrPostal(selected.shippingAddress?.postalCode || "");
    setAddrCountry(selected.shippingAddress?.country || "");
    setStatusMsg("");
  }, [selected]);

  async function patch(body: Record<string, unknown>, okMessage: string) {
    if (!selected) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setStatusMsg(okMessage);
      await load();
      setSelectedId(selected.id);
    } catch (err) {
      setStatusMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    const shippingAddress =
      addrLine1.trim() && addrCity.trim() && addrPostal.trim() && addrCountry.trim()
        ? {
            line1: addrLine1.trim(),
            line2: addrLine2.trim() || undefined,
            city: addrCity.trim(),
            state: addrState.trim() || undefined,
            postalCode: addrPostal.trim(),
            country: addrCountry.trim().toUpperCase(),
          }
        : null;

    await patch(
      {
        status: draftStatus,
        paymentStatus: draftPayment,
        shippingName: shippingName.trim(),
        shippingEmail: shippingEmail.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress,
        carrier: carrier.trim() || null,
        trackingNumber: trackingNumber.trim() || null,
        notes: notes.trim() || null,
        shippedAt:
          draftStatus === "fulfilled"
            ? selected?.shippedAt || new Date().toISOString()
            : selected?.shippedAt || null,
      },
      "Order saved.",
    );
  }

  return (
    <AdminAuthGate>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Orders
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">
              Review every checkout, confirm payment, manage shipping details, and mark fulfillment.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatus(st);
                void load(query, st);
              }}
              className={`rounded-full px-3 py-1.5 text-xs capitalize ${
                status === st
                  ? "bg-[var(--ink)] text-[var(--foam)]"
                  : "bg-[var(--chip)] text-[var(--ink)]"
              }`}
            >
              {st} {typeof counts[st] === "number" ? `(${counts[st]})` : ""}
            </button>
          ))}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id, email, name, tracking…"
              className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm"
            />
          </div>
          <button type="submit" className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--foam)]">
            Search
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[1.25rem] bg-[var(--surface)] ring-1 ring-[var(--line)]">
            <div className="max-h-[72vh] overflow-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="sticky top-0 bg-[var(--surface)] text-[10px] tracking-wide text-[var(--ink-muted)] uppercase">
                  <tr>
                    <th className="px-3 py-2 font-medium">Order</th>
                    <th className="px-2 py-2 font-medium">Customer</th>
                    <th className="px-2 py-2 font-medium">Total</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                    <th className="px-2 py-2 font-medium">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-[var(--ink-soft)]">
                        <span className="inline-flex items-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin" /> Loading…
                        </span>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-[var(--ink-soft)]">
                        No orders yet. New checkouts appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedId(order.id)}
                        className={`cursor-pointer border-t border-[var(--line)] ${
                          selectedId === order.id ? "bg-[var(--chip)]" : "hover:bg-[var(--chip)]/60"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <p className="max-w-[140px] truncate font-medium text-[var(--ink)]">{order.id}</p>
                          <p className="text-[10px] text-[var(--ink-muted)]">
                            {new Date(order.createdAt).toLocaleString()}
                            {order.demo ? " · demo" : ""}
                          </p>
                        </td>
                        <td className="px-2 py-2">
                          <p className="max-w-[120px] truncate text-[var(--ink)]">
                            {order.shippingName || order.userId}
                          </p>
                          <p className="max-w-[120px] truncate text-[10px] text-[var(--ink-muted)]">
                            {order.shippingEmail || "—"}
                          </p>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-[var(--ink)]">
                          {money(order.totalCents)}
                        </td>
                        <td className="px-2 py-2 capitalize text-[var(--ink)]">{order.status}</td>
                        <td className="px-2 py-2 capitalize text-[var(--ink)]">
                          {order.paymentStatus || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-[var(--surface)] p-5 ring-1 ring-[var(--line)]">
            {selected ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs tracking-[0.14em] text-[var(--accent-deep)] uppercase">
                    Order detail
                  </p>
                  <h2 className="mt-1 break-all font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {selected.id}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    User <span className="font-mono text-[var(--ink)]">{selected.userId}</span>
                    {selected.demo ? " · demo checkout" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void patch(
                        { status: "paid", paymentStatus: "paid" },
                        "Marked paid.",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark paid
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void patch(
                        {
                          status: "fulfilled",
                          paymentStatus: draftPayment === "unpaid" ? "paid" : draftPayment,
                          carrier: carrier.trim() || null,
                          trackingNumber: trackingNumber.trim() || null,
                          shippedAt: new Date().toISOString(),
                        },
                        "Marked fulfilled / shipped.",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                  >
                    <Truck className="h-3.5 w-3.5" /> Mark shipped
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void patch({ status: "cancelled" }, "Order cancelled.")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void patch(
                        { status: "refunded", paymentStatus: "refunded" },
                        "Marked refunded.",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                  >
                    Refunded
                  </button>
                  {selected.stripeSessionId ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void patch({ refreshFromStripe: true }, "Synced from Stripe.")
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip)] px-3 py-1.5 text-xs text-[var(--ink)]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Refresh Stripe
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Fulfillment status</span>
                    <select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm capitalize"
                    >
                      {STATUS_FILTERS.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Payment status</span>
                    <select
                      value={draftPayment}
                      onChange={(e) => setDraftPayment(e.target.value as PaymentStatus)}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm capitalize"
                    >
                      <option value="unpaid">unpaid</option>
                      <option value="paid">paid</option>
                      <option value="refunded">refunded</option>
                    </select>
                  </label>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--ink-muted)]">
                    <Package className="h-3.5 w-3.5" /> Line items · {money(selected.totalCents)}
                  </p>
                  <ul className="space-y-2">
                    {selected.items.map((item) => (
                      <li
                        key={`${item.productId}-${item.name}`}
                        className="flex items-center gap-2 rounded-xl bg-[var(--chip)]/70 px-2 py-1.5"
                      >
                        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[var(--surface)]">
                          <Image
                            src={item.image || "/cocktail-fallback.svg"}
                            alt=""
                            fill
                            className="object-contain p-0.5"
                            sizes="36px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-[var(--ink)]">{item.name}</span>
                          <span className="text-[10px] text-[var(--ink-muted)]">
                            {item.quantity} × {money(item.unitAmountCents)}
                          </span>
                        </span>
                        <span className="text-xs font-medium text-[var(--ink)]">
                          {money(item.unitAmountCents * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--ink-muted)]">Customer & shipping</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="Name"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                    <input
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="Email"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                    <input
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="Phone"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm sm:col-span-2"
                    />
                    <input
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      placeholder="Address line 1"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm sm:col-span-2"
                    />
                    <input
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      placeholder="Address line 2"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm sm:col-span-2"
                    />
                    <input
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="City"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                    <input
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      placeholder="State / region"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                    <input
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value)}
                      placeholder="Postal code"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                    <input
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      placeholder="Country (US, SG…)"
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--ink-muted)]">
                    Current: {formatAddress(selected.shippingAddress)}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Carrier</span>
                    <input
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="UPS, DHL, SF Express…"
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-[var(--ink-muted)]">Tracking number</span>
                    <input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="block text-xs">
                  <span className="text-[var(--ink-muted)]">Internal notes</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  />
                </label>

                {(selected.stripeSessionId || selected.stripePaymentIntentId) && (
                  <div className="rounded-xl bg-[var(--chip)]/80 px-3 py-2 text-[10px] break-all text-[var(--ink-muted)]">
                    {selected.stripeSessionId ? (
                      <p>Session: {selected.stripeSessionId}</p>
                    ) : null}
                    {selected.stripePaymentIntentId ? (
                      <p>PaymentIntent: {selected.stripePaymentIntentId}</p>
                    ) : null}
                    {selected.shippedAt ? (
                      <p>Shipped: {new Date(selected.shippedAt).toLocaleString()}</p>
                    ) : null}
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveAll()}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--foam)] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save changes
                </button>
                {statusMsg ? <p className="text-sm text-[var(--ink-soft)]">{statusMsg}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">
                Select an order to manage payment, shipping, and fulfillment.
              </p>
            )}
          </div>
        </div>
      </main>
    </AdminAuthGate>
  );
}
