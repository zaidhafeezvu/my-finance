import mongoose, { Document, Schema } from 'mongoose'
import { Transaction, TransactionCategory } from '@finance-app/shared'

// Transaction interface extending Document
export interface ITransaction extends Document, Omit<Transaction, '_id' | 'userId' | 'accountId' | 'createdAt'> {
  userId: mongoose.Types.ObjectId
  accountId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  categorize(category: TransactionCategory): Promise<ITransaction>
  addTags(newTags: string[]): Promise<ITransaction>
  markAsDuplicate(): Promise<ITransaction>
}

// Transaction model interface for static methods
export interface ITransactionModel extends mongoose.Model<ITransaction> {
  findByUserWithFilters(userId: string, filters?: any): Promise<ITransaction[]>
  findPotentialDuplicates(userId: string, transaction: any): Promise<ITransaction[]>
}

// Transaction schema
const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  plaidTransactionId: {
    type: String,
    sparse: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value)
      },
      message: 'Amount must be a valid number'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  merchantName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    primary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    detailed: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    }
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  isManual: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isDuplicate: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret._id = ret._id.toString()
      ret.userId = ret.userId.toString()
      ret.accountId = ret.accountId.toString()
      delete ret.__v
      return ret
    }
  }
})

// Indexes
transactionSchema.index({ userId: 1, date: -1 })
transactionSchema.index({ userId: 1, accountId: 1, date: -1 })
transactionSchema.index({ userId: 1, 'category.primary': 1 })
transactionSchema.index({ userId: 1, amount: 1 })
transactionSchema.index({ plaidTransactionId: 1 }, { sparse: true })
transactionSchema.index({ tags: 1 })
transactionSchema.index({ isDuplicate: 1 })

// Text index for search functionality
transactionSchema.index({
  description: 'text',
  merchantName: 'text',
  'category.primary': 'text',
  'category.detailed': 'text',
  notes: 'text'
})

// Static method to find transactions by user with filters
transactionSchema.statics.findByUserWithFilters = function(userId: string, filters: any = {}) {
  const query: any = { userId }
  
  if (filters.accountIds && filters.accountIds.length > 0) {
    query.accountId = { $in: filters.accountIds }
  }
  
  if (filters.categories && filters.categories.length > 0) {
    query['category.primary'] = { $in: filters.categories }
  }
  
  if (filters.dateRange) {
    query.date = {
      $gte: filters.dateRange.startDate,
      $lte: filters.dateRange.endDate
    }
  }
  
  if (filters.amountRange) {
    query.amount = {
      $gte: filters.amountRange.min,
      $lte: filters.amountRange.max
    }
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags }
  }
  
  if (typeof filters.isManual === 'boolean') {
    query.isManual = filters.isManual
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search }
  }
  
  return this.find(query).sort({ date: -1 })
}

// Static method to find potential duplicates
transactionSchema.statics.findPotentialDuplicates = function(userId: string, transaction: any) {
  const dateRange = {
    $gte: new Date(transaction.date.getTime() - 24 * 60 * 60 * 1000), // 1 day before
    $lte: new Date(transaction.date.getTime() + 24 * 60 * 60 * 1000)  // 1 day after
  }
  
  return this.find({
    userId,
    amount: transaction.amount,
    date: dateRange,
    _id: { $ne: transaction._id }
  })
}

// Instance method to categorize transaction
transactionSchema.methods.categorize = function(category: TransactionCategory) {
  this.category = category
  return this.save()
}

// Instance method to add tags
transactionSchema.methods.addTags = function(newTags: string[]) {
  const uniqueTags = [...new Set([...this.tags, ...newTags])]
  this.tags = uniqueTags
  return this.save()
}

// Instance method to mark as duplicate
transactionSchema.methods.markAsDuplicate = function() {
  this.isDuplicate = true
  return this.save()
}

export const TransactionModel = mongoose.model<ITransaction, ITransactionModel>('Transaction', transactionSchema)