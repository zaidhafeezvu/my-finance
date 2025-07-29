import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/utils'
import ForgotPassword from '../ForgotPassword'
import * as authAPI from '../../../services/api'

// Mock the API
vi.mock('../../../services/api', () => ({
  authAPI: {
    resetPassword: vi.fn(),
  },
}))

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forgot password form correctly', () => {
    render(<ForgotPassword />)
    
    expect(screen.getByText('Forgot Password')).toBeInTheDocument()
    expect(screen.getByText("Enter your email address and we'll send you a link to reset your password.")).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    expect(screen.getByText('Remember your password?')).toBeInTheDocument()
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
  })

  it('validates required email field', async () => {
    const user = userEvent.setup()
    render(<ForgotPassword />)
    
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ForgotPassword />)
    
    const emailInput = screen.getByLabelText('Email')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
  })

  it('submits form with valid email', async () => {
    const user = userEvent.setup()
    const mockResetPassword = vi.mocked(authAPI.authAPI.resetPassword)
    mockResetPassword.mockResolvedValue()
    
    render(<ForgotPassword />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('displays loading state during submission', async () => {
    const user = userEvent.setup()
    const mockResetPassword = vi.mocked(authAPI.authAPI.resetPassword)
    mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<ForgotPassword />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup()
    const mockResetPassword = vi.mocked(authAPI.authAPI.resetPassword)
    mockResetPassword.mockResolvedValue()
    
    render(<ForgotPassword />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      expect(screen.getByText("We've sent a password reset link to your email address.")).toBeInTheDocument()
    })
  })

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup()
    const mockResetPassword = vi.mocked(authAPI.authAPI.resetPassword)
    mockResetPassword.mockRejectedValue({
      response: { data: { message: 'Email not found' } }
    })
    
    render(<ForgotPassword />)
    
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' })
    
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument()
    })
  })
})