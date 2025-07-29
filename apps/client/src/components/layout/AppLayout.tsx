import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import './AppLayout.css'

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="app-layout">
      <Navigation onToggleSidebar={toggleSidebar} />
      <div className="app-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout