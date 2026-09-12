import React, { useEffect, useMemo, useState } from "react";
import { attendanceGet, attendancePost } from "../../api/attendanceApi";
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
  todayKey
} from "./AttendanceCommon";

const STATUS_OPTIONS = ["Not Marked", "Present", "Absent", "Leave", "Late", "Half Day"];

const StudentAttendanceTab = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  dateKey,
  setDateKey,
}) => {
  const { tr } = useLanguage();
  const access = meta.access;
  const activeAcademicYear =
    meta.academicYears.find((year) => year.active === "Active") || meta.academicYears[0];

  const [academicYearId, setAcademicYearId] = useState(activeAcademicYear?._id || "");
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState([]);
  const [sheetFinalized, setSheetFinalized] = useState(false);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    setRows([]);
    setSheetFinalized(false);
    setCounts(null);
    setLoaded(false);
  }, [selectedSchoolId, academicYearId, courseId, dateKey]);

  const canLoad =
    Boolean(academicYearId) &&
    Boolean(courseId) &&
    Boolean(dateKey) &&
    (!access.isSuperAdmin || Boolean(selectedSchoolId));

  const loadRoster = async () => {
    if (!canLoad) {
      showSwalAlert("Info!", "Please select Niswan, Academic Year, Course and Date.", "info");
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceGet("student/roster", {
        schoolId: selectedSchoolId,
        academicYearId,
        courseId,
        date: dateKey,
      });
      const data = response.data;
      setRows(
        (data.students || []).map((row) => ({
          ...row,
          status: row.status || "Not Marked",
          remarks: row.remarks || "",
        }))
      );
      setCounts(data.counts || null);
      setSheetFinalized(Boolean(data.isFinalized));
      setLoaded(true);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const isSheetFinalized = sheetFinalized || rows.some((row) => Boolean(row.attendance?.isFinalized));

  const updateRow = (index, field, value) => {
    if (isSheetFinalized) return;
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const markAllPresent = () => {
    if (isSheetFinalized) return;
    setRows((current) =>
      current.map((row) =>
        row.approvedLeave ? row : { ...row, status: "Present" }
      )
    );
  };

  const saveAttendance = async (finalize) => {
    if (!rows.length) return;
    if (isSheetFinalized) {
      showSwalAlert("Info!", "Finalized student attendance is locked and cannot be edited.", "info");
      return;
    }

    const unmarkedCount = rows.filter((row) => row.status === "Not Marked").length;
    if (finalize && unmarkedCount > 0) {
      showSwalAlert(
        "Info!",
        `${unmarkedCount} student(s) are still Not Marked. Mark every student before finalizing.`,
        "info"
      );
      return;
    }

    const submittedRows = rows.filter((row) => row.status !== "Not Marked");
    if (!submittedRows.length) {
      showSwalAlert("Info!", "No student attendance has been marked yet.", "info");
      return;
    }

    if (finalize) {
      const result = await showConfirmationSwalAlert(
        "Finalize Attendance?",
        "After finalization, this attendance sheet is permanently locked and cannot be edited.",
        "question"
      );
      if (!result.isConfirmed) return;
    }

    setSaving(true);
    try {
      const response = await attendancePost("student/bulk", {
        schoolId: selectedSchoolId,
        academicYearId,
        courseId,
        date: dateKey,
        finalize,
        rows: submittedRows.map((row) => ({
          studentId: row.studentId,
          status: row.status,
          remarks: row.remarks || "",
        })),
      });
      showSwalAlert("Success!", response.data.message, "success");
      await loadRoster();
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const renderStatusSelect = (row, index) => (
    <SelectInput
      value={row.status}
      disabled={isSheetFinalized || Boolean(row.approvedLeave)}
      onChange={(e) => updateRow(index, "status", e.target.value)}
      className="min-w-[115px]"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status} disabled={status === "Not Marked"}>
          {tr(status)}
        </option>
      ))}
    </SelectInput>
  );

  return (
    <div className="space-y-4">
      <AttendancePanel
        title="Student Attendance"
        subtitle="Niswan Admin or Usthadh can enter attendance for active students. SuperAdmin can select any Niswan."
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
                <option key={year._id} value={year._id}>
                  {year.acYear}{year.active === "Active" ? ` (${tr("Active")})` : ""}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <FieldLabel>{tr("Course")}</FieldLabel>
            <SelectInput value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">{tr("Select Course")}</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} : {course.name}
                </option>
              ))}
            </SelectInput>
          </div>

          <div>
            <FieldLabel>{tr("Date")}</FieldLabel>
            <Input type="date" value={dateKey} max={todayKey()} onChange={(e) => setDateKey(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton onClick={loadRoster} disabled={!canLoad || loading}>
            {loading ? tr("Loading...") : tr("Load Students")}
          </PrimaryButton>
          <SecondaryButton onClick={markAllPresent} disabled={!rows.length || isSheetFinalized}>
            {tr("Mark All Present")}
          </SecondaryButton>
        </div>
      </AttendancePanel>

      {counts && rows.length ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-7">
          {["total", "Present", "Absent", "Leave", "Late", "Half Day", "Not Marked"].map((key) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 md:text-xs">
                {tr(key === "total" ? "Total" : key)}
              </div>
              <div className="mt-0.5 text-lg font-bold text-blue-700">
                {key === "total" ? rows.length : rows.filter((row) => row.status === key).length}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <AttendancePanel title="Daily Attendance Sheet">
        {loading ? <LoadingBlock /> : null}
        {!loading && loaded && !rows.length ? <EmptyBlock text="No active students found for the selected Course and Academic Year" /> : null}
        {!loading && !loaded ? <EmptyBlock text="Select filters and load students" /> : null}

        {rows.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-2">{tr("S.No")}</th>
                    <th className="px-2 py-2">{tr("Roll Number")}</th>
                    <th className="px-2 py-2">{tr("Student Name")}</th>
                    <th className="px-2 py-2">{tr("Status")}</th>
                    <th className="px-2 py-2">{tr("Remarks")}</th>
                    <th className="px-2 py-2">{tr("Saved")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={row.studentId} className={row.approvedLeave ? "bg-violet-50/60" : "hover:bg-sky-50/40"}>
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2 font-medium text-blue-700">{row.rollNumber}</td>
                      <td className="px-2 py-2">
                        <div className="font-medium text-slate-800">{row.name}</div>
                        {row.approvedLeave ? (
                          <div className="mt-1 text-[10px] text-violet-600">
                            {tr("Approved Leave")}: {row.approvedLeave.reason || "-"}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">{renderStatusSelect(row, index)}</td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.remarks || ""}
                          disabled={isSheetFinalized}
                          onChange={(e) => updateRow(index, "remarks", e.target.value)}
                          maxLength={500}
                        />
                      </td>
                      <td className="px-2 py-2">
                        {row.attendance ? (
                          <StatusBadge status={row.attendance.isFinalized ? "Finalized" : "Draft"} />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 md:hidden">
              {rows.map((row, index) => (
                <div key={row.studentId} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{row.name}</div>
                      <div className="text-[10px] text-blue-700">{row.rollNumber}</div>
                    </div>
                    {row.attendance ? <StatusBadge status={row.attendance.isFinalized ? "Finalized" : "Draft"} /> : null}
                  </div>
                  {row.approvedLeave ? (
                    <div className="mb-2 rounded bg-violet-50 p-2 text-[10px] text-violet-700">
                      {tr("Approved Leave")}: {row.approvedLeave.reason || "-"}
                    </div>
                  ) : null}
                  <div className="grid gap-2">
                    {renderStatusSelect(row, index)}
                    <Input
                      placeholder={tr("Remarks")}
                      value={row.remarks || ""}
                      disabled={isSheetFinalized}
                      onChange={(e) => updateRow(index, "remarks", e.target.value)}
                      maxLength={500}
                    />
                  </div>
                </div>
              ))}
            </div>

            {isSheetFinalized ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {tr("Finalized attendance is locked and cannot be edited.")}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <SecondaryButton onClick={() => saveAttendance(false)} disabled={saving}>
                  {saving ? tr("Saving...") : tr("Save Draft")}
                </SecondaryButton>
                <PrimaryButton onClick={() => saveAttendance(true)} disabled={saving}>
                  {saving ? tr("Saving...") : tr("Finalize")}
                </PrimaryButton>
              </div>
            )}
          </>
        ) : null}
      </AttendancePanel>
    </div>
  );
};

export default StudentAttendanceTab;
