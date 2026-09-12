import React, { useEffect, useState } from "react";
import { attendanceGet } from "../../api/attendanceApi";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  AttendancePanel,
  FieldLabel,
  Input,
  SelectInput,
  StatCard,
  LoadingBlock,
  EmptyBlock,
  getApiError,
  todayKey
} from "./AttendanceCommon";

const AttendanceOverview = ({
  meta,
  selectedSchoolId,
  setSelectedSchoolId,
  staffScopeType,
  setStaffScopeType,
  dateKey,
  setDateKey,
}) => {
  const { tr } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const access = meta.access;

  const canChooseScope = access.isSuperAdmin;
  const needsSchool =
    access.isSuperAdmin &&
    (staffScopeType === "NISWAN" || access.canManageAnyStudents);

  useEffect(() => {
    if (access.isSuperAdmin && staffScopeType === "NISWAN" && !selectedSchoolId) {
      setData(null);
      return;
    }

    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await attendanceGet("overview", {
          date: dateKey,
          scopeType: staffScopeType,
          schoolId: selectedSchoolId,
        });
        if (alive) setData(response.data);
      } catch (error) {
        if (alive) setData({ success: false, error: getApiError(error) });
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [access.isSuperAdmin, dateKey, selectedSchoolId, staffScopeType]);

  const renderCounts = (title, section) => {
    if (!section?.counts) return null;
    const counts = section.counts;
    return (
      <AttendancePanel title={title}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Present" value={counts.Present} />
          <StatCard label="Absent" value={counts.Absent} />
          <StatCard label="Leave" value={counts.Leave} />
          <StatCard label="Late" value={counts.Late} />
          <StatCard label="Half Day" value={counts["Half Day"]} />
          <StatCard label="Not Marked" value={counts["Not Marked"]} />
          <StatCard label="Pending Approvals" value={data?.pendingStaffLeaveApprovals || 0} />
        </div>
      </AttendancePanel>
    );
  };

  return (
    <div className="space-y-4">
      <AttendancePanel title="Attendance Overview" subtitle="Daily status for the Attendance scope you are allowed to manage.">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <FieldLabel>{tr("Date")}</FieldLabel>
            <Input type="date" value={dateKey} max={todayKey()} onChange={(e) => setDateKey(e.target.value)} />
          </div>

          {canChooseScope ? (
            <div>
              <FieldLabel>{tr("Staff Scope")}</FieldLabel>
              <SelectInput value={staffScopeType} onChange={(e) => setStaffScopeType(e.target.value)}>
                <option value="NISWAN">{tr("Niswan")}</option>
                <option value="HQ">{tr("HQ")}</option>
              </SelectInput>
            </div>
          ) : null}

          {access.isSuperAdmin && needsSchool ? (
            <div className="md:col-span-2">
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

          {!access.isSuperAdmin && access.actorSchoolId ? (
            <div className="md:col-span-2">
              <FieldLabel>{tr("Niswan")}</FieldLabel>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 md:text-sm">
                {meta.hqSchool?._id === access.actorSchoolId
                  ? `${meta.hqSchool.code} : ${meta.hqSchool.nameEnglish}`
                  : tr("Your Niswan")}
              </div>
            </div>
          ) : null}
        </div>
      </AttendancePanel>

      {loading ? <LoadingBlock /> : null}
      {!loading && data?.error ? <EmptyBlock text={data.error} /> : null}
      {!loading && data?.student ? renderCounts("Student Attendance", data.student) : null}
      {!loading && data?.staff ? renderCounts("Staff Attendance", data.staff) : null}
      {!loading && !data?.student && !data?.staff && !data?.error ? (
        <EmptyBlock text="Select a scope to view Attendance overview" />
      ) : null}
    </div>
  );
};

export default AttendanceOverview;
