"use client";

import React, { useEffect, useState } from "react";
import LedgerTransactionsTable from "@/features/wallet/components/LedgerTransactionsTable";
import { walletApi } from "@/features/wallet/lib/wallet-api";
import { profileApi } from "@/features/instructor/lib/profile-api";
import { WalletTransactionDto } from "@/features/wallet/types";
import { showToast } from "@/features/instructor/components/Toast";
import Link from "next/link";
import { Wallet } from "lucide-react";

export default function TransactionsPage() {
    const [isInstructor, setIsInstructor] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [skip, setSkip] = useState<number>(0);
    const take = 10; // 10 items per page

    const loadProfile = async () => {
        try {
            const profile = await profileApi.getProfile();
            setIsInstructor(profile?.profileType?.toLowerCase() === "instructor");
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };

    const loadTransactions = async (currentSkip: number) => {
        setLoading(true);
        try {
            const res = await walletApi.getTransactions(currentSkip, take);
            setTransactions(res.transactions || []);
            setTotalCount(res.totalCount || 0);
        } catch (err: any) {
            console.error("Failed to load transactions", err);
            showToast("error", "Failed to retrieve transaction ledger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        loadTransactions(skip);
    }, [skip]);

    const handlePageChange = (newSkip: number) => {
        setSkip(newSkip);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            {/* Page Title Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight">
                        Transaction Ledger
                    </h1>
                    <p className="text-brand-muted mt-1.5 text-sm md:text-base font-medium">
                        View complete statement history of credits, platform commissions, deposits, and payouts.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Link
                        href="/wallet"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-brand-soft border border-brand-border text-brand-navy text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                    >
                        <Wallet size={16} />
                        Go to My Wallet
                    </Link>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-brand-text mb-4">Statement History</h3>
                    <LedgerTransactionsTable
                        transactions={transactions}
                        totalCount={totalCount}
                        skip={skip}
                        take={take}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
