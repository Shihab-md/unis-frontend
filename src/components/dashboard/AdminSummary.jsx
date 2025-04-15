import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import {
  FaBuilding,
  FaSchool,
  FaUserFriends,
  FaUsers,
  FaHouseUser,
  FaClipboardCheck,
  FaClipboardList,
  FaRupeeSign,FaMedal, FaFileContract,
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
        const summary = await axios.get('https://unis-server.vercel.app/api/dashboard/summary', {
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
    <div className="p-7 items-center">
      <h5 className="p-1 text-center font-semibold text-gray-700">ربِّ زِدْنِي عِلْماً</h5>
      <h5 className="p-1 text-center">Welcome, {user.name}</h5>
      <h5 className="text-2xl mt-5 mb-10 font-bold text-center text-gray-500">Dashboard</h5>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-7 mt-10 rounded">
        <Link to="/admin-dashboard/supervisors" >
          <SummaryCard
            icon={<FaUserFriends />}
            text="Muaavins"
            number={summary.totalSupervisors}
            color="bg-teal-600"
          />
        </Link>
        <Link to="/admin-dashboard/schools" >
          <SummaryCard
            icon={<FaSchool />}
            text="Niswans"
            number={summary.totalSchools}
            color="bg-pink-600"
          />
        </Link>
        <Link to="/admin-dashboard/employees" >
          <SummaryCard
            icon={<FaHouseUser />}
            text="Teachers"
            number={summary.totalEmployees}
            color="bg-cyan-600"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaUsers />}
            text="Students"
            number={summary.totalEmployees}
            color="bg-blue-500"
          />
        </Link>
        <Link to="/admin-dashboard/institutes" >
          <SummaryCard
            icon={<FaBuilding />}
            text="Institutes"
            number={summary.totalInstitutes}
            color="bg-yellow-700"
          />
        </Link>
        <Link to="/admin-dashboard/courses" >
          <SummaryCard
            icon={<FaClipboardList />}
            text="Courses"
            number={summary.totalCourses}
            color="bg-purple-700"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaClipboardCheck />}
            text="Exams"
            number={summary.totalEmployees}
            color="bg-green-700"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaRupeeSign />}
            text="Finance"
            number={summary.totalEmployees}
            color="bg-indigo-700"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaMedal />}
            text="Certificates"
            number={summary.totalEmployees}
            color="bg-yellow-500"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaFileContract />}
            text="Reports"
            number={summary.totalEmployees}
            color="bg-blue-500"
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
