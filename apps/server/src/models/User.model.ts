import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { authConfig } from '@finance-app/config'

// User interface
export interface IUser extends Document {
  email: string
  passwordHash: string
  profile: {
    firstName: string
    lastName: string
    phone?: string
    timezone: string
  }
  preferences: {
    currency: string
    dateFormat: string
    notifications: {
      email: boolean
      push: boolean
      budget: boolean
      bills: boolean
      investments: boolean
      goals: boolean
      security: boolean
      marketing: boolean
    }
  }
  security: {
    mfaEnabled: boolean
    lastLogin?: Date
    loginAttempts: number
    lockUntil?: Date
    emailVerified: boolean
    emailVerificationToken?: string
    passwordResetToken?: string
    passwordResetExpires?: Date
  }
  createdAt: Date
  updatedAt: Date
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>
  incrementLoginAttempts(): Promise<void>
  isLocked(): boolean
  generateEmailVerificationToken(): string
  generatePasswordResetToken(): string
}

// User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    timezone: {
      type: String,
      required: true,
      default: 'America/New_York'
    }
  },
  preferences: {
    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL']
    },
    dateFormat: {
      type: String,
      required: true,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      budget: {
        type: Boolean,
        default: true
      },
      bills: {
        type: Boolean,
        default: true
      },
      investments: {
        type: Boolean,
        default: true
      },
      goals: {
        type: Boolean,
        default: true
      },
      security: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    }
  },
  security: {
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash
      delete ret.security.emailVerificationToken
      delete ret.security.passwordResetToken
      delete ret.__v
      return ret
    }
  }
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ 'security.lastLogin': 1 })
userSchema.index({ 'security.emailVerificationToken': 1 })
userSchema.index({ 'security.passwordResetToken': 1 })

// Virtual for account lock status
userSchema.virtual('security.isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > new Date())
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next()
  
  try {
    const salt = await bcrypt.genSalt(authConfig.bcrypt.saltRounds)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    })
  }
  
  const updates: any = { $inc: { 'security.loginAttempts': 1 } }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.security.lockUntil) {
    updates.$set = { 'security.lockUntil': new Date(Date.now() + 2 * 60 * 60 * 1000) }
  }
  
  return this.updateOne(updates)
}

// Instance method to check if account is locked
userSchema.methods.isLocked = function(): boolean {
  return !!(this.security.lockUntil && this.security.lockUntil > new Date())
}

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.security.emailVerificationToken = token
  return token
}

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.security.passwordResetToken = token
  this.security.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  return token
}

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

// Static method to find user by reset token
userSchema.statics.findByPasswordResetToken = function(token: string) {
  return this.findOne({
    'security.passwordResetToken': token,
    'security.passwordResetExpires': { $gt: new Date() }
  })
}

// Static method to find user by email verification token
userSchema.statics.findByEmailVerificationToken = function(token: string) {
  return this.findOne({
    'security.emailVerificationToken': token
  })
}

export const User = mongoose.model<IUser>('User', userSchema)