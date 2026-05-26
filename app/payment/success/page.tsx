"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/hooks/useCartStore';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const { fetchCount } = useCartStore();

  useEffect(() => {
    if (sessionId) {
      const timer = setTimeout(() => {
        setIsVerifying(false);
        fetchCount();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, fetchCount]);

  if (!sessionId && !isVerifying) {
    return (
      <div className="container mx-auto px-6 py-20 text-center max-w-2xl min-h-[60vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-brand-primary text-6xl mb-4 leading-none">error</span>
        <h1 className="font-serif text-[28px] text-brand-navy font-normal mb-3">Invalid Payment Session</h1>
        <p className="text-brand-muted mb-8">We couldn't verify your payment session.</p>
        <Link href="/cart" className="text-brand-primary hover:text-brand-hover font-semibold transition-colors flex items-center">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-2xl text-center min-h-[80vh] flex flex-col justify-center items-center">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin opacity-20"></div>
        </div>
      </div>

      <h1 className="font-serif text-[36px] md:text-[44px] text-brand-navy font-normal mb-4">
        Payment Successful!
      </h1>
      
      {isVerifying ? (
        <p className="text-base font-semibold text-brand-muted mb-8 animate-pulse">
          Verifying your order and unlocking your courses...
        </p>
      ) : (
        <p className="text-base font-semibold text-brand-muted mb-8 leading-relaxed max-w-lg mx-auto">
          🎉 Thank you for your purchase! Your premium courses have been unlocked and added directly to your learning dashboard.
        </p>
      )}

      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm mb-10 text-left w-full">
        <h2 className="font-serif text-[20px] font-normal text-brand-navy border-b border-brand-border pb-4 mb-4">
          What happens next?
        </h2>
        <ul className="space-y-4 text-[15px] text-brand-muted font-medium">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 select-none">1</span>
            <p>You will receive an email receipt confirming your order and payment details.</p>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 select-none">2</span>
            <p>Your purchased courses are now ready and available in your personal classroom dashboard.</p>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 select-none">3</span>
            <p>You can start engaging with VR Lab scenarios and lecturing models immediately!</p>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <Link 
          href="/profile/courses"
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-hover active:scale-95 transition-all duration-150 shadow-sm flex items-center justify-center cursor-pointer"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Go to My Courses
        </Link>
        <Link 
          href="/courses" 
          className="w-full sm:w-auto px-8 py-3.5 bg-white text-brand-primary border border-brand-border font-semibold rounded-lg hover:bg-brand-peach/20 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer"
        >
          <Search className="w-5 h-5 mr-2" />
          Browse More Courses
        </Link>
      </div>
    </div>
  );
}
