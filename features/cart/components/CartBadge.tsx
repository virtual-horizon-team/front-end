"use client";

import React, { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '../hooks/useCartStore';

export const CartBadge = () => {
  const { count, fetchCount } = useCartStore();

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return (
    <Link href="/cart" className="relative text-brand-muted hover:text-brand-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-brand-soft">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full min-w-[16px] h-[16px]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};
