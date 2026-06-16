"use client";

import React, { useState } from "react";
import { AdminWithdrawalDto, adminWalletApi, WithdrawalStatus } from "../lib/wallet-api";
import { showToast } from "@/features/instructor/components/Toast";
import { X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ProcessWithdrawalModalProps {
    request: AdminWithdrawalDto;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProcessWithdrawalModal({
    request,
    onClose,
    onSuccess,
}: ProcessWithdrawalModalProps) {
    const [adminNotes, setAdminNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (status: WithdrawalStatus) => {
        // Enforce notes if rejecting, to explain to the instructor why their request was denied
        if (status === "Rejected" && !adminNotes.trim()) {
            showToast("error", "Please provide administrative feedback explaining the rejection reason");
            return;
        }

        setSubmitting(true);
        try {
            await adminWalletApi.updateWithdrawalStatus(request.id, {
                status,
                adminNotes: adminNotes.trim(),
            });
            showToast(
                "success",
                `Withdrawal request has been marked as ${status.toLowerCase()} successfully!`
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update withdrawal request", err);
            showToast("error", err?.message || "Failed to process withdrawal request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-3xl max-w-md w-full border border-brand-border/60 shadow-xl overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-brand-border/60 flex items-center justify-between">
                    <h3 className="font-extrabold text-brand-navy text-lg">Process Withdrawal Request</h3>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-brand-muted hover:text-brand-text p-1.5 hover:bg-brand-soft rounded-lg cursor-pointer transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    {/* Summary Info */}
                    <div className="bg-brand-soft rounded-2xl p-4 border border-brand-border/40 space-y-2.5">
                        <div className="flex justify-between items-center text-xs text-brand-muted">
                            <span>Instructor Email</span>
                            <span className="font-bold text-brand-navy">{request.userEmail}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-brand-muted">
                            <span>Payout Method</span>
                            <span className="font-bold text-brand-text">
                                {request.method === "BankTransfer" ? "Bank Transfer" : "PayPal"}
                            </span>
                        </div>
                        <div className="flex justify-between items-start text-xs text-brand-muted">
                            <span className="shrink-0 mr-4">Payout Account</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-brand-border text-brand-navy break-all text-right">
                                {request.payoutDetails}
                            </span>
                        </div>
                        <div className="border-t border-brand-border/60 pt-2.5 flex justify-between items-center">
                            <span className="text-xs font-bold text-brand-navy">Request Amount</span>
                            <span className="text-xl font-black text-brand-primary">
                                ${request.amount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-1.5">
                        <label htmlFor="admin-notes" className="text-xs font-bold text-brand-navy block">
                            Administrative Notes / Feedback
                        </label>
                        <textarea
                            id="admin-notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder={
                                request.method === "BankTransfer"
                                    ? "Add transaction ID, bank details check reference, or reasoning if rejecting..."
                                    : "Add PayPal payout transaction reference, or reasoning if rejecting..."
                            }
                            rows={3}
                            disabled={submitting}
                            className="w-full text-sm p-3.5 rounded-xl border border-brand-border bg-white text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary resize-none transition-colors"
                        />
                        <span className="text-[10px] text-brand-muted leading-relaxed block">
                            If rejecting, feedback notes are mandatory. They will be shared directly with the instructor.
                        </span>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-6 bg-brand-soft border-t border-brand-border/60 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => handleSubmit("Rejected")}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                        {submitting ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
                        <span>Reject Request</span>
                    </button>
                    <button
                        onClick={() => handleSubmit("Completed")}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-navy hover:bg-brand-primary text-white text-xs font-bold transition-all shadow-md shadow-brand-navy/10 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                        {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        <span>Approve & Complete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
