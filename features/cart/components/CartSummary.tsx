import React from 'react';
import { CartSummaryDto } from '../types/cart';
import { useRouter } from 'next/navigation';

interface CartSummaryProps {
  summary: CartSummaryDto;
  currency: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ summary, currency }) => {
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm sticky top-24">
      <h2 className="font-serif text-[22px] font-normal text-brand-navy mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-brand-muted text-sm font-semibold">
          <span>Items ({summary.itemCount})</span>
          <span>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency || 'USD',
              maximumFractionDigits: 0
            }).format(summary.totalPrice)}
          </span>
        </div>
        
        <div className="border-t border-brand-border pt-4 flex justify-between items-center">
          <span className="text-base font-semibold text-brand-navy">Total</span>
          <span className="font-serif text-[28px] font-normal text-brand-primary">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency || 'USD',
              maximumFractionDigits: 0
            }).format(summary.totalPrice)}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleCheckout}
        className="w-full py-3.5 px-4 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-lg transition-all duration-200 shadow-sm active:scale-[0.98] cursor-pointer"
      >
        Proceed to Checkout
      </button>
      
      <p className="mt-4 text-xs text-center text-brand-muted">
        Secure checkout powered by Stripe.
      </p>
    </div>
  );
};
