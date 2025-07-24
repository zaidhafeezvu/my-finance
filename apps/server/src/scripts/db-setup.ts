#!/usr/bin/env bun
import { connectDatabase, seedDatabase, createIndexes, clearDatabase } from '../database'
import { appConfig } from '@finance-app/config'

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    // Connect to database
    await connectDatabase()
    
    // Get command line arguments
    const args = process.argv.slice(2)
    const command = args[0]
    
    switch (command) {
      case 'seed':
        console.log('🌱 Seeding database with development data...')
        await seedDatabase()
        break
        
      case 'clear':
        console.log('🧹 Clearing database...')
        await clearDatabase()
        break
        
      case 'indexes':
        console.log('📊 Creating database indexes...')
        await createIndexes()
        break
        
      case 'reset':
        console.log('🔄 Resetting database (clear + seed + indexes)...')
        await clearDatabase()
        await createIndexes()
        await seedDatabase()
        break
        
      case 'setup':
      default:
        console.log('⚙️  Setting up database (indexes + seed)...')
        await createIndexes()
        if (appConfig.nodeEnv === 'development') {
          await seedDatabase()
        }
        break
    }
    
    console.log('✅ Database setup completed successfully')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
}

export { setupDatabase }