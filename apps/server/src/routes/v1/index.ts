import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { userRoutes } from './user.routes'

const router = Router()

// Authentication routes
router.use('/auth', authRoutes)

// User management routes
router.use('/user', userRoutes)

// API v1 root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Finance App API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      user: '/user'
    },
    timestamp: new Date().toISOString()
  })
})

export { router as v1Routes }