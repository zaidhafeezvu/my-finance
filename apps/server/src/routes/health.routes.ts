import { Router, Request, Response } from 'express'
import { appConfig } from '@finance-app/config'
import { asyncHandler } from '../middleware'
import { getDatabaseStatus, getDatabaseHealth } from '../database'

const router = Router()

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus()
  
  res.json({
    status: dbStatus.isConnected ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState
    }
  })
}))

// Detailed health check (for monitoring systems)
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const dbHealth = await getDatabaseHealth()
  const dbStatus = getDatabaseStatus()
  
  const healthCheck = {
    status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    services: {
      database: {
        status: dbHealth.status,
        connected: dbStatus.isConnected,
        details: dbHealth.details
      },
      redis: 'pending',    // Will be updated when Redis is connected
      external: {
        plaid: appConfig.plaid.clientId ? 'configured' : 'not_configured',
        email: appConfig.email.user ? 'configured' : 'not_configured',
        marketData: appConfig.marketData.apiKey ? 'configured' : 'not_configured'
      }
    }
  }

  res.json(healthCheck)
}))

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  const dbHealth = await getDatabaseHealth()
  const isReady = dbHealth.status === 'healthy'
  
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth.status
    }
  })
}))

// Liveness probe (for Kubernetes)
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  })
}))

export { router as healthRoutes }