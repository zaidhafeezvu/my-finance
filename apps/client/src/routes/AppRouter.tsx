import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ProtectedRoute from './ProtectedRoute'

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />

        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Placeholder routes for future implementation */}
          <Route path="accounts" element={<div>Accounts - Coming Soon</div>} />
          <Route path="transactions" element={<div>Transactions - Coming Soon</div>} />
          <Route path="budgets" element={<div>Budgets - Coming Soon</div>} />
          <Route path="investments" element={<div>Investments - Coming Soon</div>} />
          <Route path="bills" element={<div>Bills - Coming Soon</div>} />
          <Route path="reports" element={<div>Reports - Coming Soon</div>} />
          <Route path="goals" element={<div>Goals - Coming Soon</div>} />
          <Route path="profile" element={<div>Profile - Coming Soon</div>} />
          <Route path="settings" element={<div>Settings - Coming Soon</div>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default AppRouter