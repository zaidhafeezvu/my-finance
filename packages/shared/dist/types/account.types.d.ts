export interface Account {
    _id: string;
    userId: string;
    plaidAccountId?: string;
    institutionName: string;
    accountName: string;
    accountType: AccountType;
    balance: AccountBalance;
    isActive: boolean;
    lastSynced: Date;
    createdAt: Date;
}
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
export interface AccountBalance {
    current: number;
    available?: number;
    limit?: number;
}
export interface BankCredentials {
    institutionId: string;
    publicToken: string;
}
export interface AccountSyncResult {
    accountId: string;
    success: boolean;
    transactionsAdded: number;
    lastSyncDate: Date;
    error?: string;
}
//# sourceMappingURL=account.types.d.ts.map