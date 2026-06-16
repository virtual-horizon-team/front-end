"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  Search, Package, Filter, SlidersHorizontal, Star, Sparkles,
  ShoppingCart, ChevronLeft, ChevronRight, Loader2, X, Tag, Zap,
  AlertCircle, CheckCircle2
} from "lucide-react";

const ASSET_TYPES: Record<number, string> = {
  1: "3D Models", 2: "Materials", 3: "Shaders", 4: "Prefabs",
  5: "Scripts", 6: "Full Project", 7: "Audio", 8: "Textures"
};

interface StoreAsset {
  assetID: string;
  fileName: string;
  description: string | null;
  thumbnailSasUrl: string | null;
  assetType: number;
  price: number;
  isFree: boolean;
  categoryId: string | null;
  categoryName: string | null;
  ownerUsername: string | null;
  uploadedAt: string;
}

interface PagedResult {
  items: StoreAsset[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface Category {
  id: string;
  name: string;
}

export default function AssetStoreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [paged, setPaged] = useState<Omit<PagedResult, "items"> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filters
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "");
  const [isFree, setIsFree] = useState(searchParams.get("free") === "1");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load categories once
  useEffect(() => {
    api<Category[]>("/api/Asset/Categories").then(setCategories).catch(() => {});
  }, []);

