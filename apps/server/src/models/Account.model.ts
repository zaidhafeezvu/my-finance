import mongoose, { Document, Schema } from 'mongoose'
import { Account, AccountType, AccountBalance } from '@finance-app/shared'

// Account interface extending Document
export interface IAccount extends Document, Omit<Account, '_id' | 'userId' | 'createdAt'> {
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  updateBalance(balance: AccountBalance): Promise<IAccount>
  deactivate(): Promise<IAccount>
}

// Account model interface for static methods
export interface IAccountModel extends mongoose.Model<IAccount> {
  findByUser(userId: string): Promise<IAccount[]>
  findByPlaidId(plaidAccountId: string): Promise<IAccount | null>
}

// Account schema
const accountSchema = new Schema<IAccount>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plaidAccountId: {
    type: String,
    sparse: true,
    index: true
  },
  institutionName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountType: {
    type: String,
    required: true,
    enum: ['checking', 'savings', 'credit', 'investment', 'loan'] as AccountType[]
  },
  balance: {
    current: {
      type: Number,
      required: true,
      default: 0
    },
    available: {
      type: Number
    },
    limit: {
      type: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastSynced: {
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
      delete ret.__v
      return ret
    }
  }
})

// Indexes
accountSchema.index({ userId: 1, accountType: 1 })
accountSchema.index({ userId: 1, isActive: 1 })
accountSchema.index({ plaidAccountId: 1 }, { sparse: true })
accountSchema.index({ lastSynced: 1 })

// Static method to find accounts by user
accountSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 })
}

// Static method to find account by Plaid ID
accountSchema.statics.findByPlaidId = function(plaidAccountId: string) {
  return this.findOne({ plaidAccountId })
}

// Instance method to update balance
accountSchema.methods.updateBalance = function(balance: AccountBalance) {
  this.balance = balance
  this.lastSynced = new Date()
  return this.save()
}

// Instance method to deactivate account
accountSchema.methods.deactivate = function() {
  this.isActive = false
  return this.save()
}

export const AccountModel = mongoose.model<IAccount, IAccountModel>('Account', accountSchema)