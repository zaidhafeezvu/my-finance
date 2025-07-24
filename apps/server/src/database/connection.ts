import mongoose from 'mongoose'
import { databaseConfig, appConfig } from '@finance-app/config'

class DatabaseConnection {
  private static instance: DatabaseConnection
  private isConnected: boolean = false
  private connectionAttempts: number = 0
  private maxRetries: number = 5
  private retryDelay: number = 5000 // 5 seconds

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📊 Database already connected')
      return
    }

    try {
      await this.attemptConnection()
    } catch (error) {
      console.error('❌ Failed to connect to database after all retries:', error)
      if (appConfig.nodeEnv === 'production') {
        process.exit(1)
      }
      throw error
    }
  }

  private async attemptConnection(): Promise<void> {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        this.connectionAttempts++
        
        console.log(`🔄 Attempting database connection (${this.connectionAttempts}/${this.maxRetries})...`)
        
        const mongoUri = process.env.MONGODB_URI || databaseConfig.mongodb.uri
        console.log(`🔗 Connecting to: ${mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`)
        
        await mongoose.connect(mongoUri, {
          ...databaseConfig.mongodb.options,
          bufferCommands: false,
        })

        this.isConnected = true
        this.connectionAttempts = 0
        
        console.log('✅ Database connected successfully')
        console.log(`📊 Database: ${mongoose.connection.name}`)
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`)
        
        this.setupEventListeners()
        return

      } catch (error) {
        console.error(`❌ Database connection attempt ${this.connectionAttempts} failed:`, error)
        
        if (this.connectionAttempts < this.maxRetries) {
          console.log(`⏳ Retrying in ${this.retryDelay / 1000} seconds...`)
          await this.delay(this.retryDelay)
        }
      }
    }
    
    throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`)
  }

  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      console.log('📊 Mongoose connected to database')
      this.isConnected = true
    })

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error)
      this.isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.log('📊 Mongoose disconnected from database')
      this.isConnected = false
      
      // Attempt to reconnect in production
      if (appConfig.nodeEnv === 'production') {
        console.log('🔄 Attempting to reconnect...')
        setTimeout(() => this.connect(), this.retryDelay)
      }
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ Mongoose reconnected to database')
      this.isConnected = true
    })

    // Handle application termination
    process.on('SIGINT', this.gracefulShutdown.bind(this))
    process.on('SIGTERM', this.gracefulShutdown.bind(this))
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.connection.close()
      this.isConnected = false
      console.log('📊 Database connection closed')
    } catch (error) {
      console.error('❌ Error closing database connection:', error)
      throw error
    }
  }

  public getConnectionStatus(): {
    isConnected: boolean
    readyState: number
    host?: string
    port?: number
    name?: string
  } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    }
  }

  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    details: any
  }> {
    try {
      if (!this.isConnected || mongoose.connection.readyState !== 1) {
        return {
          status: 'unhealthy',
          details: {
            readyState: mongoose.connection.readyState,
            error: 'Database not connected'
          }
        }
      }

      // Perform a simple ping to test the connection
      await mongoose.connection.db.admin().ping()
      
      return {
        status: 'healthy',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          readyState: mongoose.connection.readyState,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('🔄 Gracefully shutting down database connection...')
    await this.disconnect()
    process.exit(0)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const database = DatabaseConnection.getInstance()

// Convenience functions
export const connectDatabase = () => database.connect()
export const disconnectDatabase = () => database.disconnect()
export const getDatabaseStatus = () => database.getConnectionStatus()
export const getDatabaseHealth = () => database.healthCheck()