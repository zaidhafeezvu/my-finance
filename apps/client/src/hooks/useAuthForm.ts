import { useState, useCallback, useRef } from 'react'
import { handleApiError } from '../utils/apiHelpers'

interface UseAuthFormOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  preventDoubleSubmit?: boolean
}

interface UseAuthFormReturn {
  isLoading: boolean
  error: string | null
  isSuccess: boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
  handleSubmit: <T>(
    submitFn: (data: T) => Promise<void>
  ) => (data: T) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useAuthForm = (options: UseAuthFormOptions = {}): UseAuthFormReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const submissionRef = useRef<Promise<void> | null>(null)

  const handleSubmit = useCallback(<T>(submitFn: (data: T) => Promise<void>) => {
    return async (data: T) => {
      // Prevent double submission
      if (options.preventDoubleSubmit !== false && submissionRef.current) {
        return
      }

      setIsLoading(true)
      setError(null)
      setIsSuccess(false) // Reset success state on new submission

      const submission = (async () => {
        try {
          await submitFn(data)
          setIsSuccess(true)
          options.onSuccess?.()
        } catch (err: any) {
          const errorMessage = handleApiError(err)
          setError(errorMessage)
          setIsSuccess(false)
          options.onError?.(errorMessage)
        } finally {
          setIsLoading(false)
          submissionRef.current = null
        }
      })()

      submissionRef.current = submission
      await submission
    }
  }, [options])

  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setIsSuccess(false)
    submissionRef.current = null
  }, [])

  return {
    isLoading,
    error,
    isSuccess,
    setLoading: setIsLoading,
    setError,
    setSuccess: setIsSuccess,
    handleSubmit,
    clearError,
    reset,
  }
}