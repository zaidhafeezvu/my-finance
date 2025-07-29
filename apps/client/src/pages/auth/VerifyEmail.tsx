import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import './Auth.css'

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token')
        setIsLoading(false)
        return
      }

      try {
        await authAPI.verifyEmail(token)
        setIsSuccess(true)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (error: any) {
        setError(error.response?.data?.message || 'Email verification failed')
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token, navigate])

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Verifying Email</h1>
            <p>Please wait while we verify your email address...</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner">Verifying...</div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email Verified!</h1>
            <p>Your email address has been successfully verified.</p>
          </div>

          <div className="success-message">
            <p>
              Thank you for verifying your email address. You can now sign in to your account.
              You will be redirected to the login page shortly.
            </p>
          </div>

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">
                Sign in now
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Verification Failed</h1>
          <p>We couldn't verify your email address.</p>
        </div>

        <div className="error-message">
          {error}
        </div>

        <div className="auth-footer">
          <p>
            Need help?{' '}
            <Link to="/register" className="auth-link">
              Try registering again
            </Link>
          </p>
          <p>
            Already verified?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail