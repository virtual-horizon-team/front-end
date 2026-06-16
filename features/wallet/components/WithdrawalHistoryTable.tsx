"use client";

import React from "react";
import { WithdrawalRequestDto, WithdrawalStatus } from "../types";
import { Clock, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

interface WithdrawalHistoryTableProps {
    requests: WithdrawalRequestDto[];
    isLoading: boolean;
}

export default function WithdrawalHistoryTable({
    requests,
    isLoading,
}: WithdrawalHistoryTableProps) {
    const getStatusStyles = (status: WithdrawalStatus) => {
        switch (status) {
            case "Pending":
            case "Processing":
                return {
                    bg: "bg-amber-50 text-amber-700 border-amber-200",
                    icon: Clock,
                };
            case "Approved":
            case "Completed":
                return {
                    bg: "bg-green-50 text-green-700 border-green-200",
                    icon: CheckCircle,
                };
            case "Rejected":
            case "Failed":
                return {
                    bg: "bg-red-50 text-red-700 border-red-200",
                    icon: AlertCircle,
                };
            default:
                return {
                    bg: "bg-slate-50 text-slate-700 border-slate-200",
                    icon: HelpCircle,
                };
        }
    };

    const formatPayoutDetails = (details: string, method: string) => {
        if (!details) return "";
        return details.length > 30 ? `${details.slice(0, 30)}...` : details;
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

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-white border border-brand-border rounded-2xl p-6 shadow-xs">
                <HelpCircle className="w-12 h-12 text-brand-muted/40 mx-auto mb-4" />
                <h3 className="text-base font-bold text-brand-text mb-1">No withdrawal history</h3>
                <p className="text-sm text-brand-muted max-w-xs mx-auto">
                    Any payout request you submit will show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-brand-soft border-b border-brand-border text-xs font-bold text-brand-muted uppercase tracking-wider">
                            <th className="px-6 py-4.5">Submitted Date</th>
                            <th className="px-6 py-4.5">Amount</th>
                            <th className="px-6 py-4.5">Method</th>
                            <th className="px-6 py-4.5">Payout Account</th>
                            <th className="px-6 py-4.5">Status</th>
                            <th className="px-6 py-4.5">Admin Response</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60 text-sm font-medium text-brand-text">
                        {requests.map((req) => {
                            const statusStyle = getStatusStyles(req.status);
                            const StatusIcon = statusStyle.icon;
                            const formattedDate = new Date(req.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            });

                            return (
                                <tr key={req.id} className="hover:bg-brand-soft/20 transition-colors">
                                    <td className="px-6 py-4">{formattedDate}</td>
                                    <td className="px-6 py-4 font-bold">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: req.currency || "USD",
                                        }).format(req.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold tracking-wide uppercase text-brand-muted">
                                        {req.method === "BankTransfer" ? "Bank Wire" : "PayPal"}
                                    </td>
                                    <td className="px-6 py-4 text-brand-muted font-normal" title={req.payoutDetails}>
                                        {formatPayoutDetails(req.payoutDetails, req.method)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}
                                        >
                                            <StatusIcon size={12} />
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-brand-muted font-normal max-w-xs truncate" title={req.adminNotes || ""}>
                                        {req.adminNotes || <span className="text-slate-400 font-light">—</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-brand-border/60">
                {requests.map((req) => {
                    const statusStyle = getStatusStyles(req.status);
                    const StatusIcon = statusStyle.icon;
                    const formattedDate = new Date(req.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    return (
                        <div key={req.id} className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-brand-muted font-medium">{formattedDate}</span>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyle.bg}`}
                                >
                                    <StatusIcon size={12} />
                                    {req.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold text-brand-text">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: req.currency || "USD",
                                    }).format(req.amount)}
                                </span>
                                <span className="text-xs font-bold tracking-wide uppercase text-brand-muted">
                                    {req.method === "BankTransfer" ? "Bank Wire" : "PayPal"}
                                </span>
                            </div>

                            <div className="bg-brand-soft/50 rounded-xl p-3 text-xs space-y-1.5 border border-brand-border/40">
                                <div>
                                    <span className="text-brand-muted font-semibold">Account details: </span>
                                    <span className="text-brand-text font-normal block mt-0.5 whitespace-pre-line">{req.payoutDetails}</span>
                                </div>
                                {req.adminNotes && (
                                    <div className="pt-1.5 border-t border-brand-border/40">
                                        <span className="text-brand-muted font-semibold">Admin notes: </span>
                                        <span className="text-brand-text font-normal block mt-0.5">{req.adminNotes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
