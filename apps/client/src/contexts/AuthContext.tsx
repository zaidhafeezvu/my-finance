import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { getCurrentUser, refreshToken } from '../store/slices/authSlice'
import { User } from '@finance-app/shared'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, isLoading, error, token } = useSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    // Check if user is authenticated on app load
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          await dispatch(getCurrentUser()).unwrap()
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            await dispatch(refreshToken()).unwrap()
            await dispatch(getCurrentUser()).unwrap()
          } catch (refreshError) {
            // Both failed, user needs to login again
            console.error('Authentication initialization failed:', refreshError)
          }
        }
      }
    }

    initializeAuth()
  }, [dispatch, token, user])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}