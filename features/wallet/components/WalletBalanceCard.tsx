"use client";

import React from "react";
import { Wallet, ArrowUpRight, Clock, Plus } from "lucide-react";

interface WalletBalanceCardProps {
    balance: number;
    currency: string;
    updatedAt: string;
    onWithdrawClick: () => void;
    onDepositClick: () => void;
}

export default function WalletBalanceCard({
    balance,
    currency,
    updatedAt,
    onWithdrawClick,
    onDepositClick,
}: WalletBalanceCardProps) {
    const formattedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
    }).format(balance);

    const lastUpdated = updatedAt
        ? new Date(updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "N/A";

    const canWithdraw = balance > 0;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-brand-navy text-white p-8 shadow-xl border border-brand-border/10 flex flex-col justify-between min-h-[220px]">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-brand-primary/25 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                            <Wallet className="w-6 h-6 text-brand-peach" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">
                            Available Balance
                        </span>
                    </div>
                    <span className="text-xs font-bold bg-brand-primary/30 border border-brand-primary/40 text-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
                        Active Wallet
                    </span>
                </div>

                {/* Balance amount */}
                <div className="mb-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {formattedBalance}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">{currency || "USD"} Base Currency</span>
                </div>
            </div>

            {/* Footer with action & last updated */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Last Updated: {lastUpdated}</span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onDepositClick}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-150 active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} />
                        Deposit Funds
                    </button>
                    <button
                        onClick={onWithdrawClick}
                        disabled={!canWithdraw}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95 cursor-pointer ${
                            canWithdraw
                                ? "bg-brand-primary hover:bg-brand-hover text-white shadow-md shadow-brand-primary/25"
                                : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                        }`}
                    >
                        Withdraw Funds
                        <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
