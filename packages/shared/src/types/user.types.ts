import { Currency, Timezone } from './common.types'

export interface User {
  _id: string
  email: string
  profile: UserProfile
  preferences: UserPreferences
  security: UserSecurity
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string
  timezone: Timezone
}

export interface UserPreferences {
  currency: Currency
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email: {
    budgetAlerts: boolean
    billReminders: boolean
    securityAlerts: boolean
    weeklyReports: boolean
  }
  push: {
    budgetAlerts: boolean
    billReminders: boolean
    securityAlerts: boolean
  }
}

export interface UserSecurity {
  mfaEnabled: boolean
  lastLogin: Date
  loginAttempts: number
  lockedUntil?: Date
}

export interface UserRegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
  timezone?: Timezone
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}