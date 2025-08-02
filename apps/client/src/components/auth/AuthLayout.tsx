import React, { ReactNode } from 'react'
import styles from './AuthLayout.module.css'

/**
 * Props for the AuthLayout component
 */
interface AuthLayoutProps {
  /** Main heading text displayed at the top of the auth card */
  title: string
  /** Subtitle text displayed below the title */
  subtitle: string
  /** Form content or other elements to be rendered in the card body */
  children: ReactNode
  /** Optional footer content (links, additional text, etc.) */
  footer?: ReactNode
}

/**
 * A reusable layout component for authentication pages (login, register, forgot password).
 * Provides consistent styling and structure across all auth flows.
 * 
 * @param props - The component props
 * @returns JSX element containing the auth layout structure
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer
}) => {
  return (
    <div className={styles.container}>
      <main className={styles.card} role="main" aria-labelledby="auth-title">
        <header className={styles.header}>
          <h1 id="auth-title">{title}</h1>
          <p>{subtitle}</p>
        </header>
        {children}
        {footer && (
          <footer className={styles.footer} role="contentinfo">
            {footer}
          </footer>
        )}
      </main>
    </div>
  )
}

export default AuthLayout