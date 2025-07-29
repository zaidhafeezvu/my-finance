import React from 'react'
import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '' 
}) => {
  return (
    <div className={`loading-container ${className}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner"></div>
        {message && <span className="loading-message">{message}</span>}
      </div>
    </div>
  )
}

export default LoadingSpinner