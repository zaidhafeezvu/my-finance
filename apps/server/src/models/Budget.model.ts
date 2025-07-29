import mongoose, { Document, Schema } from 'mongoose'
import { Budget, BudgetPeriod } from '@finance-app/shared'

// Budget interface extending Document
export interface IBudget extends Document, Omit<Budget, '_id' | 'userId' | 'createdAt'> {
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
  daysRemaining: number
  updateSpent(amount: number): Promise<IBudget>
  addToSpent(amount: number): Promise<IBudget>
  checkNotificationThreshold(): string[]
  resetForNewPeriod(startDate: Date, endDate: Date): Promise<IBudget>
  deactivate(): Promise<IBudget>
}

// Budget model interface for static methods
export interface IBudgetModel extends mongoose.Model<IBudget> {
  findActiveByUser(userId: string): Promise<IBudget[]>
  findByCategory(userId: string, category: string): Promise<IBudget[]>
  findCurrentBudgets(userId: string): Promise<IBudget[]>
}

// Budget schema
const budgetSchema = new Schema<IBudget>({
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
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  limit: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Budget limit must be a positive number'
    }
  },
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'weekly', 'yearly'] as BudgetPeriod[]
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notifications: {
    at75Percent: {
      type: Boolean,
      default: true
    },
    at90Percent: {
      type: Boolean,
      default: true
    },
    atLimit: {
      type: Boolean,
      default: true
    }
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
budgetSchema.index({ userId: 1, isActive: 1 })
budgetSchema.index({ userId: 1, category: 1 })
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 })
budgetSchema.index({ endDate: 1 })

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.limit - this.spent)
})

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.limit > 0 ? (this.spent / this.limit) * 100 : 0
})

// Virtual for is over budget
budgetSchema.virtual('isOverBudget').get(function() {
  return this.spent > this.limit
})

// Virtual for days remaining
budgetSchema.virtual('daysRemaining').get(function() {
  const now = new Date()
  const endDate = new Date(this.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

// Pre-save middleware to validate date range
budgetSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'))
  } else {
    next()
  }
})

// Static method to find active budgets by user
budgetSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId, 
    isActive: true,
    endDate: { $gte: new Date() }
  }).sort({ createdAt: -1 })
}

// Static method to find budgets by category
budgetSchema.statics.findByCategory = function(userId: string, category: string) {
  return this.find({ userId, category, isActive: true })
}

// Static method to find current budgets
budgetSchema.statics.findCurrentBudgets = function(userId: string) {
  const now = new Date()
  return this.find({
    userId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
}

// Instance method to update spent amount
budgetSchema.methods.updateSpent = function(amount: number) {
  this.spent = Math.max(0, amount)
  return this.save()
}

// Instance method to add to spent amount
budgetSchema.methods.addToSpent = function(amount: number) {
  this.spent += amount
  return this.save()
}

// Instance method to check if notification threshold is reached
budgetSchema.methods.checkNotificationThreshold = function() {
  const percentage = this.percentageUsed
  const thresholds = []
  
  if (this.notifications.at75Percent && percentage >= 75 && percentage < 90) {
    thresholds.push('75')
  }
  if (this.notifications.at90Percent && percentage >= 90 && percentage < 100) {
    thresholds.push('90')
  }
  if (this.notifications.atLimit && percentage >= 100) {
    thresholds.push('limit')
  }
  
  return thresholds
}

// Instance method to reset budget for new period
budgetSchema.methods.resetForNewPeriod = function(startDate: Date, endDate: Date) {
  this.spent = 0
  this.startDate = startDate
  this.endDate = endDate
  return this.save()
}

// Instance method to deactivate budget
budgetSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

export const BudgetModel = mongoose.model<IBudget, IBudgetModel>('Budget', budgetSchema)