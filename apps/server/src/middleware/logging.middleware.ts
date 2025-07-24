import { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import { appConfig } from '@finance-app/config'

// Custom token for request ID
morgan.token('id', (req: Request) => {
  return req.headers['x-request-id'] as string || 'unknown'
})

// Custom token for user ID (will be set by auth middleware)
morgan.token('user', (req: Request) => {
  return (req as any).user?.id || 'anonymous'
})

// Development logging format
const devFormat = ':method :url :status :response-time ms - :res[content-length] [:id]'

// Production logging format with more details
const prodFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms [:id]'

// Create logger based on environment
export const requestLogger = morgan(
  appConfig.nodeEnv === 'production' ? prodFormat : devFormat,
  {
    skip: (req: Request) => {
      // Skip logging for health checks in production
      return appConfig.nodeEnv === 'production' && req.url === '/health'
    }
  }
)

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 'unknown'
  const userId = (req as any).user?.id || 'anonymous'
  
  console.error(`[${new Date().toISOString()}] [${requestId}] [${userId}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip']
    }
  })
  
  next(err)
}

// Request context middleware
export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  // Add request ID if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Add timestamp
  (req as any).startTime = Date.now()
  
  next()
}