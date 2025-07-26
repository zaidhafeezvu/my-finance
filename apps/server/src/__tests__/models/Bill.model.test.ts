import mongoose from 'mongoose'
import { BillModel, IBill } from '../../models/Bill.model'
import { User } from '../../models/User.model'

describe('Bill Model', () => {
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

  describe('Bill Creation', () => {
    it('should create a valid bill', async () => {
      const dueDate = new Date('2024-02-01')
      const billData = {
        userId,
        name: 'Electric Bill',
        amount: 150.00,
        dueDate,
        recurrence: {
          type: 'monthly' as const,
          interval: 1
        },
        category: 'Utilities',
        reminderDays: [7, 3, 1]
      }

      const bill = new BillModel(billData)
      const savedBill = await bill.save()

      expect(savedBill._id).toBeDefined()
      expect(savedBill.userId.toString()).toBe(userId.toString())
      expect(savedBill.name).toBe('Electric Bill')
      expect(savedBill.amount).toBe(150.00)
      expect(savedBill.dueDate).toEqual(dueDate)
      expect(savedBill.recurrence.type).toBe('monthly')
      expect(savedBill.recurrence.interval).toBe(1)
      expect(savedBill.category).toBe('Utilities')
      expect(savedBill.isAutoPay).toBe(false)
      expect(savedBill.isActive).toBe(true)
      expect(savedBill.reminderDays).toEqual([7, 3, 1])
      expect(savedBill.nextDueDate).toBeDefined()
    })

    it('should require userId', async () => {
      const billData = {
        name: 'Test Bill',
        amount: 100,
        dueDate: new Date(),
        recurrence: { type: 'monthly' as const, interval: 1 },
        category: 'Test'
      }

      const bill = new BillModel(billData)
      await expect(bill.save()).rejects.toThrow()
    })

    it('should require name', async () => {
      const billData = {
        userId,
        amount: 100,
        dueDate: new Date(),
        recurrence: { type: 'monthly' as const, interval: 1 },
        category: 'Test'
      }

      const bill = new BillModel(billData)
      await expect(bill.save()).rejects.toThrow()
    })

    it('should validate amount is positive', async () => {
      const billData = {
        userId,
        name: 'Test Bill',
        amount: -100,
        dueDate: new Date(),
        recurrence: { type: 'monthly' as const, interval: 1 },
        category: 'Test'
      }

      const bill = new BillModel(billData)
      await expect(bill.save()).rejects.toThrow()
    })

    it('should validate recurrence type enum', async () => {
      const billData = {
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate: new Date(),
        recurrence: { type: 'invalid' as any, interval: 1 },
        category: 'Test'
      }

      const bill = new BillModel(billData)
      await expect(bill.save()).rejects.toThrow()
    })

    it('should validate recurrence interval is positive', async () => {
      const billData = {
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate: new Date(),
        recurrence: { type: 'monthly' as const, interval: 0 },
        category: 'Test'
      }

      const bill = new BillModel(billData)
      await expect(bill.save()).rejects.toThrow()
    })
  })

  describe('Virtual Properties', () => {
    let bill: IBill

    beforeEach(async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5) // 5 days from now

      bill = await BillModel.create({
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate: futureDate,
        recurrence: { type: 'monthly', interval: 1 },
        category: 'Test',
        nextDueDate: futureDate
      })
    })

    it('should calculate days until due', async () => {
      expect(bill.daysUntilDue).toBe(5)
    })

    it('should determine if overdue', async () => {
      expect(bill.isOverdue).toBe(false)

      // Set next due date to past
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      bill.nextDueDate = pastDate
      expect(bill.isOverdue).toBe(true)
    })
  })

  describe('Pre-save Middleware', () => {
    it('should calculate next due date on creation', async () => {
      const dueDate = new Date('2024-01-15')
      const bill = await BillModel.create({
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate,
        recurrence: { type: 'monthly', interval: 1 },
        category: 'Test'
      })

      expect(bill.nextDueDate).toBeDefined()
      // If due date is in future, nextDueDate should equal dueDate
      if (dueDate > new Date()) {
        expect(bill.nextDueDate).toEqual(dueDate)
      }
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      const now = new Date()
      const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
      const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      const soonDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from now

      await BillModel.create([
        {
          userId,
          name: 'Active Bill 1',
          amount: 100,
          dueDate: futureDate,
          recurrence: { type: 'monthly', interval: 1 },
          category: 'Utilities',
          nextDueDate: futureDate,
          isActive: true
        },
        {
          userId,
          name: 'Active Bill 2',
          amount: 200,
          dueDate: soonDate,
          recurrence: { type: 'weekly', interval: 1 },
          category: 'Subscriptions',
          nextDueDate: soonDate,
          isActive: true
        },
        {
          userId,
          name: 'Inactive Bill',
          amount: 50,
          dueDate: futureDate,
          recurrence: { type: 'monthly', interval: 1 },
          category: 'Other',
          nextDueDate: futureDate,
          isActive: false
        },
        {
          userId,
          name: 'Overdue Bill',
          amount: 75,
          dueDate: pastDate,
          recurrence: { type: 'monthly', interval: 1 },
          category: 'Utilities',
          nextDueDate: pastDate,
          isActive: true
        }
      ])
    })

    it('should find active bills by user', async () => {
      const bills = await BillModel.findActiveByUser(userId.toString())
      expect(bills).toHaveLength(3) // All active bills
      expect(bills.every(b => b.isActive)).toBe(true)
      // Should be sorted by nextDueDate
      expect(bills[0].nextDueDate.getTime()).toBeLessThanOrEqual(bills[1].nextDueDate.getTime())
    })

    it('should find upcoming bills', async () => {
      const bills = await BillModel.findUpcomingBills(userId.toString(), 30)
      expect(bills).toHaveLength(3) // All bills due within 30 days
      expect(bills.every(b => b.isActive)).toBe(true)
    })

    it('should find upcoming bills with custom days', async () => {
      const bills = await BillModel.findUpcomingBills(userId.toString(), 1)
      expect(bills).toHaveLength(1) // Only overdue bill (past due is <= 1 day from now)
    })

    it('should find overdue bills', async () => {
      const bills = await BillModel.findOverdueBills(userId.toString())
      expect(bills).toHaveLength(1)
      expect(bills[0].name).toBe('Overdue Bill')
      expect(bills[0].isActive).toBe(true)
    })

    it('should find bills by category', async () => {
      const bills = await BillModel.findByCategory(userId.toString(), 'Utilities')
      expect(bills).toHaveLength(2) // Active Bill 1 and Overdue Bill
      expect(bills.every(b => b.category === 'Utilities')).toBe(true)
      expect(bills.every(b => b.isActive)).toBe(true)
    })
  })

  describe('Instance Methods', () => {
    let bill: IBill

    beforeEach(async () => {
      const dueDate = new Date('2024-02-01')
      bill = await BillModel.create({
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate,
        recurrence: { type: 'monthly', interval: 1 },
        category: 'Test',
        reminderDays: [7, 3, 1]
      })
    })

    it('should calculate next due date for monthly recurrence', async () => {
      const currentDue = new Date('2024-01-01') // Past date
      bill.dueDate = currentDue
      
      const nextDue = bill.calculateNextDueDate()
      expect(nextDue.getMonth()).toBeGreaterThan(currentDue.getMonth())
    })

    it('should calculate next due date for weekly recurrence', async () => {
      bill.recurrence.type = 'weekly'
      const currentDue = new Date('2024-01-01') // Past date
      bill.dueDate = currentDue
      
      const nextDue = bill.calculateNextDueDate()
      const daysDiff = (nextDue.getTime() - currentDue.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeGreaterThanOrEqual(7)
    })

    it('should calculate next due date for yearly recurrence', async () => {
      bill.recurrence.type = 'yearly'
      const currentDue = new Date('2023-01-01') // Past date
      bill.dueDate = currentDue
      
      const nextDue = bill.calculateNextDueDate()
      expect(nextDue.getFullYear()).toBeGreaterThan(currentDue.getFullYear())
    })

    it('should mark as paid', async () => {
      const paidDate = new Date()
      const originalNextDue = bill.nextDueDate
      
      const updatedBill = await bill.markAsPaid(paidDate)
      
      expect(updatedBill.lastPaidDate).toEqual(paidDate)
      expect(updatedBill.nextDueDate.getTime()).toBeGreaterThan(originalNextDue.getTime())
    })

    it('should mark as paid with default date', async () => {
      const beforePaid = new Date()
      const updatedBill = await bill.markAsPaid()
      const afterPaid = new Date()
      
      expect(updatedBill.lastPaidDate!.getTime()).toBeGreaterThanOrEqual(beforePaid.getTime())
      expect(updatedBill.lastPaidDate!.getTime()).toBeLessThanOrEqual(afterPaid.getTime())
    })

    it('should update amount', async () => {
      const newAmount = 150
      const updatedBill = await bill.updateAmount(newAmount)
      
      expect(updatedBill.amount).toBe(newAmount)
    })

    it('should check if reminder should be sent', async () => {
      // Mock the daysUntilDue virtual property
      const mockDate = new Date()
      mockDate.setDate(mockDate.getDate() + 3) // 3 days from now
      bill.nextDueDate = mockDate
      
      expect(bill.shouldSendReminder()).toBe(true) // 3 is in reminderDays [7, 3, 1]
      
      // Test with a day not in reminder list
      mockDate.setDate(mockDate.getDate() + 2) // 5 days from now
      bill.nextDueDate = mockDate
      expect(bill.shouldSendReminder()).toBe(false)
    })

    it('should deactivate bill', async () => {
      const deactivatedBill = await bill.deactivate()
      expect(deactivatedBill.isActive).toBe(false)
    })

    it('should handle end date in recurrence', async () => {
      const endDate = new Date('2024-03-01')
      bill.recurrence.endDate = endDate
      bill.dueDate = new Date('2024-01-01') // Past date
      
      // Calculate next due date that would be after end date
      const nextDue = bill.calculateNextDueDate()
      
      if (nextDue > endDate) {
        expect(bill.isActive).toBe(false)
      }
    })
  })

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await BillModel.collection.getIndexes()
      const indexNames = Object.keys(indexes)

      expect(indexNames).toContain('userId_1_isActive_1')
      expect(indexNames).toContain('userId_1_nextDueDate_1')
      expect(indexNames).toContain('userId_1_category_1')
      expect(indexNames).toContain('nextDueDate_1_isActive_1')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const bill = await BillModel.create({
        userId,
        name: 'Test Bill',
        amount: 100,
        dueDate: new Date(),
        recurrence: { type: 'monthly', interval: 1 },
        category: 'Test'
      })

      const json = bill.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})