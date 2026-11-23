/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../auth/roles";
import { canUseReports } from "../../reports/reportCatalog";
import useReportFilters, { DEFAULT_EMPLOYEE_FILTERS, DEFAULT_SUPERVISOR_FILTERS } from "../../reports/useReportFilters";
import { fetchReport, downloadReport } from "../../api/reportApi";
import { formatCompactAge, formatCompactDuration as formatStudentDuration } from "../../utils/studentProfileUtils";
import { formatAge as formatEmployeeAge, formatWorkingExperience as formatEmployeeExperience } from "../../utils/employeeProfileUtils";
import { formatAge as formatSupervisorAge, formatWorkingExperience as formatSupervisorExperience } from "../../utils/supervisorProfileUtils";
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
};
const money = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const defaultPaging = { page: 1, limit: 50, total: 0, pages: 1 };

export default function DetailedReportsSection({ meta, entity = "students", studentQueryString = "", canExport = false, refresh = 0 }) {
  const { tr, direction, fontFamily } = useLanguage();
  const { user, can } = useAuth();
  const active = ["students", "employees", "supervisors"].includes(entity) ? entity : "";
  const allowed = Boolean(active) && canUseReports(user, can);
  const accessKey = `${user?._id || user?.id || ""}:${user?.role || ""}`;
  const [rows, setRows] = useState([]), [paging, setPaging] = useState(defaultPaging), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [canViewSensitive, setCanViewSensitive] = useState(false), [canViewFinancial, setCanViewFinancial] = useState(false);
  const [exportBusy, setExportBusy] = useState(false), [exportError, setExportError] = useState("");
  const exportRequest = useRef(null);
  const defaults = active === "supervisors" ? DEFAULT_SUPERVISOR_FILTERS : DEFAULT_EMPLOYEE_FILTERS;
  const [appliedFilters, applyFilters, resetFilters] = useReportFilters(user, `details:${active}`, defaults);
  const [draft, setDraft] = useState(appliedFilters);
  const [pagingScope, setPagingScope] = useState({ key: "", page: 1 });
  const schools = useMemo(() => Array.isArray(meta?.schools) ? meta.schools : [], [meta]);
  const queryString = useMemo(() => {
    if (active === "students") return studentQueryString;
    const qs = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => { if (value) qs.set(key, value); });
    return qs.toString();
  }, [active, studentQueryString, appliedFilters]);
  const queryKey = `${active}?${queryString}`;
  const page = pagingScope.key === queryKey ? pagingScope.page : 1;
  const buildPath = (format = "") => {
    const qs = new URLSearchParams(queryString);
    if (format) qs.set("format", format);
    else { qs.set("page", String(page)); qs.set("limit", "50"); }
    return `report/${active}${format ? "/export" : ""}?${qs}`;
  };
  useEffect(() => {
    if (!allowed) return;
    const abort = new AbortController();
    setRows([]); setPaging(defaultPaging); setLoading(true); setError(""); setCanViewSensitive(false); setCanViewFinancial(false);
    (async () => {
      try {
        const qs = new URLSearchParams(queryString); qs.set("page", String(page)); qs.set("limit", "50");
        const data = await fetchReport(`report/${active}?${qs}`, { signal: abort.signal });
        if (abort.signal.aborted) return;
        if (!Array.isArray(data.rows) || !data.pagination || !Number.isInteger(data.pagination.page) || !Number.isInteger(data.pagination.total) || data.pagination.total < 0 || data.pagination.page < 1 || !Number.isInteger(data.pagination.pages) || data.pagination.pages < 1) throw new Error("Invalid detailed report response");
        setRows(data.rows); setPaging(data.pagination); setCanViewSensitive(data.canViewSensitive === true && ["superadmin", "hqadmin", "accountant"].includes(normalizeRole(user?.role))); setCanViewFinancial(data.canViewFinancial !== false && normalizeRole(user?.role) !== "hquser");
      } catch (err) { if (!abort.signal.aborted) setError(err?.message || "Failed to load detailed report"); }
      finally { if (!abort.signal.aborted) setLoading(false); }
    })();
    return () => abort.abort();
  }, [allowed, active, accessKey, user?.role, queryString, page, refresh]);
  useEffect(() => {
    setExportBusy(false); setExportError("");
    return () => exportRequest.current?.abort();
  }, [queryString, accessKey]);
  const exportData = async (format) => {
    if (!allowed || !canExport || loading || exportBusy || error) return;
    const abort = new AbortController(); exportRequest.current = abort;
    setExportBusy(true); setExportError("");
    try { await downloadReport(buildPath(format), `${active}_report_${Date.now()}.${format}`, { signal: abort.signal }); }
    catch (err) { if (!abort.signal.aborted) setExportError(err?.message || "Failed to export report"); }
    finally { if (!abort.signal.aborted) setExportBusy(false); }
  };
  const reset = () => { setDraft({ ...defaults }); resetFilters(); };
  if (!allowed) return <p role="alert">{tr("Reports are not available for this role.")}</p>;
  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-lg md:p-5" dir={direction} style={{ fontFamily }}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="text-sm text-slate-600">{tr(active === "students" ? "Use Report Filters to select the student records. Exports include all matching pages." : "Apply filters to select records. Exports include all matching pages.")}</p>
      {canExport && <div className="flex flex-wrap gap-2"><button type="button" className="rounded border px-3 py-2 text-sm disabled:opacity-50" disabled={loading || exportBusy || !!error} onClick={() => exportData("csv")}>{tr("Export CSV")}</button><button type="button" className="rounded border px-3 py-2 text-sm disabled:opacity-50" disabled={loading || exportBusy || !!error} onClick={() => exportData("xlsx")}>{tr("Export XLSX")}</button></div>}
    </div>
    {active !== "students" && <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-5">
      {active === "employees" && <label className="text-sm"><span className="mb-1 block">{tr("Niswan")}</span><select className="w-full rounded border p-2" value={draft.schoolId} onChange={(event) => setDraft((value) => ({ ...value, schoolId: event.target.value }))}><option value="">{tr("All Niswans")}</option>{schools.map((school) => <option key={school._id} value={school._id}>{[school.code, school.nameEnglish].filter(Boolean).join(" - ")}</option>)}</select></label>}
      <label className="text-sm"><span className="mb-1 block">{tr("Search")}</span><input className="w-full rounded border p-2" value={draft.search} placeholder={tr(active === "employees" ? "Search name, email or employee ID" : "Search name, email or supervisor ID")} onChange={(event) => setDraft((value) => ({ ...value, search: event.target.value }))} /></label>
      <label className="text-sm"><span className="mb-1 block">{tr("Status")}</span><select className="w-full rounded border p-2" value={draft.status} onChange={(event) => setDraft((value) => ({ ...value, status: event.target.value }))}><option value="">{tr("All Statuses")}</option><option value="Active">{tr("Active")}</option><option value="In-Active">{tr("In-Active")}</option></select></label>
      {active === "supervisors" && <label className="text-sm"><span className="mb-1 block">{tr("Job Type")}</span><select className="w-full rounded border p-2" value={draft.jobType} onChange={(event) => setDraft((value) => ({ ...value, jobType: event.target.value }))}><option value="">{tr("All Job Types")}</option><option value="Full-Time">{tr("Full-Time")}</option><option value="Part-Time">{tr("Part-Time")}</option></select></label>}
      <button type="button" className="self-end rounded bg-blue-700 p-2 text-sm text-white" onClick={() => applyFilters(draft)}>{tr("Apply")}</button><button type="button" className="self-end rounded border p-2 text-sm" onClick={reset}>{tr("Reset Filters")}</button>
    </div>}
    {error && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{tr(error)}</p>}
    {exportError && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{tr(exportError)}</p>}
    <div className="mt-4">
      {loading ? <p role="status" className="p-8 text-center">{tr("Loading...")}</p> : error ? null : rows.length === 0 ? <p className="p-8 text-center text-slate-500">{tr("No data")}</p> : active === "students" ? <StudentsTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} canViewFinancial={canViewFinancial} /> : active === "employees" ? <EmployeesTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} /> : <SupervisorsTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} />}
    </div>
    {!error && <Pagination paging={paging} onPage={(next) => setPagingScope({ key: queryKey, page: next })} tr={tr} loading={loading} />}
  </section>;
}

