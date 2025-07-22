export interface Budget {
  _id: string
  userId: string
  name: string
  category: string
  limit: number
  period: BudgetPeriod
  spent: number
  startDate: Date
  endDate: Date
  isActive: boolean
  notifications: BudgetNotifications
  createdAt: Date
}

export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly'

export interface BudgetNotifications {
  at75Percent: boolean
  at90Percent: boolean
  atLimit: boolean
}

export interface BudgetData {
  name: string
  category: string
  limit: number
  period: BudgetPeriod
  notifications?: BudgetNotifications
}

export interface BudgetStatus {
  budgetId: string
  name: string
  category: string
  limit: number
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining: number
}

export interface BudgetReport {
  period: {
    startDate: Date
    endDate: Date
  }
  budgets: BudgetPerformance[]
  totalBudgeted: number
  totalSpent: number
  overallPerformance: 'under' | 'on-track' | 'over'
}

export interface BudgetPerformance {
  budgetId: string
  name: string
  category: string
  budgeted: number
  spent: number
  variance: number
  performance: 'under' | 'on-track' | 'over'
}