import { Currency } from '../types/common.types'

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and parse as float
  const cleanString = currencyString.replace(/[^0-9.-]+/g, '')
  return parseFloat(cleanString) || 0
}

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 1 : 0
  return (newValue - oldValue) / oldValue
}

export const roundToTwoDecimals = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}