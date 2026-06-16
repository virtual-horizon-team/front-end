"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";

export default function MarketplaceCartBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const response = await api<{ success: boolean; data: { count: number } }>("/api/Cart/count?cartType=Asset");
      if (response?.success && response?.data) {
        setCount(response.data.count);
      }
    } catch (err) {
      console.error("Failed to fetch marketplace cart count:", err);
    }
  };

  useEffect(() => {
    fetchCount();

    const handleUpdate = () => {
      fetchCount();
    };

    window.addEventListener("cart-updated", handleUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
    };
  }, []);

  return (
    <Link
      href="/marketplace/cart"
      className="p-2 text-slate-300 hover:text-white transition-all duration-150 relative group flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10"
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="w-4.5 h-4.5 text-slate-300" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white bg-marketplace-primary rounded-full min-w-[15px] h-[15px] border border-marketplace-bg shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
