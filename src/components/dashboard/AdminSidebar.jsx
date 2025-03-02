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
} from "react-icons/fa"; tretrtrt
import 
{BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill}
 from 'react-icons/bs'
import { AiOutlineFileText } from 'react-icons/ai'

const AdminSidebar = () => {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive" : ""}>
      <div className='sidebar-title'>
        <div className='sidebar-brand'>
          <BsCart3 className='icon_header' /> Niswan MS
        </div>
        <span className='icon close_icon' onClick={OpenSidebar}>X</span>
      </div>

      <div className="sidebar-list">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/supervisors"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaUsers />
          <span>Supervisors</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/schools"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaUsers />
          <span>Niswans</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/classSections"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaUsers />
          <span>ClassSection</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/employees"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaUsers />
          <span>Employee</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/departments"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaBuilding />
          <span>Department</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/leaves"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaCalendarAlt />
          <span>Leave</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/salary/add"
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaMoneyBillWave />
          <span>Salary</span>
        </NavLink>
        <NavLink
          to={`/admin-dashboard/attendance`}
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <FaRegCalendarAlt />
          <span>Attendance</span>
        </NavLink>
        <NavLink
          to={`/admin-dashboard/attendance-report`}
          className={({ isActive }) =>
            `${isActive ? "bg-teal-500 " : " "
            } sidebar-list-item`
          }
        >
          <AiOutlineFileText />
          <span>Attendance Report</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/setting"
          className="sidebar-list-item"
        >
          <FaCogs />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
