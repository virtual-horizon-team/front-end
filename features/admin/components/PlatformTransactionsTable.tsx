"use client";

import React from "react";
import { AdminTransactionDto, TransactionStatus } from "../lib/wallet-api";
import { ArrowDownLeft, ArrowUpRight, HelpCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface PlatformTransactionsTableProps {
    transactions: AdminTransactionDto[];
    totalCount: number;
    skip: number;
    take: number;
    onPageChange: (newSkip: number) => void;
    isLoading: boolean;
}

export default function PlatformTransactionsTable({
    transactions,
    totalCount,
    skip,
    take,
    onPageChange,
    isLoading,
}: PlatformTransactionsTableProps) {
    const isPlatformCredit = (type: string) => {
        const lowerType = type?.toLowerCase() || "";
        return (
            lowerType.includes("sale") ||
            lowerType.includes("cut") ||
            lowerType.includes("deposit") ||
            lowerType.includes("credit")
        );
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case "Success":
            case "Completed":
                return "bg-green-50 text-green-700 border-green-200";
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Failed":
            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const currentPage = Math.floor(skip / take) + 1;
    const hasMore = skip + take < totalCount;

    const handlePrev = () => {
        if (skip >= take) {
            onPageChange(skip - take);
        }
    };

    const handleNext = () => {
        if (hasMore) {
            onPageChange(skip + take);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                    <div
                        key={n}
                        className="w-full h-16 bg-white border border-brand-border rounded-2xl animate-shimmer"
                    />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 shadow-xs">
                <HelpCircle className="w-14 h-14 text-brand-muted/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-navy mb-2">No Transactions Logged</h3>
                <p className="text-sm text-brand-muted max-w-sm mx-auto">
                    The platform's financial ledger is currently empty. Any sales or payouts processed by the system will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-soft border-b border-brand-border text-xs font-bold text-brand-muted uppercase tracking-wider">
                                <th className="px-6 py-4.5">Transaction ID</th>
                                <th className="px-6 py-4.5">Date & Time</th>
                                <th className="px-6 py-4.5">Type</th>
                                <th className="px-6 py-4.5">Description</th>
                                <th className="px-6 py-4.5">Status</th>
                                <th className="px-6 py-4.5 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60 text-sm font-medium text-brand-text">
                            {transactions.map((tx) => {
                                const credit = isPlatformCredit(tx.type);
                                const statusColor = getStatusColor(tx.status);
                                const formattedDate = new Date(tx.createdAt).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <tr key={tx.id} className="hover:bg-brand-soft/20 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono text-brand-muted">
                                            {tx.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 text-brand-muted font-normal">{formattedDate}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold tracking-wide uppercase text-brand-muted">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate font-normal text-brand-muted" title={tx.description}>
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${statusColor}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-extrabold ${credit ? "text-green-600" : "text-red-600"}`}>
                                            {credit ? "+" : "-"} ${tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-brand-border/60">
                    {transactions.map((tx) => {
                        const credit = isPlatformCredit(tx.type);
                        const statusColor = getStatusColor(tx.status);
                        const formattedDate = new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <div key={tx.id} className="p-5 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${credit ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600"}`}>
                                        {credit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase text-brand-text">{tx.type}</span>
                                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-semibold border ${statusColor}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-brand-muted truncate mt-0.5" title={tx.description}>
                                            {tx.description}
                                        </p>
                                        <span className="text-[10px] text-slate-400 block mt-1">{formattedDate}</span>
                                    </div>
                                </div>
                                <span className={`text-sm font-extrabold shrink-0 ${credit ? "text-green-600" : "text-red-600"}`}>
                                    {credit ? "+" : "-"} ${tx.amount.toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Simple Pagination Controls */}
            {(skip > 0 || hasMore) && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-brand-muted font-semibold">
                        Page {currentPage} (Ledger Log)
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={skip === 0}
                            className="p-2.5 rounded-xl border border-brand-border bg-white text-brand-text hover:bg-brand-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            aria-label="Previous Page"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!hasMore}
                            className="p-2.5 rounded-xl border border-brand-border bg-white text-brand-text hover:bg-brand-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            aria-label="Next Page"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
