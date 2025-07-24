import jwt from 'jsonwebtoken'
import { authConfig } from '@finance-app/config'
import { User, IUser } from '../models'
import { 
  AuthenticationError, 
  ValidationError, 
  ConflictError, 
  NotFoundError 
} from '../middleware'
import { emailService } from './email.service'

// Types
export interface UserRegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  timezone?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
    }
    emailVerified: boolean
  }
}

export interface TokenPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // User registration
  public async register(userData: UserRegistrationData): Promise<{ user: IUser; token: string }> {
    const { email, password, firstName, lastName, phone, timezone } = userData

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save middleware
      profile: {
        firstName,
        lastName,
        phone,
        timezone: timezone || 'America/New_York'
      }
    })

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken()
    
    await user.save()

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, verificationToken, firstName)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Don't fail registration if email fails
    }

    return {
      user,
      token: verificationToken
    }
  }

  // User login
  public async login(credentials: LoginCredentials): Promise<AuthToken> {
    const { email, password } = credentials

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts')
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      await user.incrementLoginAttempts()
      throw new AuthenticationError('Invalid email or password')
    }

    // Reset login attempts on successful login
    if (user.security.loginAttempts > 0) {
      await user.updateOne({
        $unset: { 'security.loginAttempts': 1, 'security.lockUntil': 1 },
        $set: { 'security.lastLogin': new Date() }
      })
    } else {
      await user.updateOne({
        $set: { 'security.lastLogin': new Date() }
      })
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName
        },
        emailVerified: user.security.emailVerified
      }
    }
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, authConfig.jwt.secret) as TokenPayload
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type')
      }

      // Find user
      const user = await User.findById(decoded.userId)
      if (!user) {
        throw new AuthenticationError('User not found')
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user)

      return { accessToken }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token')
      }
      throw error
    }
  }

  // Password reset request
  public async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if email exists
      return
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Send reset email
    try {
      await emailService.sendPasswordReset(user.email, resetToken, user.profile.firstName)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  // Reset password
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      'security.passwordResetToken': token,
      'security.passwordResetExpires': { $gt: new Date() }
    })

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token')
    }

    // Update password
    user.passwordHash = newPassword // Will be hashed by pre-save middleware
    user.security.passwordResetToken = undefined
    user.security.passwordResetExpires = undefined
    user.security.loginAttempts = 0
    user.security.lockUntil = undefined

    await user.save()
  }

  // Email verification
  public async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      'security.emailVerificationToken': token
    })

    if (!user) {
      throw new AuthenticationError('Invalid verification token')
    }

    // Mark email as verified
    user.security.emailVerified = true
    user.security.emailVerificationToken = undefined

    await user.save()
  }

  // Resend email verification
  public async resendEmailVerification(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (user.security.emailVerified) {
      throw new ValidationError('Email is already verified')
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // Send verification email
    try {
      await emailService.sendEmailVerification(user.email, verificationToken, user.profile.firstName)
    } catch (error) {
      console.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  // Generate access token
  private generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'access'
    }

    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn
    } as jwt.SignOptions)
  }

  // Generate refresh token
  private generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'refresh'
    }

    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.refreshExpiresIn
    } as jwt.SignOptions)
  }

  // Verify access token
  public verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as TokenPayload
      
      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type')
      }

      return decoded
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token')
      }
      throw error
    }
  }

  // Get user by ID
  public async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId)
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()