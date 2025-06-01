import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClick, getSpinner } from '../../utils/CommonHelper'
import {
  FaBuilding, FaMosque, FaUserFriends, FaWpforms,
  FaUsers, FaHouseUser, FaClipboardList, FaTasks, FaCalendarAlt,
  FaRupeeSign, FaMedal, FaFileContract, FaUserCog,
} from "react-icons/fa";
import axios from 'axios'
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

const AdminSummary = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  // For FULL screen view
  document.body.addEventListener('click', () => document.documentElement.requestFullscreen(), { once: true });

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {

    const fetchSummary = async () => {
      try {
        const summary = await axios.get((await getBaseUrl()).toString() + 'dashboard/summary', {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })

        setSummary(summary.data)
      } catch (error) {
        if (error.response) {
          Swal.fire('Error!', error.response.data.error, 'error');
        }
        console.log(error.messsage)
      }
    }
    fetchSummary()
  }, [])

  if (!summary) {
    return getSpinner();
  }
  //p-6
  return (
    <div className="p-7 pt-3 items-center justify-center rounded-lg h-9/10">
      <h5 className="p-1 text-center font-semibold text-gray-700">ربِّ زِدْنِي عِلْماً</h5>
      <h5 className="p-1 mt-1 text-center">Welcome, {user.name}</h5>
      <h5 className="text-xl mt-1 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">{user.role } Dashboard</h5>

      <div className="rounded-lg grid grid-cols-2 md:grid-cols-4 gap-7 mt-7 flex rounded-lg">

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" ?
          <Link to="/dashboard/supervisors" >
            <SummaryCard
              icon={<FaUserFriends />}
              text="Muaavins"
              number={summary.totalSupervisors}
              color="bg-teal-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
          <Link to="/dashboard/schools" >
            <SummaryCard
              icon={<FaMosque />}
              text="Niswans"
              number={summary.totalSchools}
              color="bg-pink-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
          <Link to="/dashboard/employees" >
            <SummaryCard
              icon={<FaHouseUser />}
              text="Employees"
              number={summary.totalEmployees}
              color="bg-cyan-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          <Link to="/dashboard/students" >
            <SummaryCard
              icon={<FaUsers />}
              text="Students"
              number={summary.totalStudents}
              color="bg-blue-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/institutes" >
            <SummaryCard
              icon={<FaBuilding />}
              text="Institutes"
              number={summary.totalInstitutes}
              color="bg-slate-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/courses" >
            <SummaryCard
              icon={<FaClipboardList />}
              text="Courses"
              number={summary.totalCourses}
              color="bg-purple-800"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaTasks />}
              text="Exams"
              number={summary.totalEmployees}
              color="bg-emerald-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/academicYears" >
            <SummaryCard
              icon={<FaCalendarAlt />}
              text="AC Year"
              number={summary.totalAcademicYears}
              color="bg-blue-800"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaRupeeSign />}
              text="Accounts"
              number={summary.totalEmployees}
              color="bg-orange-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/certificates" >
            <SummaryCard
              icon={<FaMedal />}
              text="Certificates"
              number="*"
              color="bg-yellow-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/templates" >
            <SummaryCard
              icon={<FaWpforms />}
              text="Templates"
              number={summary.totalTemplates}
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaFileContract />}
              text="Reports"
              number={summary.totalEmployees}
              color="bg-gray-500"
            />
          </Link> : null}

        <Link to="/dashboard/settings" >
          <SummaryCard
            icon={<FaUserCog />}
            text="Settings"
            number="***"
            color="bg-teal-900"
          />
        </Link>

      </div>
    </div>
  );
};

export default AdminSummary;
