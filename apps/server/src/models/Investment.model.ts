import mongoose, { Document, Schema } from 'mongoose'
import { Investment } from '@finance-app/shared'

// Investment interface extending Document
export interface IInvestment extends Document, Omit<Investment, '_id' | 'userId' | 'accountId'> {
  userId: mongoose.Types.ObjectId
  accountId: mongoose.Types.ObjectId
  updatedAt: Date
  updatePrice(newPrice: number): Promise<IInvestment>
  updateQuantity(newQuantity: number): Promise<IInvestment>
  isPriceStale(hoursOld?: number): boolean
}

// Investment model interface for static methods
export interface IInvestmentModel extends mongoose.Model<IInvestment> {
  findByUser(userId: string): Promise<IInvestment[]>
  findByAccount(accountId: string): Promise<IInvestment[]>
  findBySymbol(userId: string, symbol: string): Promise<IInvestment | null>
  getPortfolioSummary(userId: string): Promise<any[]>
  findStaleInvestments(hoursOld?: number): Promise<IInvestment[]>
}

// Investment schema
const investmentSchema = new Schema<IInvestment>({
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
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Quantity must be a positive number'
    }
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Current price must be a positive number'
    }
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0
      },
      message: 'Purchase price must be a positive number'
    }
  },
  purchaseDate: {
    type: Date,
    required: true,
    index: true
  },
  marketValue: {
    type: Number,
    required: true,
    min: 0
  },
  gainLoss: {
    type: Number,
    required: true
  },
  gainLossPercent: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
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
investmentSchema.index({ userId: 1, accountId: 1 })
investmentSchema.index({ userId: 1, symbol: 1 })
investmentSchema.index({ symbol: 1, lastUpdated: -1 })
investmentSchema.index({ lastUpdated: 1 })

// Pre-save middleware to calculate derived values
investmentSchema.pre('save', function(next) {
  // Calculate market value
  this.marketValue = this.quantity * this.currentPrice
  
  // Calculate gain/loss
  const totalCost = this.quantity * this.purchasePrice
  this.gainLoss = this.marketValue - totalCost
  
  // Calculate gain/loss percentage
  this.gainLossPercent = totalCost > 0 ? (this.gainLoss / totalCost) * 100 : 0
  
  // Update last updated timestamp
  this.lastUpdated = new Date()
  
  next()
})

// Static method to find investments by user
investmentSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ symbol: 1 })
}

// Static method to find investments by account
investmentSchema.statics.findByAccount = function(accountId: string) {
  return this.find({ accountId }).sort({ symbol: 1 })
}

// Static method to find investment by symbol
investmentSchema.statics.findBySymbol = function(userId: string, symbol: string) {
  return this.findOne({ userId, symbol: symbol.toUpperCase() })
}

// Static method to get portfolio summary
investmentSchema.statics.getPortfolioSummary = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: '$marketValue' },
        totalGainLoss: { $sum: '$gainLoss' },
        totalCost: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
        investmentCount: { $sum: 1 }
      }
    },
    {
      $addFields: {
        totalGainLossPercent: {
          $cond: {
            if: { $gt: ['$totalCost', 0] },
            then: { $multiply: [{ $divide: ['$totalGainLoss', '$totalCost'] }, 100] },
            else: 0
          }
        }
      }
    }
  ])
}

// Static method to get investments needing price updates
investmentSchema.statics.findStaleInvestments = function(hoursOld: number = 1) {
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000)
  return this.find({ lastUpdated: { $lt: cutoffTime } })
}

// Instance method to update price
investmentSchema.methods.updatePrice = function(newPrice: number) {
  this.currentPrice = newPrice
  // Pre-save middleware will handle recalculating derived values
  return this.save()
}

// Instance method to update quantity (for stock splits, etc.)
investmentSchema.methods.updateQuantity = function(newQuantity: number) {
  this.quantity = newQuantity
  return this.save()
}

// Instance method to check if price is stale
investmentSchema.methods.isPriceStale = function(hoursOld: number = 1) {
  const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000)
  return this.lastUpdated < cutoffTime
}

export const InvestmentModel = mongoose.model<IInvestment, IInvestmentModel>('Investment', investmentSchema)