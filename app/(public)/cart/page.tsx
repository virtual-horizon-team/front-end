"use client";

import React, { useEffect } from 'react';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import { CartItemCard } from '@/features/cart/components/CartItemCard';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, isLoading, error, fetchCart, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && !cart) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-container-max min-h-[60vh]">
        <div className="h-10 bg-brand-soft rounded-lg w-1/4 mb-10 animate-pulse"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-brand-soft rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="w-full lg:w-1/3">
            <div className="h-60 bg-brand-soft rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20 text-center max-w-container-max min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-brand-primary text-6xl mb-4 leading-none">error</span>
        <h1 className="font-serif text-[28px] text-brand-navy font-normal mb-3">Error loading cart</h1>
        <p className="text-brand-muted mb-8 max-w-md">{error}</p>
        <button 
          onClick={fetchCart}
          className="px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-hover active:scale-95 transition-all duration-150 shadow-sm cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24 text-center max-w-container-max min-h-[70vh] flex flex-col items-center justify-center">
        <div className="mb-6 p-6 bg-brand-peach/40 rounded-full text-brand-primary">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-[36px] text-brand-navy font-normal mb-4">Your cart is empty</h1>
        <p className="text-brand-muted mb-8 max-w-md leading-relaxed">
          Looks like you haven't added any courses to your cart yet. Discover our premium university-certified courses and start learning today!
        </p>
        <Link 
          href="/courses" 
          className="inline-block px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-hover active:scale-95 transition-all duration-150 shadow-sm"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const currency = cart.items.length > 0 ? (cart.items[0].currency || 'USD') : 'USD';

  return (
    <div className="container mx-auto px-6 py-12 max-w-container-max min-h-[70vh]">
      <h1 className="font-serif text-[38px] md:text-[44px] text-brand-navy font-normal mb-8">
        Shopping Cart
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="mb-4 text-sm font-semibold text-brand-muted uppercase tracking-wider">
            {cart.summary.itemCount} {cart.summary.itemCount === 1 ? 'Course' : 'Courses'} in Cart
          </div>
          <div className="space-y-4">
            {cart.items.map(item => (
              <CartItemCard 
                key={item.cartItemId} 
                item={item} 
                onRemove={removeItem} 
              />
            ))}
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <CartSummary summary={cart.summary} currency={currency} />
        </div>
      </div>
    </div>
  );
}
