import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaPowerOff
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth()
  return (
    <div className='flex items-center text-white justify-between h-12 bg-teal-600 px-5'>
      <Link to="/admin-dashboard" >
        <FaHome className="text-2xl text-green-900" />
      </Link>
      <img width={57} className='rounded-md shadow w-34' src="./Logo - UNIS.PNG" />
      <p className="text-xl font-bold">UNIS ACADEMY APP</p>
      <FaPowerOff className="text-2xl text-red-900" onClick={logout} />
      {/*<button className='px-4 py-1 bg-teal-700 hover:bg-teal-800' onClick={logout}>Logout</button> */}
    </div>
  )
}

export default Navbar