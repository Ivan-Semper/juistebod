"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AdminOrder,
  StatusBadge,
  paymentMeta,
  orderMeta,
  formatEuro,
  timeAgo,
  getSla,
  isDeliverable,
} from "../components/adminUi";

// Statuskleuren voor de donut: gevalideerd op contrast; rood en amber staan
// niet naast elkaar en identiteit is nooit alleen kleur (legend met labels).
const DONUT_SEGMENTS = [
  { key: "paid", label: "Betaald", color: "#15803d" },
  { key: "pending", label: "In afwachting", color: "#b45309" },
  { key: "expired", label: "Verlopen", color: "#6b7280" },
  { key: "failed", label: "Mislukt", color: "#b91c1c" },
  { key: "refunded", label: "Terugbetaald", color: "#1d4ed8" },
] as const;

const BRAND_BLUE = "#1F3C88";

export default function DashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      // Stil falen — de admin ziet een lege staat
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "paid");
    const weekMs = 7 * 24 * 3_600_000;
    const now = Date.now();
    const paidThisWeek = paid.filter((o) => now - new Date(o.created_at).getTime() < weekMs).length;
    const deliverables = orders.filter(isDeliverable);
    // Meest urgente eerst (minste tijd over)
    deliverables.sort((a, b) => getSla(a).hoursLeft - getSla(b).hoursLeft);

    return {
      revenue: paid.reduce((sum, o) => sum + (Number(o.amount_paid) || 0), 0),
      paidCount: paid.length,
      paidThisWeek,
      deliverables,
      conversion: orders.length > 0 ? Math.round((paid.length / orders.length) * 100) : 0,
    };
  }, [orders]);

  // Laatste 14 dagen, inclusief dagen zonder bestellingen (anders liegt de grafiek)
  const dailyData = useMemo(() => {
    const days: { key: string; date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toDateString(),
        date: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
        orders: 0,
        revenue: 0,
      });
    }
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const order of orders) {
      const day = byKey.get(new Date(order.created_at).toDateString());
      if (!day) continue;
      day.orders += 1;
      if (order.payment_status === "paid") {
        day.revenue += Number(order.amount_paid) || 0;
      }
    }
    return days;
  }, [orders]);

  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      // Groepeer canceled bij verlopen zodat de donut overzichtelijk blijft
      const key = order.payment_status === "canceled" ? "expired" : order.payment_status;
      counts[key] = (counts[key] || 0) + 1;
    }
    return DONUT_SEGMENTS
      .map((seg) => ({ ...seg, value: counts[seg.key] || 0 }))
      .filter((seg) => seg.value > 0);
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    [orders]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-9 w-56 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-200 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-gray-500">{todayLabel}</p>
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

      {/* Werkvoorraad */}
      {stats.deliverables.length > 0 ? (
        <Link
          href="/admin/orders"
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5 text-white shadow-md transition hover:shadow-lg"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">
                {stats.deliverables.length}{" "}
                {stats.deliverables.length === 1 ? "rapport wacht" : "rapporten wachten"} op levering
              </p>
              <p className="text-sm text-white/70">
                Meest urgent: {stats.deliverables[0].first_name} {stats.deliverables[0].last_name} ·{" "}
                {getSla(stats.deliverables[0]).state === "overdue"
                  ? getSla(stats.deliverables[0]).label
                  : `${getSla(stats.deliverables[0]).label} binnen de 48u-belofte`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold" style={{ color: BRAND_BLUE }}>
            Naar bestellingen
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
      ) : (
        orders.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-green-50 px-6 py-4 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-600/20">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Alle betaalde bestellingen zijn afgerond — geen openstaande rapporten.
          </div>
        )
      )}

      {/* KPI's */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Totale omzet</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{formatEuro(stats.revenue)}</p>
          <p className="mt-1 text-xs text-gray-500">betaald, incl. btw</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Betaalde orders</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{stats.paidCount}</p>
          <p className="mt-1 text-xs text-gray-500">
            {stats.paidThisWeek > 0 ? `+${stats.paidThisWeek} afgelopen 7 dagen` : "geen nieuwe deze week"}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Te leveren</p>
          <p className={`mt-2 font-serif text-3xl tracking-tight ${stats.deliverables.length > 0 ? "text-[#1F3C88]" : "text-gray-900"}`}>
            {stats.deliverables.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">openstaande rapporten</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Conversie</p>
          <p className="mt-2 font-serif text-3xl tracking-tight text-gray-900">{stats.conversion}%</p>
          <p className="mt-1 text-xs text-gray-500">van aanvraag naar betaling</p>
        </div>
      </div>

      {/* Grafieken */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Bestellingen per dag */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Bestellingen per dag</h2>
          <p className="mb-4 text-xs text-gray-400">Laatste 14 dagen, alle aanvragen</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f2f4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(31, 60, 136, 0.05)" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                formatter={(value) => [value as number, "bestellingen"]}
              />
              <Bar dataKey="orders" fill={BRAND_BLUE} radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Betaalstatus */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="text-sm font-semibold text-gray-900">Betaalstatus</h2>
          <p className="mb-2 text-xs text-gray-400">Alle bestellingen</p>
          {donutData.length > 0 ? (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={84}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {donutData.map((seg) => (
                        <Cell key={seg.key} fill={seg.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                      formatter={(value, name) => [value as number, name as string]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-3xl tracking-tight text-gray-900">{orders.length}</span>
                  <span className="text-xs text-gray-400">totaal</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {donutData.map((seg) => (
                  <li key={seg.key} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </span>
                    <span className="font-medium text-gray-900">{seg.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-gray-400">
              Nog geen bestellingen
            </div>
          )}
        </div>
      </div>

      {/* Omzet per dag */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="text-sm font-semibold text-gray-900">Omzet per dag</h2>
        <p className="mb-4 text-xs text-gray-400">Laatste 14 dagen, betaalde bestellingen (incl. btw)</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f2f4" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
              formatter={(value) => [formatEuro(value as number), "omzet"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={BRAND_BLUE}
              strokeWidth={2}
              dot={{ fill: BRAND_BLUE, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recente bestellingen */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Recente bestellingen</h2>
            <p className="text-xs text-gray-400">De laatste aanvragen, nieuwste eerst</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#1F3C88] transition hover:text-[#162E6B] hover:underline"
          >
            Alle bestellingen →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <ul className="divide-y divide-gray-50 px-6 pb-4">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND_BLUE }}
                  >
                    {order.first_name?.[0]}
                    {order.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {order.property_data?.address || order.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge meta={paymentMeta(order.payment_status)} />
                  <span className="hidden sm:inline-flex">
                    <StatusBadge meta={orderMeta(order.order_status)} />
                  </span>
                  <div className="w-24 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatEuro(order.amount_paid)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(order.created_at)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 pb-10 pt-6 text-center text-sm text-gray-400">
            Nog geen bestellingen — zodra de eerste aanvraag binnenkomt, zie je die hier.
          </p>
        )}
      </div>
    </div>
  );
}
