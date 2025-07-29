import React from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthForm } from '../../hooks/useAuthForm'
import { validationRules } from '../../utils/validation'
import AuthLayout from '../../components/auth/AuthLayout'

interface ForgotPasswordFormData {
  email: string
}

const ForgotPassword: React.FC = () => {
  const { isLoading, error, isSuccess, handleSubmit: handleAuthSubmit } = useAuthForm()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  const onSubmit = handleAuthSubmit(async (data: ForgotPasswordFormData) => {
    await authAPI.resetPassword(data.email)
  })

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address."
        footer={
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        }
      >
        <div className="success-message">
          <p>
            If an account with that email exists, you'll receive a password reset link shortly.
            Please check your email and follow the instructions to reset your password.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', validationRules.email)}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword