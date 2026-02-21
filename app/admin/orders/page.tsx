"use client";

import { useState, useEffect } from "react";

interface Order {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  property_url: string;
  property_data: any;
  payment_status: string;
  order_status: string;
  payment_id: string | null;
  amount_paid: number | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: orders.length,
    paid: orders.filter((o) => o.payment_status === "paid").length,
    pending: orders.filter((o) => o.payment_status === "pending").length,
    revenue: orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + (o.amount_paid || 0), 0),
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Orders</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Totaal Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Betaald</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">In Afwachting</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Omzet</p>
          <p className="text-2xl font-bold" style={{ color: "#1F3C88" }}>
            €{stats.revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Klant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Betaling</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Bedrag</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Nog geen orders
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {order.first_name} {order.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          STATUS_COLORS[order.payment_status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          STATUS_COLORS[order.order_status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      €{(order.amount_paid || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-mono text-gray-800">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Datum</p>
                  <p className="text-sm text-gray-800">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klant</p>
                  <p className="text-sm text-gray-800">
                    {selectedOrder.first_name} {selectedOrder.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-800">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefoon</p>
                  <p className="text-sm text-gray-800">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bedrag</p>
                  <p className="text-sm font-bold text-gray-800">
                    €{(selectedOrder.amount_paid || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Betaalstatus</p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_COLORS[selectedOrder.payment_status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order status</p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      STATUS_COLORS[selectedOrder.order_status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedOrder.order_status}
                  </span>
                </div>
              </div>

              {selectedOrder.property_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Funda Link</p>
                  <a
                    href={selectedOrder.property_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {selectedOrder.property_url}
                  </a>
                </div>
              )}

              {selectedOrder.property_data?.address && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Woning Adres</p>
                  <p className="text-sm text-gray-800">{selectedOrder.property_data.address}</p>
                </div>
              )}

              {selectedOrder.property_data?.customerInfo?.additionalInfo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Aanvullende Info</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.property_data.customerInfo.additionalInfo}
                  </p>
                </div>
              )}

              {selectedOrder.payment_id && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mollie Payment ID</p>
                  <p className="text-sm font-mono text-gray-600">{selectedOrder.payment_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
