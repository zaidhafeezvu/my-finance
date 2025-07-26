import { User, IUser } from '../models/User.model'
import { AppError } from '../middleware/error.middleware'

export interface UpdatePreferencesData {
  currency?: string
  dateFormat?: string
  timezone?: string
  notifications?: {
    email?: boolean
    push?: boolean
    budget?: boolean
    bills?: boolean
  }
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  timezone?: string
}

class UserService {
  /**
   * Get user profile and preferences
   */
  async getUserProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash')
    
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    return user
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferencesData: UpdatePreferencesData): Promise<IUser> {
    const user = await User.findById(userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Update preferences
    if (preferencesData.currency) {
      user.preferences.currency = preferencesData.currency
    }
    
    if (preferencesData.dateFormat) {
      user.preferences.dateFormat = preferencesData.dateFormat
    }
    
    if (preferencesData.timezone) {
      user.profile.timezone = preferencesData.timezone
    }
    
    if (preferencesData.notifications) {
      // Update notification preferences
      if (preferencesData.notifications.email !== undefined) {
        user.preferences.notifications.email = preferencesData.notifications.email
      }
      if (preferencesData.notifications.push !== undefined) {
        user.preferences.notifications.push = preferencesData.notifications.push
      }
      if (preferencesData.notifications.budget !== undefined) {
        user.preferences.notifications.budget = preferencesData.notifications.budget
      }
      if (preferencesData.notifications.bills !== undefined) {
        user.preferences.notifications.bills = preferencesData.notifications.bills
      }
    }

    await user.save()
    
    // Return user without password hash
    return await User.findById(userId).select('-passwordHash') as IUser
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: UpdateProfileData): Promise<IUser> {
    const user = await User.findById(userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Update profile fields
    if (profileData.firstName) {
      user.profile.firstName = profileData.firstName
    }
    
    if (profileData.lastName) {
      user.profile.lastName = profileData.lastName
    }
    
    if (profileData.phone !== undefined) {
      user.profile.phone = profileData.phone
    }
    
    if (profileData.timezone) {
      user.profile.timezone = profileData.timezone
    }

    await user.save()
    
    // Return user without password hash
    return await User.findById(userId).select('-passwordHash') as IUser
  }

  /**
   * Reset preferences to default values
   */
  async resetPreferences(userId: string): Promise<IUser> {
    const user = await User.findById(userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Reset to default values
    user.preferences = {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: false,
        budget: true,
        bills: true
      }
    }

    await user.save()
    
    // Return user without password hash
    return await User.findById(userId).select('-passwordHash') as IUser
  }

  /**
   * Get available preference options
   */
  getPreferenceOptions() {
    return {
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      timezones: [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney'
      ]
    }
  }
}

export const userService = new UserService()