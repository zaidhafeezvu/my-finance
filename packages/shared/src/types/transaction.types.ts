export interface Transaction {
  _id: string
  userId: string
  accountId: string
  plaidTransactionId?: string
  amount: number
  description: string
  merchantName?: string
  category: TransactionCategory
  date: Date
  isManual: boolean
  tags: string[]
  notes?: string
  isDuplicate: boolean
  createdAt: Date
}

export interface TransactionCategory {
  primary: string
  detailed: string
}

export interface TransactionData {
  accountId: string
  amount: number
  description: string
  merchantName?: string
  category: TransactionCategory
  date: Date
  tags?: string[]
  notes?: string
}

export interface TransactionFilters {
  accountIds?: string[]
  categories?: string[]
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  search?: string
  tags?: string[]
  isManual?: boolean
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  categoryBreakdown: CategorySummary[]
}

export interface CategorySummary {
  category: string
  amount: number
  count: number
  percentage: number
}