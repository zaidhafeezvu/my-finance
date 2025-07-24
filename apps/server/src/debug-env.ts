#!/usr/bin/env bun
import dotenv from 'dotenv'
import { databaseConfig } from '@finance-app/config'

// Load environment variables from root directory
dotenv.config({ path: '../../.env' })

console.log('🔍 Environment Debug:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')
console.log('Database config URI:', databaseConfig.mongodb.uri)

if (process.env.MONGODB_URI) {
  console.log('✅ MongoDB URI is loaded from environment')
} else {
  console.log('❌ MongoDB URI is NOT loaded from environment')
  console.log('Using default:', databaseConfig.mongodb.uri)
}