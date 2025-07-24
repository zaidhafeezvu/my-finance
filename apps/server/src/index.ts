import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { appConfig } from '@finance-app/config'
import { 
  rateLimiter, 
  sanitizeInput, 
  securityHeaders,
  requestLogger,
  requestContext,
  errorLogger,
  errorHandler,
  notFoundHandler
} from './middleware'
import { apiRoutes } from './routes'
import { connectDatabase, createIndexes } from './database'

// Load environment variables from root directory
dotenv.config({ path: '../../.env' })

const app = express()
const port = appConfig.port

// Trust proxy for rate limiting and security
app.set('trust proxy', 1)

// Request context middleware (must be first)
app.use(requestContext)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-API-Version']
}))

// Rate limiting
app.use(rateLimiter)

// Request logging
app.use(requestLogger)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Input sanitization
app.use(sanitizeInput)

// Additional security headers
app.use(securityHeaders)

// API routes
app.use('/', apiRoutes)

// Error logging middleware
app.use(errorLogger)

// Error handling middleware
app.use(errorHandler)

// 404 handler (must be last)
app.use('*', notFoundHandler)

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()
    
    // Create indexes in development
    if (appConfig.nodeEnv === 'development') {
      await createIndexes()
    }
    
    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
      console.log(`📊 Environment: ${appConfig.nodeEnv}`)
      console.log(`🌐 CORS Origin: ${appConfig.corsOrigin}`)
      console.log(`🔒 Security middleware enabled`)
      console.log(`📝 Request logging enabled`)
      console.log(`⚡ Rate limiting enabled`)
      console.log(`💾 Database connected and ready`)
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()