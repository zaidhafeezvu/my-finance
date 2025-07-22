"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToTwoDecimals = exports.calculatePercentageChange = exports.formatPercentage = exports.parseCurrency = exports.formatCurrency = void 0;
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const parseCurrency = (currencyString) => {
    // Remove currency symbols and parse as float
    const cleanString = currencyString.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanString) || 0;
};
exports.parseCurrency = parseCurrency;
const formatPercentage = (value, decimals = 2) => {
    return `${(value * 100).toFixed(decimals)}%`;
};
exports.formatPercentage = formatPercentage;
const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0)
        return newValue > 0 ? 1 : 0;
    return (newValue - oldValue) / oldValue;
};
exports.calculatePercentageChange = calculatePercentageChange;
const roundToTwoDecimals = (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
};
exports.roundToTwoDecimals = roundToTwoDecimals;
//# sourceMappingURL=currency.utils.js.map