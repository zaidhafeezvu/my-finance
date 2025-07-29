import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      path: '/accounts',
      label: 'Accounts',
      icon: '🏦',
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: '💳',
    },
    {
      path: '/budgets',
      label: 'Budgets',
      icon: '📈',
    },
    {
      path: '/investments',
      label: 'Investments',
      icon: '📊',
    },
    {
      path: '/bills',
      label: 'Bills',
      icon: '📄',
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📋',
    },
    {
      path: '/goals',
      label: 'Goals',
      icon: '🎯',
    },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar