import mongoose from 'mongoose'
import { GoalModel, IGoal } from '../../models/Goal.model'
import { User } from '../../models/User.model'

describe('Goal Model', () => {
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

  describe('Goal Creation', () => {
    it('should create a valid goal', async () => {
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() + 6) // 6 months from now

      const goalData = {
        userId,
        name: 'Emergency Fund',
        description: 'Build emergency fund for 6 months expenses',
        targetAmount: 10000,
        currentAmount: 2500,
        targetDate,
        type: 'emergency_fund' as const,
        priority: 'high' as const
      }

      const goal = new GoalModel(goalData)
      const savedGoal = await goal.save()

      expect(savedGoal._id).toBeDefined()
      expect(savedGoal.userId.toString()).toBe(userId.toString())
      expect(savedGoal.name).toBe('Emergency Fund')
      expect(savedGoal.description).toBe('Build emergency fund for 6 months expenses')
      expect(savedGoal.targetAmount).toBe(10000)
      expect(savedGoal.currentAmount).toBe(2500)
      expect(savedGoal.targetDate).toEqual(targetDate)
      expect(savedGoal.type).toBe('emergency_fund')
      expect(savedGoal.priority).toBe('high')
      expect(savedGoal.isActive).toBe(true)
      expect(savedGoal.isAchieved).toBe(false)
    })

    it('should require userId', async () => {
      const goalData = {
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings' as const
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should require name', async () => {
      const goalData = {
        userId,
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings' as const
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should validate target amount is positive', async () => {
      const goalData = {
        userId,
        name: 'Test Goal',
        targetAmount: -1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings' as const
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should validate target date is in future', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      const goalData = {
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: pastDate,
        type: 'savings' as const
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should validate type enum', async () => {
      const goalData = {
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'invalid' as any
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should validate priority enum', async () => {
      const goalData = {
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings' as const,
        priority: 'invalid' as any
      }

      const goal = new GoalModel(goalData)
      await expect(goal.save()).rejects.toThrow()
    })

    it('should default priority to medium', async () => {
      const goalData = {
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings' as const
      }

      const goal = new GoalModel(goalData)
      const savedGoal = await goal.save()
      expect(savedGoal.priority).toBe('medium')
    })
  })

  describe('Virtual Properties', () => {
    let goal: IGoal

    beforeEach(async () => {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 100) // 100 days from now

      goal = await GoalModel.create({
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        currentAmount: 250,
        targetDate,
        type: 'savings'
      })
    })

    it('should calculate progress percentage', async () => {
      expect(goal.progressPercentage).toBe(25) // 250 / 1000 * 100
    })

    it('should calculate remaining amount', async () => {
      expect(goal.remainingAmount).toBe(750) // 1000 - 250
    })

    it('should calculate days remaining', async () => {
      expect(goal.daysRemaining).toBeCloseTo(100, 0) // Approximately 100 days
    })

    it('should calculate monthly contribution needed', async () => {
      const monthsRemaining = goal.daysRemaining / 30.44
      const expectedMonthly = goal.remainingAmount / monthsRemaining
      expect(goal.monthlyContributionNeeded).toBeCloseTo(expectedMonthly, 2)
    })

    it('should determine if on track', async () => {
      // Mock calculateExpectedProgress to return a known value
      jest.spyOn(goal, 'calculateExpectedProgress').mockReturnValue(20)
      expect(goal.isOnTrack).toBe(true) // 25% >= 20% - 5% tolerance
    })

    it('should handle zero target amount in progress calculation', async () => {
      goal.targetAmount = 0
      expect(goal.progressPercentage).toBe(0)
    })

    it('should cap progress percentage at 100', async () => {
      goal.currentAmount = 1500 // More than target
      expect(goal.progressPercentage).toBe(100)
    })
  })

  describe('Pre-save Middleware', () => {
    it('should mark as achieved when current amount reaches target', async () => {
      const goal = await GoalModel.create({
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        currentAmount: 500,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings'
      })

      expect(goal.isAchieved).toBe(false)
      expect(goal.achievedDate).toBeUndefined()

      // Update to reach target
      goal.currentAmount = 1000
      const updatedGoal = await goal.save()

      expect(updatedGoal.isAchieved).toBe(true)
      expect(updatedGoal.achievedDate).toBeDefined()
    })

    it('should unmark as achieved when current amount drops below target', async () => {
      const goal = await GoalModel.create({
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        currentAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings'
      })

      expect(goal.isAchieved).toBe(true)
      expect(goal.achievedDate).toBeDefined()

      // Update to drop below target
      goal.currentAmount = 900
      const updatedGoal = await goal.save()

      expect(updatedGoal.isAchieved).toBe(false)
      expect(updatedGoal.achievedDate).toBeUndefined()
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      await GoalModel.create([
        {
          userId,
          name: 'High Priority Savings',
          targetAmount: 5000,
          currentAmount: 1000,
          targetDate: futureDate,
          type: 'savings',
          priority: 'high',
          isActive: true
        },
        {
          userId,
          name: 'Medium Priority Vacation',
          targetAmount: 3000,
          currentAmount: 500,
          targetDate: futureDate,
          type: 'vacation',
          priority: 'medium',
          isActive: true
        },
        {
          userId,
          name: 'Achieved Goal',
          targetAmount: 1000,
          currentAmount: 1000,
          targetDate: futureDate,
          type: 'purchase',
          priority: 'low',
          isActive: true,
          isAchieved: true,
          achievedDate: new Date()
        },
        {
          userId,
          name: 'Inactive Goal',
          targetAmount: 2000,
          currentAmount: 200,
          targetDate: futureDate,
          type: 'other',
          priority: 'medium',
          isActive: false
        },
        {
          userId,
          name: 'Overdue Goal',
          targetAmount: 1500,
          currentAmount: 300,
          targetDate: pastDate,
          type: 'debt_payoff',
          priority: 'high',
          isActive: true,
          isAchieved: false
        }
      ])
    })

    it('should find active goals by user', async () => {
      const goals = await GoalModel.findActiveByUser(userId.toString())
      expect(goals).toHaveLength(4) // All active goals
      expect(goals.every(g => g.isActive)).toBe(true)
      
      // Should be sorted by priority (high first) then target date
      expect(goals[0].priority).toBe('high')
      expect(goals[1].priority).toBe('high')
    })

    it('should find goals by type', async () => {
      const savingsGoals = await GoalModel.findByType(userId.toString(), 'savings')
      expect(savingsGoals).toHaveLength(1)
      expect(savingsGoals[0].name).toBe('High Priority Savings')
    })

    it('should find achieved goals', async () => {
      const achievedGoals = await GoalModel.findAchievedGoals(userId.toString())
      expect(achievedGoals).toHaveLength(1)
      expect(achievedGoals[0].name).toBe('Achieved Goal')
      expect(achievedGoals[0].isAchieved).toBe(true)
    })

    it('should find goals by priority', async () => {
      const highPriorityGoals = await GoalModel.findByPriority(userId.toString(), 'high')
      expect(highPriorityGoals).toHaveLength(2)
      expect(highPriorityGoals.every(g => g.priority === 'high')).toBe(true)
    })

    it('should find overdue goals', async () => {
      const overdueGoals = await GoalModel.findOverdueGoals(userId.toString())
      expect(overdueGoals).toHaveLength(1)
      expect(overdueGoals[0].name).toBe('Overdue Goal')
      expect(overdueGoals[0].isActive).toBe(true)
      expect(overdueGoals[0].isAchieved).toBe(false)
    })
  })

  describe('Instance Methods', () => {
    let goal: IGoal

    beforeEach(async () => {
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() + 6) // 6 months from now

      goal = await GoalModel.create({
        userId,
        name: 'Test Goal',
        targetAmount: 2000,
        currentAmount: 500,
        targetDate,
        type: 'savings'
      })
    })

    it('should add contribution', async () => {
      const contribution = 300
      const updatedGoal = await goal.addContribution(contribution)

      expect(updatedGoal.currentAmount).toBe(800) // 500 + 300
    })

    it('should not exceed target amount when adding contribution', async () => {
      const largeContribution = 2000 // More than remaining amount
      const updatedGoal = await goal.addContribution(largeContribution)

      expect(updatedGoal.currentAmount).toBe(2000) // Capped at target amount
      expect(updatedGoal.isAchieved).toBe(true)
    })

    it('should calculate expected progress', async () => {
      // Mock dates for predictable calculation
      const createdAt = new Date('2024-01-01')
      const targetDate = new Date('2024-07-01') // 6 months later
      const now = new Date('2024-03-01') // 2 months after creation

      goal.createdAt = createdAt
      goal.targetDate = targetDate

      jest.useFakeTimers().setSystemTime(now)

      const expectedProgress = goal.calculateExpectedProgress()
      expect(expectedProgress).toBeCloseTo(33.33, 1) // 2/6 months = 33.33%

      jest.useRealTimers()
    })

    it('should calculate projected completion date', async () => {
      // Set creation date to 30 days ago
      const createdAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      goal.createdAt = createdAt

      const projectedDate = goal.calculateProjectedCompletionDate()
      expect(projectedDate).toBeDefined()
      expect(projectedDate!.getTime()).toBeGreaterThan(Date.now())
    })

    it('should return null projected completion date for zero contribution rate', async () => {
      // Set current amount to 0 and creation date to now (no progress)
      goal.currentAmount = 0
      goal.createdAt = new Date()

      const projectedDate = goal.calculateProjectedCompletionDate()
      expect(projectedDate).toBeNull()
    })

    it('should return achieved date for completed goals', async () => {
      goal.currentAmount = 2000
      goal.isAchieved = true
      goal.achievedDate = new Date()

      const projectedDate = goal.calculateProjectedCompletionDate()
      expect(projectedDate).toEqual(goal.achievedDate)
    })

    it('should update target', async () => {
      const newTargetAmount = 3000
      const newTargetDate = new Date()
      newTargetDate.setMonth(newTargetDate.getMonth() + 12)

      const updatedGoal = await goal.updateTarget(newTargetAmount, newTargetDate)

      expect(updatedGoal.targetAmount).toBe(newTargetAmount)
      expect(updatedGoal.targetDate).toEqual(newTargetDate)
    })

    it('should update target amount only', async () => {
      const originalTargetDate = goal.targetDate
      const newTargetAmount = 2500

      const updatedGoal = await goal.updateTarget(newTargetAmount)

      expect(updatedGoal.targetAmount).toBe(newTargetAmount)
      expect(updatedGoal.targetDate).toEqual(originalTargetDate)
    })

    it('should deactivate goal', async () => {
      const deactivatedGoal = await goal.deactivate()
      expect(deactivatedGoal.isActive).toBe(false)
    })
  })

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await GoalModel.collection.getIndexes()
      const indexNames = Object.keys(indexes)

      expect(indexNames).toContain('userId_1_isActive_1')
      expect(indexNames).toContain('userId_1_type_1')
      expect(indexNames).toContain('userId_1_priority_1')
      expect(indexNames).toContain('userId_1_targetDate_1')
      expect(indexNames).toContain('userId_1_isAchieved_1')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const goal = await GoalModel.create({
        userId,
        name: 'Test Goal',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'savings'
      })

      const json = goal.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})