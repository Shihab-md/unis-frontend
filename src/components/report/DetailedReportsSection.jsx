import React, { useEffect, useMemo, useState } from "react";
import { getBaseUrl } from "../../utils/CommonHelper.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { formatCompactAge, formatCompactDuration as formatStudentDuration } from "../../utils/studentProfileUtils.js";
import { formatAge as formatEmployeeAge, formatWorkingExperience as formatEmployeeExperience } from "../../utils/employeeProfileUtils.js";
import { formatAge as formatSupervisorAge, formatWorkingExperience as formatSupervisorExperience } from "../../utils/supervisorProfileUtils.js";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

async function apiGet(path) {
  const base = await getBaseUrl();
  const response = await fetch(`${base}${path}`, { headers: authHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}

async function downloadReport(path, filename) {
  const base = await getBaseUrl();
  const response = await fetch(`${base}${path}`, { headers: authHeaders() });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
};

const money = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const defaultPaging = { page: 1, limit: 50, total: 0, pages: 1 };

export default function DetailedReportsSection({ meta, studentQueryString = "" }) {
  const { tr, direction, fontFamily } = useLanguage();
  const [active, setActive] = useState("students");
  const [rows, setRows] = useState([]);
  const [paging, setPaging] = useState(defaultPaging);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canViewSensitive, setCanViewSensitive] = useState(false);
  const [employeeFilters, setEmployeeFilters] = useState({ schoolId: "", search: "", status: "" });
  const [employeeAppliedFilters, setEmployeeAppliedFilters] = useState({ schoolId: "", search: "", status: "" });
  const [supervisorFilters, setSupervisorFilters] = useState({ search: "", status: "", jobType: "" });
  const [supervisorAppliedFilters, setSupervisorAppliedFilters] = useState({ search: "", status: "", jobType: "" });

  const schools = useMemo(() => (Array.isArray(meta?.schools) ? meta.schools : []), [meta]);

  const buildPath = (page = 1, exportFormat = "") => {
    const qs = new URLSearchParams();
    if (active === "students") {
      const baseQs = new URLSearchParams(studentQueryString || "");
      baseQs.forEach((value, key) => qs.set(key, value));
    } else if (active === "employees") {
      if (employeeAppliedFilters.schoolId) qs.set("schoolId", employeeAppliedFilters.schoolId);
      if (employeeAppliedFilters.search) qs.set("search", employeeAppliedFilters.search);
      if (employeeAppliedFilters.status) qs.set("status", employeeAppliedFilters.status);
    } else {
      if (supervisorAppliedFilters.search) qs.set("search", supervisorAppliedFilters.search);
      if (supervisorAppliedFilters.status) qs.set("status", supervisorAppliedFilters.status);
      if (supervisorAppliedFilters.jobType) qs.set("jobType", supervisorAppliedFilters.jobType);
    }

    if (exportFormat) qs.set("format", exportFormat);
    else {
      qs.set("page", String(page));
      qs.set("limit", "50");
    }
    return `report/${active}${exportFormat ? "/export" : ""}?${qs.toString()}`;
  };

  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(buildPath(page));
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setPaging(data?.pagination || defaultPaging);
      setCanViewSensitive(Boolean(data?.canViewSensitive));
    } catch (err) {
      setRows([]);
      setPaging(defaultPaging);
      setError(err?.message || tr("Failed to load detailed report"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, studentQueryString, employeeAppliedFilters, supervisorAppliedFilters]);

  const applyEntityFilters = () => {
    if (active === "employees") setEmployeeAppliedFilters({ ...employeeFilters });
    if (active === "supervisors") setSupervisorAppliedFilters({ ...supervisorFilters });
  };

  const exportData = async (format) => {
    try {
      await downloadReport(buildPath(1, format), `${active}_report_${Date.now()}.${format}`);
    } catch (err) {
      setError(err?.message || tr("Failed to export report"));
    }
  };

  const tabs = [
    ["students", tr("Students")],
    ["employees", tr("Employees")],
    ["supervisors", tr("Supervisors")],
  ];

  return (
    <section className="mt-6 rounded-xl bg-white border border-slate-200 shadow-xl p-4 md:p-5" dir={direction} style={{ fontFamily }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">{tr("Detailed Reports")}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{tr("Current Student, Employee and Supervisor data with the latest profile fields.")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-xs sm:text-sm" onClick={() => exportData("csv")}>{tr("Export CSV")}</button>
          <button type="button" className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-xs sm:text-sm" onClick={() => exportData("xlsx")}>{tr("Export XLSX")}</button>
        </div>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActive(key); setRows([]); setPaging(defaultPaging); setError(""); }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap border ${active === key ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "students" ? (
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
          {tr("Student detailed report uses the main Report Filters above.")}
        </div>
      ) : active === "employees" ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <select className="border rounded-lg px-2 py-2 text-sm" value={employeeFilters.schoolId} onChange={(e) => setEmployeeFilters((prev) => ({ ...prev, schoolId: e.target.value }))}>
            <option value="">{tr("All Niswans")}</option>
            {schools.map((school) => <option key={school._id} value={school._id}>{school.code ? `${school.code} - ` : ""}{school.nameEnglish || ""}</option>)}
          </select>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder={tr("Search name, email or employee ID")} value={employeeFilters.search} onChange={(e) => setEmployeeFilters((prev) => ({ ...prev, search: e.target.value }))} />
          <select className="border rounded-lg px-2 py-2 text-sm" value={employeeFilters.status} onChange={(e) => setEmployeeFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="">{tr("All Statuses")}</option>
            <option value="Active">{tr("Active")}</option>
            <option value="In-Active">{tr("In-Active")}</option>
          </select>
          <button type="button" className="rounded-lg bg-blue-700 text-white px-3 py-2 text-sm hover:bg-blue-800" onClick={applyEntityFilters}>{tr("Apply")}</button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder={tr("Search name, email or supervisor ID")} value={supervisorFilters.search} onChange={(e) => setSupervisorFilters((prev) => ({ ...prev, search: e.target.value }))} />
          <select className="border rounded-lg px-2 py-2 text-sm" value={supervisorFilters.status} onChange={(e) => setSupervisorFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="">{tr("All Statuses")}</option>
            <option value="Active">{tr("Active")}</option>
            <option value="In-Active">{tr("In-Active")}</option>
          </select>
          <select className="border rounded-lg px-2 py-2 text-sm" value={supervisorFilters.jobType} onChange={(e) => setSupervisorFilters((prev) => ({ ...prev, jobType: e.target.value }))}>
            <option value="">{tr("All Job Types")}</option>
            <option value="Full-Time">{tr("Full-Time")}</option>
            <option value="Part-Time">{tr("Part-Time")}</option>
          </select>
          <button type="button" className="rounded-lg bg-blue-700 text-white px-3 py-2 text-sm hover:bg-blue-800" onClick={applyEntityFilters}>{tr("Apply")}</button>
        </div>
      )}

      {error ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div> : null}

      <div className="mt-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500 text-sm">{tr("Loading...")}</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">{tr("No data")}</div>
        ) : active === "students" ? (
          <StudentsTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} />
        ) : active === "employees" ? (
          <EmployeesTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} />
        ) : (
          <SupervisorsTable rows={rows} tr={tr} canViewSensitive={canViewSensitive} />
        )}
      </div>

      <Pagination paging={paging} onPage={load} tr={tr} loading={loading} />
    </section>
  );
}

