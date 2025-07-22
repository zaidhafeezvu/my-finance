export const formatDate = (date: Date, format: string = 'MM/DD/YYYY'): string => {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`
  }
}

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}