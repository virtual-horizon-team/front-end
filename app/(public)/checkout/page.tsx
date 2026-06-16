"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import { initiateCheckout } from '@/features/checkout/services/checkout.service';
import { StripeCheckoutRequest } from '@/features/checkout/types/checkout';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, isLoading, fetchCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && !cart) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-3xl min-h-[60vh] animate-pulse">
        <div className="h-6 bg-brand-soft rounded w-1/4 mb-8"></div>
        <div className="h-8 bg-brand-soft rounded w-1/3 mb-8"></div>
        <div className="h-80 bg-brand-soft rounded-xl"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-20 text-center max-w-3xl min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-serif text-[28px] text-brand-navy font-normal mb-4">Nothing to checkout</h1>
        <p className="text-brand-muted mb-8">Your shopping cart is empty.</p>
        <Link href="/cart" className="text-brand-primary hover:text-brand-hover font-semibold transition-colors flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Return to Cart
        </Link>
      </div>
    );
  }

  const currency = cart.items.length > 0 ? (cart.items[0].currency || 'USD') : 'USD';

  const handlePayment = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const successUrl = `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/cart`;

      const request: StripeCheckoutRequest = {
        success_url: successUrl,
        cancel_url: cancelUrl,
        cart_type: "Course",
      };

      const response = await initiateCheckout(request);
      
      if (response.success && response.data?.session?.redirectUrl) {
        window.location.href = response.data.session.redirectUrl;
      } else {
        throw new Error('Invalid response from checkout service');
      }
    } catch (err: any) {
      let friendlyMessage = err.message || 'Failed to initiate checkout. Please try again.';
      if (friendlyMessage.toLowerCase().includes('failed to fetch') || friendlyMessage.toLowerCase().includes('load failed')) {
        friendlyMessage = 'Failed to connect to the payment server. This usually indicates that your backend encountered a 500 Internal Server Error, which typically happens when the Stripe Gateway is missing its secret API key. Please ensure "Stripe:SecretKey" (or "STRIPE_SECRET_KEY" / "Stripe__SecretKey") is correctly configured in your backend environment variables (on Railway or your local appsettings.json).';
      }
      setCheckoutError(friendlyMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl min-h-[70vh]">
      <Link href="/cart" className="inline-flex items-center text-sm font-semibold text-brand-muted hover:text-brand-navy mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Cart
      </Link>
      
      <h1 className="font-serif text-[38px] text-brand-navy font-normal mb-8">Checkout</h1>

      <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-brand-border">
          <h2 className="font-serif text-[20px] font-normal text-brand-navy mb-4">Order Review</h2>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cart.items.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-center py-2">
                <div className="flex-1 pr-4">
                  <h3 className="font-sans text-sm font-semibold text-brand-navy line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-brand-muted mt-0.5">{item.level}</p>
                </div>
                <div className="font-serif text-[16px] font-normal text-brand-primary">
                  {item.price !== null ? (
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.currency || 'USD',
                      maximumFractionDigits: 0
                    }).format(item.price)
                  ) : 'Free'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-brand-soft/20">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-brand-navy">Total due today</span>
            <span className="font-serif text-[28px] font-normal text-brand-primary">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 0
              }).format(cart.summary.totalPrice)}
            </span>
          </div>

          {checkoutError && (
            <div className="mb-6 p-4 bg-brand-peach/40 text-brand-primary rounded-lg text-sm font-medium">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 px-4 rounded-lg text-white font-semibold flex justify-center items-center transition-all cursor-pointer ${
              isProcessing 
                ? 'bg-brand-primary/60 cursor-not-allowed' 
                : 'bg-brand-primary hover:bg-brand-hover active:scale-[0.98] hover:shadow-md'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Redirecting to secure payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Proceed to Payment
              </>
            )}
          </button>
          
          <div className="mt-6 flex items-center justify-center text-xs font-semibold text-brand-muted">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 mr-2" />
            Guaranteed safe & secure checkout powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
