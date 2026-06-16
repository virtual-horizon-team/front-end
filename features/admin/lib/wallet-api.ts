import { api } from "@/features/auth/lib/api-client";

export interface AdminWalletDto {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

export type PlatformTransactionType = 
    | "CourseSale" 
    | "AssetSale" 
    | "PlatformCut" 
    | "Withdrawal" 
    | "Debit" 
    | "Credit"
    | string;

export type TransactionStatus = "Pending" | "Success" | "Failed" | "Cancelled" | string;

export interface AdminTransactionDto {
    id: string;
    walletId: string;
    amount: number;
    type: PlatformTransactionType;
    status: TransactionStatus;
    description: string;
    referenceId: string;
    createdAt: string;
}

export type WithdrawalMethod = "BankTransfer" | "PayPal" | string;
export type WithdrawalStatus = "Pending" | "Processing" | "Approved" | "Completed" | "Rejected" | "Failed" | string;

export interface AdminWithdrawalDto {
    id: string;
    userId: string;
    userEmail: string;
    walletId: string;
    amount: number;
    currency: string;
    method: WithdrawalMethod;
    payoutDetails: string;
    status: WithdrawalStatus;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    processedAt: string | null;
}

export interface UpdateWithdrawalRequest {
    status: WithdrawalStatus;
    adminNotes: string;
}

export interface AdminTransactionsResponse {
    transactions?: AdminTransactionDto[];
    Transactions?: AdminTransactionDto[];
    totalCount?: number;
    TotalCount?: number;
}

export interface AdminWithdrawalsResponse {
    requests?: AdminWithdrawalDto[];
    Requests?: AdminWithdrawalDto[];
    totalCount?: number;
    TotalCount?: number;
}

export const adminWalletApi = {
    /**
     * Fetch the overall platform wallet metrics.
     */
    getPlatformWallet: () => {
        return api<AdminWalletDto>("/api/admin/wallets/platform-wallet");
    },

    /**
     * Fetch platform transaction history logs.
     */
    getPlatformTransactions: (skip: number = 0, take: number = 20) => {
        return api<AdminTransactionsResponse>(
            `/api/admin/wallets/platform-wallet/transactions?skip=${skip}&take=${take}`
        );
    },

    /**
     * Fetch only pending withdrawal requests from instructors.
     */
    getPendingWithdrawals: () => {
        return api<AdminWithdrawalDto[]>("/api/admin/wallets/withdrawals/pending");
    },

    /**
     * Fetch all withdrawal logs.
     */
    getWithdrawals: (skip: number = 0, take: number = 20) => {
        return api<AdminWithdrawalsResponse>(`/api/admin/wallets/withdrawals?skip=${skip}&take=${take}`);
    },

    /**
     * Update the status of a withdrawal request.
     */
    updateWithdrawalStatus: (requestId: string, data: UpdateWithdrawalRequest) => {
        return api<AdminWithdrawalDto>(`/api/admin/wallets/withdrawals/${requestId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /**
     * Fetch the CSV data as a string and download it in the browser.
     */
    exportWithdrawalsCsv: async (): Promise<string> => {
        return api<string>("/api/admin/wallets/withdrawals/export-csv", {
            headers: {
                "Accept": "text/plain",
            },
        });
    }
};
