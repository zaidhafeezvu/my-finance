import mongoose from 'mongoose'
import { AccountModel, IAccount } from '../../models/Account.model'
import { User } from '../../models/User.model'

describe('Account Model', () => {
  let userId: mongoose.Types.ObjectId

  beforeEach(async () => {
    // Create a test user
    const user = new User({
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        timezone: 'America/New_York'
      }
    })
    await user.save()
    userId = user._id
  })

  describe('Account Creation', () => {
    it('should create a valid account', async () => {
      const accountData = {
        userId,
        plaidAccountId: 'plaid_123',
        institutionName: 'Test Bank',
        accountName: 'Checking Account',
        accountType: 'checking' as const,
        balance: {
          current: 1000,
          available: 950
        }
      }

      const account = new AccountModel(accountData)
      const savedAccount = await account.save()

      expect(savedAccount._id).toBeDefined()
      expect(savedAccount.userId.toString()).toBe(userId.toString())
      expect(savedAccount.institutionName).toBe('Test Bank')
      expect(savedAccount.accountType).toBe('checking')
      expect(savedAccount.balance.current).toBe(1000)
      expect(savedAccount.isActive).toBe(true)
      expect(savedAccount.lastSynced).toBeDefined()
    })

    it('should require userId', async () => {
      const accountData = {
        institutionName: 'Test Bank',
        accountName: 'Checking Account',
        accountType: 'checking' as const,
        balance: { current: 1000 }
      }

      const account = new AccountModel(accountData)
      await expect(account.save()).rejects.toThrow()
    })

    it('should require institutionName', async () => {
      const accountData = {
        userId,
        accountName: 'Checking Account',
        accountType: 'checking' as const,
        balance: { current: 1000 }
      }

      const account = new AccountModel(accountData)
      await expect(account.save()).rejects.toThrow()
    })

    it('should validate accountType enum', async () => {
      const accountData = {
        userId,
        institutionName: 'Test Bank',
        accountName: 'Checking Account',
        accountType: 'invalid' as any,
        balance: { current: 1000 }
      }

      const account = new AccountModel(accountData)
      await expect(account.save()).rejects.toThrow()
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test accounts
      await AccountModel.create([
        {
          userId,
          institutionName: 'Bank A',
          accountName: 'Checking',
          accountType: 'checking',
          balance: { current: 1000 },
          isActive: true
        },
        {
          userId,
          institutionName: 'Bank B',
          accountName: 'Savings',
          accountType: 'savings',
          balance: { current: 5000 },
          isActive: true
        },
        {
          userId,
          institutionName: 'Bank C',
          accountName: 'Old Account',
          accountType: 'checking',
          balance: { current: 0 },
          isActive: false
        }
      ])
    })

    it('should find accounts by user (active only)', async () => {
      const accounts = await AccountModel.findByUser(userId.toString())
      expect(accounts).toHaveLength(2)
      expect(accounts.every(acc => acc.isActive)).toBe(true)
    })

    it('should find account by Plaid ID', async () => {
      const testAccount = await AccountModel.create({
        userId,
        plaidAccountId: 'plaid_unique_123',
        institutionName: 'Test Bank',
        accountName: 'Test Account',
        accountType: 'checking',
        balance: { current: 1000 }
      })

      const foundAccount = await AccountModel.findByPlaidId('plaid_unique_123')
      expect(foundAccount).toBeTruthy()
      expect(foundAccount!._id.toString()).toBe(testAccount._id.toString())
    })
  })

  describe('Instance Methods', () => {
    let account: IAccount

    beforeEach(async () => {
      account = await AccountModel.create({
        userId,
        institutionName: 'Test Bank',
        accountName: 'Test Account',
        accountType: 'checking',
        balance: { current: 1000, available: 950 }
      })
    })

    it('should update balance', async () => {
      const newBalance = { current: 1500, available: 1400 }
      const updatedAccount = await account.updateBalance(newBalance)

      expect(updatedAccount.balance.current).toBe(1500)
      expect(updatedAccount.balance.available).toBe(1400)
      expect(updatedAccount.lastSynced.getTime()).toBeGreaterThan(account.lastSynced.getTime())
    })

    it('should deactivate account', async () => {
      const deactivatedAccount = await account.deactivate()
      expect(deactivatedAccount.isActive).toBe(false)
    })
  })

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await AccountModel.collection.getIndexes()
      const indexNames = Object.keys(indexes)

      expect(indexNames).toContain('userId_1')
      expect(indexNames).toContain('userId_1_accountType_1')
      expect(indexNames).toContain('userId_1_isActive_1')
      expect(indexNames).toContain('lastSynced_1')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const account = await AccountModel.create({
        userId,
        institutionName: 'Test Bank',
        accountName: 'Test Account',
        accountType: 'checking',
        balance: { current: 1000 }
      })

      const json = account.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})