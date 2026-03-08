import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import CommonHeader from "./CommonHeader";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, LinkIcon, showSwalAlert } from '../../utils/CommonHelper'
import {
  FaUniversity, FaWpforms, FaClipboardList, FaCalendarAlt, FaUserCog, FaMapMarkerAlt, FaGoogleDrive
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const Masters = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

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
      <CommonHeader userName={user?.name || ""} title="Masters" />
      <div className="content-center rounded-lg grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-10 mt-16 flex rounded-lg">

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/institutes" >
            <SummaryCard
              icon={<FaUniversity />}
              text="Institutes"
              number={summary.totalInstitutes}
              color="bg-cyan-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/courses" >
            <SummaryCard
              icon={<FaClipboardList />}
              text="Courses"
              number={summary.totalCourses}
              color="bg-pink-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/academicYears" >
            <SummaryCard
              icon={<FaCalendarAlt />}
              text="AC Years"
              number={summary.totalAcademicYears}
              color="bg-yellow-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/templates" >
            <SummaryCard
              icon={<FaWpforms />}
              text="Templates"
              number={summary.totalTemplates}
              color="bg-purple-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/districtStates" >
            <SummaryCard
              icon={<FaMapMarkerAlt />}
              text="Districts, States"
              number={summary.totalDistrictStates}
              color="bg-green-600"
            />
          </Link> : null}

        {user.role === "superadmin" ?
          <Link to="/dashboard/admin/connect-drive" >
            <SummaryCard
              icon={<FaGoogleDrive />}
              text="Re-Connect Google Drive"
              number="*"
              color="bg-blue-600"
            />
          </Link> : null}

      </div>
    </div>
  );
};

export default Masters;
