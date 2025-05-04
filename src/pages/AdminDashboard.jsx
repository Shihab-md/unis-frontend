import React from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/dashboard/Navbar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
  const {user} = useAuth()
 
  return (
      <div className='flex-1 bg-gray-100'>
        <Navbar />
        <Outlet />
      </div>
  
  )
}

export default AdminDashboard