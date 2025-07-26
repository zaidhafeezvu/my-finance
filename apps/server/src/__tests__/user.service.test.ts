import { userService, UpdatePreferencesData, UpdateProfileData } from '../services/user.service'
import { User } from '../models/User.model'
import { AppError } from '../middleware/error.middleware'

// Mock the User model
jest.mock('../models/User.model')

const MockedUser = User as jest.Mocked<typeof User>

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
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
          loginAttempts: 0,
          emailVerified: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      MockedUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      } as any)

      const result = await userService.getUserProfile('user123')

      expect(result).toBeDefined()
      expect(result.email).toBe('test@example.com')
      expect(result.profile.firstName).toBe('John')
      expect(result.preferences.currency).toBe('USD')
    })

    it('should throw error for non-existent user', async () => {
      MockedUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(userService.getUserProfile('nonexistent'))
        .rejects.toThrow(new AppError('User not found', 404))
    })
  })

  describe('updatePreferences', () => {
    it('should update currency preference', async () => {
      const mockUser = {
        _id: 'user123',
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
        profile: {
          timezone: 'America/New_York'
        },
        save: jest.fn().mockResolvedValue(true)
      }

      const updatedUser = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          currency: 'EUR'
        }
      }

      MockedUser.findById.mockResolvedValueOnce(mockUser as any)
      MockedUser.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(updatedUser)
      } as any)

      const result = await userService.updatePreferences('user123', { currency: 'EUR' })

      expect(mockUser.save).toHaveBeenCalled()
      expect(result.preferences.currency).toBe('EUR')
    })

    it('should update notification preferences', async () => {
      const mockUser = {
        _id: 'user123',
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
        profile: {
          timezone: 'America/New_York'
        },
        save: jest.fn().mockResolvedValue(true)
      }

      const updatedUser = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          notifications: {
            ...mockUser.preferences.notifications,
            email: false,
            budget: false
          }
        }
      }

      MockedUser.findById.mockResolvedValueOnce(mockUser as any)
      MockedUser.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(updatedUser)
      } as any)

      const result = await userService.updatePreferences('user123', {
        notifications: { email: false, budget: false }
      })

      expect(result.preferences.notifications.email).toBe(false)
      expect(result.preferences.notifications.budget).toBe(false)
    })

    it('should throw error for non-existent user', async () => {
      MockedUser.findById.mockResolvedValue(null)

      await expect(userService.updatePreferences('nonexistent', { currency: 'EUR' }))
        .rejects.toThrow(new AppError('User not found', 404))
    })
  })

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      const mockUser = {
        _id: 'user123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          timezone: 'America/New_York'
        },
        save: jest.fn().mockResolvedValue(true)
      }

      const updatedUser = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }

      MockedUser.findById.mockResolvedValueOnce(mockUser as any)
      MockedUser.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(updatedUser)
      } as any)

      const result = await userService.updateProfile('user123', {
        firstName: 'Jane',
        lastName: 'Smith'
      })

      expect(mockUser.save).toHaveBeenCalled()
      expect(result.profile.firstName).toBe('Jane')
      expect(result.profile.lastName).toBe('Smith')
    })

    it('should throw error for non-existent user', async () => {
      MockedUser.findById.mockResolvedValue(null)

      await expect(userService.updateProfile('nonexistent', { firstName: 'Jane' }))
        .rejects.toThrow(new AppError('User not found', 404))
    })
  })

  describe('resetPreferences', () => {
    it('should reset preferences to default values', async () => {
      const mockUser = {
        _id: 'user123',
        preferences: {
          currency: 'EUR',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: false,
            push: true,
            budget: false,
            bills: false
          }
        },
        save: jest.fn().mockResolvedValue(true)
      }

      const resetUser = {
        ...mockUser,
        preferences: {
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            push: false,
            budget: true,
            bills: true
          }
        }
      }

      MockedUser.findById.mockResolvedValueOnce(mockUser as any)
      MockedUser.findById.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(resetUser)
      } as any)

      const result = await userService.resetPreferences('user123')

      expect(mockUser.save).toHaveBeenCalled()
      expect(result.preferences.currency).toBe('USD')
      expect(result.preferences.dateFormat).toBe('MM/DD/YYYY')
      expect(result.preferences.notifications.email).toBe(true)
      expect(result.preferences.notifications.push).toBe(false)
      expect(result.preferences.notifications.budget).toBe(true)
      expect(result.preferences.notifications.bills).toBe(true)
    })

    it('should throw error for non-existent user', async () => {
      MockedUser.findById.mockResolvedValue(null)

      await expect(userService.resetPreferences('nonexistent'))
        .rejects.toThrow(new AppError('User not found', 404))
    })
  })

  describe('getPreferenceOptions', () => {
    it('should return available preference options', () => {
      const options = userService.getPreferenceOptions()

      expect(options).toHaveProperty('currencies')
      expect(options).toHaveProperty('dateFormats')
      expect(options).toHaveProperty('timezones')

      expect(options.currencies).toContain('USD')
      expect(options.currencies).toContain('EUR')
      expect(options.currencies).toContain('GBP')

      expect(options.dateFormats).toContain('MM/DD/YYYY')
      expect(options.dateFormats).toContain('DD/MM/YYYY')
      expect(options.dateFormats).toContain('YYYY-MM-DD')

      expect(options.timezones).toContain('America/New_York')
      expect(options.timezones).toContain('Europe/London')
      expect(options.timezones).toContain('Asia/Tokyo')
    })
  })
})