import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { PERMISSIONS } from "../../auth/permissions";
import { normalizeRole } from "../../auth/roles";
import { fetchStudentYearEndReport, fetchStudentYearEndStudents, downloadStudentYearEndReport, studentYearEndError } from "../../api/studentYearEndReportApi";
import { translateStudentYearEnd, yearEndStatusText, YEAR_END_REASON_TEXT } from "../../i18n/studentYearEndReportText";

const initialFilters = { supervisorId: "", schoolId: "", courseId: "", status: "" };
const statuses = ["DONE", "PENDING", "NEEDS_REVIEW", "NO_STUDENTS"];
const decisions = ["UNRESOLVED", "PROMOTED", "NOT_PROMOTED", "COMPLETED", "PENDING", "NEEDS_REVIEW"];
const numberText = (value) => Number(value || 0).toLocaleString("en-IN");
const badgeStyle = (status) => status === "DONE" || status === "COMPLETED" || status === "PROMOTED"
  ? "bg-emerald-100 text-emerald-900" : status === "NEEDS_REVIEW" ? "bg-rose-100 text-rose-900" : "bg-amber-100 text-amber-900";

export default function StudentYearEndReport() {
  const { user, can } = useAuth();
  const { language, tr, direction, fontFamily } = useLanguage();
  const t = (value) => translateStudentYearEnd(value, language, tr);
  const allowed = ["superadmin", "hqadmin"].includes(normalizeRole(user?.role)) && can(PERMISSIONS.REPORTS_VIEW);
  const canExport = allowed && can(PERMISSIONS.REPORTS_EXPORT);
  const [filters, setFilters] = useState(initialFilters);
  const [report, setReport] = useState(null);
  const [meta, setMeta] = useState({ schools: [], courses: [], supervisors: [] });
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [details, setDetails] = useState(null), [detailBusy, setDetailBusy] = useState(false), [detailError, setDetailError] = useState("");
  const [detailSchool, setDetailSchool] = useState(""), [decision, setDecision] = useState(""), [page, setPage] = useState(1);
  const [exportBusy, setExportBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const reportRequest = React.useRef(0), detailRequest = React.useRef(0);

  useEffect(() => {
    if (!allowed) return;
    const request = ++reportRequest.current, abort = new AbortController();
    detailRequest.current++;
    setReport(null); setDetails(null); setDetailSchool(""); setDetailBusy(false); setError(""); setBusy(true);
    (async () => {
      try {
        const result = await fetchStudentYearEndReport(filters, { signal: abort.signal });
        if (abort.signal.aborted || request !== reportRequest.current) return;
        if (result?.version !== 1 || !result?.academicYear?._id || !Array.isArray(result.rows)) throw new Error("Invalid report response");
        setReport(result); setMeta(result.meta);
      } catch (err) {
        if (abort.signal.aborted || request !== reportRequest.current) return;
        const message = await studentYearEndError(err, "Unable to load the student year-end report.");
        if (!abort.signal.aborted && request === reportRequest.current) setError(message);
      } finally { if (!abort.signal.aborted && request === reportRequest.current) setBusy(false); }
    })();
    return () => abort.abort();
  }, [allowed, filters, refresh]);

  useEffect(() => {
    if (!allowed || !report || !detailSchool) return;
    const request = ++detailRequest.current, abort = new AbortController();
    setDetails(null); setDetailError(""); setDetailBusy(true);
    (async () => {
      try {
        const result = await fetchStudentYearEndStudents({ ...filters, schoolId: detailSchool, decision, page: String(page), limit: "50" },
          { signal: abort.signal, expectedYear: report.academicYear._id });
        if (abort.signal.aborted || request !== detailRequest.current) return;
        if (!result?.success || result?.academicYear?._id !== report.academicYear._id) throw new Error("Academic year changed");
        setDetails(result);
      } catch (err) {
        if (abort.signal.aborted || request !== detailRequest.current) return;
        const message = await studentYearEndError(err, "Unable to load student decisions. Please refresh the report.");
        if (!abort.signal.aborted && request === detailRequest.current) setDetailError(message);
      } finally { if (!abort.signal.aborted && request === detailRequest.current) setDetailBusy(false); }
    })();
    return () => abort.abort();
  }, [allowed, report, detailSchool, decision, page, filters]);

  const openDetails = (schoolId, nextDecision = "") => { setDetailSchool(schoolId); setDecision(nextDecision); setPage(1); };
  const updateFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));
  const exportReport = async (detailOnly = false) => {
    if (!canExport || !report) return;
    setExportBusy(true); setError("");
    try { await downloadStudentYearEndReport({ ...filters, ...(detailOnly && detailSchool ? { schoolId: detailSchool, decision } : {}) }, report.academicYear._id); }
    catch (err) { setError(await studentYearEndError(err, "Unable to export the report.")); }
    finally { setExportBusy(false); }
  };
  const statusBadge = (value) => <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${badgeStyle(value)}`}>{t(yearEndStatusText[value] || value)}</span>;
  const countButton = (value, schoolId, nextDecision = "") => <button type="button" className="font-semibold text-sky-800 underline disabled:text-slate-500 disabled:no-underline"
    disabled={!value} onClick={() => openDetails(schoolId, nextDecision)}>{numberText(value)}</button>;
  const select = (key, label, options) => <label className="block text-sm"><span className="mb-1 block font-medium">{t(label)}</span>
    <select aria-label={label} className="w-full rounded border border-slate-300 bg-white p-2" value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
      <option value="">{t("All")}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select></label>;

  if (!allowed) return <div className="p-6" dir={direction} style={{ fontFamily }}><p role="alert">{t("This report is available only to Superadmin and HQAdmin with report access.")}</p></div>;
  const global = report?.globalSummary;
  const selectedSchool = report?.rows?.find((row) => row.schoolId === detailSchool);
  return <section className="year-end-print-root min-h-screen bg-slate-50 p-3 md:p-6 text-slate-800" dir={direction} style={{ fontFamily }}>
    <style>{`@media print { body * { visibility: hidden; } .year-end-print-root, .year-end-print-root * { visibility: visible; } .year-end-print-root { position: absolute; inset: 0; width: 100%; padding: 0; background: white; } .year-end-no-print { display: none !important; } .year-end-table-wrap { overflow: visible !important; } .year-end-print-root table { font-size: 9px; width: 100%; border-collapse: collapse; } .year-end-print-root th, .year-end-print-root td { border: 1px solid #aaa; padding: 4px; } .year-end-print-root thead { display: table-header-group; } .year-end-print-root tr { break-inside: avoid; } }`}</style>
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-gradient-to-r from-sky-800 to-teal-700 p-5 text-white shadow">
      <div><Link className="year-end-no-print text-sm underline" to="/dashboard/reports">{t("Back to Reports")}</Link>
        <h1 className="mt-2 text-xl font-bold md:text-2xl">{t("Student Promotion & Year-End Status")}</h1>
        <p className="mt-2 text-sm">{t("Current Academic Year")}: <strong>{report?.academicYear?.label || "-"}</strong>
          {" | "}{t("Next Academic Year")}: <strong>{report?.nextAcademicYear?.label || "-"}</strong></p>
      </div>
      <div className="year-end-no-print flex flex-wrap gap-2">
        <button type="button" className="rounded border border-white/50 px-3 py-2 text-sm disabled:opacity-50" disabled={busy} onClick={() => setRefresh((value) => value + 1)}>{t("Refresh Report")}</button>
        {canExport && <><button type="button" className="rounded bg-white px-3 py-2 text-sm font-semibold text-sky-900 disabled:opacity-50" disabled={!report || busy || exportBusy} onClick={() => exportReport()}>{exportBusy ? t("Loading...") : t("Export Excel")}</button>
          <button type="button" className="rounded border border-white/50 px-3 py-2 text-sm disabled:opacity-50" disabled={!report || busy || detailBusy} onClick={() => window.print()}>{t("Print")}</button></>}
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-600">{t("Read-only report. Academic-year changes and promotion actions are managed separately.")}</p>
    {error && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{t(error)}</p>}
    <div className="year-end-no-print mt-4 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
      {select("supervisorId", "Supervisor", (meta.supervisors || []).map((item) => ({ value: item._id, label: [item.code, item.name].filter(Boolean).join(" : ") })))}
      {select("schoolId", "Niswan", (meta.schools || []).map((item) => ({ value: item._id, label: `${item.code} : ${item.name}` })))}
      {select("courseId", "Course", (meta.courses || []).map((item) => ({ value: item._id, label: item.name })))}
      {select("status", "Status", statuses.map((status) => ({ value: status, label: t(yearEndStatusText[status]) })))}
      <button type="button" className="self-end rounded border p-2 font-semibold" onClick={() => { setFilters({ ...initialFilters }); setRefresh((value) => value + 1); }}>{t("Reset Filters")}</button>
    </div>
    {busy && <p role="status" className="p-6 text-center">{t("Loading...")}</p>}
    {report && <>
      <div className={`mt-4 rounded-xl border p-4 ${global.ready ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
        <p className="text-xs font-bold uppercase tracking-wide">{t("All Niswans / All Courses")}</p>
        <p className="mt-1 font-bold">{t(global.ready ? "Year-end decisions are complete." : "Year-end decisions still need attention.")}</p>
        <p className="mt-1 text-sm">{t("Filters do not change this overall readiness result.")}</p>
        {report.warnings.includes("NEXT_YEAR_MISSING") && <p className="mt-2 text-sm">{t("The next academic year is not configured.")}</p>}
        {!!global.unassignedStudentCount && <p className="mt-2 text-sm">{t("Students with missing Niswan or student records")}: <strong>{numberText(global.unassignedStudentCount)}</strong></p>}
      </div>
      {!!report.unassignedRecords?.length && <details className="mt-3 rounded border border-rose-200 bg-rose-50 p-3">
        <summary className="cursor-pointer font-semibold">{t("Records To Review")}: {numberText(report.unassignedRecords.length)}</summary>
        <p className="mt-1 text-xs">{t("These records affect overall readiness, regardless of the selected filters.")}</p>
        <div className="year-end-table-wrap mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Student ID", "Student Name", "Niswan Reference", "Reason"].map((label) => <th key={label} className="p-2">{t(label)}</th>)}</tr></thead>
          <tbody>{report.unassignedRecords.slice(0, 50).map((record) => <tr key={record.studentId} className="border-t"><td className="p-2">{record.studentId}</td><td className="p-2">{record.studentName || "-"}</td><td className="p-2">{record.schoolId || "-"}</td><td className="p-2">{t(YEAR_END_REASON_TEXT[record.reasonCode])}</td></tr>)}</tbody></table></div>
        <p className="text-xs">{t("Showing up to 50 records. Excel export includes all records to review.")}</p>
      </details>}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-6">{[
        ["Total Niswans", global.totalNiswans], ["Niswans Done", global.doneNiswans], ["Niswans Pending", global.pendingNiswans],
        ["Niswans Needing Review", global.needsReviewNiswans], ["Pending Students", global.pendingStudents], ["Final-Year Decisions Pending", global.finalYearPending],
      ].map(([label, value]) => <div key={label} className="rounded-lg border bg-white p-3 shadow-sm"><p className="text-xs text-slate-600">{t(label)}</p><strong className="mt-1 block text-xl">{numberText(value)}</strong></div>)}</div>
      <div className="mt-4 rounded-xl border bg-white p-4">
        <h2 className="font-bold">{t("Niswan Summary")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("Filtered results")}: {numberText(report.summary.totalNiswans)} {t("Niswans")} | {numberText(report.summary.totalStudents)} {t("Students")} | {t("Pending Students")}: {numberText(report.summary.pendingStudents)}</p>
        <p className="mt-1 text-xs text-slate-500">{t("Student counts are unique. Needs Review students are included in Pending Students. Final-year counts refer to course decisions.")}</p>
        <div className="year-end-table-wrap mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-slate-100"><tr>{["Niswan", "Supervisor", "Students", "Fully Processed", "Pending Students", "Needs Review", "Final-Year Decisions Pending", "Status"].map((label) => <th key={label} className="p-2">{t(label)}</th>)}</tr></thead>
          <tbody>{report.rows.map((row) => <tr key={row.schoolId} className="border-t align-middle">
            <td className="p-2"><button type="button" className="text-left font-semibold text-sky-900 underline" onClick={() => openDetails(row.schoolId)}>{row.code} : {row.name}</button><p className="text-xs text-slate-500">{t(row.active)}{row.contact ? ` | ${row.contact}` : ""}</p></td>
            <td className="p-2">{row.supervisorName || "-"}<p className="text-xs text-slate-500">{row.supervisorCode}</p></td>
            <td className="p-2 text-center">{countButton(row.totalStudents, row.schoolId)}</td><td className="p-2 text-center">{numberText(row.processedStudents)}</td>
            <td className="p-2 text-center">{countButton(row.pendingStudents, row.schoolId, "UNRESOLVED")}</td>
            <td className="p-2 text-center">{countButton(row.needsReviewStudents, row.schoolId, "NEEDS_REVIEW")}</td>
            <td className="p-2 text-center">{numberText(row.finalYearPending)}</td><td className="p-2">{statusBadge(row.status)}{filters.courseId && row.allCoursesStatus !== row.status && <p className="mt-1 text-xs text-slate-500">{t("All Courses")}: {t(yearEndStatusText[row.allCoursesStatus])}</p>}</td>
          </tr>)}</tbody></table>{!report.rows.length && <p className="p-4 text-center">{t("No records found.")}</p>}</div>
      </div>
      {detailSchool && <div className="mt-4 rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{t("Course Decisions")}: {selectedSchool?.code} : {selectedSchool?.name}</h2>
          <div className="year-end-no-print flex gap-2">{canExport && <button type="button" className="rounded border px-3 py-1 disabled:opacity-50" disabled={detailBusy || !details || exportBusy} onClick={() => exportReport(true)}>{t("Export Student Decisions")}</button>}
          <button type="button" className="rounded border px-3 py-1" onClick={() => { setDetailSchool(""); setDetails(null); }}>{t("Close")}</button></div></div>
        <label className="year-end-no-print mt-3 block text-sm">{t("Decision")}<select aria-label="Decision" className="ml-2 rounded border p-2" value={decision} onChange={(event) => { setDecision(event.target.value); setPage(1); }}><option value="">{t("All")}</option>{decisions.map((value) => <option key={value} value={value}>{t(yearEndStatusText[value])}</option>)}</select></label>
        {detailBusy && <p role="status" className="p-4">{t("Loading...")}</p>}{detailError && <p role="alert" className="p-3 text-rose-800">{t(detailError)}</p>}
        {details && <>
          <p className="mt-3 text-xs text-slate-600">{t("Course counts refer to the selected decision filter. Students studying multiple courses appear once per course.")}</p>
          <div className="year-end-table-wrap mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{["Course", "Entries", "Promoted", "Not Promoted", "Completed", "Pending", "Needs Review"].map((label) => <th key={label} className="p-2">{t(label)}</th>)}</tr></thead><tbody>{details.courses.map((course) => <tr key={course.courseId || "missing"} className="border-t"><td className="p-2">{course.courseName || t("Course details missing")}</td>{[course.entries, course.promoted, course.notPromoted, course.completed, course.pending, course.needsReview].map((count, index) => <td key={index} className="p-2 text-center">{numberText(count)}</td>)}</tr>)}</tbody></table></div>
          <p className="mt-4 text-sm">{t("Student course entries shown")}: {numberText(details.entries.length)} / {numberText(details.totalEntries)} | {t("Page")}: {details.page}</p>
          <div className="year-end-table-wrap mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>{["Student ID", "Student Name", "Course / Year", "Decision", "Reason"].map((label) => <th key={label} className="p-2">{t(label)}</th>)}</tr></thead><tbody>{details.entries.map((entry) => <tr key={`${entry.studentId}-${entry.courseId}`} className="border-t align-middle">
            <td className="p-2">{entry.rollNumber || "-"}<p className="text-[10px] text-slate-500">{entry.studentId}</p></td><td className="p-2">{entry.studentName || "-"}</td>
            <td className="p-2">{entry.courseName || "-"}{entry.sourceYear ? ` / ${entry.sourceYear}` : ""}{entry.isFinalYear && <p className="text-xs text-slate-500">{t("Final Year")}</p>}</td>
            <td className="p-2">{statusBadge(entry.decision)}</td><td className="p-2">{t(YEAR_END_REASON_TEXT[entry.reasonCode] || "-")}</td>
          </tr>)}</tbody></table>{!details.entries.length && <p className="p-4">{t("No records found.")}</p>}</div>
          <div className="year-end-no-print mt-3 flex items-center gap-3"><button type="button" className="rounded border px-3 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t("Previous")}</button><button type="button" className="rounded border px-3 py-1 disabled:opacity-50" disabled={page * details.limit >= details.totalEntries} onClick={() => setPage((value) => value + 1)}>{t("Next")}</button><span className="text-xs text-slate-500">{t("Excel export includes all matching pages.")}</span></div>
        </>}
      </div>}
      <p className="mt-3 text-xs text-slate-500">{t("Print includes the Niswan summary and only the student entries currently shown. Excel export includes all matching pages.")}</p>
      <p className="mt-4 text-xs text-slate-500">{t("Generated at")}: {new Date(report.generatedAt).toLocaleString()} | {t("Niswan attribution uses the student's current Niswan.")}</p>
    </>}
  </section>;
}
