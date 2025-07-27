export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface FilterOptions {
  search?: string
  dateRange?: DateRange
  categories?: string[]
  accounts?: string[]
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY' | 'INR' | 'BRL'
export type Timezone = string // e.g., 'America/New_York'