function DateDuration({ date, duration }) {
  return <div className="leading-relaxed"><div>{formatDate(date)}</div><div className="text-[10px] text-slate-500">({duration})</div></div>;
}

function StudentsTable({ rows, tr, canViewSensitive, canViewFinancial }) {
  if (!canViewSensitive) {
    return (
      <div className="overflow-auto border rounded-lg" dir="ltr">
        <table className="min-w-[1450px] w-full text-xs">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <Th>{tr("Roll Number")}</Th><Th>{tr("Student Name")}</Th><Th>{tr("Niswan")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Admission Date")} / {tr("Admission Duration")}</Th><Th>{tr("Gender")}</Th><Th>{tr("Course")}</Th><Th>{tr("Status")}</Th><Th>{tr("Hostel")}</Th>{canViewFinancial ? <Th>{tr("Fees Status")}</Th> : null}
            </tr>
          </thead>
          <tbody>{rows.map((row) => (
            <tr key={row._id} className="border-t hover:bg-slate-50">
              <Td>{row.rollNumber}</Td><Td className="font-medium">{row.name}</Td><Td>{row.schoolCode}<br /><span className="text-slate-500">{row.schoolName}</span></Td>
              <Td><DateDuration date={row.dob} duration={formatCompactAge(row.dob, tr)} /></Td>
              <Td><DateDuration date={row.admissionDate} duration={formatStudentDuration(row.admissionDate, tr)} /></Td>
              <Td>{tr(row.gender)}</Td><Td>{row.courses}</Td><Td>{tr(row.status)}</Td><Td>{tr(row.hostel)}</Td>{canViewFinancial ? <Td>{tr(row.feesStatus)}</Td> : null}
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-auto border rounded-lg" dir="ltr">
      <table className="min-w-[3150px] w-full text-xs">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <Th>{tr("Roll Number")}</Th>
            <Th>{tr("Student Name")}</Th>
            <Th>{tr("Niswan")}</Th>
            <Th>{tr("Date of Birth")} / {tr("Age")}</Th>
            <Th>{tr("Admission Date")} / {tr("Admission Duration")}</Th>
            <Th>{tr("Personal Details")}</Th>
            <Th>{tr("Family / Guardian")}</Th>
            <Th>{tr("Course")}</Th>
            <Th>{tr("Address Details")}</Th>
            <Th>{tr(canViewFinancial ? "Hostel / Fees" : "Hostel")}</Th>
            <Th>{tr("Status")} / {tr("Remarks")}</Th>
          </tr>
        </thead>
        <tbody>{rows.map((row) => (
          <tr key={row._id} className="border-t hover:bg-slate-50">
            <Td>
              <div className="font-semibold">{row.rollNumber}</div>
              {row.oldRollNumber && row.oldRollNumber !== "-" ? <div className="mt-1 text-[10px] text-slate-500">{tr("Old Roll Number")}: {row.oldRollNumber}</div> : null}
            </Td>
            <Td className="font-medium">
              <div>{row.name}</div>
              {row.email && row.email !== "-" ? <div className="mt-1 text-[10px] font-normal text-slate-500 break-all">{row.email}</div> : null}
            </Td>
            <Td>{row.schoolCode}<br /><span className="text-slate-500">{row.schoolName}</span></Td>
            <Td><DateDuration date={row.dob} duration={formatCompactAge(row.dob, tr)} /></Td>
            <Td><DateDuration date={row.admissionDate} duration={formatStudentDuration(row.admissionDate, tr)} /></Td>
            <Td className="min-w-[230px]">
              <ReportLine label={tr("Gender")} value={tr(row.gender)} />
              <ReportLine label={tr("Marital Status")} value={tr(row.maritalStatus)} />
              <ReportLine label={tr("Mother Tongue")} value={row.motherTongue} />
              <ReportLine label={tr("Blood Group")} value={row.bloodGroup} />
              <ReportLine label={tr("Identification Mark-1")} value={row.identificationMark1} />
              <ReportLine label={tr("Identification Mark-2")} value={row.identificationMark2} />
              <ReportLine label={tr("More details about the Student")} value={row.about} multiline />
            </Td>
            <Td className="min-w-[290px]">
              <ReportLine label={tr("Father's Name")} value={row.fatherName} />
              <ReportLine label={tr("Father's Number")} value={row.fatherNumber} />
              <ReportLine label={tr("Father's Occupation")} value={row.fatherOccupation} />
              <div className="my-1.5 border-t border-slate-100" />
              <ReportLine label={tr("Mother's Name")} value={row.motherName} />
              <ReportLine label={tr("Mother's Number")} value={row.motherNumber} />
              <ReportLine label={tr("Mother's Occupation")} value={row.motherOccupation} />
              <div className="my-1.5 border-t border-slate-100" />
              <ReportLine label={tr("Guardian's Name")} value={row.guardianName} />
              <ReportLine label={tr("Guardian's Number")} value={row.guardianNumber} />
              <ReportLine label={tr("Guardian's Occupation")} value={row.guardianOccupation} />
              <ReportLine label={tr("Guardian's Relationship")} value={row.guardianRelation} />
            </Td>
            <Td className="min-w-[150px] whitespace-pre-wrap">{row.courses}</Td>
            <Td className="min-w-[260px]">
              <ReportLine label={tr("Address")} value={row.address} multiline />
              <ReportLine label={tr("Area & Town / City")} value={row.city} />
              <ReportLine label={tr("Landmark")} value={row.landmark} />
              <ReportLine label={tr("Pincode")} value={row.pincode} />
              <ReportLine label={tr("State & District")} value={[row.district, row.state].filter((v) => v && v !== "-").join(", ") || "-"} />
            </Td>
            <Td className="min-w-[230px]">
              <ReportLine label={tr("Hostel Admission")} value={tr(row.hostel)} />
              <ReportLine label={tr("Hostel Reference")} value={row.hostelRefNumber} />
              {canViewFinancial ? (
                <>
                  <ReportLine label={tr("Hostel Monthly Fees")} value={money(row.hostelFees)} />
                  <ReportLine label={tr("Discount")} value={money(row.hostelDiscount)} />
                  <ReportLine label={tr("Final Fees")} value={money(row.hostelFinalFees)} />
                  <ReportLine label={tr("Fees Status")} value={tr(row.feesStatus)} />
                </>
              ) : null}
            </Td>
            <Td className="min-w-[190px]">
              <ReportLine label={tr("Status")} value={tr(row.status)} />
              <ReportLine label={tr("Remarks")} value={row.remarks} multiline />
            </Td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function ReportLine({ label, value, multiline = false }) {
  const normalized = value === undefined || value === null || value === "" ? "-" : String(value);
  return (
    <div className={`mb-1 last:mb-0 ${multiline ? "whitespace-pre-wrap" : ""}`}>
      <span className="font-medium text-blue-700">{label}:</span>{" "}
      <span className="text-slate-700">{normalized}</span>
    </div>
  );
}

function EmployeesTable({ rows, tr, canViewSensitive }) {
  return (
    <div className="overflow-auto border rounded-lg" dir="ltr">
      <table className="min-w-[2050px] w-full text-xs">
        <thead className="bg-slate-50 text-slate-700"><tr>
          <Th>{tr("Employee ID")}</Th><Th>{tr("Name")}</Th><Th>{tr("Role")}</Th><Th>{tr("Niswan")}</Th><Th>{tr("Father / Guardian Name")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Date of Joining")} / {tr("Working Experience")}</Th><Th>{tr("Other Designation")}</Th>{canViewSensitive ? <><Th>{tr("Hadhiya")}</Th></> : null}<Th>{tr("Activities carried out")}</Th>{canViewSensitive ? <Th>{tr("Bank account details")}</Th> : null}<Th>{tr("Status")}</Th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row._id} className="border-t hover:bg-slate-50">
          <Td>{row.employeeId}</Td><Td className="font-medium">{row.name}<br /><span className="text-slate-500">{row.email}</span></Td><Td>{tr(row.role)}</Td><Td>{row.schoolCode}<br /><span className="text-slate-500">{row.schoolName}</span></Td><Td>{row.fatherGuardianName}</Td>
          <Td><DateDuration date={row.dob} duration={formatEmployeeAge(row.dob, tr)} /></Td><Td><DateDuration date={row.doj} duration={formatEmployeeExperience(row.doj, tr)} /></Td><Td className="max-w-[180px] whitespace-pre-wrap">{row.otherDesignation}</Td>{canViewSensitive ? <><Td>{money(row.hadhiya)}</Td></> : null}<Td className="max-w-[220px] whitespace-pre-wrap">{row.activitiesCarriedOut}</Td>{canViewSensitive ? <Td className="max-w-[220px] whitespace-pre-wrap">{row.bankAccountDetails}</Td> : null}<Td>{tr(row.status)}</Td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function SupervisorsTable({ rows, tr, canViewSensitive }) {
  return (
    <div className="overflow-auto border rounded-lg" dir="ltr">
      <table className="min-w-[2200px] w-full text-xs">
        <thead className="bg-slate-50 text-slate-700"><tr>
          <Th>{tr("Supervisor ID")}</Th><Th>{tr("Name")}</Th><Th>{tr("Father / Guardian Name")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Date of Joining")} / {tr("Working Experience")}</Th><Th>{tr("Job Type")}</Th><Th>{tr("Route")}</Th><Th>{tr("Other Designation")}</Th>{canViewSensitive ? <><Th>{tr("Hadhiya")}</Th></> : null}<Th>{tr("Activities carried out")}</Th>{canViewSensitive ? <Th>{tr("Bank account details")}</Th> : null}<Th>{tr("Niswans")}</Th><Th>{tr("Employees")}</Th><Th>{tr("Students")}</Th><Th>{tr("Status")}</Th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row._id} className="border-t hover:bg-slate-50">
          <Td>{row.supervisorId}</Td><Td className="font-medium">{row.name}<br /><span className="text-slate-500">{row.email}</span></Td><Td>{row.fatherGuardianName}</Td><Td><DateDuration date={row.dob} duration={formatSupervisorAge(row.dob, tr)} /></Td><Td><DateDuration date={row.doj} duration={formatSupervisorExperience(row.doj, tr)} /></Td><Td>{tr(row.jobType)}</Td><Td>{row.routeName}</Td><Td className="max-w-[180px] whitespace-pre-wrap">{row.otherDesignation}</Td>{canViewSensitive ? <><Td>{money(row.hadhiya)}</Td></> : null}<Td className="max-w-[220px] whitespace-pre-wrap">{row.activitiesCarriedOut}</Td>{canViewSensitive ? <Td className="max-w-[220px] whitespace-pre-wrap">{row.bankAccountDetails}</Td> : null}<Td>{row.niswansCount}</Td><Td>{row.employeesCount}</Td><Td>{row.studentsCount}</Td><Td>{tr(row.status)}</Td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function Pagination({ paging, onPage, tr, loading }) {
  const page = Number(paging?.page || 1);
  const pages = Number(paging?.pages || 1);
  const total = Number(paging?.total || 0);
  return (
    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap text-xs text-slate-600">
      <div>{tr("Total Records")}: <span className="font-semibold text-slate-800">{total.toLocaleString()}</span></div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={loading || page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">{tr("Previous")}</button>
        <span>{tr("Page")} {page} / {pages}</span>
        <button type="button" disabled={loading || page >= pages} onClick={() => onPage(page + 1)} className="px-3 py-1.5 rounded border disabled:opacity-40">{tr("Next")}</button>
      </div>
    </div>
  );
}

function Th({ children }) { return <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">{children}</th>; }
function Td({ children, className = "" }) { return <td className={`px-3 py-3 align-top ${className}`}>{children}</td>; }
