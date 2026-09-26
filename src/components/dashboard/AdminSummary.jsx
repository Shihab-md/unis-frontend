import React, { useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import CommonHeader from "./CommonHeader";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from "../../auth/permissions";
import { useLanguage } from '../../i18n/LanguageContext'
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, showSwalAlert, removeLocalStorage, isHqAdminSession } from '../../utils/CommonHelper'
import {
  FaMosque, FaUserFriends, FaCoins, FaGraduationCap,
  FaUsers, FaHouseUser, FaClipboardList, FaTasks,
  FaRupeeSign, FaMedal, FaFileContract, FaCogs, FaFileSignature, FaBookOpen, FaHeadset,
} from "react-icons/fa";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

const AdminSummary = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const [summary, setSummary] = useState(null)
  const navigate = useNavigate()
  const { user, can, canAny } = useAuth()
  const { t, tr, direction, fontFamily } = useLanguage()

  const userRole = String(user?.role || "").toLowerCase();


  const canViewExamQuestions = can(PERMISSIONS.EXAM_QUESTION_VIEW);
  const canViewMarksheet = can(PERMISSIONS.MARKSHEET_VIEW);
  const canOpenExams = canViewExamQuestions || canViewMarksheet;
  const canViewInspections = can(PERMISSIONS.INSPECTION_VIEW);
  const canViewCertificates = can(PERMISSIONS.CERTIFICATE_VIEW);
  const canOpenAccounts = can(PERMISSIONS.ACCOUNTS_VIEW);
  const canViewReports = can(PERMISSIONS.REPORTS_VIEW);
  const canViewHelpDesk = can(PERMISSIONS.HELP_DESK_VIEW);
  const isHqAdmin = isHqAdminSession(user?.role, user?.schoolName);
  const hasHqMasterUtilityPermission =
    can(PERMISSIONS.CERTIFICATE_BULK_IHS) || can(PERMISSIONS.TEMP_SCHOOL_MARKSHEET_CREATE);
  const canOpenHqMasterUtilities =
    hasHqMasterUtilityPermission && (userRole !== "admin" || isHqAdmin);
  const canOpenMasters =
    canAny([
      PERMISSIONS.MASTER_INSTITUTE_VIEW,
      PERMISSIONS.MASTER_COURSE_VIEW,
      PERMISSIONS.MASTER_ACADEMIC_YEAR_VIEW,
      PERMISSIONS.MASTER_TEMPLATE_VIEW,
      PERMISSIONS.MASTER_DISTRICT_STATE_VIEW,
      PERMISSIONS.MASTER_GRADE_VIEW,
    ]) || canOpenHqMasterUtilities;

  // Payroll remains on the legacy Attendance scope until its dedicated permission phase.
  // Attendance/Leave/Reports are permission-controlled in Phase 2.2.
  const legacyPayrollAccess = ["superadmin", "hquser", "admin"].includes(userRole);
  const canOpenAttendance =
    legacyPayrollAccess ||
    canAny([
      PERMISSIONS.STUDENT_ATTENDANCE_VIEW,
      PERMISSIONS.STUDENT_ATTENDANCE_ENTER,
      PERMISSIONS.STUDENT_ATTENDANCE_FINALIZE,
      PERMISSIONS.STAFF_ATTENDANCE_SELF_VIEW,
      PERMISSIONS.STAFF_ATTENDANCE_VIEW,
      PERMISSIONS.STAFF_ATTENDANCE_ENTER,
      PERMISSIONS.STAFF_ATTENDANCE_FINALIZE,
      PERMISSIONS.STUDENT_LEAVE_VIEW,
      PERMISSIONS.STUDENT_LEAVE_MANAGE,
      PERMISSIONS.STAFF_LEAVE_SELF_VIEW,
      PERMISSIONS.STAFF_LEAVE_SELF_APPLY,
      PERMISSIONS.STAFF_LEAVE_APPROVE,
      PERMISSIONS.STUDENT_ATTENDANCE_REPORT_VIEW,
      PERMISSIONS.STAFF_ATTENDANCE_REPORT_VIEW,
    ]);

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

        {can(PERMISSIONS.SUPERVISOR_LIST) ?
          <Link to="/dashboard/supervisors" >
            <SummaryCard
              icon={<FaUserFriends />}
              text={t("dashboard.muavins")}
              number={summary.totalSupervisors}
              color="bg-teal-600"
            />
          </Link> : null}

        {can(PERMISSIONS.NISWAN_VIEW) ?
          <Link to="/dashboard/schools" >
            <SummaryCard
              icon={<FaMosque />}
              text={user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" ? t("dashboard.niswans") : t("dashboard.niswan")}
              number={user.role === "admin" || user.role === "guest" ? "*" : summary.totalSchools}
              color="bg-pink-600"
            />
          </Link> : null}

        {can(PERMISSIONS.EMPLOYEE_VIEW) ?
          <Link to="/dashboard/employees" >
            <SummaryCard
              icon={<FaHouseUser />}
              text={t("dashboard.employees")}
              number={user.role === "guest" ? "*" : summary.totalEmployees}
              color={user.role === "supervisor" ? "bg-slate-500" : "bg-cyan-600"}
            />
          </Link> : null}

        {can(PERMISSIONS.STUDENT_VIEW) ?
          <Link to="/dashboard/students"  >
            <SummaryCard
              icon={<FaUsers />}
              text={t("dashboard.students")}
              number={user.role === "guest" ? "*" : summary.totalStudents}
              color="bg-blue-500"
            />
          </Link> : null}

        {canViewInspections ?
          <Link to="/dashboard/inspection-reports" >
            <SummaryCard
              icon={<FaFileSignature />}
              text={t("dashboard.inspection")}
              number="*"
              color={user.role === "supervisor" ? "bg-blue-600" : "bg-lime-600"}
            />
          </Link> : null}

        {canOpenAttendance ?
          <Link to="/dashboard/attendance" >
            <SummaryCard
              icon={<FaTasks />}
              text={t("dashboard.attendance")}
              number="*"
              color="bg-purple-700"
            />
          </Link> : null}

        {canOpenExams ?
          <Link to="/dashboard/exams" >
            <SummaryCard
              icon={<FaClipboardList />}
              text={t("dashboard.exams")}
              number="*"
              color="bg-emerald-600"
            />
          </Link> : null}

        {canViewCertificates ?
          <Link to="/dashboard/certificates" >
            <SummaryCard
              icon={<FaMedal />}
              text={t("dashboard.certificates")}
              number={summary.totalCertificates}
              color="bg-yellow-600"
            />
          </Link> : null}

        {canOpenAccounts ?
          <Link to="/dashboard/accountsPage" >
            <SummaryCard
              icon={<FaRupeeSign />}
              text={t("dashboard.accounts")}
              number="*"
              color="bg-orange-700"
            />
          </Link> : null}

        {canOpenMasters ?
          <Link to="/dashboard/masters" >
            <SummaryCard
              icon={<FaCoins />}
              text={t("dashboard.masters")}
              number="*"
              color="bg-purple-500"
            />
          </Link> : null}

        {canViewReports ?
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

        <Link to="/dashboard/demo-tutorial" >
          <SummaryCard
            icon={<FaBookOpen />}
            text={tr("Demo - Tutorial")}
            number="*"
            color="bg-sky-700"
          />
        </Link>

        {canViewHelpDesk ? (
          <Link to="/dashboard/help-desk" >
            <SummaryCard
              icon={<FaHeadset />}
              text={tr("Help Desk")}
              number="*"
              color="bg-indigo-600"
            />
          </Link>
        ) : null}

      </div>
    </div>
  );
};

export default AdminSummary;
