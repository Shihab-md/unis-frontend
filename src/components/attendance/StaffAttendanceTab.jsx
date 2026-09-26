import React, { useEffect, useMemo, useState } from "react";
import { attendanceGet, attendancePost } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { PERMISSIONS } from "../../auth/permissions";
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
  currentMonthKey,
  getApiError,
  todayKey
} from "./AttendanceCommon";

const STATUS_OPTIONS = ["Not Marked", "Present", "Absent", "Leave", "Late", "Half Day", "Holiday", "Weekly Off"];

const StaffAttendanceTab = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  staffScopeType,
  setStaffScopeType,
  dateKey,
  setDateKey,
}) => {
  const { tr } = useLanguage();
  const { can } = useAuth();
  const access = meta.access;
  const hasManageScope =
    access.isSuperAdmin || access.canManageHqStaff || access.canManageOwnNiswanStaff;
  const canManage = hasManageScope && can(PERMISSIONS.STAFF_ATTENDANCE_VIEW);
  const canEnter = canManage && can(PERMISSIONS.STAFF_ATTENDANCE_ENTER);
  const canFinalize = canEnter && can(PERMISSIONS.STAFF_ATTENDANCE_FINALIZE);
  const canViewOwn = access.canViewOwnStaffAttendance && can(PERMISSIONS.STAFF_ATTENDANCE_SELF_VIEW);

  const [rows, setRows] = useState([]);
  const [sheetFinalized, setSheetFinalized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hqStaffCategory, setHqStaffCategory] = useState("HQ_STAFF");
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [myAttendance, setMyAttendance] = useState(null);

  const effectiveScopeType = access.isSuperAdmin
    ? staffScopeType
    : access.canManageHqStaff
      ? "HQ"
      : "NISWAN";

  const effectiveSchoolId =
    effectiveScopeType === "HQ"
      ? meta.hqSchool?._id || ""
      : access.isSuperAdmin
        ? selectedSchoolId
        : access.actorSchoolId || "";

  useEffect(() => {
    if (!canManage) return;
    setRows([]);
    setSheetFinalized(false);
    setLoaded(false);
  }, [dateKey, effectiveScopeType, effectiveSchoolId, hqStaffCategory, canManage]);

  useEffect(() => {
    if (canManage || !canViewOwn) return;
    let alive = true;
    const loadMine = async () => {
      setLoading(true);
      try {
        const response = await attendanceGet("staff/my-monthly", { month: monthKey });
        if (alive) setMyAttendance(response.data);
      } catch (error) {
        if (alive) setMyAttendance({ success: false, error: getApiError(error) });
      } finally {
        if (alive) setLoading(false);
      }
    };
    loadMine();
    return () => {
      alive = false;
    };
  }, [canViewOwn, canManage, monthKey]);

  const canLoad =
    Boolean(dateKey) &&
    (effectiveScopeType === "HQ" || Boolean(effectiveSchoolId));

  const loadRoster = async () => {
    if (!canLoad) {
      showSwalAlert("Info!", "Please select Attendance scope and date.", "info");
      return;
    }
    setLoading(true);
    try {
      const response = await attendanceGet("staff/roster", {
        scopeType: effectiveScopeType,
        schoolId: effectiveSchoolId,
        date: dateKey,
        ...(effectiveScopeType === "HQ" ? { staffCategory: hqStaffCategory } : {}),
      });
      setRows(
        (response.data.staff || []).map((row) => ({
          ...row,
          status: row.status || "Not Marked",
          inTime: row.inTime || "",
          outTime: row.outTime || "",
          remarks: row.remarks || "",
        }))
      );
      setSheetFinalized(Boolean(response.data.isFinalized));
      setLoaded(true);
    } catch (error) {
      showSwalAlert("Error!", getApiError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const isSheetFinalized = sheetFinalized || rows.some((row) => Boolean(row.attendance?.isFinalized));

  const updateRow = (index, field, value) => {
    if (!canEnter || isSheetFinalized) return;
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const markAllPresent = () => {
    if (!canEnter || isSheetFinalized) return;
    setRows((current) =>
      current.map((row) =>
        row.approvedLeave ? row : { ...row, status: "Present" }
      )
    );
  };

  const saveAttendance = async (finalize) => {
    if (!rows.length) return;
    if (!canEnter || (finalize && !canFinalize)) {
      showSwalAlert("Error!", "You do not have permission for this attendance action.", "error");
      return;
    }
    if (isSheetFinalized) {
      showSwalAlert("Info!", "Finalized staff attendance is locked and cannot be edited.", "info");
      return;
    }

    const unmarkedCount = rows.filter((row) => row.status === "Not Marked").length;
    if (finalize && unmarkedCount > 0) {
      showSwalAlert(
        "Info!",
        `${unmarkedCount} staff member(s) are still Not Marked. Mark every staff member before finalizing.`,
        "info"
      );
      return;
    }

    const submittedRows = rows.filter((row) => row.status !== "Not Marked");
    if (!submittedRows.length) {
      showSwalAlert("Info!", "No staff attendance has been marked yet.", "info");
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
      const response = await attendancePost("staff/bulk", {
        scopeType: effectiveScopeType,
        schoolId: effectiveSchoolId,
        date: dateKey,
        finalize,
        ...(effectiveScopeType === "HQ" ? { staffCategory: hqStaffCategory } : {}),
        rows: submittedRows.map((row) => ({
          staffType: row.staffType,
          staffId: row.staffId,
          status: row.status,
          inTime: row.inTime,
          outTime: row.outTime,
          remarks: row.remarks,
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

  const summary = useMemo(() => {
    const result = {
      Total: rows.length,
      Present: 0,
      Absent: 0,
      Leave: 0,
      Late: 0,
      "Half Day": 0,
      "Not Marked": 0,
    };
    rows.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(result, row.status)) result[row.status] += 1;
    });
    return result;
  }, [rows]);

  if (!canManage) {
    return (
      <div className="space-y-4">
        <AttendancePanel
          title="My Attendance"
          subtitle="Your personal attendance history. Attendance management is restricted to authorized Admin/HQ users."
        >
          <div className="max-w-xs">
            <FieldLabel>{tr("Month")}</FieldLabel>
            <Input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} />
          </div>
        </AttendancePanel>

        <AttendancePanel title="Monthly Attendance">
          {loading ? <LoadingBlock /> : null}
          {!loading && myAttendance?.error ? <EmptyBlock text={myAttendance.error} /> : null}
          {!loading && myAttendance?.records?.length ? (
            <>
              <div className="mb-3 grid grid-cols-3 gap-2 md:grid-cols-6">
                {["Present", "Absent", "Leave", "Late", "Half Day", "Holiday"].map((status) => (
                  <div key={status} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                    <div className="text-[10px] text-slate-500">{tr(status)}</div>
                    <div className="text-lg font-bold text-blue-700">
                      {myAttendance.records.filter((row) => row.status === status).length}
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2">{tr("Date")}</th>
                      <th className="px-2 py-2">{tr("Status")}</th>
                      <th className="px-2 py-2">{tr("In Time")}</th>
                      <th className="px-2 py-2">{tr("Out Time")}</th>
                      <th className="px-2 py-2">{tr("Remarks")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttendance.records.map((row) => (
                      <tr key={row._id}>
                        <td className="px-2 py-2">{row.dateKey}</td>
                        <td className="px-2 py-2"><StatusBadge status={row.status} /></td>
                        <td className="px-2 py-2">{row.inTime || "-"}</td>
                        <td className="px-2 py-2">{row.outTime || "-"}</td>
                        <td className="px-2 py-2">{row.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          {!loading && myAttendance?.success && !myAttendance?.records?.length ? (
            <EmptyBlock text="No Attendance records found for this month" />
          ) : null}
        </AttendancePanel>
      </div>
    );
  }

  const renderStatusSelect = (row, index) => (
    <SelectInput
      value={row.status}
      disabled={!canEnter || isSheetFinalized || Boolean(row.approvedLeave)}
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
        title="Staff Attendance"
        subtitle="HQ attendance is maintained separately for HQ Staff and Muavins. Niswan Admin manages only staff of the logged-in Niswan."
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {access.isSuperAdmin ? (
            <div>
              <FieldLabel>{tr("Staff Scope")}</FieldLabel>
              <SelectInput value={staffScopeType} onChange={(e) => setStaffScopeType(e.target.value)}>
                <option value="HQ">{tr("HQ")}</option>
                <option value="NISWAN">{tr("Niswan")}</option>
              </SelectInput>
            </div>
          ) : null}

          {access.isSuperAdmin && effectiveScopeType === "NISWAN" ? (
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

          {!access.isSuperAdmin ? (
            <div className="lg:col-span-2">
              <FieldLabel>{tr("Attendance Scope")}</FieldLabel>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 md:text-sm">
                {effectiveScopeType === "HQ"
                  ? `${meta.hqSchool?.code || "HQ"} : ${meta.hqSchool?.nameEnglish || tr("HQ")}`
                  : tr("Your Niswan")}
              </div>
            </div>
          ) : null}

          {effectiveScopeType === "HQ" && access.canManageHqStaff ? (
            <div>
              <FieldLabel>{tr("Staff Category")}</FieldLabel>
              <SelectInput value={hqStaffCategory} onChange={(e) => setHqStaffCategory(e.target.value)}>
                <option value="HQ_STAFF">{tr("HQ Staff")}</option>
                <option value="MUAVIN">{tr("Muavins")}</option>
              </SelectInput>
            </div>
          ) : null}

          <div>
            <FieldLabel>{tr("Date")}</FieldLabel>
            <Input type="date" value={dateKey} max={todayKey()} onChange={(e) => setDateKey(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton onClick={loadRoster} disabled={!canLoad || loading}>
            {loading ? tr("Loading...") : tr("Load Staff")}
          </PrimaryButton>
          <SecondaryButton onClick={markAllPresent} disabled={!canEnter || !rows.length || isSheetFinalized}>
            {tr("Mark All Present")}
          </SecondaryButton>
        </div>
      </AttendancePanel>

      {rows.length ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-7">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 md:text-xs">{tr(key)}</div>
              <div className="mt-0.5 text-lg font-bold text-blue-700">{value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <AttendancePanel title="Daily Staff Attendance Sheet">
        {loading ? <LoadingBlock /> : null}
        {!loading && loaded && !rows.length ? <EmptyBlock text="No active staff found in this Attendance scope" /> : null}
        {!loading && !loaded ? <EmptyBlock text="Select scope and load staff" /> : null}

        {rows.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px] text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-2 py-2">{tr("S.No")}</th>
                    <th className="px-2 py-2">{tr("Staff ID")}</th>
                    <th className="px-2 py-2">{tr("Name")}</th>
                    <th className="px-2 py-2">{tr("Role")}</th>
                    <th className="px-2 py-2">{tr("Status")}</th>
                    <th className="px-2 py-2">{tr("In Time")}</th>
                    <th className="px-2 py-2">{tr("Out Time")}</th>
                    <th className="px-2 py-2">{tr("Remarks")}</th>
                    <th className="px-2 py-2">{tr("Saved")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={`${row.staffType}:${row.staffId}`} className={row.approvedLeave ? "bg-violet-50/60" : "hover:bg-sky-50/40"}>
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2 font-medium text-blue-700">{row.staffCode || "-"}</td>
                      <td className="px-2 py-2">
                        <div className="font-medium text-slate-800">{row.name}</div>
                        {row.approvedLeave ? (
                          <div className="mt-1 text-[10px] text-violet-600">
                            {tr("Approved Leave")}: {row.approvedLeave.leaveType}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">{tr(row.role || "-")}</td>
                      <td className="px-2 py-2">{renderStatusSelect(row, index)}</td>
                      <td className="px-2 py-2">
                        <Input type="time" value={row.inTime || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "inTime", e.target.value)} />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="time" value={row.outTime || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "outTime", e.target.value)} />
                      </td>
                      <td className="px-2 py-2">
                        <Input value={row.remarks || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "remarks", e.target.value)} maxLength={500} />
                      </td>
                      <td className="px-2 py-2">
                        {row.attendance ? <StatusBadge status={row.attendance.isFinalized ? "Finalized" : "Draft"} /> : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 md:hidden">
              {rows.map((row, index) => (
                <div key={`${row.staffType}:${row.staffId}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{row.name}</div>
                      <div className="text-[10px] text-blue-700">
                        {row.staffCode || "-"} · {tr(row.role || "-")}
                      </div>
                    </div>
                    {row.attendance ? <StatusBadge status={row.attendance.isFinalized ? "Finalized" : "Draft"} /> : null}
                  </div>
                  {row.approvedLeave ? (
                    <div className="mb-2 rounded bg-violet-50 p-2 text-[10px] text-violet-700">
                      {tr("Approved Leave")}: {row.approvedLeave.leaveType}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">{renderStatusSelect(row, index)}</div>
                    <Input type="time" value={row.inTime || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "inTime", e.target.value)} />
                    <Input type="time" value={row.outTime || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "outTime", e.target.value)} />
                    <Input className="col-span-2" placeholder={tr("Remarks")} value={row.remarks || ""} disabled={!canEnter || isSheetFinalized} onChange={(e) => updateRow(index, "remarks", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            {isSheetFinalized ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {tr("Finalized attendance is locked and cannot be edited.")}
              </div>
            ) : canEnter ? (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <SecondaryButton onClick={() => saveAttendance(false)} disabled={saving}>
                  {saving ? tr("Saving...") : tr("Save Draft")}
                </SecondaryButton>
                {canFinalize ? (
                  <PrimaryButton onClick={() => saveAttendance(true)} disabled={saving}>
                    {saving ? tr("Saving...") : tr("Finalize")}
                  </PrimaryButton>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-800">
                {tr("View-only access. Attendance changes are disabled.")}
              </div>
            )}
          </>
        ) : null}
      </AttendancePanel>
    </div>
  );
};

export default StaffAttendanceTab;
