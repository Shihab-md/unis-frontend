import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom';
import {
  FaHome, FaSignOutAlt, FaPowerOff
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();
  const isHQ = user?.role === "superadmin" || user?.role === "hquser" || user?.role === "supervisor";
  return (
    <div
      className={`relative flex items-center text-white justify-between bg-teal-600 px-5 text-shadow-lg overflow-hidden 
        ${isHQ ? "h-18" : "h-28"}`}
    >
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 blur-md opacity-70" />
        <Link to="/dashboard" className="relative z-10">
          <FaHome className="text-3xl lg:text-4xl text-green-300 text-shadow-lg" />
        </Link>
      </div>
      <div className="relative z-10 flex flex-col items-center mt-2">
        <p className={`font-bold text-shadow-lg ${isHQ ? "text-xl lg:text-2xl" : "text-xl lg:text-3xl"}`}>
          UNIS ACADEMY
        </p>

        {user?.role && (
          <span
            className={`font-semibold mb-2 mt-2 ${isHQ ? "text-teal-300 drop-shadow" : "text-teal-200"
              } ${isHQ ? "text-[12px] lg:text-sm" : "text-[10px] md:text-[12px] lg:text-sm"}`}
          >
            {String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)}
          </span>
        )}

        {!isHQ && (
          <span className="text-center px-2 text-[9px] md:text-[12px] lg:text-sm text-teal-100 mt-1 mb-2">
            {localStorage.getItem("schoolName") || "-"}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 blur-md opacity-70" />
        <FaPowerOff
          className="relative z-10 text-3xl lg:text-4xl text-red-600 text-shadow-lg cursor-pointer"
          onClick={logout}
        />
      </div>
    </div>
  );
};

export default Navbar