"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    adminWalletApi, 
    AdminWalletDto, 
    AdminTransactionDto, 
    AdminWithdrawalDto 
} from "@/features/admin/lib/wallet-api";
import PlatformWalletCard from "@/features/admin/components/PlatformWalletCard";
import PlatformTransactionsTable from "@/features/admin/components/PlatformTransactionsTable";
import AdminWithdrawalsList from "@/features/admin/components/AdminWithdrawalsList";
import ProcessWithdrawalModal from "@/features/admin/components/ProcessWithdrawalModal";
import { showToast } from "@/features/instructor/components/Toast";
import { Landmark, ArrowLeftRight, Coins } from "lucide-react";

export default function AdminWalletPage() {
    // Sub-tab selection state
    const [subTab, setSubTab] = useState<"ledger" | "payouts">("ledger");

    // Platform Balance & Metadata
    const [wallet, setWallet] = useState<AdminWalletDto | null>(null);
    const [loadingWallet, setLoadingWallet] = useState(true);

    // Platform Transaction Ledger logs
    const [transactions, setTransactions] = useState<AdminTransactionDto[]>([]);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [txSkip, setTxSkip] = useState(0);
    const txTake = 10;

    // Withdrawal / Payout lists
    const [pendingPayouts, setPendingPayouts] = useState<AdminWithdrawalDto[]>([]);
    const [allPayouts, setAllPayouts] = useState<AdminWithdrawalDto[]>([]);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [loadingPayouts, setLoadingPayouts] = useState(true);
    const [payoutTab, setPayoutTab] = useState<"pending" | "all">("pending");
    const [payoutSkip, setPayoutSkip] = useState(0);
    const payoutTake = 10;

    // Modal control for processing a pending withdrawal
    const [processingWithdrawal, setProcessingWithdrawal] = useState<AdminWithdrawalDto | null>(null);

    // Fetch platform wallet balance
    const fetchWallet = useCallback(async () => {
        setLoadingWallet(true);
        try {
            const data = await adminWalletApi.getPlatformWallet();
            setWallet(data);
        } catch (err: any) {
            console.error("Failed to fetch platform wallet info", err);
            showToast("error", "Failed to retrieve platform wallet balance");
        } finally {
            setLoadingWallet(false);
        }
    }, []);

    // Fetch transaction logs
    const fetchTransactions = useCallback(async () => {
        setLoadingTransactions(true);
        try {
            const data = await adminWalletApi.getPlatformTransactions(txSkip, txTake);
            const txList = data.transactions || data.Transactions || [];
            const count = data.totalCount ?? data.TotalCount ?? 0;
            setTransactions(txList);
            setTotalTransactions(count);
        } catch (err: any) {
            console.error("Failed to fetch platform transactions", err);
            showToast("error", "Failed to load transaction ledger records");
        } finally {
            setLoadingTransactions(false);
        }
    }, [txSkip, txTake]);

    // Fetch pending & historical payouts
    const fetchPayouts = useCallback(async () => {
        setLoadingPayouts(true);
        try {
            const [pendingData, allDataResponse] = await Promise.all([
                adminWalletApi.getPendingWithdrawals(),
                adminWalletApi.getWithdrawals(payoutSkip, payoutTake)
            ]);
            setPendingPayouts(pendingData || []);
            
            const reqs = allDataResponse.requests || allDataResponse.Requests || [];
            const count = allDataResponse.totalCount ?? allDataResponse.TotalCount ?? 0;
            setAllPayouts(reqs);
            setTotalPayouts(count);
        } catch (err: any) {
            console.error("Failed to load payout list", err);
            showToast("error", "Failed to fetch payout requests");
        } finally {
            setLoadingPayouts(false);
        }
    }, [payoutSkip, payoutTake]);

    // Trigger initial requests
    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    // Load ledger logs on tab swap or offset shift
    useEffect(() => {
        if (subTab === "ledger") {
            fetchTransactions();
        }
    }, [subTab, fetchTransactions]);

    // Load payouts lists on tab swap or offset shift
    useEffect(() => {
        if (subTab === "payouts") {
            fetchPayouts();
        }
    }, [subTab, fetchPayouts]);

    const handleRefreshAll = () => {
        fetchWallet();
        if (subTab === "ledger") {
            fetchTransactions();
        } else {
            fetchPayouts();
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-wider mb-1">
                        <Landmark size={14} className="stroke-[2.5]" />
                        <span>Platform Treasury & Finance</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight">
                        Financials Control Panel
                    </h1>
                    <p className="text-sm text-brand-muted mt-1 max-w-2xl font-normal leading-relaxed">
                        Track platform sales margins, check global credit/debit ledger entries, and approve payout transfers for instructors.
                    </p>
                </div>
            </div>

            {/* Platform Balance Panel */}
            {loadingWallet ? (
                <div className="w-full h-[220px] bg-white border border-brand-border rounded-3xl animate-shimmer" />
            ) : wallet ? (
                <PlatformWalletCard
                    balance={wallet.balance}
                    currency={wallet.currency}
                    updatedAt={wallet.updatedAt}
                    onRefresh={handleRefreshAll}
                />
            ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-sm font-semibold">
                    Failed to fetch platform financials data. Please check connection and try again.
                </div>
            )}

            {/* Subpages Navigation Row */}
            <div className="flex bg-brand-soft border border-brand-border/80 p-1 rounded-2xl max-w-sm">
                <button
                    onClick={() => setSubTab("ledger")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                        subTab === "ledger"
                            ? "bg-white text-brand-navy shadow-xs border border-brand-border/40"
                            : "text-brand-muted hover:text-brand-text"
                    }`}
                >
                    <ArrowLeftRight size={14} />
                    Platform Ledger
                </button>
                <button
                    onClick={() => setSubTab("payouts")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                        subTab === "payouts"
                            ? "bg-white text-brand-navy shadow-xs border border-brand-border/40"
                            : "text-brand-muted hover:text-brand-text"
                    }`}
                >
                    <Coins size={14} />
                    Payout Requests
                </button>
            </div>

            {/* Selected Panel Content */}
            <div className="pt-2">
                {subTab === "ledger" ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-brand-navy text-[17px]">Transaction Ledger Logs</h3>
                        </div>
                        <PlatformTransactionsTable
                            transactions={transactions}
                            totalCount={totalTransactions}
                            skip={txSkip}
                            take={txTake}
                            onPageChange={setTxSkip}
                            isLoading={loadingTransactions}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-brand-navy text-[17px]">Instructor Cash-outs</h3>
                        </div>
                        <AdminWithdrawalsList
                            pendingRequests={pendingPayouts}
                            allRequests={allPayouts}
                            totalCount={totalPayouts}
                            onProcessRequest={setProcessingWithdrawal}
                            currentTab={payoutTab}
                            onTabChange={setPayoutTab}
                            skip={payoutSkip}
                            take={payoutTake}
                            onPageChange={setPayoutSkip}
                            isLoading={loadingPayouts}
                        />
                    </div>
                )}
            </div>

            {/* Process Withdrawal Modal */}
            {processingWithdrawal && (
                <ProcessWithdrawalModal
                    request={processingWithdrawal}
                    onClose={() => setProcessingWithdrawal(null)}
                    onSuccess={handleRefreshAll}
                />
            )}
        </div>
    );
}