function DateDuration({ date, duration }) {
  return <div className="leading-relaxed"><div>{formatDate(date)}</div><div className="text-[10px] text-slate-500">({duration})</div></div>;
}

function StudentsTable({ rows, tr, canViewSensitive }) {
  if (!canViewSensitive) {
    return (
      <div className="overflow-auto border rounded-lg" dir="ltr">
        <table className="min-w-[1450px] w-full text-xs">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <Th>{tr("Roll Number")}</Th><Th>{tr("Student Name")}</Th><Th>{tr("Niswan")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Admission Date")} / {tr("Admission Duration")}</Th><Th>{tr("Gender")}</Th><Th>{tr("Course")}</Th><Th>{tr("Status")}</Th><Th>{tr("Hostel")}</Th><Th>{tr("Fees Status")}</Th>
            </tr>
          </thead>
          <tbody>{rows.map((row) => (
            <tr key={row._id} className="border-t hover:bg-slate-50">
              <Td>{row.rollNumber}</Td><Td className="font-medium">{row.name}</Td><Td>{row.schoolCode}<br /><span className="text-slate-500">{row.schoolName}</span></Td>
              <Td><DateDuration date={row.dob} duration={formatCompactAge(row.dob, tr)} /></Td>
              <Td><DateDuration date={row.admissionDate} duration={formatStudentDuration(row.admissionDate, tr)} /></Td>
              <Td>{tr(row.gender)}</Td><Td>{row.courses}</Td><Td>{tr(row.status)}</Td><Td>{tr(row.hostel)}</Td><Td>{tr(row.feesStatus)}</Td>
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
            <Th>{tr("Hostel / Fees")}</Th>
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
              <ReportLine label={tr("Hostel Monthly Fees")} value={money(row.hostelFees)} />
              <ReportLine label={tr("Discount")} value={money(row.hostelDiscount)} />
              <ReportLine label={tr("Final Fees")} value={money(row.hostelFinalFees)} />
              <ReportLine label={tr("Fees Status")} value={tr(row.feesStatus)} />
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
          <Th>{tr("Employee ID")}</Th><Th>{tr("Name")}</Th><Th>{tr("Role")}</Th><Th>{tr("Niswan")}</Th><Th>{tr("Father / Guardian Name")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Date of Joining")} / {tr("Working Experience")}</Th><Th>{tr("Other Designation")}</Th>{canViewSensitive ? <><Th>{tr("Hadhiya")}</Th><Th>{tr("Travelling Allowance")}</Th></> : null}<Th>{tr("Activities carried out")}</Th>{canViewSensitive ? <Th>{tr("Bank account details")}</Th> : null}<Th>{tr("Status")}</Th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row._id} className="border-t hover:bg-slate-50">
          <Td>{row.employeeId}</Td><Td className="font-medium">{row.name}<br /><span className="text-slate-500">{row.email}</span></Td><Td>{tr(row.role)}</Td><Td>{row.schoolCode}<br /><span className="text-slate-500">{row.schoolName}</span></Td><Td>{row.fatherGuardianName}</Td>
          <Td><DateDuration date={row.dob} duration={formatEmployeeAge(row.dob, tr)} /></Td><Td><DateDuration date={row.doj} duration={formatEmployeeExperience(row.doj, tr)} /></Td><Td className="max-w-[180px] whitespace-pre-wrap">{row.otherDesignation}</Td>{canViewSensitive ? <><Td>{money(row.hadhiya)}</Td><Td>{money(row.travellingAllowance)}</Td></> : null}<Td className="max-w-[220px] whitespace-pre-wrap">{row.activitiesCarriedOut}</Td>{canViewSensitive ? <Td className="max-w-[220px] whitespace-pre-wrap">{row.bankAccountDetails}</Td> : null}<Td>{tr(row.status)}</Td>
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
          <Th>{tr("Supervisor ID")}</Th><Th>{tr("Name")}</Th><Th>{tr("Father / Guardian Name")}</Th><Th>{tr("Date of Birth")} / {tr("Age")}</Th><Th>{tr("Date of Joining")} / {tr("Working Experience")}</Th><Th>{tr("Job Type")}</Th><Th>{tr("Route")}</Th><Th>{tr("Other Designation")}</Th>{canViewSensitive ? <><Th>{tr("Hadhiya")}</Th><Th>{tr("Travelling Allowance")}</Th></> : null}<Th>{tr("Activities carried out")}</Th>{canViewSensitive ? <Th>{tr("Bank account details")}</Th> : null}<Th>{tr("Niswans")}</Th><Th>{tr("Employees")}</Th><Th>{tr("Students")}</Th><Th>{tr("Status")}</Th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row._id} className="border-t hover:bg-slate-50">
          <Td>{row.supervisorId}</Td><Td className="font-medium">{row.name}<br /><span className="text-slate-500">{row.email}</span></Td><Td>{row.fatherGuardianName}</Td><Td><DateDuration date={row.dob} duration={formatSupervisorAge(row.dob, tr)} /></Td><Td><DateDuration date={row.doj} duration={formatSupervisorExperience(row.doj, tr)} /></Td><Td>{tr(row.jobType)}</Td><Td>{row.routeName}</Td><Td className="max-w-[180px] whitespace-pre-wrap">{row.otherDesignation}</Td>{canViewSensitive ? <><Td>{money(row.hadhiya)}</Td><Td>{money(row.travellingAllowance)}</Td></> : null}<Td className="max-w-[220px] whitespace-pre-wrap">{row.activitiesCarriedOut}</Td>{canViewSensitive ? <Td className="max-w-[220px] whitespace-pre-wrap">{row.bankAccountDetails}</Td> : null}<Td>{row.niswansCount}</Td><Td>{row.employeesCount}</Td><Td>{row.studentsCount}</Td><Td>{tr(row.status)}</Td>
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
