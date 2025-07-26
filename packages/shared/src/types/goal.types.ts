export interface Goal {
  _id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  type: GoalType
  priority: GoalPriority
  isActive: boolean
  isAchieved: boolean
  achievedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export type GoalType = 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'vacation' | 'purchase' | 'other'

export type GoalPriority = 'low' | 'medium' | 'high'

export interface GoalData {
  name: string
  description?: string
  targetAmount: number
  targetDate: Date
  type: GoalType
  priority?: GoalPriority
}

export interface GoalProgress {
  goalId: string
  name: string
  targetAmount: number
  currentAmount: number
  progressPercentage: number
  remainingAmount: number
  daysRemaining: number
  isOnTrack: boolean
  projectedCompletionDate?: Date
  monthlyContributionNeeded: number
}

export interface GoalContribution {
  _id: string
  goalId: string
  userId: string
  amount: number
  date: Date
  transactionId?: string
  notes?: string
  createdAt: Date
}