import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaSignOutAlt, FaPowerOff
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center text-white justify-between h-14 lg:h-20 bg-teal-600 px-5 text-shadow-lg">
      <Link to="/dashboard">
        <FaHome className="text-3xl lg:text-5xl text-green-300 text-shadow-lg" />
      </Link>

      <div className="flex flex-col items-center leading-tight">
        <p className="text-xl lg:text-3xl mt-1 font-bold text-shadow-lg">UNIS ACADEMY</p>
        {user?.role && (
          <span className="text-[12px] md:text-[12px] mt-1 mb-2 lg:text-sm font-semibold text-teal-300">
            {String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}
          </span>
        )}
      </div>

      <FaPowerOff
        className="text-3xl lg:text-5xl text-red-700 text-shadow-lg cursor-pointer"
        onClick={logout}
      />
    </div>
  );
};

export default Navbar