"use client";

import React from "react";
import { WalletTransactionDto, TransactionStatus } from "../types";
import { ArrowDownLeft, ArrowUpRight, HelpCircle, ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";

interface LedgerTransactionsTableProps {
    transactions: WalletTransactionDto[];
    totalCount: number;
    skip: number;
    take: number;
    onPageChange: (newSkip: number) => void;
    isLoading: boolean;
}

export default function LedgerTransactionsTable({
    transactions,
    totalCount,
    skip,
    take,
    onPageChange,
    isLoading,
}: LedgerTransactionsTableProps) {
    const isCredit = (type: string) => {
        const lowerType = type?.toLowerCase() || "";
        // Types that represent incoming money (credits to the wallet)
        return (
            lowerType.includes("sale") ||
            lowerType.includes("deposit") ||
            lowerType.includes("credit") ||
            lowerType.includes("refund") ||
            lowerType.includes("share") ||
            lowerType.includes("topup") ||
            lowerType.includes("charge")
        );
    };

    const getTransactionTypeDetails = (type: string) => {
        const lower = type?.toLowerCase() || "";
        if (lower.includes("coursesale")) {
            return {
                label: "Course Earnings",
                className: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
            };
        }
        if (lower.includes("assetsale")) {
            return {
                label: "Asset Earnings",
                className: "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
            };
        }
        if (lower.includes("topup") || lower.includes("charge")) {
            return {
                label: "Wallet Top-up",
                className: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
            };
        }
        if (lower.includes("withdraw")) {
            return {
                label: "Payout Withdrawal",
                className: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
            };
        }
        if (lower.includes("refund")) {
            return {
                label: "Refund Credit",
                className: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
            };
        }
        // Fallback
        return {
            label: type,
            className: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
        };
    };

    const getStatusColor = (status: TransactionStatus) => {
        switch (status) {
            case "Success":
                return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
            case "Failed":
            case "Cancelled":
                return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
        }
    };

    const currentPage = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(totalCount / take) || 1;

    const handlePrev = () => {
        if (skip >= take) {
            onPageChange(skip - take);
        }
    };

    const handleNext = () => {
        if (skip + take < totalCount) {
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
                <h3 className="text-lg font-bold text-brand-text mb-2">No Transactions Yet</h3>
                <p className="text-sm text-brand-muted max-w-sm mx-auto">
                    Your financial history is empty. Once you sell assets, courses, or request payouts, the records will appear here.
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
                                const credit = isCredit(tx.type);
                                const statusColor = getStatusColor(tx.status);
                                const typeDetails = getTransactionTypeDetails(tx.type);
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
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${typeDetails.className}`}>
                                                {typeDetails.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate font-semibold text-brand-text" title={tx.description}>
                                            {tx.description || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${statusColor}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-extrabold text-base ${credit ? "text-green-600" : "text-red-600"}`}>
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
                        const credit = isCredit(tx.type);
                        const statusColor = getStatusColor(tx.status);
                        const typeDetails = getTransactionTypeDetails(tx.type);
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
                                        {credit ? <Plus size={16} /> : <Minus size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeDetails.className}`}>
                                                {typeDetails.label}
                                            </span>
                                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-semibold border ${statusColor}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-brand-text truncate mt-1.5" title={tx.description}>
                                            {tx.description || "N/A"}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-brand-muted font-semibold">
                        Page {currentPage} of {totalPages} ({totalCount} records)
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
                            disabled={skip + take >= totalCount}
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
