import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, getRole } from '../../utils/CommonHelper'
import {
  FaBuilding, FaMosque, FaUserFriends,
  FaUsers, FaHouseUser, FaClipboardList, FaTasks, FaCalendarAlt,
  FaRupeeSign, FaMedal, FaFileContract, FaUserCog,
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AdminSummary = () => {
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
        console.log(summary.data)
        setSummary(summary.data)
      } catch (error) {
        if (error.response) {
          alert(error.response.data.error)
        }
        console.log(error.messsage)
      }
    }
    fetchSummary()
  }, [])

  if (!summary) {
    return <div> Loading...</div>
  }
  //p-6
  return (
    <div className="p-7 pt-3 items-center rounded-lg">
      <h5 className="p-1 text-center font-semibold text-gray-700">ربِّ زِدْنِي عِلْماً</h5>
      <h5 className="p-1 text-center">Welcome, {user.name}</h5>
      <h5 className="text-xl mt-2 mb-3 font-bold text-center text-gray-500 text-shadow-lg">Super Admin Dashboard</h5>

      <div className="rounded-lg grid grid-cols-2 md:grid-cols-4 gap-7 mt-7 flex rounded-lg">
        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/admin-dashboard/supervisors" >
            <SummaryCard
              icon={<FaUserFriends />}
              text="Muaavins"
              number={summary.totalSupervisors}
              color="bg-teal-600"
            />
          </Link> : null}
        <Link to="/admin-dashboard/schools" >
          <SummaryCard
            icon={<FaMosque />}
            text="Niswans"
            number={summary.totalSchools}
            color="bg-pink-600"
          />
        </Link>
        <Link to="/admin-dashboard/employees" >
          <SummaryCard
            icon={<FaHouseUser />}
            text="Employees"
            number={summary.totalEmployees}
            color="bg-cyan-600"
          />
        </Link>
        <Link to="/admin-dashboard/students" >
          <SummaryCard
            icon={<FaUsers />}
            text="Students"
            number={summary.totalStudents}
            color="bg-blue-500"
          />
        </Link>
        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/admin-dashboard/institutes" >
            <SummaryCard
              icon={<FaBuilding />}
              text="Institutes"
              number={summary.totalInstitutes}
              color="bg-slate-700"
            />
          </Link> : null}
        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/admin-dashboard/courses" >
            <SummaryCard
              icon={<FaClipboardList />}
              text="Courses"
              number={summary.totalCourses}
              color="bg-purple-700"
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
          <Link to="/admin-dashboard/academicYears" >
            <SummaryCard
              icon={<FaCalendarAlt />}
              text="AC Year"
              number={summary.totalAcademicYears}
              color="bg-blue-800"
            />
          </Link> : null}
        <Link to="#" >
          <SummaryCard
            icon={<FaRupeeSign />}
            text="Accounts"
            number={summary.totalEmployees}
            color="bg-orange-700"
          />
        </Link>
        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaMedal />}
              text="Certificates"
              number={summary.totalEmployees}
              color="bg-yellow-600"
            />
          </Link> : null}
        <Link to="#" >
          <SummaryCard
            icon={<FaFileContract />}
            text="Reports"
            number={summary.totalEmployees}
            color="bg-gray-500"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaUserCog />}
            text="Settings"
            number=""
            color="bg-teal-900"
          />
        </Link>
      </div>

      {/*
      <div className="mt-12">
        <h4 className="text-center text-2xl font-bold">Leave Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <SummaryCard
            icon={<FaFileAlt />}
            text="Leave Applied"
            number={summary.leaveSummary.appliedFor}
            color="bg-teal-600"
          />
          <SummaryCard
            icon={<FaCheckCircle />}
            text="Leave Approved"
            number={summary.leaveSummary.approved}
            color="bg-green-600"
          />
          <SummaryCard
            icon={<FaHourglassHalf />}
            text="Leave Pending"
            number={summary.leaveSummary.pending}
            color="bg-yellow-600"
          />
          <SummaryCard
            icon={<FaTimesCircle />}
            text="Leave Rejected"
            number={summary.leaveSummary.rejected}
            color="bg-red-600"
          />
        </div>
      </div>
      */}
    </div>
  );
};

export default AdminSummary;
