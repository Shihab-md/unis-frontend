import React from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/dashboard/Navbar'
import { Outlet } from 'react-router-dom'

const AdminDashboard = () => {
  const {user} = useAuth()
 
  return (
      <div className='flex-1 bg-gray-200 min-h-screen h-9/10 bg-[url(../bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat bg-teal-50'>
        <Navbar />
        <Outlet />
      </div>
  
  )
}

export default AdminDashboard