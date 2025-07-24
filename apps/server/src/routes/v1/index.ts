import { Router } from 'express'
import { authRoutes } from './auth.routes'

const router = Router()

// Authentication routes
router.use('/auth', authRoutes)

// API v1 root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Finance App API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/auth'
    },
    timestamp: new Date().toISOString()
  })
})

export { router as v1Routes }