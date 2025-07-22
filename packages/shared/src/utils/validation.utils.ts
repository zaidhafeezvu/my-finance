export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const isValidAmount = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0
}

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime())
}

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}