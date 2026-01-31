import Navbar from '../components/dashboard/Navbar'
import React, { useEffect, useState } from "react";
import { Outlet } from 'react-router-dom'
import { handleRightClickAndFullScreen } from '../utils/CommonHelper';

const AdminDashboard = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  return (
    <div className='flex-1 bg-gray-200 min-h-screen h-9/10 bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat bg-teal-50 pb-5'>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default AdminDashboard