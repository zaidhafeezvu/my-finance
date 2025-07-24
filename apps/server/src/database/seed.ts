import mongoose from 'mongoose'
import { appConfig } from '@finance-app/config'

// Seed data interface
interface SeedData {
  collection: string
  data: any[]
  options?: {
    dropCollection?: boolean
    upsert?: boolean
  }
}

class DatabaseSeeder {
  private static instance: DatabaseSeeder

  private constructor() {}

  public static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder()
    }
    return DatabaseSeeder.instance
  }

  public async seedDatabase(seedData: SeedData[]): Promise<void> {
    if (appConfig.nodeEnv === 'production') {
      console.warn('⚠️  Database seeding is disabled in production')
      return
    }

    console.log('🌱 Starting database seeding...')

    try {
      for (const seed of seedData) {
        await this.seedCollection(seed)
      }
      console.log('✅ Database seeding completed successfully')
    } catch (error) {
      console.error('❌ Database seeding failed:', error)
      throw error
    }
  }

  private async seedCollection(seed: SeedData): Promise<void> {
    const { collection, data, options = {} } = seed
    const { dropCollection = false, upsert = false } = options

    console.log(`🌱 Seeding collection: ${collection}`)

    try {
      const db = mongoose.connection.db
      const coll = db.collection(collection)

      // Drop collection if requested
      if (dropCollection) {
        try {
          await coll.drop()
          console.log(`🗑️  Dropped collection: ${collection}`)
        } catch (error: any) {
          // Ignore error if collection doesn't exist
          if (error.code !== 26) {
            throw error
          }
        }
      }

      // Insert or upsert data
      if (data.length > 0) {
        if (upsert) {
          // Upsert each document individually
          for (const doc of data) {
            await coll.replaceOne(
              { _id: doc._id },
              doc,
              { upsert: true }
            )
          }
          console.log(`📝 Upserted ${data.length} documents in ${collection}`)
        } else {
          // Insert all documents
          await coll.insertMany(data, { ordered: false })
          console.log(`📝 Inserted ${data.length} documents in ${collection}`)
        }
      }
    } catch (error: any) {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        console.log(`⚠️  Some documents in ${collection} already exist, skipping duplicates`)
      } else {
        console.error(`❌ Error seeding collection ${collection}:`, error)
        throw error
      }
    }
  }

  public async clearDatabase(): Promise<void> {
    if (appConfig.nodeEnv === 'production') {
      console.warn('⚠️  Database clearing is disabled in production')
      return
    }

    console.log('🧹 Clearing database...')

    try {
      const db = mongoose.connection.db
      const collections = await db.listCollections().toArray()

      for (const collection of collections) {
        await db.collection(collection.name).deleteMany({})
        console.log(`🗑️  Cleared collection: ${collection.name}`)
      }

      console.log('✅ Database cleared successfully')
    } catch (error) {
      console.error('❌ Database clearing failed:', error)
      throw error
    }
  }

  public async createIndexes(): Promise<void> {
    console.log('📊 Creating database indexes...')

    try {
      const db = mongoose.connection.db

      // User collection indexes
      await db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { createdAt: 1 } },
        { key: { 'security.lastLogin': 1 } }
      ])

      // Account collection indexes
      await db.collection('accounts').createIndexes([
        { key: { userId: 1 } },
        { key: { plaidAccountId: 1 }, unique: true, sparse: true },
        { key: { userId: 1, accountType: 1 } },
        { key: { isActive: 1 } },
        { key: { lastSynced: 1 } }
      ])

      // Transaction collection indexes
      await db.collection('transactions').createIndexes([
        { key: { userId: 1, date: -1 } },
        { key: { accountId: 1, date: -1 } },
        { key: { plaidTransactionId: 1 }, unique: true, sparse: true },
        { key: { 'category.primary': 1 } },
        { key: { amount: 1 } },
        { key: { date: -1 } },
        { key: { userId: 1, isDuplicate: 1 } }
      ])

      // Budget collection indexes
      await db.collection('budgets').createIndexes([
        { key: { userId: 1 } },
        { key: { userId: 1, category: 1 } },
        { key: { startDate: 1, endDate: 1 } },
        { key: { isActive: 1 } }
      ])

      // Investment collection indexes
      await db.collection('investments').createIndexes([
        { key: { userId: 1 } },
        { key: { accountId: 1 } },
        { key: { symbol: 1 } },
        { key: { userId: 1, symbol: 1 } },
        { key: { lastUpdated: 1 } }
      ])

      console.log('✅ Database indexes created successfully')
    } catch (error) {
      console.error('❌ Index creation failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const seeder = DatabaseSeeder.getInstance()

// Development seed data
export const developmentSeedData: SeedData[] = [
  {
    collection: 'users',
    data: [
      {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'demo@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // password: demo123!
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          timezone: 'America/New_York'
        },
        preferences: {
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            push: false,
            budget: true,
            bills: true
          }
        },
        security: {
          mfaEnabled: false,
          lastLogin: new Date(),
          loginAttempts: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    options: { upsert: true }
  }
]

// Convenience functions
export const seedDatabase = (data?: SeedData[]) => 
  seeder.seedDatabase(data || developmentSeedData)
export const clearDatabase = () => seeder.clearDatabase()
export const createIndexes = () => seeder.createIndexes()