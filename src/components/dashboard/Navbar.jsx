import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle, BsSearch, BsJustify }
  from 'react-icons/bs'

const Navbar = ({ OpenSidebar }) => {
  const { user, logout } = useAuth()
  return (
    <header className='header'>
      <div className='flex items-center text-white justify-between h-12 bg-teal-600 px-5'>
        <p >Welcome {user.name}</p>
        <button className='px-4 py-1 bg-teal-700 hover:bg-teal-800' onClick={logout}>Logout</button>
      </div>

      <div className='menu-icon'>
        <BsJustify className='icon' onClick={OpenSidebar} />
      </div>
      <div className='header-left'>
        <BsSearch className='icon' />
      </div>
      <div className='header-right'>
        <BsFillBellFill className='icon' />
        <BsFillEnvelopeFill className='icon' />
        <BsPersonCircle className='icon' />
      </div>
    </header>
  )
}

export default Navbar