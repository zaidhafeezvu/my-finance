import { Router } from 'express'
import { healthRoutes } from './health.routes'
import { v1Routes } from './v1'

const router = Router()

// Health check routes (no versioning)
router.use('/health', healthRoutes)

// API v1 routes
router.use('/api/v1', v1Routes)

// API root endpoint
router.get('/api', (req, res) => {
  res.json({
    message: 'Finance App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      v1: '/api/v1'
    },
    timestamp: new Date().toISOString()
  })
})

export { router as apiRoutes }