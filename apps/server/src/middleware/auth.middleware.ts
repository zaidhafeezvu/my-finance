import { Request, Response, NextFunction } from 'express'
import { authService } from '../services'
import { AuthenticationError, AuthorizationError } from './error.middleware'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        emailVerified: boolean
      }
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token required')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = authService.verifyAccessToken(token)
    
    // Get user details
    const user = await authService.getUserById(decoded.userId)
    if (!user) {
      throw new AuthenticationError('User not found')
    }

    // Add user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      emailVerified: user.security.emailVerified
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // Continue without user
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = authService.verifyAccessToken(token)
      const user = await authService.getUserById(decoded.userId)
      
      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          emailVerified: user.security.emailVerified
        }
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Email verification required middleware
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required')
  }

  if (!req.user.emailVerified) {
    throw new AuthorizationError('Email verification required')
  }

  next()
}

// Admin role middleware (placeholder for future role-based access)
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required')
  }

  // TODO: Implement role checking when user roles are added
  // For now, all authenticated users are considered admins in development
  next()
}