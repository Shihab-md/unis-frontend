import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'
import {
  FaUniversity, FaWpforms, FaClipboardList, FaCalendarAlt, FaUserCog, FaMapMarkerAlt
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const Masters = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

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
      <h5 className="p-1 text-center font-semibold lg:text-xl text-gray-600 mt-14">إيمان : تقوى : حياء : أخلاق : دعاء : دعوة</h5>
      <h5 className="p-1 mt-1 text-center text-gray-600">Welcome, {user.name}</h5>
      <h5 className="text-2xl mt-1 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">{user.role} Dashboard</h5>
      <h5 className="text-xl mt-2 mb-3 font-bold capitalize text-center text-gray-500 text-shadow-lg">Masters</h5>

      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 mt-16 flex rounded-lg">

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
              text="AC Years"
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
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" ?
          <Link to="/dashboard/districtStates" >
            <SummaryCard
              icon={<FaMapMarkerAlt />}
              text="Districts, States"
              number={summary.totalDistrictStates}
              color="bg-green-600"
            />
          </Link> : null}

      </div>
    </div>
  );
};

export default Masters;