  const loadAssets = useCallback(async (p?: number) => {
    p = p ?? page;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("pageNumber", String(p));
      params.set("pageSize", "12");
      if (search) params.set("searchTerm", search);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (isFree) {
        params.set("isFree", "true");
      } else {
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
      }
      if (sortBy) params.set("sortBy", sortBy);

      const data = await api<PagedResult>(`/api/Asset/Store?${params}`);
      setAssets(data.items || []);
      setPaged({ totalCount: data.totalCount, pageNumber: data.pageNumber, pageSize: data.pageSize, totalPages: data.totalPages });
    } catch (e: any) {
      setError(e.message || "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, isFree, minPrice, maxPrice, sortBy]);

  useEffect(() => { loadAssets(page); }, [page, selectedCategory, isFree, minPrice, maxPrice, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); loadAssets(1); }, 450);
  };

  const handleAddToCart = async (asset: StoreAsset) => {
    setAddingToCart(asset.assetID);
    try {
      if (asset.isFree) {
        await api(`/api/Asset/Store/Claim/${asset.assetID}`, { method: "POST" });
      } else {
        await api("/api/Cart/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId: asset.assetID })
        });
      }
      setCartSuccess(asset.assetID);
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setCartSuccess(null), 3000);
    } catch (e: any) {
      const msg = e.message || "Failed to add asset to cart.";
      console.warn("API Add to Cart caught error:", msg);
      if (msg.includes("Session expired") || msg.includes("log in") || msg.includes("Unauthorized") || msg.includes("401") || msg.includes("Login")) {
        router.push("/login?redirect=/marketplace/assets");
      } else {
        setToast({ message: msg, type: "error" });
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const applyFilter = (key: string, val: string) => {
    setPage(1);
    if (key === "cat") setSelectedCategory(val);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setIsFree(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };
  const hasFilters = search || selectedCategory || isFree || minPrice || maxPrice || sortBy !== "newest";

  return (
    <div className="w-full mx-auto px-6 py-8 space-y-6" style={{ maxWidth: "85rem" }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between border-b border-marketplace-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-marketplace-primary" />
            Asset Store
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            {paged ? `${paged.totalCount.toLocaleString()} assets available` : "Browse the catalog"}
          </p>
        </div>
        <Link
          href="/marketplace/cart"
          className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-white border border-marketplace-border hover:border-slate-600 bg-[#121826] px-4 py-2 rounded-xl transition-all"
        >
          <ShoppingCart className="w-4 h-4" /> View Cart
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar Filters (Left Side) ── */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Categories Card (Clickable List) */}
          <div className="bg-[#121826] border border-marketplace-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Categories</h3>
              {selectedCategory && (
                <button
                  onClick={() => { setSelectedCategory(""); setPage(1); }}
                  className="text-[10px] font-bold text-red-400 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              <button
                onClick={() => { setSelectedCategory(""); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  !selectedCategory
                    ? "bg-marketplace-primary/10 text-marketplace-primary border border-marketplace-primary/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#0f1623] border border-transparent"
                }`}
              >
                All Categories
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.id); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all truncate cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-marketplace-primary/10 text-marketplace-primary border border-marketplace-primary/20 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-[#0f1623] border border-transparent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Sorting Card */}
          <div className="bg-[#121826] border border-marketplace-border p-5 rounded-2xl space-y-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pricing & Sorting</h3>
            
            {/* Free only toggle */}
            <button
              onClick={() => { setIsFree(f => !f); setPage(1); }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                isFree 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                  : "bg-[#0f1623] border-marketplace-border text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Free Assets Only
            </button>

            {/* Min Price */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Min Price ($)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                disabled={isFree}
                onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="0.00"
                className="w-full bg-[#0f1623] border border-marketplace-border focus:border-marketplace-primary text-sm text-white placeholder:text-slate-600 font-semibold rounded-xl px-4 py-2.5 outline-none transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Max Price ($)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                disabled={isFree}
                onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="Any"
                className="w-full bg-[#0f1623] border border-marketplace-border focus:border-marketplace-primary text-sm text-white placeholder:text-slate-600 font-semibold rounded-xl px-4 py-2.5 outline-none transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="w-full bg-[#0f1623] border border-marketplace-border text-sm text-slate-300 font-semibold rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-marketplace-primary transition-colors"
              >
                <option value="newest">Newest Uploads</option>
                <option value="oldest">Oldest Uploads</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Alphabetical: A-Z</option>
                <option value="name_desc">Alphabetical: Z-A</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ── Main content (Right Side) ── */}
        <div className="flex-1 space-y-6">
          {/* Top Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search assets, categories, materials..."
              className="w-full bg-[#121826] border border-marketplace-border hover:border-slate-600 focus:border-marketplace-primary text-base text-white placeholder:text-slate-600 font-semibold rounded-2xl pl-12 pr-4 py-3 outline-none transition-colors"
            />
            {search && (
              <button onClick={() => handleSearchChange("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Active filters strip */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap bg-[#121826] border border-marketplace-border p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold">Active:</span>
              {search && <span className="text-xs bg-[#0f1623] border border-marketplace-border text-slate-300 px-2.5 py-1 rounded-full font-semibold">"{search}"</span>}
              {selectedCategory && <span className="text-xs bg-[#0f1623] border border-marketplace-border text-slate-300 px-2.5 py-1 rounded-full font-semibold">{categories.find(c => c.id === selectedCategory)?.name}</span>}
              {isFree && <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">Free</span>}
              {!isFree && minPrice && <span className="text-xs bg-[#0f1623] border border-marketplace-border text-slate-300 px-2.5 py-1 rounded-full font-semibold">Min: ${minPrice}</span>}
              {!isFree && maxPrice && <span className="text-xs bg-[#0f1623] border border-marketplace-border text-slate-300 px-2.5 py-1 rounded-full font-semibold">Max: ${maxPrice}</span>}
              {sortBy !== "newest" && <span className="text-xs bg-[#0f1623] border border-marketplace-border text-slate-300 px-2.5 py-1 rounded-full font-semibold">Sorted: {sortBy === "oldest" ? "Oldest" : sortBy === "price_asc" ? "Price: Low to High" : sortBy === "price_desc" ? "Price: High to Low" : sortBy === "name_asc" ? "Name: A-Z" : "Name: Z-A"}</span>}
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-400 font-bold flex items-center gap-1 transition-colors ml-auto cursor-pointer">
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          {/* Action Notification Banner */}
          {toast && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 mb-4 transition-all duration-200 ${
              toast.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-semibold flex-1">{toast.message}</p>
              <button onClick={() => setToast(null)} className="p-1 hover:opacity-80 transition-opacity cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-[#121826] border border-marketplace-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-800/60" />
                  <div className="p-4 space-y-2">
                    <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                    <div className="h-3 bg-slate-800/40 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 gap-5 bg-[#121826] border border-marketplace-border rounded-2xl">
              <Package className="w-14 h-14 text-slate-700" />
              <div className="text-center space-y-1.5">
                <p className="text-base font-extrabold text-white">No assets found</p>
                <p className="text-sm text-slate-500 font-semibold">Try adjusting your search or filters.</p>
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs font-bold text-marketplace-primary hover:opacity-80 transition-opacity cursor-pointer">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {assets.map(asset => (
                <div
                  key={asset.assetID}
                  className="group relative bg-[#0f1623] border border-marketplace-border hover:border-slate-600 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                >
                  {/* Thumbnail */}
                  <Link href={`/marketplace/assets/${asset.assetID}`} className="block relative h-44 bg-slate-900 overflow-hidden shrink-0">
                    {asset.thumbnailSasUrl ? (
                      <img src={asset.thumbnailSasUrl} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                        <Package className="w-10 h-10 text-slate-700" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {asset.isFree && (
                        <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> FREE
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    <div className="flex-1 space-y-1">
                      <Link href={`/marketplace/assets/${asset.assetID}`} className="font-extrabold text-white text-sm line-clamp-1 hover:text-marketplace-primary transition-colors">
                        {asset.fileName}
                      </Link>
                      {asset.categoryName && (
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{asset.categoryName}</span>
                      )}
                      {asset.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{asset.description}</p>
                      )}
                    </div>

                    {/* Price + Add to Cart */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-marketplace-border/50">
                      <div>
                        {asset.isFree ? (
                          <span className="text-emerald-400 font-extrabold text-sm">FREE</span>
                        ) : (
                          <span className="text-white font-extrabold text-base">${asset.price.toFixed(2)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(asset)}
                        disabled={addingToCart === asset.assetID}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer disabled:opacity-60 active:scale-95 ${
                          cartSuccess === asset.assetID
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                            : "bg-marketplace-primary/10 border border-marketplace-primary/20 text-marketplace-primary hover:bg-marketplace-primary hover:text-white"
                        }`}
                      >
                        {addingToCart === asset.assetID ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : cartSuccess === asset.assetID ? (
                          <><Zap className="w-3.5 h-3.5" /> Added!</>
                        ) : (
                          <><ShoppingCart className="w-3.5 h-3.5" /> {asset.isFree ? "Get Free" : "Add to Cart"}</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {paged && paged.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-marketplace-border bg-[#121826] text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: paged.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === paged.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`dot-${i}`} className="text-slate-600 text-xs font-bold px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        page === p
                          ? "bg-marketplace-primary text-white shadow-lg shadow-red-900/20"
                          : "border border-marketplace-border bg-[#121826] text-slate-400 hover:text-white hover:border-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }

              <button
                onClick={() => setPage(p => Math.min(paged.totalPages, p + 1))}
                disabled={page >= paged.totalPages}
                className="p-2 rounded-xl border border-marketplace-border bg-[#121826] text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          <div
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/95 border-red-500/30 text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-bold flex-1 leading-relaxed text-slate-100">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="shrink-0 p-0.5 hover:opacity-75 transition-opacity cursor-pointer text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
