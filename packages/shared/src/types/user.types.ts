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
  email: boolean
  push: boolean
  budget: boolean
  bills: boolean
  investments: boolean
  goals: boolean
  security: boolean
  marketing: boolean
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

export interface AuthResponse {
  user: User
  token: AuthToken
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetResponse {
  message: string
  resetToken?: string // Only included in development
}

export interface EmailVerificationResponse {
  message: string
  verified: boolean
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  statusCode: number
}

export interface UpdatePreferencesData {
  currency?: Currency
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timezone?: Timezone
  notifications?: Partial<NotificationSettings>
}

export interface NotificationPreferencesUpdate {
  email?: boolean
  push?: boolean
  budget?: boolean
  bills?: boolean
  investments?: boolean
  goals?: boolean
  security?: boolean
  marketing?: boolean
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  timezone?: Timezone
}

export interface CurrencyOption {
  code: Currency
  name: string
  symbol: string
}

export interface DateFormatOption {
  format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  example: string
  description: string
}

export interface TimezoneOption {
  value: Timezone
  label: string
  offset: string
}

export interface PreferenceOptions {
  currencies: CurrencyOption[]
  dateFormats: DateFormatOption[]
  timezones: TimezoneOption[]
}

export interface LocalizedPreferences {
  preferences: UserPreferences
  timezone: Timezone
  localizedOptions: {
    currency?: CurrencyOption
    dateFormat?: DateFormatOption
    timezone?: TimezoneOption
  }
}