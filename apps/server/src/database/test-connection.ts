#!/usr/bin/env bun
import { connectDatabase, getDatabaseHealth } from './connection'

async function testConnection() {
  try {
    console.log('🧪 Testing database connection...')
    
    await connectDatabase()
    
    const health = await getDatabaseHealth()
    console.log('📊 Database health:', health)
    
    console.log('✅ Database connection test passed')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    console.log('💡 Make sure MongoDB is running on the configured URI')
    process.exit(1)
  }
}

testConnection()