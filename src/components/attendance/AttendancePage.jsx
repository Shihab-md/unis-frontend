import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CommonHeader from "../dashboard/CommonHeader";
import { useAuth } from "../../context/AuthContext";
import { PERMISSIONS } from "../../auth/permissions";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { attendanceGet } from "../../api/attendanceApi";
import { showSwalAlert } from "../../utils/CommonHelper";
import { AttendancePanel, LoadingBlock, todayKey } from "./AttendanceCommon";
import AttendanceOverview from "./AttendanceOverview";
import StudentAttendanceTab from "./StudentAttendanceTab";
import StaffAttendanceTab from "./StaffAttendanceTab";
import LeaveTab from "./LeaveTab";
import PayrollTab from "./PayrollTab";
import MyPayslipsTab from "./MyPayslipsTab";
import AttendanceReportsTab from "./AttendanceReportsTab";

const AttendancePage = () => {
  const { can } = useAuth();
  const { tr, direction, fontFamily } = useLanguage();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const requestedTab = String(searchParams.get("tab") || "").trim().toLowerCase();
  const [activeTab, setActiveTab] = useState(requestedTab || "overview");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [staffScopeType, setStaffScopeType] = useState("NISWAN");
  const [dateKey, setDateKey] = useState(todayKey());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await attendanceGet("meta");
        if (!alive) return;
        const data = response.data;
        setMeta(data);
        setSelectedSchoolId(data.defaultSchoolId || "");
        setStaffScopeType(data.defaultScopeType === "HQ" ? "HQ" : "NISWAN");
      } catch (error) {
        showSwalAlert("Error!", error?.response?.data?.error || error.message, "error");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const tabs = useMemo(() => {
    if (!meta?.access) return [];
    const access = meta.access;
    const rows = [{ id: "overview", label: "Overview" }];
    const hasStudentScope =
      access.isSuperAdmin || access.canManageAnyStudents || access.canManageOwnNiswanStudents;
    const hasStaffManageScope =
      access.isSuperAdmin || access.canManageHqStaff || access.canManageOwnNiswanStaff;
    const canViewStudentAttendance = hasStudentScope && can(PERMISSIONS.STUDENT_ATTENDANCE_VIEW);
    const canViewStaffAttendance =
      (hasStaffManageScope && can(PERMISSIONS.STAFF_ATTENDANCE_VIEW)) ||
      (access.canViewOwnStaffAttendance && can(PERMISSIONS.STAFF_ATTENDANCE_SELF_VIEW));
    const canUseStudentLeave = hasStudentScope && can(PERMISSIONS.STUDENT_LEAVE_VIEW);
    const canUseStaffLeave =
      (access.canApplyOwnStaffLeave && can(PERMISSIONS.STAFF_LEAVE_SELF_VIEW)) ||
      (hasStaffManageScope && can(PERMISSIONS.STAFF_LEAVE_APPROVE));
    const canViewReports =
      (hasStudentScope && can(PERMISSIONS.STUDENT_ATTENDANCE_REPORT_VIEW)) ||
      (hasStaffManageScope && can(PERMISSIONS.STAFF_ATTENDANCE_REPORT_VIEW));

    if (canViewStudentAttendance) rows.push({ id: "students", label: "Students" });
    if (canViewStaffAttendance) rows.push({ id: "staff", label: "Staff" });
    if (canUseStudentLeave || canUseStaffLeave) rows.push({ id: "leave", label: "Leave" });

    const canManagePayroll =
      (access.canManagePayrollGlobally || access.canManageOwnNiswanPayroll) &&
      can(PERMISSIONS.PAYROLL_VIEW);
    const canViewOwnPayslip = access.canViewOwnPayslip && can(PERMISSIONS.PAYSLIP_SELF_VIEW);

    if (canManagePayroll) rows.push({ id: "payroll", label: "Payroll" });
    if (canViewOwnPayslip) rows.push({ id: "payslips", label: "My Payslips" });
    if (canViewReports) rows.push({ id: "reports", label: "Reports" });

    return rows;
  }, [meta, can]);

  useEffect(() => {
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
      return;
    }
    if (tabs.length && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab, requestedTab]);

  if (loading) {
    return (
      <div className="p-4 md:p-7">
        <LoadingBlock text="Loading Attendance..." />
      </div>
    );
  }

  if (!meta?.success) {
    return (
      <div className="p-4 md:p-7">
        <AttendancePanel title="Attendance">
          <div className="text-sm text-rose-600">{tr("Unable to load Attendance module")}</div>
        </AttendancePanel>
      </div>
    );
  }

  const commonProps = {
    meta,
    selectedSchoolId,
    setSelectedSchoolId,
    staffScopeType,
    setStaffScopeType,
    dateKey,
    setDateKey,
  };

  return (
    <div
      className="mx-auto w-full max-w-[1600px] p-3 pt-2 md:p-7 md:pt-1 "
      dir={direction}
      style={{ fontFamily }}
    >
      <div className="text-center">
        <AutoText
          as="h5"
          text={tr("Attendance")}
          variant="heading"
          className="mt-1 lg:mt-3 mb-3 font-bold capitalize text-green-600 drop-shadow-lg"
        />
      </div>
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-md">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition md:px-4 md:text-sm ${activeTab === tab.id
                ? "bg-blue-700 text-white shadow"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {tr(tab.label)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? <AttendanceOverview {...commonProps} /> : null}
      {activeTab === "students" ? <StudentAttendanceTab {...commonProps} /> : null}
      {activeTab === "staff" ? <StaffAttendanceTab {...commonProps} /> : null}
      {activeTab === "leave" ? <LeaveTab {...commonProps} /> : null}
      {activeTab === "payroll" ? <PayrollTab {...commonProps} /> : null}
      {activeTab === "payslips" ? <MyPayslipsTab /> : null}
      {activeTab === "reports" ? <AttendanceReportsTab {...commonProps} /> : null}
    </div>
  );
};

export default AttendancePage;
