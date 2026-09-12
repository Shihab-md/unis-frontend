import React, { useEffect, useMemo, useState } from "react";
import { attendanceGet, attendancePatch, attendancePost } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { showConfirmationSwalAlert, showSwalAlert } from "../../utils/CommonHelper";
import {
  AttendancePanel,
  EmptyBlock,
  FieldLabel,
  Input,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusBadge,
  getApiError,
  todayKey,
} from "./AttendanceCommon";

const StaffLeaveSection = ({ meta, staffScopeType, selectedSchoolId }) => {
  const { tr } = useLanguage();
  const access = meta.access;
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [dayType, setDayType] = useState("Full Day");
  const [fromDateKey, setFromDateKey] = useState(todayKey());
  const [toDateKey, setToDateKey] = useState(todayKey());
  const [reason, setReason] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [saving, setSaving] = useState(false);

  const canApprove =
    access.isSuperAdmin || access.canManageHqStaff || access.canManageOwnNiswanStaff;

  const loadMine = async () => {
    if (!access.canApplyOwnStaffLeave) return;
    setLoadingMine(true);
    try {
      const response = await attendanceGet("staff-leaves/mine");
      setMyLeaves(response.data.leaves || []);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoadingMine(false);
    }
  };

  const loadApprovals = async () => {
    if (!canApprove) return;
    setLoadingApprovals(true);
    try {
      const response = await attendanceGet("staff-leaves/approvals", {
        status: "Pending",
        scopeType: access.isSuperAdmin ? staffScopeType : undefined,
        schoolId: access.isSuperAdmin && staffScopeType === "NISWAN" ? selectedSchoolId : undefined,
      });
      setApprovals(response.data.leaves || []);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoadingApprovals(false);
    }
  };

  useEffect(() => {
    loadMine();
  }, [access.canApplyOwnStaffLeave]);

  useEffect(() => {
    if (!canApprove) return;
    if (access.isSuperAdmin && staffScopeType === "NISWAN" && !selectedSchoolId) {
      setApprovals([]);
      return;
    }
    loadApprovals();
  }, [access.isSuperAdmin, canApprove, selectedSchoolId, staffScopeType]);

  const applyLeave = async () => {
    if (!leaveType || !fromDateKey || !toDateKey || !reason.trim()) {
      showSwalAlert("Info!", "Leave Type, dates and Reason are required.", "info");
      return;
    }
    if (dayType === "Half Day" && fromDateKey !== toDateKey) {
      showSwalAlert("Info!", "For Half Day leave, From Date and To Date must be the same.", "info");
      return;
    }
    setSaving(true);
    try {
      const response = await attendancePost("staff-leaves/mine", {
        leaveType,
        dayType,
        fromDateKey,
        toDateKey,
        reason,
      });
      showSwalAlert("Success!", response.data.message, "success");
      setReason("");
      await loadMine();
      await loadApprovals();
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const changeLeaveStatus = async (leaveId, status, isPaid) => {
    const result = await showConfirmationSwalAlert(
      `${status} Leave?`,
      status === "Approved"
        ? isPaid
          ? "This leave will be treated as paid leave."
          : "This leave will be treated as unpaid leave and can affect payroll."
        : "",
      "question"
    );
    if (!result.isConfirmed) return;

    try {
      const response = await attendancePatch(`staff-leaves/${leaveId}/status`, {
        status,
        isPaid,
      });
      showSwalAlert("Success!", response.data.message, "success");
      await loadApprovals();
      await loadMine();
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    }
  };

  return (
    <div className="space-y-4">
      {access.canApplyOwnStaffLeave ? (
        <AttendancePanel
          title="My Leave"
          subtitle="Apply for your own leave. Paid/unpaid treatment is decided by the approver."
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <FieldLabel>{tr("Leave Type")}</FieldLabel>
              <SelectInput value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                {["Casual Leave", "Sick Leave", "Earned Leave", "Special Leave"].map((type) => (
                  <option key={type} value={type}>{tr(type)}</option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel>{tr("Day Type")}</FieldLabel>
              <SelectInput
                  value={dayType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDayType(next);
                    if (next === "Half Day") setToDateKey(fromDateKey);
                  }}
                >
                <option value="Full Day">{tr("Full Day")}</option>
                <option value="Half Day">{tr("Half Day")}</option>
              </SelectInput>
            </div>
            <div>
              <FieldLabel>{tr("From Date")}</FieldLabel>
              <Input
                type="date"
                value={fromDateKey}
                onChange={(e) => {
                  const next = e.target.value;
                  setFromDateKey(next);
                  if (dayType === "Half Day") setToDateKey(next);
                }}
              />
            </div>
            <div>
              <FieldLabel>{tr("To Date")}</FieldLabel>
              <Input type="date" value={toDateKey} onChange={(e) => setToDateKey(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <FieldLabel>{tr("Reason")}</FieldLabel>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
            </div>
          </div>
          <div className="mt-3">
            <PrimaryButton onClick={applyLeave} disabled={saving}>
              {saving ? tr("Submitting...") : tr("Apply Leave")}
            </PrimaryButton>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold text-slate-700">{tr("My Leave History")}</div>
            {loadingMine ? <LoadingBlock /> : null}
            {!loadingMine && !myLeaves.length ? <EmptyBlock text="No leave history found" /> : null}
            {myLeaves.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2">{tr("Leave Type")}</th>
                      <th className="px-2 py-2">{tr("From Date")}</th>
                      <th className="px-2 py-2">{tr("To Date")}</th>
                      <th className="px-2 py-2">{tr("Day Type")}</th>
                      <th className="px-2 py-2">{tr("Status")}</th>
                      <th className="px-2 py-2">{tr("Paid / Unpaid")}</th>
                      <th className="px-2 py-2">{tr("Reason")}</th>
                      <th className="px-2 py-2">{tr("Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td className="px-2 py-2">{tr(leave.leaveType)}</td>
                        <td className="px-2 py-2">{leave.fromDateKey}</td>
                        <td className="px-2 py-2">{leave.toDateKey}</td>
                        <td className="px-2 py-2">{tr(leave.dayType)}</td>
                        <td className="px-2 py-2"><StatusBadge status={leave.status} /></td>
                        <td className="px-2 py-2">
                          {leave.status === "Approved" ? tr(leave.isPaid ? "Paid Leave" : "Unpaid Leave") : "-"}
                        </td>
                        <td className="px-2 py-2">{leave.reason}</td>
                        <td className="px-2 py-2">
                          {leave.status === "Pending" || leave.status === "Approved" ? (
                            <SecondaryButton onClick={() => changeLeaveStatus(leave._id, "Cancelled", leave.isPaid)}>
                              {tr("Cancel")}
                            </SecondaryButton>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </AttendancePanel>
      ) : null}

      {canApprove ? (
        <AttendancePanel
          title="Staff Leave Approvals"
          subtitle="Niswan staff → Niswan Admin; HQ staff/Muavins → HQ manager; Admin leave → SuperAdmin."
        >
          {loadingApprovals ? <LoadingBlock /> : null}
          {!loadingApprovals && !approvals.length ? <EmptyBlock text="No pending staff leave approvals" /> : null}
          {approvals.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-2">{tr("Staff")}</th>
                    <th className="px-2 py-2">{tr("Role")}</th>
                    <th className="px-2 py-2">{tr("Leave Type")}</th>
                    <th className="px-2 py-2">{tr("Dates")}</th>
                    <th className="px-2 py-2">{tr("Reason")}</th>
                    <th className="px-2 py-2">{tr("Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvals.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-2 py-2 font-medium text-slate-800">{leave.userId?.name || "-"}</td>
                      <td className="px-2 py-2">{tr(leave.userId?.role || "-")}</td>
                      <td className="px-2 py-2">{tr(leave.leaveType)}</td>
                      <td className="px-2 py-2">{leave.fromDateKey} → {leave.toDateKey}</td>
                      <td className="px-2 py-2">{leave.reason}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <PrimaryButton onClick={() => changeLeaveStatus(leave._id, "Approved", true)}>
                            {tr("Approve Paid")}
                          </PrimaryButton>
                          <SecondaryButton onClick={() => changeLeaveStatus(leave._id, "Approved", false)}>
                            {tr("Approve Unpaid")}
                          </SecondaryButton>
                          <button
                            type="button"
                            onClick={() => changeLeaveStatus(leave._id, "Rejected", leave.isPaid)}
                            className="rounded-md bg-rose-600 px-2.5 py-2 text-[11px] font-semibold text-white hover:bg-rose-700"
                          >
                            {tr("Reject")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </AttendancePanel>
      ) : null}
    </div>
  );
};

const StudentLeaveSection = ({ meta, selectedSchoolId, setSelectedSchoolId, dateKey }) => {
  const { tr } = useLanguage();
  const access = meta.access;
  const activeAcademicYear =
    meta.academicYears.find((year) => year.active === "Active") || meta.academicYears[0];
  const [academicYearId, setAcademicYearId] = useState(activeAcademicYear?._id || "");
  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [fromDateKey, setFromDateKey] = useState(todayKey());
  const [toDateKey, setToDateKey] = useState(todayKey());
  const [reason, setReason] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const courses = useMemo(
    () =>
      [...(meta.courses || [])].sort((a, b) =>
        String(a.code || "").localeCompare(String(b.code || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ),
    [meta.courses]
  );

  const effectiveSchoolId = access.isSuperAdmin ? selectedSchoolId : access.actorSchoolId || "";

  const loadStudents = async () => {
    if (!effectiveSchoolId || !academicYearId || !courseId) {
      showSwalAlert("Info!", "Please select Niswan, Academic Year and Course.", "info");
      return;
    }
    setLoading(true);
    try {
      const response = await attendanceGet("student/roster", {
        schoolId: effectiveSchoolId,
        academicYearId,
        courseId,
        date: fromDateKey || dateKey || todayKey(),
      });
      setStudents(response.data.students || []);
      setStudentId("");
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaves = async () => {
    if (!effectiveSchoolId) {
      setLeaves([]);
      return;
    }
    try {
      const response = await attendanceGet("student-leaves", {
        schoolId: effectiveSchoolId,
        month: fromDateKey.slice(0, 7),
      });
      setLeaves(response.data.leaves || []);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [effectiveSchoolId]);

  const recordLeave = async () => {
    if (!studentId || !fromDateKey || !toDateKey || !reason.trim()) {
      showSwalAlert("Info!", "Student, dates and Reason are required.", "info");
      return;
    }
    setSaving(true);
    try {
      const response = await attendancePost("student-leaves", {
        studentId,
        fromDateKey,
        toDateKey,
        reason,
      });
      showSwalAlert("Success!", response.data.message, "success");
      setReason("");
      await loadLeaves();
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelStudentLeave = async (id) => {
    const result = await showConfirmationSwalAlert("Cancel Student Leave?", "", "question");
    if (!result.isConfirmed) return;
    try {
      const response = await attendancePatch(`student-leaves/${id}/status`, { status: "Cancelled" });
      showSwalAlert("Success!", response.data.message, "success");
      await loadLeaves();
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    }
  };

  return (
    <AttendancePanel
      title="Student Leave"
      subtitle="Admin/Usthadh can record student leave. Approved leave is automatically protected in daily attendance."
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        {access.isSuperAdmin ? (
          <div className="lg:col-span-2">
            <FieldLabel>{tr("Select Niswan")}</FieldLabel>
            <SelectInput value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
              <option value="">{tr("Select Niswan")}</option>
              {meta.schools
                //.filter((school) => school.code !== meta.hqSchool?.code)
                .map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.code} : {school.nameEnglish}
                  </option>
                ))}
            </SelectInput>
          </div>
        ) : null}

        <div>
          <FieldLabel>{tr("Academic Year")}</FieldLabel>
          <SelectInput value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
            <option value="">{tr("Select Academic Year")}</option>
            {meta.academicYears.map((year) => (
              <option key={year._id} value={year._id}>{year.acYear}</option>
            ))}
          </SelectInput>
        </div>

        <div>
          <FieldLabel>{tr("Course")}</FieldLabel>
          <SelectInput value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">{tr("Select Course")}</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.code} : {course.name}</option>
            ))}
          </SelectInput>
        </div>

        <div className="flex items-end">
          <SecondaryButton onClick={loadStudents} disabled={loading}>
            {loading ? tr("Loading...") : tr("Load Students")}
          </SecondaryButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FieldLabel>{tr("Student")}</FieldLabel>
          <SelectInput value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">{tr("Select Student")}</option>
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.rollNumber} : {student.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <div>
          <FieldLabel>{tr("From Date")}</FieldLabel>
          <Input type="date" value={fromDateKey} onChange={(e) => setFromDateKey(e.target.value)} />
        </div>
        <div>
          <FieldLabel>{tr("To Date")}</FieldLabel>
          <Input type="date" value={toDateKey} onChange={(e) => setToDateKey(e.target.value)} />
        </div>
        <div>
          <FieldLabel>{tr("Reason")}</FieldLabel>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
        </div>
      </div>

      <div className="mt-3">
        <PrimaryButton onClick={recordLeave} disabled={saving}>
          {saving ? tr("Saving...") : tr("Record Student Leave")}
        </PrimaryButton>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold text-slate-700">{tr("Recent Student Leave")}</div>
        {!leaves.length ? <EmptyBlock text="No student leave records found" /> : null}
        {leaves.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-2">{tr("Student")}</th>
                  <th className="px-2 py-2">{tr("Dates")}</th>
                  <th className="px-2 py-2">{tr("Reason")}</th>
                  <th className="px-2 py-2">{tr("Status")}</th>
                  <th className="px-2 py-2">{tr("Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-2 py-2">
                      <div className="font-medium">{leave.studentId?.userId?.name || "-"}</div>
                      <div className="text-[10px] text-blue-700">{leave.studentId?.rollNumber || ""}</div>
                    </td>
                    <td className="px-2 py-2">{leave.fromDateKey} → {leave.toDateKey}</td>
                    <td className="px-2 py-2">{leave.reason}</td>
                    <td className="px-2 py-2"><StatusBadge status={leave.status} /></td>
                    <td className="px-2 py-2">
                      {leave.status === "Approved" || leave.status === "Pending" ? (
                        <SecondaryButton onClick={() => cancelStudentLeave(leave._id)}>
                          {tr("Cancel")}
                        </SecondaryButton>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </AttendancePanel>
  );
};

const LeaveTab = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  staffScopeType,
  dateKey,
}) => {
  const { tr } = useLanguage();
  const access = meta.access;
  const canStudentLeave =
    access.isSuperAdmin || access.canManageAnyStudents || access.canManageOwnNiswanStudents;
  const canStaffLeave =
    access.canApplyOwnStaffLeave ||
    access.isSuperAdmin ||
    access.canManageHqStaff ||
    access.canManageOwnNiswanStaff;

  const [mode, setMode] = useState(canStaffLeave ? "staff" : "student");

  useEffect(() => {
    if (mode === "staff" && !canStaffLeave && canStudentLeave) setMode("student");
    if (mode === "student" && !canStudentLeave && canStaffLeave) setMode("staff");
  }, [canStaffLeave, canStudentLeave, mode]);

  return (
    <div className="space-y-4">
      {canStaffLeave && canStudentLeave ? (
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              mode === "staff" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {tr("Staff Leave")}
          </button>
          <button
            type="button"
            onClick={() => setMode("student")}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              mode === "student" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {tr("Student Leave")}
          </button>
        </div>
      ) : null}

      {mode === "staff" && canStaffLeave ? (
        <StaffLeaveSection
          meta={meta}
          staffScopeType={staffScopeType}
          selectedSchoolId={selectedSchoolId}
        />
      ) : null}

      {mode === "student" && canStudentLeave ? (
        <StudentLeaveSection
          meta={meta}
          selectedSchoolId={selectedSchoolId}
          setSelectedSchoolId={setSelectedSchoolId}
          dateKey={dateKey}
        />
      ) : null}
    </div>
  );
};

export default LeaveTab;
