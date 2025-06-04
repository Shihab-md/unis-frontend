import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClick, getSpinner, getBackIcon } from '../../utils/CommonHelper'
import {
  FaUniversity, FaWpforms, FaClipboardList, FaCalendarAlt, FaUserCog,
} from "react-icons/fa";
import axios from 'axios'
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

const Masters = () => {
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
        const summary = await axios.get((await getBaseUrl()).toString() + 'dashboard/masterSummary', {
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
      <h5 className="p-1 text-center font-semibold lg:text-xl text-gray-700 mt-14">ٱللَّٰهُمَّ ربِّ زِدْنِي عِلْماً</h5>
      <h5 className="p-1 mt-1 text-center">Welcome, {user.name}</h5>
      <h5 className="text-2xl mt-1 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">{user.role} Dashboard</h5>
      <h5 className="text-xl mt-1 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">Masters</h5>

      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mt-16 flex rounded-lg">

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/institutes" >
            <SummaryCard
              icon={<FaUniversity />}
              text="Institutes"
              number={summary.totalInstitutes}
              color="bg-cyan-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/courses" >
            <SummaryCard
              icon={<FaClipboardList />}
              text="Courses"
              number={summary.totalCourses}
              color="bg-pink-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/academicYears" >
            <SummaryCard
              icon={<FaCalendarAlt />}
              text="AC Year"
              number={summary.totalAcademicYears}
              color="bg-yellow-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/templates" >
            <SummaryCard
              icon={<FaWpforms />}
              text="Templates"
              number={summary.totalTemplates}
              color="bg-blue-700"
            />
          </Link> : null}
      </div>
    </div>
  );
};

export default Masters;
