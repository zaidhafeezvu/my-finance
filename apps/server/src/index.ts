import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { appConfig } from '@finance-app/config'

// Load environment variables
dotenv.config()

const app = express()
const port = appConfig.port

// Middleware
app.use(helmet())
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv 
  })
})

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Finance App API',
    version: '1.0.0'
  })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: appConfig.nodeEnv === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📊 Environment: ${appConfig.nodeEnv}`)
  console.log(`🌐 CORS Origin: ${appConfig.corsOrigin}`)
})