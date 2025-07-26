import mongoose, { Document, Schema } from 'mongoose'
import { Goal, GoalType, GoalPriority } from '@finance-app/shared'

// Goal interface extending Document
export interface IGoal extends Document, Omit<Goal, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  progressPercentage: number
  remainingAmount: number
  daysRemaining: number
  monthlyContributionNeeded: number
  isOnTrack: boolean
  addContribution(amount: number): Promise<IGoal>
  calculateExpectedProgress(): number
  calculateProjectedCompletionDate(): Date | null
  updateTarget(newTargetAmount: number, newTargetDate?: Date): Promise<IGoal>
  deactivate(): Promise<IGoal>
}

// Goal model interface for static methods
export interface IGoalModel extends mongoose.Model<IGoal> {
  findActiveByUser(userId: string): Promise<IGoal[]>
  findByType(userId: string, type: GoalType): Promise<IGoal[]>
  findAchievedGoals(userId: string): Promise<IGoal[]>
  findByPriority(userId: string, priority: GoalPriority): Promise<IGoal[]>
  findOverdueGoals(userId: string): Promise<IGoal[]>
}

// Goal schema
const goalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value > 0
      },
      message: 'Target amount must be a positive number'
    }
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Current amount must be a non-negative number'
    }
  },
  targetDate: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function(value: Date) {
        return value > new Date()
      },
      message: 'Target date must be in the future'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['savings', 'debt_payoff', 'investment', 'emergency_fund', 'vacation', 'purchase', 'other'] as GoalType[],
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'] as GoalPriority[],
    default: 'medium',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isAchieved: {
    type: Boolean,
    default: false,
    index: true
  },
  achievedDate: {
    type: Date,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret._id = ret._id.toString()
      ret.userId = ret.userId.toString()
      delete ret.__v
      return ret
    }
  }
})

// Indexes
goalSchema.index({ userId: 1, isActive: 1 })
goalSchema.index({ userId: 1, type: 1 })
goalSchema.index({ userId: 1, priority: 1 })
goalSchema.index({ userId: 1, targetDate: 1 })
goalSchema.index({ userId: 1, isAchieved: 1 })

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 ? Math.min(100, (this.currentAmount / this.targetAmount) * 100) : 0
})

// Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount)
})

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
  const now = new Date()
  const targetDate = new Date(this.targetDate)
  const diffTime = targetDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

// Virtual for monthly contribution needed
goalSchema.virtual('monthlyContributionNeeded').get(function() {
  const remaining = this.remainingAmount
  const daysRemaining = this.daysRemaining
  
  if (daysRemaining <= 0 || remaining <= 0) return 0
  
  const monthsRemaining = daysRemaining / 30.44 // Average days per month
  return monthsRemaining > 0 ? remaining / monthsRemaining : remaining
})

// Virtual for is on track
goalSchema.virtual('isOnTrack').get(function() {
  const expectedProgress = this.calculateExpectedProgress()
  return this.progressPercentage >= expectedProgress - 5 // 5% tolerance
})

// Pre-save middleware to check if goal is achieved
goalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount && !this.isAchieved) {
    this.isAchieved = true
    this.achievedDate = new Date()
  } else if (this.currentAmount < this.targetAmount && this.isAchieved) {
    this.isAchieved = false
    this.achievedDate = undefined
  }
  next()
})

// Static method to find active goals by user
goalSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ priority: -1, targetDate: 1 })
}

// Static method to find goals by type
goalSchema.statics.findByType = function(userId: string, type: GoalType) {
  return this.find({ userId, type, isActive: true })
}

// Static method to find achieved goals
goalSchema.statics.findAchievedGoals = function(userId: string) {
  return this.find({ userId, isAchieved: true }).sort({ achievedDate: -1 })
}

// Static method to find goals by priority
goalSchema.statics.findByPriority = function(userId: string, priority: GoalPriority) {
  return this.find({ userId, priority, isActive: true })
}

// Static method to find overdue goals
goalSchema.statics.findOverdueGoals = function(userId: string) {
  return this.find({
    userId,
    isActive: true,
    isAchieved: false,
    targetDate: { $lt: new Date() }
  })
}

// Instance method to add contribution
goalSchema.methods.addContribution = function(amount: number) {
  this.currentAmount = Math.min(this.targetAmount, this.currentAmount + amount)
  return this.save()
}

// Instance method to calculate expected progress
goalSchema.methods.calculateExpectedProgress = function() {
  const now = new Date()
  const createdAt = new Date(this.createdAt)
  const targetDate = new Date(this.targetDate)
  
  const totalDuration = targetDate.getTime() - createdAt.getTime()
  const elapsed = now.getTime() - createdAt.getTime()
  
  if (totalDuration <= 0) return 100
  if (elapsed <= 0) return 0
  
  return Math.min(100, (elapsed / totalDuration) * 100)
}

// Instance method to calculate projected completion date
goalSchema.methods.calculateProjectedCompletionDate = function() {
  if (this.isAchieved) return this.achievedDate
  
  const remaining = this.remainingAmount
  if (remaining <= 0) return new Date()
  
  // Calculate average monthly contribution over the last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  const contributionsSinceCreation = this.currentAmount
  const daysSinceCreation = Math.max(1, (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const dailyAverage = contributionsSinceCreation / daysSinceCreation
  
  if (dailyAverage <= 0) return null
  
  const daysToCompletion = remaining / dailyAverage
  const projectedDate = new Date()
  projectedDate.setDate(projectedDate.getDate() + daysToCompletion)
  
  return projectedDate
}

// Instance method to update target
goalSchema.methods.updateTarget = function(newTargetAmount: number, newTargetDate?: Date) {
  this.targetAmount = newTargetAmount
  if (newTargetDate) {
    this.targetDate = newTargetDate
  }
  return this.save()
}

// Instance method to deactivate goal
goalSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

export const GoalModel = mongoose.model<IGoal, IGoalModel>('Goal', goalSchema)