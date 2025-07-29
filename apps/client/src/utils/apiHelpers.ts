// Helper utilities for API interactions
export const isRateLimitError = (error: any): boolean => {
  return error.response?.status === 429
}

export const getRateLimitRetryAfter = (error: any): number | null => {
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

export const handleApiError = (error: any): string => {
  if (isRateLimitError(error)) {
    const retryAfter = getRateLimitRetryAfter(error)
    return formatRateLimitMessage(retryAfter)
  }
  
  return error.response?.data?.message || 'An unexpected error occurred'
}