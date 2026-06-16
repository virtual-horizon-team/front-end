import { api } from "@/features/auth/lib/api-client";
import { 
    WalletDto, 
    WalletTransactionDto, 
    CreateWithdrawalRequestDto, 
    WithdrawalRequestDto 
} from "../types";

export interface WalletChargeRequestDto {
    amount: number;
    successUrl: string;
    cancelUrl: string;
}

export interface WalletChargeResponseDto {
    sessionId: string;
    checkoutUrl: string;
}

export const walletApi = {
    getMyWallet: () => {
        return api<WalletDto>("/api/Wallet/my-wallet");
    },
    getTransactions: (skip = 0, take = 20) => {
        return api<{ transactions: WalletTransactionDto[]; totalCount: number }>(
            `/api/Wallet/transactions?skip=${skip}&take=${take}`
        );
    },
    requestWithdrawal: (payload: CreateWithdrawalRequestDto) => {
        return api<WithdrawalRequestDto>("/api/Wallet/withdraw", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    getWithdrawalRequests: () => {
        return api<WithdrawalRequestDto[]>("/api/Wallet/withdrawals");
    },
    chargeWallet: (payload: WalletChargeRequestDto) => {
        return api<WalletChargeResponseDto>("/api/Wallet/charge", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
};
