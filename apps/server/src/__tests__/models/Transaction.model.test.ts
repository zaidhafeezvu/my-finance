import mongoose from 'mongoose'
import { TransactionModel, ITransaction } from '../../models/Transaction.model'
import { AccountModel } from '../../models/Account.model'
import { User } from '../../models/User.model'

describe('Transaction Model', () => {
  let userId: mongoose.Types.ObjectId
  let accountId: mongoose.Types.ObjectId

  beforeEach(async () => {
    // Create test user
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

    // Create test account
    const account = new AccountModel({
      userId,
      institutionName: 'Test Bank',
      accountName: 'Test Account',
      accountType: 'checking',
      balance: { current: 1000 }
    })
    await account.save()
    accountId = account._id
  })

  describe('Transaction Creation', () => {
    it('should create a valid transaction', async () => {
      const transactionData = {
        userId,
        accountId,
        amount: -50.25,
        description: 'Coffee Shop Purchase',
        merchantName: 'Starbucks',
        category: {
          primary: 'Food & Drink',
          detailed: 'Coffee Shops'
        },
        date: new Date(),
        tags: ['coffee', 'morning']
      }

      const transaction = new TransactionModel(transactionData)
      const savedTransaction = await transaction.save()

      expect(savedTransaction._id).toBeDefined()
      expect(savedTransaction.userId.toString()).toBe(userId.toString())
      expect(savedTransaction.accountId.toString()).toBe(accountId.toString())
      expect(savedTransaction.amount).toBe(-50.25)
      expect(savedTransaction.description).toBe('Coffee Shop Purchase')
      expect(savedTransaction.category.primary).toBe('Food & Drink')
      expect(savedTransaction.isManual).toBe(false)
      expect(savedTransaction.isDuplicate).toBe(false)
      expect(savedTransaction.tags).toEqual(['coffee', 'morning'])
    })

    it('should require userId', async () => {
      const transactionData = {
        accountId,
        amount: -50,
        description: 'Test Transaction',
        category: { primary: 'Test', detailed: 'Test' },
        date: new Date()
      }

      const transaction = new TransactionModel(transactionData)
      await expect(transaction.save()).rejects.toThrow()
    })

    it('should require accountId', async () => {
      const transactionData = {
        userId,
        amount: -50,
        description: 'Test Transaction',
        category: { primary: 'Test', detailed: 'Test' },
        date: new Date()
      }

      const transaction = new TransactionModel(transactionData)
      await expect(transaction.save()).rejects.toThrow()
    })

    it('should validate amount is a number', async () => {
      const transactionData = {
        userId,
        accountId,
        amount: 'invalid' as any,
        description: 'Test Transaction',
        category: { primary: 'Test', detailed: 'Test' },
        date: new Date()
      }

      const transaction = new TransactionModel(transactionData)
      await expect(transaction.save()).rejects.toThrow()
    })

    it('should limit description length', async () => {
      const longDescription = 'a'.repeat(501)
      const transactionData = {
        userId,
        accountId,
        amount: -50,
        description: longDescription,
        category: { primary: 'Test', detailed: 'Test' },
        date: new Date()
      }

      const transaction = new TransactionModel(transactionData)
      await expect(transaction.save()).rejects.toThrow()
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      const baseDate = new Date('2024-01-01')
      
      await TransactionModel.create([
        {
          userId,
          accountId,
          amount: -100,
          description: 'Grocery Store',
          category: { primary: 'Food & Drink', detailed: 'Groceries' },
          date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          tags: ['groceries']
        },
        {
          userId,
          accountId,
          amount: -50,
          description: 'Gas Station',
          category: { primary: 'Transportation', detailed: 'Gas' },
          date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          isManual: true
        },
        {
          userId,
          accountId,
          amount: 2000,
          description: 'Salary',
          category: { primary: 'Income', detailed: 'Salary' },
          date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      ])
    })

    it('should find transactions by user with filters', async () => {
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString())
      expect(transactions).toHaveLength(3)
      expect(transactions[0].date.getTime()).toBeGreaterThan(transactions[1].date.getTime())
    })

    it('should filter by category', async () => {
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString(), {
        categories: ['Food & Drink']
      })
      expect(transactions).toHaveLength(1)
      expect(transactions[0].category.primary).toBe('Food & Drink')
    })

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-02')
      
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString(), {
        dateRange: { startDate, endDate }
      })
      expect(transactions).toHaveLength(1)
    })

    it('should filter by amount range', async () => {
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString(), {
        amountRange: { min: -200, max: -40 }
      })
      expect(transactions).toHaveLength(2)
    })

    it('should filter by manual transactions', async () => {
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString(), {
        isManual: true
      })
      expect(transactions).toHaveLength(1)
      expect(transactions[0].isManual).toBe(true)
    })

    it('should find potential duplicates', async () => {
      const testTransaction = {
        userId,
        accountId,
        amount: -100,
        date: new Date('2024-01-01T12:00:00Z'),
        _id: new mongoose.Types.ObjectId()
      }

      const duplicates = await TransactionModel.findPotentialDuplicates(userId.toString(), testTransaction)
      expect(duplicates).toHaveLength(1)
      expect(duplicates[0].amount).toBe(-100)
    })
  })

  describe('Instance Methods', () => {
    let transaction: ITransaction

    beforeEach(async () => {
      transaction = await TransactionModel.create({
        userId,
        accountId,
        amount: -75,
        description: 'Restaurant',
        category: { primary: 'Food & Drink', detailed: 'Restaurants' },
        date: new Date(),
        tags: ['dinner']
      })
    })

    it('should categorize transaction', async () => {
      const newCategory = { primary: 'Entertainment', detailed: 'Dining' }
      const updatedTransaction = await transaction.categorize(newCategory)

      expect(updatedTransaction.category.primary).toBe('Entertainment')
      expect(updatedTransaction.category.detailed).toBe('Dining')
    })

    it('should add tags', async () => {
      const newTags = ['weekend', 'family']
      const updatedTransaction = await transaction.addTags(newTags)

      expect(updatedTransaction.tags).toContain('dinner')
      expect(updatedTransaction.tags).toContain('weekend')
      expect(updatedTransaction.tags).toContain('family')
      expect(updatedTransaction.tags).toHaveLength(3)
    })

    it('should not add duplicate tags', async () => {
      const duplicateTags = ['dinner', 'new-tag']
      const updatedTransaction = await transaction.addTags(duplicateTags)

      expect(updatedTransaction.tags).toContain('dinner')
      expect(updatedTransaction.tags).toContain('new-tag')
      expect(updatedTransaction.tags).toHaveLength(2)
    })

    it('should mark as duplicate', async () => {
      const updatedTransaction = await transaction.markAsDuplicate()
      expect(updatedTransaction.isDuplicate).toBe(true)
    })
  })

  describe('Text Search', () => {
    beforeEach(async () => {
      await TransactionModel.create([
        {
          userId,
          accountId,
          amount: -25,
          description: 'Starbucks Coffee',
          merchantName: 'Starbucks',
          category: { primary: 'Food & Drink', detailed: 'Coffee' },
          date: new Date(),
          notes: 'Morning coffee with friends'
        },
        {
          userId,
          accountId,
          amount: -15,
          description: 'Local Cafe',
          merchantName: 'Corner Cafe',
          category: { primary: 'Food & Drink', detailed: 'Coffee' },
          date: new Date()
        }
      ])
    })

    it('should search by text', async () => {
      const transactions = await TransactionModel.findByUserWithFilters(userId.toString(), {
        search: 'Starbucks'
      })
      expect(transactions).toHaveLength(1)
      expect(transactions[0].merchantName).toBe('Starbucks')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const transaction = await TransactionModel.create({
        userId,
        accountId,
        amount: -50,
        description: 'Test Transaction',
        category: { primary: 'Test', detailed: 'Test' },
        date: new Date()
      })

      const json = transaction.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(typeof json.accountId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})