"use client";

import React, { useEffect, useState } from "react";
import WalletBalanceCard from "@/features/wallet/components/WalletBalanceCard";
import WithdrawalHistoryTable from "@/features/wallet/components/WithdrawalHistoryTable";
import WithdrawModal from "@/features/wallet/components/WithdrawModal";
import DepositModal from "@/features/wallet/components/DepositModal";
import { walletApi } from "@/features/wallet/lib/wallet-api";
import { profileApi } from "@/features/instructor/lib/profile-api";
import { WalletDto, WithdrawalRequestDto } from "@/features/wallet/types";
import { showToast } from "@/features/instructor/components/Toast";
import Link from "next/link";
import { Receipt } from "lucide-react";

export default function WalletPage() {
    const [isInstructor, setIsInstructor] = useState<boolean>(false);
    const [wallet, setWallet] = useState<WalletDto | null>(null);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequestDto[]>([]);
    const [loadingWallet, setLoadingWallet] = useState<boolean>(true);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

    const loadProfile = async () => {
        try {
            const profile = await profileApi.getProfile();
            setIsInstructor(profile?.profileType?.toLowerCase() === "instructor");
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };

    const loadWalletData = async () => {
        setLoadingWallet(true);
        try {
            const data = await walletApi.getMyWallet();
            setWallet(data);
        } catch (err: any) {
            console.error("Failed to load wallet balance", err);
            showToast("error", "Failed to retrieve wallet balance");
        } finally {
            setLoadingWallet(false);
        }
    };

    const loadWithdrawalHistory = async () => {
        setLoadingWithdrawals(true);
        try {
            const data = await walletApi.getWithdrawalRequests();
            // Sort by date descending
            const sorted = data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setWithdrawals(sorted);
        } catch (err: any) {
            console.error("Failed to load withdrawal requests", err);
        } finally {
            setLoadingWithdrawals(false);
        }
    };

    useEffect(() => {
        loadProfile();
        loadWalletData();
        loadWithdrawalHistory();
    }, []);

    const handleWithdrawSuccess = () => {
        loadWalletData();
        loadWithdrawalHistory();
    };

    const handleDepositSuccess = () => {
        loadWalletData();
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            {/* Page Title Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight">
                        My Wallet
                    </h1>
                    <p className="text-brand-muted mt-1.5 text-sm md:text-base font-medium">
                        Manage your personal virtual wallet balance, deposit funds using Stripe, and view payout logs.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-brand-soft border border-brand-border text-brand-navy text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                    >
                        <Receipt size={16} />
                        View Transaction Ledger
                    </Link>
                </div>
            </div>

            <div className="mt-8 space-y-10">
                {/* Wallet Balance Card */}
                <div>
                    <h3 className="text-lg font-bold text-brand-text mb-4">Balance Summary</h3>
                    {loadingWallet ? (
                        <div className="w-full h-[220px] bg-white border border-brand-border rounded-3xl animate-shimmer" />
                    ) : wallet ? (
                        <WalletBalanceCard
                            balance={wallet.balance}
                            currency={wallet.currency}
                            updatedAt={wallet.updatedAt}
                            onWithdrawClick={() => setIsWithdrawModalOpen(true)}
                            onDepositClick={() => setIsDepositModalOpen(true)}
                        />
                    ) : (
                        <div className="bg-white border border-brand-border rounded-3xl p-8 text-center text-brand-muted text-sm font-semibold">
                            Failed to load wallet dashboard. Please check your credentials or refresh.
                        </div>
                    )}
                </div>

                {/* Withdrawal Request logs */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-brand-text">Payout History</h3>
                        <span className="text-xs text-brand-muted font-medium">Shows bank wire & PayPal requests</span>
                    </div>
                    <WithdrawalHistoryTable requests={withdrawals} isLoading={loadingWithdrawals} />
                </div>
            </div>

            {/* Withdraw Modal Dialog */}
            {wallet && (
                <WithdrawModal
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    availableBalance={wallet.balance}
                    currency={wallet.currency}
                    onSuccess={handleWithdrawSuccess}
                />
            )}

            {/* Deposit Modal Dialog */}
            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
            />
        </div>
    );
}
