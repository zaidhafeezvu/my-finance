import { Router, Request, Response } from 'express'
import { authRateLimiter, asyncHandler, validate } from '../../middleware'
import { authService } from '../../services'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  resendEmailVerificationSchema
} from '../../validators'

const router = Router()

// Apply rate limiting to all auth routes
router.use(authRateLimiter)

// Auth endpoints overview
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Authentication endpoints',
    endpoints: {
      register: 'POST /register',
      login: 'POST /login',
      refresh: 'POST /refresh',
      'forgot-password': 'POST /forgot-password',
      'reset-password': 'POST /reset-password',
      'verify-email': 'POST /verify-email',
      'resend-verification': 'POST /resend-verification'
    },
    timestamp: new Date().toISOString()
  })
})

// User registration
router.post('/register', 
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone, timezone } = req.body

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
      timezone
    })

    // Generate tokens for immediate login after registration
    const authToken = await authService.login({ email, password })

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for verification.',
      data: authToken,
      timestamp: new Date().toISOString()
    })
  })
)

// User login
router.post('/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body

    const authToken = await authService.login({ email, password })

    res.json({
      status: 'success',
      message: 'Login successful',
      data: authToken,
      timestamp: new Date().toISOString()
    })
  })
)

// Refresh access token
router.post('/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    const result = await authService.refreshToken(refreshToken)

    res.json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: result,
      timestamp: new Date().toISOString()
    })
  })
)

// Request password reset
router.post('/forgot-password',
  validate(passwordResetRequestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body

    await authService.requestPasswordReset(email)

    res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.',
      timestamp: new Date().toISOString()
    })
  })
)

// Reset password
router.post('/reset-password',
  validate(passwordResetSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body

    await authService.resetPassword(token, password)

    res.json({
      status: 'success',
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    })
  })
)

// Verify email
router.post('/verify-email',
  validate(emailVerificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body

    await authService.verifyEmail(token)

    res.json({
      status: 'success',
      message: 'Email verified successfully',
      timestamp: new Date().toISOString()
    })
  })
)

// Resend email verification
router.post('/resend-verification',
  validate(resendEmailVerificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body

    await authService.resendEmailVerification(email)

    res.json({
      status: 'success',
      message: 'Verification email sent',
      timestamp: new Date().toISOString()
    })
  })
)

export { router as authRoutes }