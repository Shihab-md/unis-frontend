import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import CommonHeader from "./CommonHeader";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, showSwalAlert, removeLocalStorage } from '../../utils/CommonHelper'
import {
  FaMosque, FaUserFriends, FaCoins, FaGraduationCap,
  FaUsers, FaHouseUser, FaClipboardList, FaTasks,
  FaRupeeSign, FaMedal, FaFileContract, FaCogs, FaFileSignature, FaBookOpen,
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AdminSummary = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, tr, direction, fontFamily } = useLanguage()

  const userRole = String(user?.role || "").toLowerCase();

  const loggedInSchoolName = String(localStorage.getItem("schoolName") || "").trim();

  const isHqAdmin =
    userRole === "admin" && loggedInSchoolName.startsWith("UN-00-00001");

  const canViewExam =
    userRole === "superadmin" || userRole === "hquser" || isHqAdmin;

  useEffect(() => {

    if (user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "guest") {
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

  return (
    <div className="p-7 pt-3 items-center justify-center rounded-lg h-9/10" dir={direction} style={{ fontFamily }}>
      <CommonHeader userName={user?.name || ""} title={t("common.dashboard")} />
      <div className="content-center rounded-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-7 lg:gap-14 mt-7 lg:mt-16 flex rounded-lg">

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "guest" ?
          <Link to="/dashboard/supervisors" >
            <SummaryCard
              icon={<FaUserFriends />}
              text={t("dashboard.muavins")}
              number={summary.totalSupervisors}
              color="bg-teal-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" || user.role === "guest" ?
          <Link to="/dashboard/schools" >
            <SummaryCard
              icon={<FaMosque />}
              text={user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" ? t("dashboard.niswans") : t("dashboard.niswan")}
              number={user.role === "admin" || user.role === "guest" ? "*" : summary.totalSchools}
              color="bg-pink-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" || user.role === "guest" ?
          <Link to="/dashboard/employees" >
            <SummaryCard
              icon={<FaHouseUser />}
              text={t("dashboard.employees")}
              number={user.role === "guest" ? "*" : summary.totalEmployees}
              color={user.role === "supervisor" ? "bg-slate-500" : "bg-cyan-600"}
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" || user.role === "guest" ?
          <Link to="/dashboard/students"  >
            <SummaryCard
              icon={<FaUsers />}
              text={t("dashboard.students")}
              number={user.role === "guest" ? "*" : summary.totalStudents}
              color="bg-blue-500"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "guest" ?
          <Link to="/dashboard/inspection-reports" >
            <SummaryCard
              icon={<FaFileSignature />}
              text={t("dashboard.inspection")}
              number="*"
              color={user.role === "supervisor" ? "bg-blue-600" : "bg-lime-600"}
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin"
          || user.role === "teacher" || user.role === "usthadh" || user.role === "supervisor"
          || user.role === "employee" || user.role === "warden" || user.role === "staff" ?
          <Link to={canViewExam ? "/dashboard/attendance" : "#"} >
            <SummaryCard
              icon={<FaTasks />}
              text={t("dashboard.attendance")}
              number="*"
              color="bg-purple-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" || user.role === "guest" ?
          <Link to={canViewExam ? "/dashboard/exams" : "#"} >
            <SummaryCard
              icon={<FaClipboardList />}
              text={t("dashboard.exams")}
              number="*"
              color="bg-emerald-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/certificates" >
            <SummaryCard
              icon={<FaMedal />}
              text={t("dashboard.certificates")}
              number={summary.totalCertificates}
              color="bg-yellow-600"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
          <Link to="/dashboard/accountsPage" >
            <SummaryCard
              icon={<FaRupeeSign />}
              text={t("dashboard.accounts")}
              number="*"
              color="bg-orange-700"
            />
          </Link> : null}

        {user.role === "superadmin" || user.role === "hquser" || user.role === "guest" ?
          <Link to="/dashboard/masters" >
            <SummaryCard
              icon={<FaCoins />}
              text={t("dashboard.masters")}
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        <Link to="/dashboard/demo-tutorial" >
          <SummaryCard
            icon={<FaBookOpen />}
            text={tr("Demo - Tutorial")}
            number="*"
            color="bg-sky-700"
          />
        </Link>

        {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" || user.role === "guest" ?
          <Link to="/dashboard/reports" >
            <SummaryCard
              icon={<FaFileContract />}
              text={t("dashboard.reports")}
              number="*"
              color={user.role === "supervisor" ? "bg-purple-500" : "bg-pink-500"}
            />
          </Link> : null}

        <Link to="/dashboard/profile" >
          <SummaryCard
            icon={<FaCogs />}
            text={t("dashboard.profile")}
            number="*"
            color="bg-lime-700"
          />
        </Link>

      </div>
    </div>
  );
};

export default AdminSummary;
