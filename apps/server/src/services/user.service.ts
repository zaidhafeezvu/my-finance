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
    investments?: boolean
    goals?: boolean
    security?: boolean
    marketing?: boolean
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
      const notificationKeys = ['email', 'push', 'budget', 'bills', 'investments', 'goals', 'security', 'marketing'] as const
      
      notificationKeys.forEach(key => {
        if (preferencesData.notifications![key] !== undefined) {
          user.preferences.notifications[key] = preferencesData.notifications![key]!
        }
      })
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
        bills: true,
        investments: true,
        goals: true,
        security: true,
        marketing: false
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
      currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
      ],
      dateFormats: [
        { format: 'MM/DD/YYYY', example: '12/31/2023', description: 'US Format' },
        { format: 'DD/MM/YYYY', example: '31/12/2023', description: 'European Format' },
        { format: 'YYYY-MM-DD', example: '2023-12-31', description: 'ISO Format' }
      ],
      timezones: [
        // North America
        { value: 'America/New_York', label: 'Eastern Time (New York)', offset: 'UTC-5/-4' },
        { value: 'America/Chicago', label: 'Central Time (Chicago)', offset: 'UTC-6/-5' },
        { value: 'America/Denver', label: 'Mountain Time (Denver)', offset: 'UTC-7/-6' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', offset: 'UTC-8/-7' },
        { value: 'America/Toronto', label: 'Eastern Time (Toronto)', offset: 'UTC-5/-4' },
        { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)', offset: 'UTC-8/-7' },
        { value: 'America/Mexico_City', label: 'Central Time (Mexico City)', offset: 'UTC-6/-5' },
        // Europe
        { value: 'Europe/London', label: 'Greenwich Mean Time (London)', offset: 'UTC+0/+1' },
        { value: 'Europe/Paris', label: 'Central European Time (Paris)', offset: 'UTC+1/+2' },
        { value: 'Europe/Berlin', label: 'Central European Time (Berlin)', offset: 'UTC+1/+2' },
        { value: 'Europe/Rome', label: 'Central European Time (Rome)', offset: 'UTC+1/+2' },
        { value: 'Europe/Madrid', label: 'Central European Time (Madrid)', offset: 'UTC+1/+2' },
        { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)', offset: 'UTC+1/+2' },
        { value: 'Europe/Stockholm', label: 'Central European Time (Stockholm)', offset: 'UTC+1/+2' },
        { value: 'Europe/Zurich', label: 'Central European Time (Zurich)', offset: 'UTC+1/+2' },
        // Asia
        { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)', offset: 'UTC+9' },
        { value: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)', offset: 'UTC+8' },
        { value: 'Asia/Hong_Kong', label: 'Hong Kong Time', offset: 'UTC+8' },
        { value: 'Asia/Singapore', label: 'Singapore Standard Time', offset: 'UTC+8' },
        { value: 'Asia/Seoul', label: 'Korea Standard Time (Seoul)', offset: 'UTC+9' },
        { value: 'Asia/Mumbai', label: 'India Standard Time (Mumbai)', offset: 'UTC+5:30' },
        { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)', offset: 'UTC+4' },
        { value: 'Asia/Bangkok', label: 'Indochina Time (Bangkok)', offset: 'UTC+7' },
        // Oceania
        { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)', offset: 'UTC+10/+11' },
        { value: 'Australia/Melbourne', label: 'Australian Eastern Time (Melbourne)', offset: 'UTC+10/+11' },
        { value: 'Australia/Perth', label: 'Australian Western Time (Perth)', offset: 'UTC+8' },
        { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (Auckland)', offset: 'UTC+12/+13' },
        // South America
        { value: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)', offset: 'UTC-3' },
        { value: 'America/Buenos_Aires', label: 'Argentina Time (Buenos Aires)', offset: 'UTC-3' },
        { value: 'America/Lima', label: 'Peru Time (Lima)', offset: 'UTC-5' },
        // Africa
        { value: 'Africa/Cairo', label: 'Eastern European Time (Cairo)', offset: 'UTC+2' },
        { value: 'Africa/Johannesburg', label: 'South Africa Standard Time', offset: 'UTC+2' },
        { value: 'Africa/Lagos', label: 'West Africa Time (Lagos)', offset: 'UTC+1' }
      ]
    }
  }

  /**
   * Validate timezone
   */
  async validateTimezone(timezone: string): Promise<boolean> {
    const options = this.getPreferenceOptions()
    return options.timezones.some(tz => tz.value === timezone)
  }

  /**
   * Validate currency
   */
  async validateCurrency(currency: string): Promise<boolean> {
    const options = this.getPreferenceOptions()
    return options.currencies.some(curr => curr.code === currency)
  }

  /**
   * Get user's localized preferences
   */
  async getUserLocalizedPreferences(userId: string): Promise<{
    preferences: any
    timezone: string
    localizedOptions: any
  }> {
    const user = await this.getUserProfile(userId)
    const options = this.getPreferenceOptions()
    
    // Find localized information for current preferences
    const currentCurrency = options.currencies.find(c => c.code === user.preferences.currency)
    const currentDateFormat = options.dateFormats.find(d => d.format === user.preferences.dateFormat)
    const currentTimezone = options.timezones.find(t => t.value === user.profile.timezone)

    return {
      preferences: user.preferences,
      timezone: user.profile.timezone,
      localizedOptions: {
        currency: currentCurrency,
        dateFormat: currentDateFormat,
        timezone: currentTimezone
      }
    }
  }

  /**
   * Bulk update preferences with validation
   */
  async bulkUpdatePreferences(userId: string, preferencesData: UpdatePreferencesData): Promise<IUser> {
    const user = await User.findById(userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Validate all preferences before updating
    if (preferencesData.currency && !(await this.validateCurrency(preferencesData.currency))) {
      throw new AppError('Invalid currency code', 400)
    }

    if (preferencesData.timezone && !(await this.validateTimezone(preferencesData.timezone))) {
      throw new AppError('Invalid timezone', 400)
    }

    // Perform bulk update
    const updates: any = {}

    if (preferencesData.currency) {
      updates['preferences.currency'] = preferencesData.currency
    }
    
    if (preferencesData.dateFormat) {
      updates['preferences.dateFormat'] = preferencesData.dateFormat
    }
    
    if (preferencesData.timezone) {
      updates['profile.timezone'] = preferencesData.timezone
    }
    
    if (preferencesData.notifications) {
      Object.keys(preferencesData.notifications).forEach(key => {
        if (preferencesData.notifications![key as keyof typeof preferencesData.notifications] !== undefined) {
          updates[`preferences.notifications.${key}`] = preferencesData.notifications![key as keyof typeof preferencesData.notifications]
        }
      })
    }

    // Use findByIdAndUpdate for atomic operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash')

    if (!updatedUser) {
      throw new AppError('Failed to update preferences', 500)
    }

    return updatedUser
  }

  /**
   * Get preference validation status
   */
  async validateAllPreferences(preferencesData: UpdatePreferencesData): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    if (preferencesData.currency && !(await this.validateCurrency(preferencesData.currency))) {
      errors.push('Invalid currency code')
    }

    if (preferencesData.timezone && !(await this.validateTimezone(preferencesData.timezone))) {
      errors.push('Invalid timezone')
    }

    if (preferencesData.dateFormat) {
      const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
      if (!validFormats.includes(preferencesData.dateFormat)) {
        errors.push('Invalid date format')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export const userService = new UserService()