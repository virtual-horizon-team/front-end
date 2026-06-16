export type TransactionStatus = "Pending" | "Success" | "Failed" | "Cancelled";
export type WithdrawalStatus = "Pending" | "Approved" | "Processing" | "Completed" | "Rejected" | "Failed";
export type PayoutMethod = "BankTransfer" | "PayPal";

export interface WalletDto {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    updatedAt: string;
}

export interface WalletTransactionDto {
    id: string;
    walletId: string;
    amount: number;
    type: string;
    status: TransactionStatus;
    description: string;
    referenceId: string | null;
    createdAt: string;
}

export interface CreateWithdrawalRequestDto {
    amount: number;
    method: PayoutMethod;
    payoutDetails: string;
}

export interface WithdrawalRequestDto {
    id: string;
    userId: string;
    userEmail: string;
    walletId: string;
    amount: number;
    currency: string;
    method: PayoutMethod;
    payoutDetails: string;
    status: WithdrawalStatus;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    processedAt: string | null;
}
