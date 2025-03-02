import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/dashboard/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'
import AdminSummary from '../components/dashboard/AdminSummary'
import { Outlet } from 'react-router-dom'
import './App.css'

const AdminDashboard = () => {
  const {user} = useAuth()

  const [openSidebarToggle, setOpenSidebarToggle] = useState(false)

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle)
  }
 
  return (
    <div className='grid-container'>
      <AdminSidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
      <div className='flex-1 ml-64 bg-gray-100 h-screen'>
        <Navbar OpenSidebar={OpenSidebar}/>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminDashboard