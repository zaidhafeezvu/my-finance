import React, { ReactNode } from 'react'
import '../pages/auth/Auth.css'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  title, 
  subtitle, 
  children, 
  footer 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default AuthLayout