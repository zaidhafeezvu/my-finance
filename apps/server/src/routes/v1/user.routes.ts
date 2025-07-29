import { Router, Request, Response } from 'express'
import { authenticate, asyncHandler, validate } from '../../middleware'
import { userService } from '../../services'
import {
  updatePreferencesSchema,
  updateProfileSchema
} from '../../validators'

const router = Router()

// Apply authentication middleware to all user routes
router.use(authenticate)

// User routes overview
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'User management endpoints',
    endpoints: {
      profile: 'GET /profile',
      'update-profile': 'PUT /profile',
      preferences: 'GET /preferences',
      'update-preferences': 'PUT /preferences',
      'bulk-update-preferences': 'PATCH /preferences/bulk',
      'validate-preferences': 'POST /preferences/validate',
      'reset-preferences': 'POST /preferences/reset',
      'preference-options': 'GET /preferences/options',
      'localized-preferences': 'GET /preferences/localized'
    },
    timestamp: new Date().toISOString()
  })
})

// Get user profile and preferences
router.get('/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const user = await userService.getUserProfile(userId)

    res.json({
      status: 'success',
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          security: {
            mfaEnabled: user.security.mfaEnabled,
            lastLogin: user.security.lastLogin,
            emailVerified: user.security.emailVerified
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Update user profile
router.put('/profile',
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const profileData = req.body

    const user = await userService.updateProfile(userId, profileData)

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          updatedAt: user.updatedAt
        }
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Get user preferences
router.get('/preferences',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const user = await userService.getUserProfile(userId)

    res.json({
      status: 'success',
      message: 'User preferences retrieved successfully',
      data: {
        preferences: user.preferences,
        timezone: user.profile.timezone
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Update user preferences
router.put('/preferences',
  validate(updatePreferencesSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const preferencesData = req.body

    const user = await userService.updatePreferences(userId, preferencesData)

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences,
        timezone: user.profile.timezone
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Reset preferences to defaults
router.post('/preferences/reset',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    const user = await userService.resetPreferences(userId)

    res.json({
      status: 'success',
      message: 'Preferences reset to defaults successfully',
      data: {
        preferences: user.preferences
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Get available preference options
router.get('/preferences/options',
  asyncHandler(async (req: Request, res: Response) => {
    const options = userService.getPreferenceOptions()

    res.json({
      status: 'success',
      message: 'Preference options retrieved successfully',
      data: options,
      timestamp: new Date().toISOString()
    })
  })
)

// Get user's localized preferences with detailed information
router.get('/preferences/localized',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const localizedPreferences = await userService.getUserLocalizedPreferences(userId)

    res.json({
      status: 'success',
      message: 'Localized preferences retrieved successfully',
      data: localizedPreferences,
      timestamp: new Date().toISOString()
    })
  })
)

// Bulk update preferences with atomic operation
router.patch('/preferences/bulk',
  validate(updatePreferencesSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const preferencesData = req.body

    const user = await userService.bulkUpdatePreferences(userId, preferencesData)

    res.json({
      status: 'success',
      message: 'Preferences updated successfully (bulk)',
      data: {
        preferences: user.preferences,
        timezone: user.profile.timezone
      },
      timestamp: new Date().toISOString()
    })
  })
)

// Validate preferences without updating
router.post('/preferences/validate',
  validate(updatePreferencesSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const preferencesData = req.body
    const validation = await userService.validateAllPreferences(preferencesData)

    res.json({
      status: validation.isValid ? 'success' : 'error',
      message: validation.isValid ? 'Preferences are valid' : 'Validation failed',
      data: validation,
      timestamp: new Date().toISOString()
    })
  })
)

export { router as userRoutes }