import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaSignOutAlt
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth()
  return (
    <div className='flex items-center text-white justify-between h-12 bg-teal-600 px-5 text-shadow-lg'>
      <Link to="/admin-dashboard" >
        <FaHome className="text-2xl text-white text-shadow-lg" />
      </Link>
      <p className="text-xl font-bold text-shadow-lg">UNIS ACADEMY</p>
      <FaSignOutAlt className="text-2xl text-red-700 text-shadow-lg" onClick={logout} />
      {/*<button className='px-4 py-1 bg-teal-700 hover:bg-teal-800' onClick={logout}>Logout</button> */}
    </div>
  )
}

export default Navbar