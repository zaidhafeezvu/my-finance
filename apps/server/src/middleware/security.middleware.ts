import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { authConfig } from '@finance-app/config'

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: authConfig.rateLimit.windowMs,
  max: authConfig.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(authConfig.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Request sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potential XSS attempts from request body
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  next()
}

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers beyond helmet
  res.setHeader('X-API-Version', '1.0.0')
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId())
  
  next()
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}