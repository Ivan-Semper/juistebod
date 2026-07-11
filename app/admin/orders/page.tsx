"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  AdminOrder,
  StatusBadge,
  paymentMeta,
  orderMeta,
  formatEuro,
  formatDateTime,
  timeAgo,
  getSla,
  isDeliverable,
} from "../components/adminUi";

type PayFilter = "all" | "paid" | "pending" | "failed";
type StatusFilter = "all" | "new" | "in_progress" | "completed";

const PAY_FILTERS: { value: PayFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "paid", label: "Betaald" },
  { value: "pending", label: "In afwachting" },
  { value: "failed", label: "Niet gelukt" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "new", label: "Nieuw" },
  { value: "in_progress", label: "In behandeling" },
  { value: "completed", label: "Afgerond" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "new", label: "Nieuw" },
  { value: "in_progress", label: "In behandeling" },
  { value: "completed", label: "Afgerond" },
] as const;

const PAYMENT_STATUS_OPTIONS = [
  "pending",
  "paid",
  "failed",
  "expired",
  "canceled",
  "refunded",
] as const;

interface Toast {
  type: "success" | "error";
  text: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<string>("");

  const showToast = useCallback((type: Toast["type"], text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      showToast("error", "Kon bestellingen niet laden");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  // Houd het betaalstatus-concept in sync met de geselecteerde order
  useEffect(() => {
    if (selectedOrder) setPaymentDraft(selectedOrder.payment_status);
  }, [selectedOrder]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (payFilter === "paid" && order.payment_status !== "paid") return false;
      if (payFilter === "pending" && !["pending", "open"].includes(order.payment_status)) return false;
      if (payFilter === "failed" && !["failed", "expired", "canceled"].includes(order.payment_status)) return false;
      if (statusFilter !== "all" && order.order_status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        order.first_name,
        order.last_name,
        `${order.first_name} ${order.last_name}`,
        order.email,
        order.property_data?.address,
        order.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, payFilter, statusFilter]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "paid");
    return {
      deliverable: orders.filter(isDeliverable).length,
      paid: paid.length,
      pending: orders.filter((o) => ["pending", "open"].includes(o.payment_status)).length,
      revenue: paid.reduce((sum, o) => sum + (Number(o.amount_paid) || 0), 0),
    };
  }, [orders]);

