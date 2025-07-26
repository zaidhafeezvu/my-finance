import mongoose from 'mongoose'
import { InvestmentModel, IInvestment } from '../../models/Investment.model'
import { AccountModel } from '../../models/Account.model'
import { User } from '../../models/User.model'

describe('Investment Model', () => {
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
      institutionName: 'Test Brokerage',
      accountName: 'Investment Account',
      accountType: 'investment',
      balance: { current: 10000 }
    })
    await account.save()
    accountId = account._id
  })

  describe('Investment Creation', () => {
    it('should create a valid investment', async () => {
      const investmentData = {
        userId,
        accountId,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: 150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date('2024-01-01')
      }

      const investment = new InvestmentModel(investmentData)
      const savedInvestment = await investment.save()

      expect(savedInvestment._id).toBeDefined()
      expect(savedInvestment.userId.toString()).toBe(userId.toString())
      expect(savedInvestment.accountId.toString()).toBe(accountId.toString())
      expect(savedInvestment.symbol).toBe('AAPL')
      expect(savedInvestment.name).toBe('Apple Inc.')
      expect(savedInvestment.quantity).toBe(10)
      expect(savedInvestment.currentPrice).toBe(150.00)
      expect(savedInvestment.purchasePrice).toBe(140.00)
      expect(savedInvestment.marketValue).toBe(1500) // 10 * 150
      expect(savedInvestment.gainLoss).toBe(100) // 1500 - (10 * 140)
      expect(savedInvestment.gainLossPercent).toBe(7.142857142857142) // (100 / 1400) * 100
      expect(savedInvestment.lastUpdated).toBeDefined()
    })

    it('should require userId', async () => {
      const investmentData = {
        accountId,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: 150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date()
      }

      const investment = new InvestmentModel(investmentData)
      await expect(investment.save()).rejects.toThrow()
    })

    it('should require accountId', async () => {
      const investmentData = {
        userId,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: 150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date()
      }

      const investment = new InvestmentModel(investmentData)
      await expect(investment.save()).rejects.toThrow()
    })

    it('should validate quantity is positive', async () => {
      const investmentData = {
        userId,
        accountId,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: -5,
        currentPrice: 150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date()
      }

      const investment = new InvestmentModel(investmentData)
      await expect(investment.save()).rejects.toThrow()
    })

    it('should validate prices are positive', async () => {
      const investmentData = {
        userId,
        accountId,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: -150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date()
      }

      const investment = new InvestmentModel(investmentData)
      await expect(investment.save()).rejects.toThrow()
    })

    it('should convert symbol to uppercase', async () => {
      const investmentData = {
        userId,
        accountId,
        symbol: 'aapl',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: 150.00,
        purchasePrice: 140.00,
        purchaseDate: new Date()
      }

      const investment = new InvestmentModel(investmentData)
      const savedInvestment = await investment.save()
      expect(savedInvestment.symbol).toBe('AAPL')
    })
  })

  describe('Pre-save Calculations', () => {
    it('should calculate market value correctly', async () => {
      const investment = await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 5,
        currentPrice: 200.00,
        purchasePrice: 180.00,
        purchaseDate: new Date()
      })

      expect(investment.marketValue).toBe(1000) // 5 * 200
    })

    it('should calculate gain/loss correctly', async () => {
      const investment = await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        quantity: 8,
        currentPrice: 300.00,
        purchasePrice: 250.00,
        purchaseDate: new Date()
      })

      const totalCost = 8 * 250 // 2000
      const marketValue = 8 * 300 // 2400
      const expectedGainLoss = marketValue - totalCost // 400

      expect(investment.gainLoss).toBe(expectedGainLoss)
      expect(investment.gainLossPercent).toBe(20) // (400 / 2000) * 100
    })

    it('should handle zero cost basis', async () => {
      const investment = await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'FREE',
        name: 'Free Stock',
        quantity: 10,
        currentPrice: 50.00,
        purchasePrice: 0,
        purchaseDate: new Date()
      })

      expect(investment.gainLossPercent).toBe(0)
    })
  })

  describe('Static Methods', () => {
    beforeEach(async () => {
      await InvestmentModel.create([
        {
          userId,
          accountId,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 10,
          currentPrice: 150.00,
          purchasePrice: 140.00,
          purchaseDate: new Date('2024-01-01')
        },
        {
          userId,
          accountId,
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 5,
          currentPrice: 2500.00,
          purchasePrice: 2400.00,
          purchaseDate: new Date('2024-01-15')
        }
      ])
    })

    it('should find investments by user', async () => {
      const investments = await InvestmentModel.findByUser(userId.toString())
      expect(investments).toHaveLength(2)
      expect(investments[0].symbol).toBe('AAPL') // Should be sorted by symbol
      expect(investments[1].symbol).toBe('GOOGL')
    })

    it('should find investments by account', async () => {
      const investments = await InvestmentModel.findByAccount(accountId.toString())
      expect(investments).toHaveLength(2)
    })

    it('should find investment by symbol', async () => {
      const investment = await InvestmentModel.findBySymbol(userId.toString(), 'AAPL')
      expect(investment).toBeTruthy()
      expect(investment!.symbol).toBe('AAPL')
      expect(investment!.name).toBe('Apple Inc.')
    })

    it('should find investment by symbol case-insensitive', async () => {
      const investment = await InvestmentModel.findBySymbol(userId.toString(), 'aapl')
      expect(investment).toBeTruthy()
      expect(investment!.symbol).toBe('AAPL')
    })

    it('should get portfolio summary', async () => {
      const summary = await InvestmentModel.getPortfolioSummary(userId.toString())
      expect(summary).toHaveLength(1)
      
      const portfolioData = summary[0]
      expect(portfolioData.totalValue).toBe(14000) // (10 * 150) + (5 * 2500)
      expect(portfolioData.totalGainLoss).toBe(600) // 100 + 500
      expect(portfolioData.investmentCount).toBe(2)
      expect(portfolioData.totalGainLossPercent).toBeCloseTo(4.69, 2) // (600 / 12800) * 100
    })

    it('should find stale investments', async () => {
      // Create an investment with old lastUpdated timestamp
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'STALE',
        name: 'Stale Stock',
        quantity: 1,
        currentPrice: 100.00,
        purchasePrice: 100.00,
        purchaseDate: new Date(),
        lastUpdated: oldDate
      })

      const staleInvestments = await InvestmentModel.findStaleInvestments(1) // 1 hour threshold
      expect(staleInvestments).toHaveLength(1)
      expect(staleInvestments[0].symbol).toBe('STALE')
    })
  })

  describe('Instance Methods', () => {
    let investment: IInvestment

    beforeEach(async () => {
      investment = await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'NVDA',
        name: 'NVIDIA Corp.',
        quantity: 20,
        currentPrice: 400.00,
        purchasePrice: 350.00,
        purchaseDate: new Date('2024-01-01')
      })
    })

    it('should update price', async () => {
      const newPrice = 450.00
      const updatedInvestment = await investment.updatePrice(newPrice)

      expect(updatedInvestment.currentPrice).toBe(newPrice)
      expect(updatedInvestment.marketValue).toBe(9000) // 20 * 450
      expect(updatedInvestment.gainLoss).toBe(2000) // 9000 - (20 * 350)
      expect(updatedInvestment.lastUpdated.getTime()).toBeGreaterThan(investment.lastUpdated.getTime())
    })

    it('should update quantity', async () => {
      const newQuantity = 25
      const updatedInvestment = await investment.updateQuantity(newQuantity)

      expect(updatedInvestment.quantity).toBe(newQuantity)
      expect(updatedInvestment.marketValue).toBe(10000) // 25 * 400
      expect(updatedInvestment.gainLoss).toBe(1250) // 10000 - (25 * 350)
    })

    it('should check if price is stale', async () => {
      expect(investment.isPriceStale(24)).toBe(false) // Within 24 hours

      // Mock an old timestamp
      investment.lastUpdated = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      expect(investment.isPriceStale(1)).toBe(true) // Older than 1 hour
    })
  })

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await InvestmentModel.collection.getIndexes()
      const indexNames = Object.keys(indexes)

      expect(indexNames).toContain('userId_1_accountId_1')
      expect(indexNames).toContain('userId_1_symbol_1')
      expect(indexNames).toContain('symbol_1_lastUpdated_-1')
      expect(indexNames).toContain('lastUpdated_1')
    })
  })

  describe('JSON Transformation', () => {
    it('should transform ObjectIds to strings in JSON', async () => {
      const investment = await InvestmentModel.create({
        userId,
        accountId,
        symbol: 'TEST',
        name: 'Test Stock',
        quantity: 1,
        currentPrice: 100.00,
        purchasePrice: 100.00,
        purchaseDate: new Date()
      })

      const json = investment.toJSON()
      expect(typeof json._id).toBe('string')
      expect(typeof json.userId).toBe('string')
      expect(typeof json.accountId).toBe('string')
      expect(json.__v).toBeUndefined()
    })
  })
})