import mongoose from 'mongoose'
import { BudgetModel, IBudget } from '../../models/Budget.model'
import { User } from '../../models/User.model'

describe('Budget Model', () => {
  let userId: mongoose.Types.ObjectId

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
  })

  describe('Budget Creation', () => {
    it('should create a valid budget', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      const budgetData = {
        userId,
        name: 'Groceries Budget',
        category: 'Food & Drink',
        limit: 500,
        period: 'monthly' as const,
        startDate,
        endDate
      }

      const budget = new BudgetModel(budgetData)
      const savedBudget = await budget.save()

      expect(savedBudget._id).toBeDefined()
      expect(savedBudget.userId.toString()).toBe(userId.toString())
      expect(savedBudget.name).toBe('Groceries Budget')
      expect(savedBudget.category).toBe('Food & Drink')
      expect(savedBudget.limit).toBe(500)
      expect(savedBudget.period).toBe('monthly')
      expect(savedBudget.spent).toBe(0)
      expect(savedBudget.isActive).toBe(true)
      expect(savedBudget.notifications.at75Percent).toBe(true)
    })

    it('should require userId', async () => {
      const budgetData = {
        name: 'Test Budget',
        category: 'Test',
        limit: 100,
        period: 'monthly' as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      const budget = new BudgetModel(budgetData)
      await expect(budget.save()).rejects.toThrow()
    })

    it('should validate budget limit is positive', async () => {
      const budgetData = {
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: -100,
        period: 'monthly' as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      const budget = new BudgetModel(budgetData)
      await expect(budget.save()).rejects.toThrow()
    })

    it('should validate period enum', async () => {
      const budgetData = {
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: 100,
        period: 'invalid' as any,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      const budget = new BudgetModel(budgetData)
      await expect(budget.save()).rejects.toThrow()
    })

    it('should validate end date is after start date', async () => {
      const startDate = new Date('2024-01-31')
      const endDate = new Date('2024-01-01')
      
      const budgetData = {
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: 100,
        period: 'monthly' as const,
        startDate,
        endDate
      }

      const budget = new BudgetModel(budgetData)
      await expect(budget.save()).rejects.toThrow('End date must be after start date')
    })
  })

  describe('Virtual Properties', () => {
    let budget: IBudget

    beforeEach(async () => {
      budget = await BudgetModel.create({
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: 1000,
        period: 'monthly',
        spent: 750,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      })
    })

    it('should calculate remaining amount', async () => {
      expect(budget.remaining).toBe(250)
    })

    it('should calculate percentage used', async () => {
      expect(budget.percentageUsed).toBe(75)
    })

    it('should determine if over budget', async () => {
      expect(budget.isOverBudget).toBe(false)
      
      budget.spent = 1200
      expect(budget.isOverBudget).toBe(true)
    })

    it('should calculate days remaining', async () => {
      // Mock current date to be within budget period
      const mockDate = new Date('2024-01-15')
      jest.useFakeTimers().setSystemTime(mockDate)
      
      expect(budget.daysRemaining).toBe(17) // Days from Jan 15 to Jan 31
      
      jest.useRealTimers()
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      await BudgetModel.create([
        {
          userId,
          name: 'Active Budget 1',
          category: 'Food',
          limit: 500,
          period: 'monthly',
          startDate: now,
          endDate: futureDate,
          isActive: true
        },
        {
          userId,
          name: 'Active Budget 2',
          category: 'Transport',
          limit: 200,
          period: 'monthly',
          startDate: now,
          endDate: futureDate,
          isActive: true
        },
        {
          userId,
          name: 'Inactive Budget',
          category: 'Entertainment',
          limit: 100,
          period: 'monthly',
          startDate: pastDate,
          endDate: now,
          isActive: false
        },
        {
          userId,
          name: 'Expired Budget',
          category: 'Shopping',
          limit: 300,
          period: 'monthly',
          startDate: pastDate,
          endDate: pastDate,
          isActive: true
        }
      ])
    })

    it('should find active budgets by user', async () => {
      const budgets = await BudgetModel.findActiveByUser(userId.toString())
      expect(budgets).toHaveLength(2)
      expect(budgets.every(b => b.isActive)).toBe(true)
    })

    it('should find budgets by category', async () => {
      const budgets = await BudgetModel.findByCategory(userId.toString(), 'Food')
      expect(budgets).toHaveLength(1)
      expect(budgets[0].category).toBe('Food')
    })

    it('should find current budgets', async () => {
      const budgets = await BudgetModel.findCurrentBudgets(userId.toString())
      expect(budgets).toHaveLength(2)
      expect(budgets.every(b => {
        const now = new Date()
        return b.startDate <= now && b.endDate >= now && b.isActive
      })).toBe(true)
    })
  })

  describe('Instance Methods', () => {
    let budget: IBudget

    beforeEach(async () => {
      budget = await BudgetModel.create({
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: 1000,
        period: 'monthly',
        spent: 500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      })
    })

    it('should update spent amount', async () => {
      const updatedBudget = await budget.updateSpent(750)
      expect(updatedBudget.spent).toBe(750)
    })

    it('should not allow negative spent amount', async () => {
      const updatedBudget = await budget.updateSpent(-100)
      expect(updatedBudget.spent).toBe(0)
    })

    it('should add to spent amount', async () => {
      const updatedBudget = await budget.addToSpent(250)
      expect(updatedBudget.spent).toBe(750)
    })

    it('should check notification thresholds', async () => {
      // Test 75% threshold
      budget.spent = 750
      let thresholds = budget.checkNotificationThreshold()
      expect(thresholds).toContain('75')

      // Test 90% threshold
      budget.spent = 900
      thresholds = budget.checkNotificationThreshold()
      expect(thresholds).toContain('90')

      // Test limit threshold
      budget.spent = 1000
      thresholds = budget.checkNotificationThreshold()
      expect(thresholds).toContain('limit')
    })

    it('should reset for new period', async () => {
      const newStartDate = new Date('2024-02-01')
      const newEndDate = new Date('2024-02-29')
      
      const resetBudget = await budget.resetForNewPeriod(newStartDate, newEndDate)
      
      expect(resetBudget.spent).toBe(0)
      expect(resetBudget.startDate).toEqual(newStartDate)
      expect(resetBudget.endDate).toEqual(newEndDate)
    })

    it('should deactivate budget', async () => {
      const deactivatedBudget = await budget.deactivate()
      expect(deactivatedBudget.isActive).toBe(false)
    })
  })

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await BudgetModel.collection.getIndexes()
      const indexNames = Object.keys(indexes)

      expect(indexNames).toContain('userId_1_isActive_1')
      expect(indexNames).toContain('userId_1_category_1')
      expect(indexNames).toContain('endDate_1')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const budget = await BudgetModel.create({
        userId,
        name: 'Test Budget',
        category: 'Test',
        limit: 1000,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })

      const json = budget.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})