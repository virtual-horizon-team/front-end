"use client";

import React from "react";
import { XCircle, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function WalletCancelPage() {
    return (
        <div className="container mx-auto px-6 py-20 max-w-xl text-center min-h-[75vh] flex flex-col justify-center items-center">
            {/* Header Icon */}
            <div className="flex justify-center mb-8 animate-pulse">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
            </div>

            <h1 className="font-serif text-[36px] md:text-[42px] text-brand-navy font-normal mb-3">
                Payment Cancelled
            </h1>

            <div className="space-y-6 max-w-md mx-auto">
                <p className="text-sm font-semibold text-brand-muted leading-relaxed">
                    The Stripe Checkout session was cancelled before completion. No funds were debited from your card, and your wallet balance remains unchanged.
                </p>

                <div className="flex items-center gap-3 bg-brand-soft border border-brand-border/60 p-4 rounded-2xl text-left">
                    <AlertCircle size={20} className="text-brand-navy flex-shrink-0" />
                    <span className="text-xs font-semibold text-brand-navy leading-normal">
                        You can safely restart the deposit or attempt the transaction again at any time using a different payment option if necessary.
                    </span>
                </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <Link
                    href="/wallet"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-navy hover:bg-brand-primary text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-navy/15 cursor-pointer active:scale-95"
                >
                    Return to Wallet
                    <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
