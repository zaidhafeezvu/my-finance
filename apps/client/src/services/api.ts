import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  User, 
  LoginCredentials, 
  UserRegistrationData, 
  AuthToken,
  UpdateProfileData,
  UpdatePreferencesData
} from '@finance-app/shared'

// Import API endpoints directly to avoid build issues
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    PREFERENCES: '/api/users/preferences',
    SECURITY: '/api/users/security',
  },
} as const

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
          })
          
          const { accessToken } = response.data
          localStorage.setItem('token', accessToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  },

  register: async (userData: UserRegistrationData): Promise<AuthToken> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  },

  refreshToken: async (): Promise<AuthToken> => {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get(API_ENDPOINTS.USERS.PROFILE)
    return response.data
  },

  resetPassword: async (email: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email })
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token })
  },
}

// User API
export const userAPI = {
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put(API_ENDPOINTS.USERS.PROFILE, data)
    return response.data
  },

  updatePreferences: async (data: UpdatePreferencesData): Promise<User> => {
    const response = await api.put(API_ENDPOINTS.USERS.PREFERENCES, data)
    return response.data
  },

  updateSecurity: async (data: any): Promise<User> => {
    const response = await api.put(API_ENDPOINTS.USERS.SECURITY, data)
    return response.data
  },
}

export default api