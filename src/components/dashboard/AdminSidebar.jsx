import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaCogs,
  FaMoneyBillWave,
  FaRegCalendarAlt,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import {AiOutlineFileText} from 'react-icons/ai'

const AdminSidebar = () => {
  return (
    <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64">
      <div className="bg-teal-600 h-12 flex items-center justify-center">
        <h3 className="text-2xl text-center font-pacific">Niswan MS</h3>
      </div>
      <div className="px-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/dashboard/supervisors"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaUsers />
          <span>Supervisors</span>
        </NavLink>
        <NavLink
          to="/dashboard/schools"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaUsers />
          <span>Niswans</span>
        </NavLink>
        <NavLink
          to="/dashboard/classSections"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaUsers />
          <span>ClassSection</span>
        </NavLink>
        <NavLink
          to="/dashboard/employees"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaUsers />
          <span>Employee</span>
        </NavLink>
        <NavLink
          to="/dashboard/departments"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaBuilding />
          <span>Department</span>
        </NavLink>
        <NavLink
          to="/dashboard/leaves"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaCalendarAlt />
          <span>Leave</span>
        </NavLink>
        <NavLink
          to="/dashboard/salary/add"
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaMoneyBillWave />
          <span>Salary</span>
        </NavLink>
        <NavLink
          to={`/dashboard/attendance`}
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <FaRegCalendarAlt />
          <span>Attendance</span>
        </NavLink>
        <NavLink
          to={`/dashboard/attendance-report`}
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 " : " "
            } flex items-center space-x-4 block py-2.5 px-4 rounded`
          }
        >
          <AiOutlineFileText />
          <span>Attendance Report</span>
        </NavLink>
        <NavLink
          to="/dashboard/setting"
          className="flex items-center space-x-4 block py-2.5 px-4 rounded"
        >
          <FaCogs />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
