"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  ShoppingCart, Trash2, Loader2, Package,
  ArrowRight, AlertCircle, CheckCircle, Tag,
  Sparkles, Shield, RotateCcw, ChevronRight,
  Star
} from "lucide-react";

const ASSET_TYPES: Record<number, string> = {
  1: "3D Models", 2: "Materials", 3: "Shaders", 4: "Prefabs",
  5: "Scripts", 6: "Full Project", 7: "Audio", 8: "Textures"
};

interface CartAssetItem {
  id: string;
  cartItemId: string;
  fileName: string;
  thumbnailUrl: string | null;
  price: number;
  averageRating: number;
  totalReviews: number;
  description: string | null;
  assetType: number;
  addedAt: string;
}

interface CartSummary {
  cartId: string;
  totalPrice: number;
  itemCount: number;
}

export default function CartPageClient() {
  const router = useRouter();
  const [assets, setAssets] = useState<CartAssetItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ data: { summary: CartSummary; assets: CartAssetItem[] } }>("/api/Cart?cartType=Asset");
      setSummary(data.data.summary);
      setAssets(data.data.assets || []);
    } catch (e: any) {
      setError(e.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const handleRemove = async (cartItemId: string) => {
    setRemovingId(cartItemId);
    try {
      await api("/api/Cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId })
      });
      await loadCart();
      window.dispatchEvent(new Event("cart-updated"));
      setSuccess("Item removed.");
    } catch (e: any) {
      setError(e.message || "Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!summary || summary.itemCount === 0) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const data = await api<{ data: { session: { redirectUrl: string } } }>("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success_url: `${origin}/marketplace/cart/success`,
          cancel_url: `${origin}/marketplace/cart`,
          cart_type: "Asset"
        })
      });
      if (data?.data?.session?.redirectUrl) {
        window.location.href = data.data.session.redirectUrl;
      }
    } catch (e: any) {
      setError(e.message || "Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-marketplace-primary/10 border border-marketplace-primary/20 flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-marketplace-primary animate-pulse" />
          </div>
          <p className="text-sm font-bold text-slate-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const isEmpty = assets.length === 0;

  return (
    <div className="min-h-[80vh] w-full mx-auto px-6 py-10 space-y-8" style={{ maxWidth: "85rem" }}>

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-marketplace-primary/10 border border-marketplace-primary/20 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-marketplace-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 font-semibold">
            {isEmpty ? "Your cart is empty" : `${assets.length} item${assets.length !== 1 ? "s" : ""} in cart`}
          </p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <Link href="/marketplace/assets" className="hover:text-slate-300 transition-colors">Asset Store</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-300">Cart</span>
      </div>

      {/* ── Notifications ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl animate-in slide-in-from-top duration-300">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold px-4 py-3 rounded-xl animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {isEmpty ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center gap-6 py-28 bg-gradient-to-b from-[#121826] to-[#0d1420] border border-marketplace-border rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-marketplace-primary/3 to-transparent pointer-events-none" />
          <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-marketplace-border flex items-center justify-center relative">
            <ShoppingCart className="w-10 h-10 text-slate-600" />
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-marketplace-border rounded-full border border-[#0d1420] flex items-center justify-center">
              <span className="text-[9px] font-extrabold text-slate-500">0</span>
            </div>
          </div>
          <div className="text-center space-y-2 max-w-xs">
            <h2 className="text-xl font-extrabold text-white">Nothing here yet</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Discover thousands of premium Unity assets, 3D models, shaders, and more.
            </p>
          </div>
          <Link
            href="/marketplace/assets"
            className="bg-marketplace-primary text-white px-7 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-red-900/20"
          >
            <Package className="w-4 h-4" /> Browse the Asset Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Cart Items Column ── */}
          <div className="lg:col-span-8 space-y-3">
            {assets.map((item) => (
              <div
                key={item.cartItemId}
                className="group relative bg-[#0f1623] border border-marketplace-border hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col sm:flex-row"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-marketplace-primary/60 via-marketplace-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 h-32 bg-slate-900/50 shrink-0 overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.fileName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0c101b] to-[#121826]">
                      <Package className="w-8 h-8 text-slate-700" />
                    </div>
                  )}
                  {/* Asset type badge over image */}
                  <div className="absolute bottom-2 left-2 bg-[#030712]/80 backdrop-blur-sm text-[9px] font-extrabold text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/5">
                    {ASSET_TYPES[item.assetType] || "Asset"}
                  </div>
                </div>

                {/* Details Content */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link
                        href={`/marketplace/assets/${item.id}`}
                        className="font-extrabold text-white text-base hover:text-marketplace-primary transition-colors line-clamp-1 pr-2"
                      >
                        {item.fileName}
                      </Link>
                      
                      {/* Price on the right */}
                      <div className="shrink-0">
                        {item.price === 0 ? (
                          <span className="text-emerald-400 font-extrabold text-base flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> FREE
                          </span>
                        ) : (
                          <span className="text-lg font-extrabold text-white tracking-tight">
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="mt-1.5 flex items-center gap-2">
                      {item.averageRating > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= Math.round(item.averageRating) ? "text-amber-400 fill-amber-400" : "text-slate-700 fill-slate-700"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">
                            {item.averageRating.toFixed(1)} ({item.totalReviews})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-semibold">No reviews yet</span>
                      )}
                    </div>

                    {item.description && (
                      <p className="mt-3 text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed max-w-xl">{item.description}</p>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 flex justify-end items-center border-t border-marketplace-border/30 pt-3">
                    <button
                      onClick={() => handleRemove(item.cartItemId)}
                      disabled={removingId === item.cartItemId}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {removingId === item.cartItemId
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/marketplace/assets"
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">

            {/* Summary Card */}
            <div className="bg-[#0f1623] border border-marketplace-border rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-marketplace-border/60 bg-white/[0.02]">
                <h3 className="text-sm font-extrabold text-white tracking-wide">Order Summary</h3>
              </div>

              {/* Line Items */}
              <div className="px-5 py-4 space-y-3">
                {assets.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold truncate flex-1">{item.fileName}</span>
                    <span className="font-bold text-slate-200 shrink-0">
                      {item.price === 0 ? <span className="text-emerald-400">FREE</span> : `$${item.price.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="px-5 py-4 border-t border-marketplace-border/60 bg-white/[0.02] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold">Subtotal</span>
                  <span className="text-xl font-extrabold text-white">${(summary?.totalPrice ?? 0).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-semibold text-right">All prices in USD</div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full relative bg-marketplace-primary text-white py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:opacity-90 active:scale-95 transition-all duration-150 shadow-lg shadow-red-900/20 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Tag className="w-4 h-4" />
                      Checkout — ${(summary?.totalPrice ?? 0).toFixed(2)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1623] border border-marketplace-border rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-extrabold text-slate-300">Secure Payment</span>
                <span className="text-[9px] text-slate-500 font-medium">256-bit SSL</span>
              </div>
              <div className="bg-[#0f1623] border border-marketplace-border rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-extrabold text-slate-300">Instant Access</span>
                <span className="text-[9px] text-slate-500 font-medium">After payment</span>
              </div>
            </div>

            {/* My Orders Link */}
            <Link
              href="/marketplace/orders"
              className="flex items-center justify-between w-full px-4 py-3 bg-[#0f1623] border border-marketplace-border rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all group"
            >
              <span>View Purchase History</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
