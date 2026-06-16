"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import { Receipt, Loader2, AlertCircle, Package, BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderItem {
  courseId: string | null;
  courseTitle: string;
  assetId: string | null;
  assetFileName: string;
  priceAtPurchase: number;
  isCourseAvailable: boolean;
  isAssetAvailable: boolean;
}

interface Order {
  id: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  status: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  Paid: { label: "Paid", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Authorized: { label: "Authorized", className: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Pending: { label: "Pending", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: <Clock className="w-3.5 h-3.5" /> },
  Cancelled: { label: "Cancelled", className: "text-red-400 bg-red-500/10 border-red-500/20", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api<Order[]>("/api/Order/my-orders");
        setOrders(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-marketplace-primary animate-spin" />
          <span className="text-sm font-bold text-slate-400">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-6 py-10 space-y-6" style={{ maxWidth: "85rem" }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Receipt className="w-7 h-7 text-marketplace-primary" />
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Order History</h1>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24 bg-[#121826] border border-marketplace-border rounded-2xl">
          <Receipt className="w-16 h-16 text-slate-600" />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-extrabold text-white">No orders yet</h2>
            <p className="text-sm text-slate-500 font-semibold">Your purchase history will appear here.</p>
          </div>
          <Link
            href="/marketplace/assets"
            className="bg-marketplace-primary text-white px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Package className="w-4 h-4" /> Browse Assets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_STYLES[order.status] || STATUS_STYLES["Pending"];
            return (
              <div key={order.id} className="bg-[#121826] border border-marketplace-border rounded-2xl overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-marketplace-border/60">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-500 font-semibold">
                      Order <span className="text-slate-300 font-bold font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusConfig.className}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                    <span className="text-base font-extrabold text-white">
                      ${order.totalAmount.toFixed(2)} <span className="text-xs text-slate-500">{order.currency}</span>
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-marketplace-border/40">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-marketplace-border flex items-center justify-center shrink-0">
                        {item.assetId ? (
                          <Package className="w-4 h-4 text-marketplace-primary" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.assetId ? (
                          <Link
                            href={`/marketplace/assets/${item.assetId}`}
                            className="text-sm font-bold text-slate-200 hover:text-white transition-colors truncate block"
                          >
                            {item.assetFileName || "Asset"}
                          </Link>
                        ) : (
                          <span className="text-sm font-bold text-slate-200 truncate block">{item.courseTitle || "Course"}</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          {item.assetId ? "Asset" : "Course"}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-white shrink-0">
                        {item.priceAtPurchase === 0 ? (
                          <span className="text-emerald-400">FREE</span>
                        ) : (
                          `$${item.priceAtPurchase.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
