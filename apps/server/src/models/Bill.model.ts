import mongoose, { Document, Schema } from 'mongoose'
import { Bill } from '@finance-app/shared'

// Bill interface extending Document
export interface IBill extends Document, Omit<Bill, '_id' | 'userId' | 'createdAt'> {
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  daysUntilDue: number
  isOverdue: boolean
  calculateNextDueDate(): Date
  markAsPaid(paidDate?: Date): Promise<IBill>
  updateAmount(newAmount: number): Promise<IBill>
  shouldSendReminder(): boolean
  deactivate(): Promise<IBill>
}

// Bill model interface for static methods
export interface IBillModel extends mongoose.Model<IBill> {
  findActiveByUser(userId: string): Promise<IBill[]>
  findUpcomingBills(userId: string, days?: number): Promise<IBill[]>
  findOverdueBills(userId: string): Promise<IBill[]>
  findByCategory(userId: string, category: string): Promise<IBill[]>
}

// Bill schema
const billSchema = new Schema<IBill>({
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
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Amount must be a positive number'
    }
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  recurrence: {
    type: {
      type: String,
      required: true,
      enum: ['monthly', 'weekly', 'yearly', 'custom']
    },
    interval: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    endDate: {
      type: Date
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  isAutoPay: {
    type: Boolean,
    default: false
  },
  reminderDays: [{
    type: Number,
    min: 0,
    max: 365
  }],
  lastPaidDate: {
    type: Date,
    index: true
  },
  nextDueDate: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
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
billSchema.index({ userId: 1, isActive: 1 })
billSchema.index({ userId: 1, nextDueDate: 1 })
billSchema.index({ userId: 1, category: 1 })
billSchema.index({ nextDueDate: 1, isActive: 1 })

// Virtual for days until due
billSchema.virtual('daysUntilDue').get(function() {
  const now = new Date()
  const dueDate = new Date(this.nextDueDate)
  const diffTime = dueDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for is overdue
billSchema.virtual('isOverdue').get(function() {
  return new Date() > new Date(this.nextDueDate)
})

// Pre-save middleware to calculate next due date
billSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('dueDate') || this.isModified('recurrence')) {
    this.nextDueDate = this.calculateNextDueDate()
  }
  next()
})

// Static method to find active bills by user
billSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ nextDueDate: 1 })
}

// Static method to find upcoming bills
billSchema.statics.findUpcomingBills = function(userId: string, days: number = 30) {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)
  
  return this.find({
    userId,
    isActive: true,
    nextDueDate: { $lte: endDate }
  }).sort({ nextDueDate: 1 })
}

// Static method to find overdue bills
billSchema.statics.findOverdueBills = function(userId: string) {
  return this.find({
    userId,
    isActive: true,
    nextDueDate: { $lt: new Date() }
  }).sort({ nextDueDate: 1 })
}

// Static method to find bills by category
billSchema.statics.findByCategory = function(userId: string, category: string) {
  return this.find({ userId, category, isActive: true })
}

// Instance method to calculate next due date
billSchema.methods.calculateNextDueDate = function() {
  const currentDue = new Date(this.dueDate)
  const now = new Date()
  
  // If the original due date is in the future, use it
  if (currentDue > now) {
    return currentDue
  }
  
  // Calculate next occurrence based on recurrence
  let nextDue = new Date(currentDue)
  
  switch (this.recurrence.type) {
    case 'weekly':
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + (7 * this.recurrence.interval))
      }
      break
    case 'monthly':
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + this.recurrence.interval)
      }
      break
    case 'yearly':
      while (nextDue <= now) {
        nextDue.setFullYear(nextDue.getFullYear() + this.recurrence.interval)
      }
      break
    case 'custom':
      // For custom recurrence, add interval as days
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + this.recurrence.interval)
      }
      break
  }
  
  // Check if we've passed the end date
  if (this.recurrence.endDate && nextDue > this.recurrence.endDate) {
    this.isActive = false
  }
  
  return nextDue
}

// Instance method to mark as paid
billSchema.methods.markAsPaid = function(paidDate: Date = new Date()) {
  this.lastPaidDate = paidDate
  this.nextDueDate = this.calculateNextDueDate()
  return this.save()
}

// Instance method to update amount
billSchema.methods.updateAmount = function(newAmount: number) {
  this.amount = newAmount
  return this.save()
}

// Instance method to check if reminder should be sent
billSchema.methods.shouldSendReminder = function() {
  const daysUntilDue = this.daysUntilDue
  return this.reminderDays.includes(daysUntilDue) && daysUntilDue >= 0
}

// Instance method to deactivate bill
billSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

export const BillModel = mongoose.model<IBill, IBillModel>('Bill', billSchema)