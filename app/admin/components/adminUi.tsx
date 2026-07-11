"use client";

// Gedeelde UI-bouwstenen voor het admin-dashboard: statusdefinities,
// badges, geldbedragen, datums en SLA-berekening (48-uursbelofte).

export interface AdminOrder {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  property_url: string;
  property_data: any;
  payment_status: string;
  order_status: string;
  payment_id: string | null;
  amount_paid: number | null;
  created_at: string;
  updated_at: string;
}

export interface StatusMeta {
  label: string;
  chip: string;
  dot: string;
}

export const PAYMENT_META: Record<string, StatusMeta> = {
  paid: { label: "Betaald", chip: "bg-green-50 text-green-800 ring-green-600/20", dot: "bg-green-600" },
  pending: { label: "In afwachting", chip: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  open: { label: "Open", chip: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  failed: { label: "Mislukt", chip: "bg-red-50 text-red-800 ring-red-600/20", dot: "bg-red-600" },
  expired: { label: "Verlopen", chip: "bg-gray-100 text-gray-600 ring-gray-500/20", dot: "bg-gray-400" },
  canceled: { label: "Geannuleerd", chip: "bg-gray-100 text-gray-600 ring-gray-500/20", dot: "bg-gray-400" },
  refunded: { label: "Terugbetaald", chip: "bg-blue-50 text-blue-800 ring-blue-600/20", dot: "bg-blue-600" },
};

export const ORDER_META: Record<string, StatusMeta> = {
  new: { label: "Nieuw", chip: "bg-blue-50 text-blue-800 ring-blue-600/20", dot: "bg-blue-600" },
  in_progress: { label: "In behandeling", chip: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  completed: { label: "Afgerond", chip: "bg-green-50 text-green-800 ring-green-600/20", dot: "bg-green-600" },
  cancelled: { label: "Geannuleerd", chip: "bg-gray-100 text-gray-600 ring-gray-500/20", dot: "bg-gray-400" },
};

const FALLBACK_META: StatusMeta = {
  label: "Onbekend",
  chip: "bg-gray-100 text-gray-600 ring-gray-500/20",
  dot: "bg-gray-400",
};

export function paymentMeta(status: string): StatusMeta {
  return PAYMENT_META[status] ?? { ...FALLBACK_META, label: status };
}

export function orderMeta(status: string): StatusMeta {
  return ORDER_META[status] ?? { ...FALLBACK_META, label: status };
}

export function StatusBadge({ meta }: { meta: StatusMeta }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const euroFormat = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

export function formatEuro(value: number | string | null | undefined): string {
  return euroFormat.format(Number(value) || 0);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "zojuist";
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "gisteren";
  if (days < 7) return `${days} dagen geleden`;
  return formatDateShort(value);
}

// SLA: rapport moet binnen 48 uur na de aanvraag geleverd zijn.
export const SLA_HOURS = 48;

export interface SlaInfo {
  state: "none" | "ok" | "warning" | "overdue";
  hoursLeft: number;
  label: string;
  chip: string;
}

export function getSla(order: AdminOrder): SlaInfo {
  const deliverable =
    order.payment_status === "paid" &&
    order.order_status !== "completed" &&
    order.order_status !== "cancelled";

  if (!deliverable) {
    return { state: "none", hoursLeft: 0, label: "", chip: "" };
  }

  const deadline = new Date(order.created_at).getTime() + SLA_HOURS * 3_600_000;
  const hoursLeft = (deadline - Date.now()) / 3_600_000;

  if (hoursLeft < 0) {
    const late = Math.ceil(-hoursLeft);
    return {
      state: "overdue",
      hoursLeft,
      label: `${late} uur te laat`,
      chip: "bg-red-50 text-red-800 ring-red-600/20",
    };
  }
  if (hoursLeft <= 12) {
    return {
      state: "warning",
      hoursLeft,
      label: `nog ${Math.floor(hoursLeft)} uur`,
      chip: "bg-amber-50 text-amber-800 ring-amber-600/20",
    };
  }
  return {
    state: "ok",
    hoursLeft,
    label: `nog ${Math.floor(hoursLeft)} uur`,
    chip: "bg-gray-100 text-gray-600 ring-gray-500/20",
  };
}

// Een order waarvoor nog een rapport geleverd moet worden
export function isDeliverable(order: AdminOrder): boolean {
  return getSla(order).state !== "none";
}
