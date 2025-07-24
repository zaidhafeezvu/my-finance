#!/usr/bin/env bun
import express from 'express'
import { authRoutes } from './routes/v1/auth.routes'
import { errorHandler } from './middleware'

// Create a simple test server without database connection
const app = express()

app.use(express.json())
app.use('/auth', authRoutes)
app.use(errorHandler)

const port = 3002

app.listen(port, () => {
  console.log(`🧪 Test server running on port ${port}`)
  console.log('📋 Available auth endpoints:')
  console.log('  GET  /auth')
  console.log('  POST /auth/register')
  console.log('  POST /auth/login')
  console.log('  POST /auth/refresh')
  console.log('  POST /auth/forgot-password')
  console.log('  POST /auth/reset-password')
  console.log('  POST /auth/verify-email')
  console.log('  POST /auth/resend-verification')
  console.log('')
  console.log('⚠️  Note: Database operations will fail without MongoDB connection')
})