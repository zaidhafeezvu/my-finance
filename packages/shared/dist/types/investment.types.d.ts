export interface Investment {
    _id: string;
    userId: string;
    accountId: string;
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
    purchasePrice: number;
    purchaseDate: Date;
    marketValue: number;
    gainLoss: number;
    gainLossPercent: number;
    lastUpdated: Date;
}
export interface Portfolio {
    userId: string;
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    investments: Investment[];
    assetAllocation: AssetAllocation[];
    lastUpdated: Date;
}
export interface AssetAllocation {
    type: AssetType;
    value: number;
    percentage: number;
}
export type AssetType = 'stocks' | 'bonds' | 'etf' | 'mutual_funds' | 'crypto' | 'cash' | 'other';
export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    lastUpdated: Date;
}
//# sourceMappingURL=investment.types.d.ts.map