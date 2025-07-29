// Helper utilities for API interactions

interface ApiErrorResponse {
  response?: {
    status: number
    data?: {
      message?: string
      code?: string
      field?: string
    }
    headers?: {
      'retry-after'?: string
    }
  }
  message?: string
}

export const isRateLimitError = (error: ApiErrorResponse): boolean => {
  return error.response?.status === 429
}

export const getRateLimitRetryAfter = (error: ApiErrorResponse): number | null => {
  const retryAfter = error.response?.headers?.['retry-after']
  return retryAfter ? parseInt(retryAfter, 10) : null
}

export const formatRateLimitMessage = (retryAfter: number | null): string => {
  if (!retryAfter) return 'Too many requests. Please try again later.'
  
  if (retryAfter < 60) {
    return `Too many requests. Please try again in ${retryAfter} seconds.`
  }
  
  const minutes = Math.ceil(retryAfter / 60)
  return `Too many requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
}

export const getErrorStatusCode = (error: ApiErrorResponse): number | null => {
  return error.response?.status || null
}

export const isNetworkError = (error: ApiErrorResponse): boolean => {
  return !error.response && !!error.message
}

export const handleApiError = (error: ApiErrorResponse): string => {
  // Handle network errors
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.'
  }

  // Handle rate limiting
  if (isRateLimitError(error)) {
    const retryAfter = getRateLimitRetryAfter(error)
    return formatRateLimitMessage(retryAfter)
  }

  // Handle specific HTTP status codes
  const statusCode = getErrorStatusCode(error)
  switch (statusCode) {
    case 400:
      return error.response?.data?.message || 'Invalid request. Please check your input.'
    case 401:
      return 'Authentication failed. Please log in again.'
    case 403:
      return 'Access denied. You do not have permission to perform this action.'
    case 404:
      return error.response?.data?.message || 'The requested resource was not found.'
    case 500:
      return 'Server error. Please try again later.'
    default:
      return error.response?.data?.message || 'An unexpected error occurred'
  }
}