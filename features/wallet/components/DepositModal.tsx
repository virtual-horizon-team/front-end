"use client";

import React, { useState } from "react";
import { walletApi } from "../lib/wallet-api";
import { showToast } from "@/features/instructor/components/Toast";
import { X, CreditCard, Loader2 } from "lucide-react";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const presets = [10, 50, 100, 250];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 1.00 || numericAmount > 100000.00) {
            setError("Top-up amount must be between $1.00 and $100,000.00.");
            return;
        }

        setLoading(true);

        try {
            const successUrl = `${window.location.origin}/wallet/success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/wallet/cancel`;

            const response = await walletApi.chargeWallet({
                amount: numericAmount,
                successUrl,
                cancelUrl,
            });

            if (response && response.checkoutUrl) {
                // Redirect user to Stripe secure page
                window.location.href = response.checkoutUrl;
            } else {
                throw new Error("Stripe did not return a checkout URL.");
            }
        } catch (err: any) {
            console.error("Failed to initiate Stripe Checkout session", err);
            setError(err?.message || "Failed to initiate secure checkout session.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-brand-border/60 shadow-xl overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-brand-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-brand-peach/40 text-brand-primary rounded-xl flex items-center justify-center">
                            <CreditCard size={18} />
                        </div>
                        <h3 className="font-extrabold text-brand-navy text-lg">Deposit Funds</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-brand-muted hover:text-brand-text p-1.5 hover:bg-brand-soft rounded-lg cursor-pointer transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Modal Body */}
                    <div className="p-6 space-y-5">
                        <p className="text-xs text-brand-muted leading-relaxed font-medium">
                            Add funds securely to your virtual wallet balance using Stripe Checkout. You can use credit card payments to load funds instantenously.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        {/* Presets Grid */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-brand-navy block">Quick Select Preset</span>
                            <div className="grid grid-cols-4 gap-2.5">
                                {presets.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                            setAmount(preset.toFixed(2));
                                            setError(null);
                                        }}
                                        className={`py-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                                            parseFloat(amount) === preset
                                                ? "border-brand-primary bg-brand-primary text-white"
                                                : "border-brand-border bg-white text-brand-text hover:bg-brand-soft"
                                        }`}
                                    >
                                        ${preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="deposit-amount" className="text-xs font-bold text-brand-navy block">
                                Custom Top-up Amount ($)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-brand-muted">$</span>
                                <input
                                    id="deposit-amount"
                                    type="number"
                                    min="1.00"
                                    max="100000.00"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="0.00"
                                    disabled={loading}
                                    required
                                    className="w-full text-sm pl-8 pr-4 py-3.5 rounded-xl border border-brand-border bg-white text-brand-text font-semibold focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                                />
                            </div>
                            <span className="text-[10px] text-brand-muted leading-relaxed block font-medium">
                                Minimum deposit allowed: $1.00. Maximum single transaction: $100,000.00.
                            </span>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 bg-brand-soft border-t border-brand-border/60 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-3 rounded-xl border border-brand-border hover:bg-brand-soft text-brand-text text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-primary text-white text-xs font-bold transition-all shadow-md shadow-brand-navy/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Redirecting to Stripe...</span>
                                </>
                            ) : (
                                <span>Proceed to Checkout</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
