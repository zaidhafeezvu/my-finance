export const TRANSACTION_CATEGORIES = {
  INCOME: {
    SALARY: 'Salary',
    FREELANCE: 'Freelance',
    INVESTMENT: 'Investment Income',
    BUSINESS: 'Business Income',
    OTHER: 'Other Income',
  },
  EXPENSES: {
    FOOD: 'Food & Dining',
    TRANSPORTATION: 'Transportation',
    SHOPPING: 'Shopping',
    ENTERTAINMENT: 'Entertainment',
    BILLS: 'Bills & Utilities',
    HEALTHCARE: 'Healthcare',
    EDUCATION: 'Education',
    TRAVEL: 'Travel',
    PERSONAL: 'Personal Care',
    HOME: 'Home & Garden',
    INSURANCE: 'Insurance',
    TAXES: 'Taxes',
    FEES: 'Fees & Charges',
    OTHER: 'Other Expenses',
  },
} as const

export const BUDGET_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Home & Garden',
  'Insurance',
  'Other Expenses',
] as const

export const BILL_CATEGORIES = [
  'Utilities',
  'Insurance',
  'Subscriptions',
  'Loans',
  'Credit Cards',
  'Rent/Mortgage',
  'Phone/Internet',
  'Other',
] as const