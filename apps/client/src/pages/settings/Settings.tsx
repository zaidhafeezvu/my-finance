import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { UpdatePreferencesData, NotificationPreferencesUpdate } from '@finance-app/shared'
import { userAPI } from '../../services/api'
import './Settings.css'

interface SettingsFormData {
  currency: string
  dateFormat: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    budget: boolean
    bills: boolean
    investments: boolean
    goals: boolean
    security: boolean
    marketing: boolean
  }
}

const Settings: React.FC = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsFormData>({
    defaultValues: {
      currency: user?.preferences.currency || 'USD',
      dateFormat: user?.preferences.dateFormat || 'MM/DD/YYYY',
      timezone: user?.profile.timezone || 'America/New_York',
      notifications: {
        email: user?.preferences.notifications.email ?? true,
        push: user?.preferences.notifications.push ?? true,
        budget: user?.preferences.notifications.budget ?? true,
        bills: user?.preferences.notifications.bills ?? true,
        investments: user?.preferences.notifications.investments ?? true,
        goals: user?.preferences.notifications.goals ?? true,
        security: user?.preferences.notifications.security ?? true,
        marketing: user?.preferences.notifications.marketing ?? false,
      },
    },
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const updateData: UpdatePreferencesData = {
        currency: data.currency as any,
        dateFormat: data.dateFormat as any,
        timezone: data.timezone as any,
        notifications: data.notifications,
      }

      await userAPI.updatePreferences(updateData)
      setIsSuccess(true)
      
      // Reset form dirty state
      reset(data)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="settings-container">
        <div className="loading-container">
          <div className="loading-spinner">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your Finance App experience</p>
      </div>

      <div className="settings-content">
        <form onSubmit={handleSubmit(onSubmit)} className="settings-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="success-message">
              Settings updated successfully!
            </div>
          )}

          {/* General Preferences */}
          <div className="settings-card">
            <div className="card-header">
              <h2>General Preferences</h2>
              <p>Configure your display and formatting preferences</p>
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                {...register('currency', {
                  required: 'Currency is required',
                })}
                className={errors.currency ? 'error' : ''}
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CHF">Swiss Franc (CHF)</option>
                <option value="CNY">Chinese Yuan (CNY)</option>
              </select>
              {errors.currency && (
                <span className="field-error">{errors.currency.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                {...register('dateFormat', {
                  required: 'Date format is required',
                })}
                className={errors.dateFormat ? 'error' : ''}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (European Format)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
              </select>
              {errors.dateFormat && (
                <span className="field-error">{errors.dateFormat.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                {...register('timezone', {
                  required: 'Timezone is required',
                })}
                className={errors.timezone ? 'error' : ''}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
              {errors.timezone && (
                <span className="field-error">{errors.timezone.message}</span>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="settings-card">
            <div className="card-header">
              <h2>Notification Preferences</h2>
              <p>Choose how you want to receive notifications</p>
            </div>

            <div className="notification-section">
              <h3>Delivery Methods</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.email')}
                  />
                  <span className="checkmark"></span>
                  Email Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.push')}
                  />
                  <span className="checkmark"></span>
                  Push Notifications
                </label>
              </div>
            </div>

            <div className="notification-section">
              <h3>Notification Types</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.budget')}
                  />
                  <span className="checkmark"></span>
                  Budget Alerts
                  <small>Get notified when you approach budget limits</small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.bills')}
                  />
                  <span className="checkmark"></span>
                  Bill Reminders
                  <small>Receive reminders for upcoming bill payments</small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.investments')}
                  />
                  <span className="checkmark"></span>
                  Investment Updates
                  <small>Get updates on your investment portfolio</small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.goals')}
                  />
                  <span className="checkmark"></span>
                  Goal Progress
                  <small>Track progress towards your financial goals</small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.security')}
                  />
                  <span className="checkmark"></span>
                  Security Alerts
                  <small>Important security and account notifications</small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('notifications.marketing')}
                  />
                  <span className="checkmark"></span>
                  Marketing Communications
                  <small>Product updates and promotional content</small>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading || !isDirty}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings