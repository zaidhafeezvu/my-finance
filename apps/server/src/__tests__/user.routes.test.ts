import request from 'supertest'
import { app } from '../index'
import { userService } from '../services/user.service'
import jwt from 'jsonwebtoken'

// Mock the user service
jest.mock('../services/user.service')
jest.mock('jsonwebtoken')

const MockedUserService = userService as jest.Mocked<typeof userService>
const MockedJWT = jwt as jest.Mocked<typeof jwt>

describe('User Routes', () => {
  let authToken: string

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock JWT verification for authentication middleware
    authToken = 'valid-token'
    MockedJWT.verify.mockReturnValue({
      id: 'user123',
      email: 'test@example.com'
    } as any)
  })



  describe('GET /api/v1/user/profile', () => {
    it('should get user profile successfully', async () => {
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
          emailVerified: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      MockedUserService.getUserProfile.mockResolvedValue(mockUser as any)

      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com')
      expect(response.body.data.user).toHaveProperty('profile')
      expect(response.body.data.user).toHaveProperty('preferences')
      expect(MockedUserService.getUserProfile).toHaveBeenCalledWith('user123')
    })

    it('should require authentication', async () => {
      MockedJWT.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const response = await request(app)
        .get('/api/v1/user/profile')
        .expect(401)

      expect(response.body.status).toBe('error')
    })
  })

  describe('PUT /api/v1/user/profile', () => {
    it('should update profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890'
      }

      const mockUpdatedUser = {
        _id: 'user123',
        email: 'test@example.com',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567890',
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
        updatedAt: new Date()
      }

      MockedUserService.updateProfile.mockResolvedValue(mockUpdatedUser as any)

      const response = await request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.user.profile.firstName).toBe('Jane')
      expect(response.body.data.user.profile.lastName).toBe('Smith')
      expect(response.body.data.user.profile.phone).toBe('+1234567890')
      expect(MockedUserService.updateProfile).toHaveBeenCalledWith('user123', updateData)
    })

    it('should validate profile data', async () => {
      const invalidData = {
        firstName: '', // Empty string should fail
        phone: 'invalid-phone'
      }

      const response = await request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.status).toBe('error')
    })
  })

  describe('PUT /api/v1/user/preferences', () => {
    it('should update preferences successfully', async () => {
      const updateData = {
        currency: 'EUR',
        notifications: {
          email: false,
          budget: false
        }
      }

      const mockUpdatedUser = {
        _id: 'user123',
        preferences: {
          currency: 'EUR',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: false,
            push: false,
            budget: false,
            bills: true
          }
        },
        profile: {
          timezone: 'America/New_York'
        }
      }

      MockedUserService.updatePreferences.mockResolvedValue(mockUpdatedUser as any)

      const response = await request(app)
        .put('/api/v1/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.preferences.currency).toBe('EUR')
      expect(response.body.data.preferences.notifications.email).toBe(false)
      expect(response.body.data.preferences.notifications.budget).toBe(false)
      expect(MockedUserService.updatePreferences).toHaveBeenCalledWith('user123', updateData)
    })

    it('should validate currency values', async () => {
      const invalidData = {
        currency: 'INVALID'
      }

      const response = await request(app)
        .put('/api/v1/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.status).toBe('error')
    })
  })

  describe('GET /api/v1/user/preferences/options', () => {
    it('should get preference options', async () => {
      const mockOptions = {
        currencies: ['USD', 'EUR', 'GBP'],
        dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
        timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo']
      }

      MockedUserService.getPreferenceOptions.mockReturnValue(mockOptions)

      const response = await request(app)
        .get('/api/v1/user/preferences/options')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toEqual(mockOptions)
      expect(MockedUserService.getPreferenceOptions).toHaveBeenCalled()
    })
  })
})