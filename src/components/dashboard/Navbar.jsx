import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaSignOutAlt, FaPowerOff
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center text-white justify-between h-18 lg:h-28 bg-teal-600 px-5 text-shadow-lg">
      <Link to="/dashboard">
        <FaHome className="text-3xl lg:text-4xl text-green-300 text-shadow-lg" />
      </Link>

      <div className="flex flex-col items-center leading-tight">
        <p className="text-xl lg:text-3xl mt-1 font-bold text-shadow-lg">UNIS ACADEMY</p>
        {user?.role && (
          <div className="mt-1 flex flex-col items-center">
          <span className="text-[7px] md:text-[12px] md:mt-1 mb-1 lg:text-sm font-semibold text-teal-400">
            {String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}
          </span>
          <span className="text-[5px] md:text-[12px] md:mt-1 mb-1 lg:text-sm font-bold text-teal-400">
            {!(user.role === "superadmin" || user.role == "hquser") ? localStorage.getItem('schoolName') : user.name}
          </span>
          </div>
        )}
      </div>

      <FaPowerOff
        className="text-3xl lg:text-4xl text-red-600 text-shadow-lg cursor-pointer"
        onClick={logout}
      />
    </div>
  );
};

export default Navbar