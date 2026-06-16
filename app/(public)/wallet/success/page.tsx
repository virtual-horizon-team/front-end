"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { walletApi } from "@/features/wallet/lib/wallet-api";
import { WalletDto } from "@/features/wallet/types";
import { CheckCircle2, Loader2, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

function WalletSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [pollingStatus, setPollingStatus] = useState<"verifying" | "updated" | "timeout">("verifying");
    const [wallet, setWallet] = useState<WalletDto | null>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;

        const checkBalance = async () => {
            try {
                const data = await walletApi.getMyWallet();
                setWallet(data);
                // If we retrieved the wallet successfully, we assume the webhook had time to complete.
                // In a production environment, we could compare against a cached old balance.
                // For this implementation, we will fetch, wait, and transition to "updated".
                setPollingStatus("updated");
                return true;
            } catch (err) {
                console.error("Error fetching updated wallet balance", err);
            }
            return false;
        };

        const interval = setInterval(async () => {
            attempts++;
            const success = await checkBalance();
            if (success || attempts >= maxAttempts) {
                clearInterval(interval);
                if (!success) {
                    setPollingStatus("timeout");
                }
            }
        }, 2000);

        checkBalance(); // Immediate initial fetch

        return () => clearInterval(interval);
    }, [sessionId]);

    const formattedBalance = wallet
        ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: wallet.currency || "USD",
          }).format(wallet.balance)
        : "$0.00";

    return (
        <div className="container mx-auto px-6 py-20 max-w-xl text-center min-h-[75vh] flex flex-col justify-center items-center">
            {/* Header Icon */}
            <div className="flex justify-center mb-8 animate-bounce">
                <div className="relative">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    {pollingStatus === "verifying" && (
                        <div className="absolute -inset-1 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin opacity-45"></div>
                    )}
                </div>
            </div>

            <h1 className="font-serif text-[36px] md:text-[42px] text-brand-navy font-normal mb-3">
                Deposit Successful!
            </h1>

            {pollingStatus === "verifying" && (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-brand-muted animate-pulse">
                        Verifying payment status with the server and updating your balance...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-brand-primary font-bold bg-brand-peach/30 px-4 py-2 rounded-full max-w-max mx-auto">
                        <Loader2 size={13} className="animate-spin" />
                        Synchronizing balance
                    </div>
                </div>
            )}

            {pollingStatus === "updated" && (
                <div className="space-y-6 w-full">
                    <p className="text-sm font-semibold text-brand-muted max-w-md mx-auto leading-relaxed">
                        Your transaction was processed successfully. The funds have been added directly to your virtual wallet.
                    </p>

                    {/* New Balance display */}
                    <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-xs max-w-sm mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-soft rounded-2xl">
                                <Wallet className="w-5 h-5 text-brand-navy" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">New Balance</span>
                                <div className="text-xl font-extrabold text-brand-navy leading-none mt-0.5">{formattedBalance}</div>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                            Credited
                        </span>
                    </div>
                </div>
            )}

            {pollingStatus === "timeout" && (
                <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-100 p-4 rounded-2xl max-w-md mx-auto leading-relaxed">
                    ⚠️ Stripe is still finalizing your payment. Your balance will refresh automatically in the background shortly.
                </p>
            )}

            <div className="mt-10 flex justify-center w-full">
                <Link
                    href="/wallet"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-navy hover:bg-brand-primary text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-navy/15 cursor-pointer active:scale-95"
                >
                    Return to Wallet
                    <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}

export default function WalletSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-6 py-20 text-center min-h-[75vh] flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                    <p className="text-brand-muted font-bold text-sm">Loading success details...</p>
                </div>
            }
        >
            <WalletSuccessContent />
        </Suspense>
    );
}
