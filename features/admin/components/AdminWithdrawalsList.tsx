"use client";

import React, { useState } from "react";
import { AdminWithdrawalDto, WithdrawalStatus } from "../lib/wallet-api";
import { CreditCard, ArrowLeft, ArrowRight, HelpCircle, FileText, CheckCircle2 } from "lucide-react";

interface AdminWithdrawalsListProps {
    pendingRequests: AdminWithdrawalDto[];
    allRequests: AdminWithdrawalDto[];
    totalCount: number;
    onProcessRequest: (request: AdminWithdrawalDto) => void;
    currentTab: "pending" | "all";
    onTabChange: (tab: "pending" | "all") => void;
    skip: number;
    take: number;
    onPageChange: (newSkip: number) => void;
    isLoading: boolean;
}

export default function AdminWithdrawalsList({
    pendingRequests,
    allRequests,
    totalCount,
    onProcessRequest,
    currentTab,
    onTabChange,
    skip,
    take,
    onPageChange,
    isLoading,
}: AdminWithdrawalsListProps) {
    const getStatusColor = (status: WithdrawalStatus) => {
        switch (status) {
            case "Completed":
            case "Approved":
                return "bg-green-50 text-green-700 border-green-200";
            case "Pending":
            case "Processing":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Rejected":
            case "Failed":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const getMethodLabel = (method: string) => {
        return method === "BankTransfer" ? "Bank Transfer" : "PayPal";
    };

    const activeList = currentTab === "pending" ? pendingRequests : allRequests;
    
    const currentPage = Math.floor(skip / take) + 1;
    const hasMore = currentTab === "all" && skip + take < totalCount;

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

    return (
        <div className="space-y-6">
            {/* Horizontal Filter Tabs */}
            <div className="flex border-b border-brand-border/60">
                <button
                    onClick={() => onTabChange("pending")}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer relative ${
                        currentTab === "pending"
                            ? "border-brand-primary text-brand-primary"
                            : "border-transparent text-brand-muted hover:text-brand-text"
                    }`}
                >
                    Pending Approvals
                    {pendingRequests.length > 0 && (
                        <span className="ml-2 bg-brand-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => onTabChange("all")}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                        currentTab === "all"
                            ? "border-brand-primary text-brand-primary"
                            : "border-transparent text-brand-muted hover:text-brand-text"
                    }`}
                >
                    Historical Records
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div
                            key={n}
                            className="w-full h-20 bg-white border border-brand-border rounded-2xl animate-shimmer"
                        />
                    ))}
                </div>
            ) : activeList.length === 0 ? (
                <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 shadow-xs">
                    <CheckCircle2 className="w-14 h-14 text-green-500/20 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-brand-navy mb-2">
                        {currentTab === "pending" ? "All Caught Up!" : "No Historical Payouts"}
                    </h3>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                        {currentTab === "pending"
                            ? "There are no pending instructor withdrawals requiring your approval at this time."
                            : "No processed payout requests were found in the database logs."}
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
                        {/* Desktop View Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-brand-soft border-b border-brand-border text-xs font-bold text-brand-muted uppercase tracking-wider">
                                        <th className="px-6 py-4.5">Instructor Email</th>
                                        <th className="px-6 py-4.5">Payout Method</th>
                                        <th className="px-6 py-4.5">Account / Details</th>
                                        <th className="px-6 py-4.5">Amount</th>
                                        <th className="px-6 py-4.5">Status</th>
                                        <th className="px-6 py-4.5">Request Date</th>
                                        <th className="px-6 py-4.5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/60 text-sm font-medium text-brand-text">
                                    {activeList.map((req) => {
                                        const formattedDate = new Date(req.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        });

                                        return (
                                            <tr key={req.id} className="hover:bg-brand-soft/10 transition-colors">
                                                <td className="px-6 py-4 font-bold text-brand-navy">
                                                    {req.userEmail || "Unknown Instructor"}
                                                </td>
                                                <td className="px-6 py-4 text-brand-muted font-normal">
                                                    {getMethodLabel(req.method)}
                                                </td>
                                                <td className="px-6 py-4 max-w-[200px] truncate text-brand-muted font-mono text-xs" title={req.payoutDetails}>
                                                    {req.payoutDetails}
                                                </td>
                                                <td className="px-6 py-4 font-extrabold text-brand-text">
                                                    ${req.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-brand-muted font-normal">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {req.status === "Pending" ? (
                                                        <button
                                                            onClick={() => onProcessRequest(req)}
                                                            className="px-4 py-1.5 rounded-lg bg-brand-navy hover:bg-brand-primary text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            Process
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-brand-muted/50 font-normal">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile & Tablet Card Grid */}
                        <div className="lg:hidden divide-y divide-brand-border/60">
                            {activeList.map((req) => {
                                const formattedDate = new Date(req.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                });

                                return (
                                    <div key={req.id} className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-bold">{formattedDate}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-extrabold text-brand-navy text-sm break-all">{req.userEmail}</h4>
                                            <p className="text-xs text-brand-muted mt-1">
                                                Method: <span className="font-semibold text-brand-text">{getMethodLabel(req.method)}</span>
                                            </p>
                                            <p className="text-xs text-brand-muted font-mono mt-0.5 bg-brand-soft/60 px-2.5 py-1.5 rounded-lg border border-brand-border/50 break-all">
                                                {req.payoutDetails}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-sm font-black text-brand-text">
                                                Amount: <span className="text-lg">${req.amount.toFixed(2)}</span>
                                            </div>
                                            {req.status === "Pending" ? (
                                                <button
                                                    onClick={() => onProcessRequest(req)}
                                                    className="px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-primary text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                                                >
                                                    Process Payout
                                                </button>
                                            ) : (
                                                <span className="text-xs text-brand-muted/50 font-semibold">Processed</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pagination for History Tab */}
                    {currentTab === "all" && (skip > 0 || hasMore) && (
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs text-brand-muted font-semibold">
                                Page {currentPage} (Payout Logs)
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
            )}
        </div>
    );
}
