import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../store/slices/authSlice'
import { AppDispatch } from '../../store'
import { getUserDisplayName } from '../../utils/userDisplay'
import './Navigation.css'

interface NavigationProps {
  onToggleSidebar: () => void
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = useCallback(() => {
    try {
      dispatch(logout())
      navigate('/login')
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
      // Still navigate to login even if logout fails
      navigate('/login')
      setIsDropdownOpen(false)
    }
  }, [dispatch, navigate])

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(!isDropdownOpen)
  }, [isDropdownOpen])

  const handleMenuItemClick = useCallback((action: () => void) => {
    action()
    setIsDropdownOpen(false)
  }, [])

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  return (
    <nav className="navigation">
      <div className="nav-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="nav-brand">
          <h1>Finance App</h1>
        </div>
      </div>

      <div className="nav-right">
        {isLoading ? (
          <div className="nav-loading">Loading...</div>
        ) : isAuthenticated && user && user.profile ? (
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="user-trigger"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span className="user-name">
                {getUserDisplayName(user)}
              </span>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`user-dropdown ${isDropdownOpen ? 'open' : ''}`}>
              <button
                className="dropdown-item"
                onClick={() => handleMenuItemClick(() => navigate('/profile'))}
              >
                Profile
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleMenuItemClick(() => navigate('/settings'))}
              >
                Settings
              </button>
              <button
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default memo(Navigation)