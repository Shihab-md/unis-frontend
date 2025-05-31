import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaSignOutAlt, FaPowerOff
} from "react-icons/fa";

const Navbar = () => { 
  const { user, logout } = useAuth()
  return (
    <div className='flex items-center text-white justify-between h-12 bg-teal-600 px-5 text-shadow-lg'>
      <Link to="/dashboard" >
        <FaHome className="text-2xl text-green-300 text-shadow-lg" />
      </Link>
      <p className="text-xl mt-1 font-bold text-shadow-lg">UNIS ACADEMY</p>
      <FaPowerOff className="text-2xl text-red-700 text-shadow-lg" onClick={logout} />
    </div>
  )
}

export default Navbar