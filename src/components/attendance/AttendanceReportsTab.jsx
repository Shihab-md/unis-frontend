import React, { useEffect, useMemo, useState } from "react";
import { attendanceGet } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { PERMISSIONS } from "../../auth/permissions";
import { showSwalAlert } from "../../utils/CommonHelper";
import {
  AttendancePanel,
  EmptyBlock,
  FieldLabel,
  Input,
  LoadingBlock,
  PrimaryButton,
  SelectInput,
  currentMonthKey,
  getApiError,
} from "./AttendanceCommon";

const AttendanceReportsTab = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  staffScopeType,
  setStaffScopeType,
}) => {
  const { tr } = useLanguage();
  const { can } = useAuth();
  const access = meta.access;
  const hasStudentScope =
    access.isSuperAdmin || access.canManageAnyStudents || access.canManageOwnNiswanStudents;
  const hasStaffScope =
    access.isSuperAdmin || access.canManageHqStaff || access.canManageOwnNiswanStaff;
  const canStudent =
    hasStudentScope && can(PERMISSIONS.STUDENT_ATTENDANCE_REPORT_VIEW);
  const canStaff =
    hasStaffScope && can(PERMISSIONS.STAFF_ATTENDANCE_REPORT_VIEW);

  const [kind, setKind] = useState(canStaff ? "staff" : "student");
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [rows, setRows] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kind === "staff" && !canStaff && canStudent) setKind("student");
    if (kind === "student" && !canStudent && canStaff) setKind("staff");
  }, [kind, canStaff, canStudent]);

  useEffect(() => {
    setRows([]);
    setContext(null);
  }, [kind, monthKey, selectedSchoolId, staffScopeType]);

  const effectiveStaffScope = access.isSuperAdmin
    ? staffScopeType
    : access.canManageHqStaff
      ? "HQ"
      : "NISWAN";
  const effectiveStaffSchoolId =
    effectiveStaffScope === "HQ"
      ? meta.hqSchool?._id || ""
      : access.isSuperAdmin
        ? selectedSchoolId
        : access.actorSchoolId || "";
  const effectiveStudentSchoolId = access.isSuperAdmin
    ? selectedSchoolId
    : access.actorSchoolId || "";

  const canLoad =
    kind === "student"
      ? canStudent && Boolean(effectiveStudentSchoolId)
      : canStaff && (effectiveStaffScope === "HQ" || Boolean(effectiveStaffSchoolId));

  const loadReport = async () => {
    if (!canLoad) {
      showSwalAlert("Info!", "Please select the report scope.", "info");
      return;
    }
    setLoading(true);
    try {
      const response = await attendanceGet("reports/monthly", {
        kind,
        month: monthKey,
        scopeType: kind === "staff" ? effectiveStaffScope : undefined,
        schoolId:
          kind === "staff" ? effectiveStaffSchoolId : effectiveStudentSchoolId,
      });
      setRows(response.data.rows || []);
      setContext(response.data);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const result = { Present: 0, Absent: 0, Leave: 0, Late: 0, "Half Day": 0 };
    rows.forEach((row) => {
      Object.keys(result).forEach((key) => {
        result[key] += Number(row[key] || 0);
      });
    });
    return result;
  }, [rows]);

  return (
    <div className="space-y-4">
      <AttendancePanel
        title="Attendance Reports"
        subtitle="Monthly student/staff summaries respect the same server-side Attendance scope."
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          {canStudent && canStaff ? (
            <div>
              <FieldLabel>{tr("Report Type")}</FieldLabel>
              <SelectInput value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="staff">{tr("Staff Attendance")}</option>
                <option value="student">{tr("Student Attendance")}</option>
              </SelectInput>
            </div>
          ) : null}

          {kind === "staff" && access.isSuperAdmin ? (
            <div>
              <FieldLabel>{tr("Staff Scope")}</FieldLabel>
              <SelectInput value={staffScopeType} onChange={(e) => setStaffScopeType(e.target.value)}>
                <option value="HQ">{tr("HQ")}</option>
                <option value="NISWAN">{tr("Niswan")}</option>
              </SelectInput>
            </div>
          ) : null}

          {access.isSuperAdmin &&
          ((kind === "student") || (kind === "staff" && effectiveStaffScope === "NISWAN")) ? (
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
            <FieldLabel>{tr("Month")}</FieldLabel>
            <Input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} />
          </div>

          <div className="flex items-end">
            <PrimaryButton onClick={loadReport} disabled={loading || !canLoad}>
              {loading ? tr("Loading...") : tr("Load Report")}
            </PrimaryButton>
          </div>
        </div>
      </AttendancePanel>

      {loading ? <LoadingBlock /> : null}

      {!loading && rows.length ? (
        <>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
            {Object.entries(totals).map(([status, value]) => (
              <div key={status} className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="text-[10px] text-slate-500">{tr(status)}</div>
                <div className="mt-1 text-lg font-bold text-blue-700">{value}</div>
              </div>
            ))}
          </div>

          <AttendancePanel title={kind === "student" ? "Student Monthly Attendance Report" : "Staff Monthly Attendance Report"}>
            <div className="mb-2 text-xs text-slate-500">
              {context?.school?.nameEnglish ||
                context?.scope?.school?.nameEnglish ||
                (context?.scope?.organizationType === "HQ" ? tr("HQ") : "")}
              {context?.monthKey ? ` · ${context.monthKey}` : ""}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-2">{kind === "student" ? tr("Roll Number") : tr("Staff ID")}</th>
                    <th className="px-2 py-2">{tr("Name")}</th>
                    {kind === "staff" ? <th className="px-2 py-2">{tr("Role")}</th> : null}
                    <th className="px-2 py-2 text-center">{tr("Present")}</th>
                    <th className="px-2 py-2 text-center">{tr("Absent")}</th>
                    <th className="px-2 py-2 text-center">{tr("Leave")}</th>
                    <th className="px-2 py-2 text-center">{tr("Late")}</th>
                    <th className="px-2 py-2 text-center">{tr("Half Day")}</th>
                    <th className="px-2 py-2 text-center">{tr("Marked Days")}</th>
                    {kind === "student" ? <th className="px-2 py-2 text-center">{tr("Attendance %")}</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={kind === "student" ? row.studentId : `${row.staffType}:${row.staffId}`} className="hover:bg-sky-50/40">
                      <td className="px-2 py-2 font-medium text-blue-700">
                        {kind === "student" ? row.rollNumber : row.staffCode}
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-800">{row.name}</td>
                      {kind === "staff" ? <td className="px-2 py-2">{tr(row.role || "-")}</td> : null}
                      <td className="px-2 py-2 text-center">{row.Present || 0}</td>
                      <td className="px-2 py-2 text-center">{row.Absent || 0}</td>
                      <td className="px-2 py-2 text-center">{row.Leave || 0}</td>
                      <td className="px-2 py-2 text-center">{row.Late || 0}</td>
                      <td className="px-2 py-2 text-center">{row["Half Day"] || 0}</td>
                      <td className="px-2 py-2 text-center font-semibold">{row.totalMarked || 0}</td>
                      {kind === "student" ? (
                        <td className="px-2 py-2 text-center font-semibold text-emerald-700">
                          {Number(row.attendancePercent || 0).toFixed(1)}%
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AttendancePanel>
        </>
      ) : null}

      {!loading && context?.success && !rows.length ? <EmptyBlock text="No Attendance records found for this report" /> : null}
    </div>
  );
};

export default AttendanceReportsTab;
