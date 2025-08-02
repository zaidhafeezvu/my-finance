import { User } from '@finance-app/shared'

/**
 * Safely formats user display name with fallbacks
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user?.profile) {
    return 'User'
  }

  const { firstName, lastName } = user.profile
  
  // Sanitize and validate names
  const safeName = (name: string) => 
    name?.trim().replace(/[<>]/g, '') || ''

  const safeFirstName = safeName(firstName)
  const safeLastName = safeName(lastName)

  if (safeFirstName && safeLastName) {
    return `${safeFirstName} ${safeLastName}`
  }
  
  return safeFirstName || safeLastName || user.email.split('@')[0] || 'User'
}

/**
 * Gets user initials for avatar display
 */
export const getUserInitials = (user: User | null): string => {
  if (!user?.profile) {
    return 'U'
  }

  const { firstName, lastName } = user.profile
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || ''
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || ''
  
  return firstInitial + lastInitial || user.email.charAt(0).toUpperCase()
}