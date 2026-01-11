import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, showSwalAlert, removeLocalStorage } from '../../utils/CommonHelper'
import {
  FaMosque, FaUserFriends, FaCoins, FaGraduationCap,
  FaUsers, FaHouseUser, FaClipboardList, FaTasks, FaCalendarAlt,
  FaRupeeSign, FaMedal, FaFileContract, FaCogs,
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AdminSummary = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {

    if (user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor") {
      removeLocalStorage();
    }

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
          showSwalAlert("Error!", error.response.data.error, "error");
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
      <h5 className="p-1 text-center font-semibold lg:text-xl text-gray-600 lg:mt-10">إيمان : تقوى : حياء : أخلاق : دعاء : دعوة</h5>
      <h5 className="p-1 mt-1 lg:mt-3 text-center text-gray-600">Welcome, {user.name}</h5>
      <h5 className="text-2xl mt-1 lg:mt-3 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">{user.role} Dashboard</h5>

      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-7 lg:gap-14 mt-7 lg:mt-16 flex rounded-lg">

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" ?
          <Link to="/dashboard/supervisors" >
            <SummaryCard
              icon={<FaUserFriends />}
              text="Muavins"
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
          <Link to="/dashboard/students"  >
            <SummaryCard
              icon={<FaUsers />}
              text="Students"
              number={summary.totalStudents}
              color="bg-blue-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin"
          || user.role === "teacher" || user.role === "usthadh" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaTasks />}
              text="Attendance"
              number="*"
              color="bg-purple-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin"
          || user.role === "teacher" || user.role === "usthadh" || user.role === "student" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaCalendarAlt />}
              text="Leaves"
              number="*"
              color="bg-gray-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaClipboardList />}
              text="Exams"
              number="*"
              color="bg-emerald-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/certificates" >
            <SummaryCard
              icon={<FaMedal />}
              text="Certificates"
              number={summary.totalCertificates}
              color="bg-yellow-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "admin" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaRupeeSign />}
              text="Accounts"
              number="*"
              color="bg-orange-700"
            />
          </Link> : null}

        {user.role === "superadmin" ?
          <Link to="/dashboard/masters" >
            <SummaryCard
              icon={<FaCoins />}
              text="Masters"
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
          <Link to="#" >
            <SummaryCard
              icon={<FaFileContract />}
              text="Reports"
              number="*"
              color="bg-pink-500"
            />
          </Link> : null}

        <Link to="/dashboard/changePassword" >
          <SummaryCard
            icon={<FaCogs />}
            text="Change Password"
            number="***"
            color="bg-lime-700"
          />
        </Link>

      </div>
    </div>
  );
};

export default AdminSummary;
