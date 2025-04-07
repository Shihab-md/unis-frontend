import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome,
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth()
  return (
    <div className='flex items-center text-white justify-between h-12 bg-teal-600 px-5'>
      <Link to="/admin-dashboard" >
        <FaHome />
      </Link>
      <Link to="/admin-dashboard" >
        <p className="text-3xl font-bold">UNIS APP</p>
      </Link>
      <button className='px-4 py-1 bg-teal-700 hover:bg-teal-800' onClick={logout}>Logout</button>
    </div>
  )
}

export default Navbar