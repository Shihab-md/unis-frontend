import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import {
  FaBuilding,
  FaCheckCircle,
  FaFileAlt,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaTimesCircle,
  FaUsers,
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
    <div className="p-3 items-center">
      <h5 className="p-3 text-center">Welcome, {user.name}</h5>
      <h3 className="text-2xl font-bold text-center">Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <Link to="/admin-dashboard/supervisors" >
          <SummaryCard
            icon={<FaUsers />}
            text="Supervisors"
            number={summary.totalSupervisors}
            color="bg-teal-600"
          />
        </Link>
        <Link to="/admin-dashboard/schools" >
          <SummaryCard
            icon={<FaBuilding />}
            text="Niswans"
            number={summary.totalSchools}
            color="bg-yellow-600"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaUsers />}
            text="Students"
            number={summary.totalEmployees}
            color="bg-teal-600"
          />
        </Link>
        <Link to="#" >
          <SummaryCard
            icon={<FaBuilding />}
            text="Institutions"
            number={summary.totalEmployees}
            color="bg-yellow-600"
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
