import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/dashboard/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'
import AdminSummary from '../components/dashboard/AdminSummary'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
  const {user} = useAuth()
 
  return (
      <div className='flex ml-64 bg-gray-100 h-screen'>
        <Navbar />
        <Outlet />
      </div>
  
  )
}

export default AdminDashboard