"use client";

import React, { useState } from "react";
import { X, Loader2, DollarSign, Send, Landmark } from "lucide-react";
import { PayoutMethod } from "../types";
import { walletApi } from "../lib/wallet-api";
import { showToast } from "@/features/instructor/components/Toast";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    currency: string;
    onSuccess: () => void;
}

export default function WithdrawModal({
    isOpen,
    onClose,
    availableBalance,
    currency,
    onSuccess,
}: WithdrawModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [method, setMethod] = useState<PayoutMethod>("BankTransfer");
    const [payoutDetails, setPayoutDetails] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setErrorMsg("Please enter a valid amount greater than 0");
            return;
        }

        if (numericAmount > availableBalance) {
            setErrorMsg(`Insufficient funds. You can withdraw up to $${availableBalance.toFixed(2)}`);
            return;
        }

        if (!payoutDetails.trim()) {
            setErrorMsg("Please enter your payout details (e.g. IBAN/Swift details or PayPal email)");
            return;
        }

        setIsSubmitting(true);
        try {
            await walletApi.requestWithdrawal({
                amount: numericAmount,
                method,
                payoutDetails: payoutDetails.trim(),
            });
            showToast("success", "Withdrawal request submitted successfully!");
            onSuccess();
            onClose();
            // Reset fields
            setAmount("");
            setPayoutDetails("");
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Failed to submit withdrawal request. Please try again.");
            showToast("error", err.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-brand-border animate-fade-in mx-4 z-10">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-brand-muted hover:text-brand-text p-2 rounded-xl hover:bg-brand-soft transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-brand-peach/50 rounded-2xl">
                        <Landmark className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-brand-text">Request Payout</h2>
                        <p className="text-xs text-brand-muted mt-0.5">Transfer funds from your Virtual Horizon wallet</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Available balance indicator */}
                    <div className="bg-brand-soft rounded-2xl p-4 border border-brand-border/60 flex justify-between items-center text-sm font-semibold">
                        <span className="text-brand-muted">Limit Available:</span>
                        <span className="text-brand-text">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: currency || "USD",
                            }).format(availableBalance)}
                        </span>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-text">Withdrawal Amount</label>
                        <div className="relative rounded-2xl shadow-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <DollarSign className="h-5 w-5 text-brand-muted" />
                            </div>
                            <input
                                type="number"
                                step="any"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                disabled={isSubmitting}
                                className="block w-full rounded-2xl border border-brand-border pl-11 pr-4 py-3 text-[15px] font-medium text-brand-text placeholder-brand-muted/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Payout Method */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-text">Payout Method</label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as PayoutMethod)}
                            disabled={isSubmitting}
                            className="block w-full rounded-2xl border border-brand-border px-4 py-3 text-[15px] font-medium text-brand-text bg-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all cursor-pointer disabled:opacity-50"
                        >
                            <option value="BankTransfer">Bank Wire Transfer</option>
                            <option value="PayPal">PayPal Invoice</option>
                        </select>
                    </div>

                    {/* Payout Details */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-brand-text">Payout Details</label>
                        <textarea
                            rows={3}
                            value={payoutDetails}
                            onChange={(e) => setPayoutDetails(e.target.value)}
                            disabled={isSubmitting}
                            placeholder={
                                method === "BankTransfer"
                                    ? "Provide Bank Name, Account Name, IBAN code, and Swift/BIC code"
                                    : "Enter your registered PayPal email account"
                            }
                            className="block w-full rounded-2xl border border-brand-border px-4 py-3 text-[15px] font-medium text-brand-text placeholder-brand-muted/50 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50 resize-none"
                        />
                    </div>

                    {/* Error display */}
                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold">
                            {errorMsg}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-3 rounded-xl border border-brand-border bg-white text-brand-text hover:bg-brand-soft text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand-primary/10 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span>Submit Request</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
