import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.profile.firstName}!</h1>
        <p>Here's your financial overview</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Balance</h3>
          <p className="amount">$0.00</p>
          <span className="subtitle">Across all accounts</span>
        </div>

        <div className="dashboard-card">
          <h3>Monthly Spending</h3>
          <p className="amount">$0.00</p>
          <span className="subtitle">This month</span>
        </div>

        <div className="dashboard-card">
          <h3>Budget Status</h3>
          <p className="amount">0%</p>
          <span className="subtitle">Used this month</span>
        </div>

        <div className="dashboard-card">
          <h3>Investment Value</h3>
          <p className="amount">$0.00</p>
          <span className="subtitle">Portfolio total</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Transactions</h2>
        <div className="empty-state">
          <p>No transactions yet. Connect your accounts to get started!</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard