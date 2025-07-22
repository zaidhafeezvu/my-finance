import { Currency } from '../types/common.types';
export declare const formatCurrency: (amount: number, currency?: Currency) => string;
export declare const parseCurrency: (currencyString: string) => number;
export declare const formatPercentage: (value: number, decimals?: number) => string;
export declare const calculatePercentageChange: (oldValue: number, newValue: number) => number;
export declare const roundToTwoDecimals: (amount: number) => number;
//# sourceMappingURL=currency.utils.d.ts.map