  const patchLocalOrder = useCallback((orderId: string, patch: Partial<AdminOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
  }, []);

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/update-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus }),
      });
      const data = await res.json();
      if (data.success) {
        patchLocalOrder(orderId, { order_status: orderStatus, updated_at: new Date().toISOString() });
        showToast("success", `Levering bijgewerkt naar “${orderMeta(orderStatus).label}”`);
      } else {
        showToast("error", data.error || "Bijwerken mislukt");
      }
    } catch {
      showToast("error", "Bijwerken mislukt");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (order: AdminOrder, paymentStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/update-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          paymentStatus,
          paymentId: order.payment_id,
          amountPaid: order.amount_paid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        patchLocalOrder(order.id, { payment_status: paymentStatus, updated_at: new Date().toISOString() });
        showToast("success", `Betaalstatus bijgewerkt naar “${paymentMeta(paymentStatus).label}”`);
      } else {
        showToast("error", data.error || "Bijwerken mislukt");
      }
    } catch {
      showToast("error", "Bijwerken mislukt");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async (value: string, wat: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast("success", `${wat} gekopieerd`);
    } catch {
      showToast("error", "Kopiëren niet gelukt");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-gray-900">Bestellingen</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} {orders.length === 1 ? "bestelling" : "bestellingen"} · {stats.deliverable} te leveren
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-900/10 transition hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Vernieuwen
        </button>
      </div>

      {/* KPI's */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Te leveren</p>
          <p className={`mt-2 font-serif text-3xl tracking-tight ${stats.deliverable > 0 ? "text-[#1F3C88]" : "text-gray-900"}`}>
            {stats.deliverable}
          </p>
          <p className="mt-1 text-xs text-gray-500">rapporten binnen 48u-belofte</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Betaald</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{stats.paid}</p>
          <p className="mt-1 text-xs text-gray-500">succesvolle betalingen</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">In afwachting</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{stats.pending}</p>
          <p className="mt-1 text-xs text-gray-500">nog niet afgerekend</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Omzet</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{formatEuro(stats.revenue)}</p>
          <p className="mt-1 text-xs text-gray-500">totaal betaald (incl. btw)</p>
        </div>
      </div>

      {/* Zoeken + filters */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam, e-mail of adres…"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:bg-white focus:ring-2 focus:ring-[#1F3C88]/15"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Betaling</span>
              <div className="flex rounded-full bg-gray-100 p-0.5">
                {PAY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setPayFilter(f.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      payFilter === f.value
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/10"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Levering</span>
              <div className="flex rounded-full bg-gray-100 p-0.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      statusFilter === f.value
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/10"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Datum</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Klant</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Woning</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Betaling</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Levering</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">Deadline</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Bedrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="font-medium text-gray-500">Geen bestellingen gevonden</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {orders.length === 0
                        ? "Zodra de eerste aanvraag binnenkomt, verschijnt die hier."
                        : "Pas je zoekopdracht of filters aan."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const sla = getSla(order);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className="cursor-pointer transition-colors hover:bg-[#1F3C88]/[0.03]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                        <span className="block text-gray-900">{timeAgo(order.created_at)}</span>
                        <span className="text-xs">{formatDateTime(order.created_at)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.first_name} {order.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                      </td>
                      <td className="hidden max-w-[220px] px-5 py-4 md:table-cell">
                        <p className="truncate text-sm text-gray-600">
                          {order.property_data?.address || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge meta={paymentMeta(order.payment_status)} />
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <StatusBadge meta={orderMeta(order.order_status)} />
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        {sla.state === "none" ? (
                          <span className="text-sm text-gray-300">—</span>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${sla.chip}`}>
                            {sla.label}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatEuro(order.amount_paid)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail-paneel */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Paneel-header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Bestelling</p>
                <h2 className="mt-1 font-serif text-2xl tracking-tight text-gray-900">
                  {selectedOrder.first_name} {selectedOrder.last_name}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Sluiten"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* SLA-melding */}
              {(() => {
                const sla = getSla(selectedOrder);
                if (sla.state === "none") return null;
                const tone =
                  sla.state === "overdue"
                    ? "bg-red-50 text-red-800 ring-red-600/20"
                    : sla.state === "warning"
                      ? "bg-amber-50 text-amber-800 ring-amber-600/20"
                      : "bg-blue-50 text-blue-800 ring-blue-600/20";
                return (
                  <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ring-1 ring-inset ${tone}`}>
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {sla.state === "overdue"
                      ? `Levertijd overschreden: ${sla.label}`
                      : `Rapport leveren: ${sla.label} binnen de 48u-belofte`}
                  </div>
                );
              })()}

              {/* Levering */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Levering</h3>
                <div className="grid grid-cols-3 gap-2">
                  {ORDER_STATUS_OPTIONS.map((opt) => {
                    const active = selectedOrder.order_status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        disabled={updating || active}
                        onClick={() => updateOrderStatus(selectedOrder.id, opt.value)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-[#1F3C88] text-white shadow-sm"
                            : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 disabled:opacity-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {selectedOrder.order_status === "completed" && (
                  <p className="mt-2 text-xs text-gray-400">
                    Deze bestelling is afgerond — het rapport is geleverd.
                  </p>
                )}
              </section>

              {/* Betaling */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Betaling</h3>
                <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-inset ring-gray-100">
                  <div className="flex items-center justify-between">
                    <StatusBadge meta={paymentMeta(selectedOrder.payment_status)} />
                    <span className="font-serif text-xl tracking-tight text-gray-900">
                      {formatEuro(selectedOrder.amount_paid)}
                    </span>
                  </div>
                  {selectedOrder.payment_id && (
                    <p className="mt-2 break-all font-mono text-xs text-gray-400">
                      Mollie: {selectedOrder.payment_id}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <select
                      value={paymentDraft}
                      onChange={(e) => setPaymentDraft(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/15"
                    >
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {paymentMeta(status).label}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={updating || paymentDraft === selectedOrder.payment_status}
                      onClick={() => updatePaymentStatus(selectedOrder, paymentDraft)}
                      className="rounded-lg bg-[#1F3C88] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162E6B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Opslaan
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    De betaalstatus wordt normaal automatisch bijgewerkt via Mollie. Alleen handmatig
                    aanpassen bij correcties, zoals een terugbetaling.
                  </p>
                </div>
              </section>

              {/* Klant */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Klant</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <a href={`mailto:${selectedOrder.email}`} className="truncate font-medium text-[#1F3C88] hover:underline">
                      {selectedOrder.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.email, "E-mailadres")}
                      className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      Kopieer
                    </button>
                  </div>
                  {selectedOrder.phone && (
                    <a href={`tel:${selectedOrder.phone}`} className="block font-medium text-[#1F3C88] hover:underline">
                      {selectedOrder.phone}
                    </a>
                  )}
                  {selectedOrder.property_data?.customerInfo?.additionalInfo && (
                    <div className="rounded-xl bg-gray-50 p-3.5 text-gray-700 ring-1 ring-inset ring-gray-100">
                      <p className="mb-1 text-xs font-medium text-gray-400">Aanvullende informatie</p>
                      <p className="whitespace-pre-wrap">{selectedOrder.property_data.customerInfo.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Woning */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Woning</h3>
                <div className="space-y-2.5 text-sm">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.property_data?.address || "Adres onbekend"}
                  </p>
                  {selectedOrder.property_data?.price && (
                    <p className="text-gray-500">Vraagprijs: {selectedOrder.property_data.price}</p>
                  )}
                  {selectedOrder.property_url && (
                    <a
                      href={selectedOrder.property_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1F3C88] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162E6B]"
                    >
                      Bekijk op Funda
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </section>

              {/* Meta */}
              <section className="border-t border-gray-100 pt-5">
                <div className="space-y-1.5 text-xs text-gray-400">
                  <div className="flex items-center justify-between gap-3">
                    <span className="break-all font-mono">{selectedOrder.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.id, "Order-ID")}
                      className="shrink-0 rounded-md px-2 py-1 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      Kopieer
                    </button>
                  </div>
                  <p>Laatst bijgewerkt: {formatDateTime(selectedOrder.updated_at)}</p>
                </div>
              </section>
            </div>
          </aside>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div
            className={`flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-gray-900" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
