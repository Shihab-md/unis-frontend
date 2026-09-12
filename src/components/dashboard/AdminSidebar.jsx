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
import { AiOutlineFileText } from 'react-icons/ai'
import { AutoText, useLanguage } from '../../i18n/LanguageContext';

const AdminSidebar = () => {
  const { tr, direction, fontFamily } = useLanguage();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt />, end: true },
    { to: "/dashboard/supervisors", label: "Supervisors", icon: <FaUsers /> },
    { to: "/dashboard/schools", label: "Niswans", icon: <FaUsers /> },
    { to: "/dashboard/classSections", label: "ClassSection", icon: <FaUsers /> },
    { to: "/dashboard/employees", label: "Employee", icon: <FaUsers /> },
    { to: "/dashboard/departments", label: "Department", icon: <FaBuilding /> },
    { to: "/dashboard/leaves", label: "Leave", icon: <FaCalendarAlt /> },
    { to: "/dashboard/salary/add", label: "Salary", icon: <FaMoneyBillWave /> },
    { to: "/dashboard/attendance", label: "Attendance", icon: <FaRegCalendarAlt /> },
    { to: "/dashboard/attendance-report", label: "Attendance Report", icon: <AiOutlineFileText /> },
    { to: "/dashboard/setting", label: "Settings", icon: <FaCogs /> },
  ];

  return (
    <div
      className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 space-y-2 w-64"
      dir={direction}
      style={{ fontFamily }}
    >
      <div className="bg-teal-600 h-12 flex items-center justify-center">
        <h3 className="text-2xl text-center font-pacific" dir="ltr">Niswan MS</h3>
      </div>
      <div className="px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${isActive ? "bg-teal-500 " : " "} flex items-center gap-4 py-2.5 px-4 rounded`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <AutoText text={tr(item.label)} className="min-w-0" />
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
