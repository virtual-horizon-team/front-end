"use client";

import React, { useState } from "react";
import { adminWalletApi } from "../lib/wallet-api";
import { showToast } from "@/features/instructor/components/Toast";
import { Wallet, Clock, Download, Loader2 } from "lucide-react";

interface PlatformWalletCardProps {
    balance: number;
    currency: string;
    updatedAt: string;
    onRefresh: () => void;
}

export default function PlatformWalletCard({
    balance,
    currency,
    updatedAt,
    onRefresh,
}: PlatformWalletCardProps) {
    const [exporting, setExporting] = useState(false);

    const formattedBalance = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
    }).format(balance);

    const lastUpdated = new Date(updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleExportCsv = async () => {
        setExporting(true);
        try {
            const csvContent = await adminWalletApi.exportWithdrawalsCsv();
            
            // Generate dynamic file download in browser
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            const timestamp = new Date().toISOString().slice(0, 10);
            link.setAttribute("href", url);
            link.setAttribute("download", `platform_withdrawals_${timestamp}.csv`);
            link.style.visibility = "hidden";
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast("success", "Payout records exported successfully!");
        } catch (err: any) {
            console.error("Failed to export withdrawals CSV", err);
            showToast("error", "Failed to compile and export CSV records");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="relative overflow-hidden bg-brand-navy rounded-3xl p-6 md:p-8 text-white border border-white/5 shadow-lg flex flex-col justify-between min-h-[220px]">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
                            <Wallet size={18} className="text-white" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                            Platform Treasury
                        </span>
                    </div>
                    <span className="text-xs font-bold bg-white/10 border border-white/15 text-slate-200 px-3 py-1 rounded-full uppercase tracking-wider">
                        Platform Commission Base
                    </span>
                </div>

                {/* Balance display */}
                <div className="mb-6">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                        {formattedBalance}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">{currency || "USD"} Treasury Balance</span>
                </div>
            </div>

            {/* Footer actions */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={14} />
                    <span>Last Updated: {lastUpdated}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportCsv}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-md shadow-brand-primary/15 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {exporting ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Download size={13} className="stroke-[2.5]" />
                        )}
                        <span>Export Payouts CSV</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
