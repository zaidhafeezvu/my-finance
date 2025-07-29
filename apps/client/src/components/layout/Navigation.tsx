import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../store/slices/authSlice'
import { AppDispatch } from '../../store'
import './Navigation.css'

interface NavigationProps {
  onToggleSidebar: () => void
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

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
        {isAuthenticated && user ? (
          <div className="user-menu">
            <span className="user-name">
              {user.profile.firstName} {user.profile.lastName}
            </span>
            <div className="user-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
              <button 
                className="dropdown-item"
                onClick={() => navigate('/settings')}
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

export default Navigation