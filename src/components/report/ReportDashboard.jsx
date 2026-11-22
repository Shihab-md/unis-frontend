/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import ReportsFiltersDrawer from "./ReportsFiltersDrawer";
import ReportsBreadcrumbs from "./ReportsBreadcrumbs";
import NiswanReportTable from "./NiswanReportTable";
import DetailedReportsSection from "./DetailedReportsSection";
import { useLanguage } from "../../i18n/LanguageContext";
import { translateReportNavigation } from "../../i18n/reportNavigationText";
import { useAuth } from "../../context/AuthContext";
import { PERMISSIONS } from "../../auth/permissions";
import { normalizeRole } from "../../auth/roles";
import { canUseReport, reportPath } from "../../reports/reportCatalog";
import useReportFilters from "../../reports/useReportFilters";
import { fetchReport, downloadReport } from "../../api/reportApi";

const formatNumber = (value) => Number(value || 0).toLocaleString();
const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;
const emptyMeta = { schools: [], courses: [], academicYears: [], years: [], statuses: [], feeStatuses: [], hostels: [], studyYears: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] };
const emptyNiswan = { totalNiswans: 0, totalStudents: 0, totalFeesPaid: 0, totalUnpaid: 0, totalActive: 0, totalGraduated: 0 };

export default function ReportDashboard({ report }) {
  const { tr, direction, fontFamily, language } = useLanguage();
  const { user, can } = useAuth();
  const t = (text) => translateReportNavigation(text, language, tr);
  const allowed = canUseReport(report, user, can);
  const view = report.view;
  const isDetailed = ["students", "employees", "supervisors"].includes(view);
  const studentFilters = ["overview", "students", "niswan"].includes(view);
  const canViewFinancialReports = normalizeRole(user?.role) !== "hquser";
  const canExportReports = allowed && can(PERMISSIONS.REPORTS_EXPORT);
  const [filters, applyFilters, resetFilters] = useReportFilters(user, reportPath(report));
  const [meta, setMeta] = useState(emptyMeta), [metaLoading, setMetaLoading] = useState(view !== "supervisors"), [metaError, setMetaError] = useState("");
  const [home, setHome] = useState(null), [niswanRows, setNiswanRows] = useState([]), [niswanSummary, setNiswanSummary] = useState(emptyNiswan);
  const [loading, setLoading] = useState(!isDetailed), [error, setError] = useState(""), [refresh, setRefresh] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [exportBusy, setExportBusy] = useState(false), [exportError, setExportError] = useState("");
  const exportRequest = useRef(null);
  const accessKey = `${user?._id || user?.id || ""}:${user?.role || ""}`;
  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "feesStatus" && !canViewFinancialReports) return;
      if (value !== "" && value !== null && value !== undefined) qs.set(key, String(value));
    });
    return qs.toString();
  }, [filters, canViewFinancialReports]);

  useEffect(() => {
    if (!allowed || view === "supervisors") return;
    const abort = new AbortController();
    setMeta(emptyMeta); setMetaError(""); setMetaLoading(true);
    (async () => {
      try {
        const data = await fetchReport("report/meta", { signal: abort.signal });
        if (abort.signal.aborted) return;
        if (!Array.isArray(data.schools) || !Array.isArray(data.courses)) throw new Error("Invalid report filter response");
        const academicYears = Array.isArray(data.academicYears) ? data.academicYears : Array.isArray(data.years) ? data.years : [];
        setMeta({ ...emptyMeta, ...data, academicYears, years: academicYears });
      } catch (err) { if (!abort.signal.aborted) setMetaError(err?.message || "Failed to load filters"); }
      finally { if (!abort.signal.aborted) setMetaLoading(false); }
    })();
    return () => abort.abort();
  }, [allowed, view, accessKey, refresh]);

  useEffect(() => {
    if (!allowed || isDetailed) return;
    const abort = new AbortController();
    setLoading(true); setHasData(false); setError(""); setHome(null); setNiswanRows([]); setNiswanSummary(emptyNiswan);
    (async () => {
      try {
        const data = await fetchReport(`report/${view === "niswan" ? "niswan" : "home"}?${queryString}`, { signal: abort.signal });
        if (abort.signal.aborted) return;
        if (view === "niswan") {
          if (!Array.isArray(data.rows) || !data.summary) throw new Error("Invalid Niswan report response");
          setNiswanRows(data.rows); setNiswanSummary(data.summary);
        } else {
          if (!data.kpis || typeof data.kpis !== "object" || Array.isArray(data.kpis)) throw new Error("Invalid student overview response");
          const list = (value) => Array.isArray(value) ? value : [];
          setHome({ ...data, trends: { admissions: list(data.trends?.admissions || data.admissionsTrend), feesCollection: list(data.trends?.feesCollection || data.feesTrend) },
            previews: { latestAdmissions: list(data.previews?.latestAdmissions || data.latestAdmissions), latestUnpaid: list(data.previews?.latestUnpaid || data.latestUnpaid) } });
        }
        setHasData(true);
      } catch (err) { if (!abort.signal.aborted) setError(err?.message || "Failed to load report"); }
      finally { if (!abort.signal.aborted) setLoading(false); }
    })();
    return () => abort.abort();
  }, [allowed, isDetailed, view, accessKey, queryString, refresh]);

  useEffect(() => {
    setExportBusy(false); setExportError("");
    return () => exportRequest.current?.abort();
  }, [queryString, accessKey]);

  const exportData = async (format) => {
    if (!canExportReports || exportBusy || loading || error || !hasData) return;
    const abort = new AbortController(); exportRequest.current = abort;
    setExportBusy(true); setExportError("");
    try { await downloadReport(`report/${view === "niswan" ? "niswan" : "home"}/export?${queryString}&format=${format}`, `${view === "niswan" ? "Niswan_Report" : "Student_Overview"}_${Date.now()}.${format}`, { signal: abort.signal }); }
    catch (err) { if (!abort.signal.aborted) setExportError(err?.message || "Failed to export report"); }
    finally { if (!abort.signal.aborted) setExportBusy(false); }
  };
  const selectedFilterChips = useMemo(() => {
    const labels = { schoolId: "Niswan", schoolCode: "Code", q: "Search", courseId: "Course", acYear: "Academic Year", year: "Studying Year", status: "Status", feesStatus: "Fees", hostel: "Hostel", months: "Months" };
    return Object.entries(filters).filter(([key, value]) => value !== "" && value !== null && value !== undefined && (key !== "feesStatus" || canViewFinancialReports) && (key !== "months" || view === "overview")).map(([key, value]) => {
      const label = key === "schoolId" ? meta.schools.find((item) => String(item._id) === value)?.code || value : key === "courseId" ? meta.courses.find((item) => String(item._id) === value)?.name || value : key === "acYear" ? meta.academicYears.find((item) => String(item._id) === value)?.acYear || value : value;
      return `${tr(labels[key] || key)}: ${tr(String(label))}`;
    });
  }, [filters, meta, tr, canViewFinancialReports, view]);
  const onApplyFilters = useCallback((next) => applyFilters(next), [applyFilters]);
  const kpis = home?.kpis || {};
  const trendAdmissions = home?.trends?.admissions || home?.admissionsTrend || [];
  const trendFees = home?.trends?.feesCollection || home?.feesTrend || [];
  const latestAdmissions = home?.previews?.latestAdmissions || home?.latestAdmissions || [];
  const latestUnpaid = home?.previews?.latestUnpaid || home?.latestUnpaid || [];
  if (!allowed) return <p role="alert" className="p-6">{tr("Reports are not available for this role.")}</p>;
  return <section className="min-h-screen bg-slate-50 p-3 md:p-6" dir={direction} style={{ fontFamily }}>
    <ReportsBreadcrumbs categoryId={report.category} title={report.title} />
    <header className="mt-4 rounded-xl bg-gradient-to-r from-sky-800 to-teal-700 p-5 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold">{t(report.title)}</h1><p className="mt-2 text-sm">{tr(report.description)}</p></div>
        <div className="flex flex-wrap gap-2">
          {studentFilters && <><ReportsFiltersDrawer meta={meta} value={filters} loading={metaLoading} onApply={onApplyFilters} showFeesFilter={canViewFinancialReports} showMonths={view === "overview"} onReset={resetFilters} /><button type="button" className="rounded border border-white/40 px-3 py-2 text-sm" onClick={resetFilters}>{tr("Reset Filters")}</button></>}
          <button type="button" className="rounded border border-white/40 px-3 py-2 text-sm" onClick={() => setRefresh((value) => value + 1)}>{tr("Refresh Report")}</button>
          {!isDetailed && canExportReports && <><button type="button" disabled={loading || exportBusy || !!error || !hasData} className="rounded bg-white px-3 py-2 text-sm font-semibold text-sky-900 disabled:opacity-50" onClick={() => exportData("csv")}>{tr("Export CSV")}</button><button type="button" disabled={loading || exportBusy || !!error || !hasData} className="rounded bg-white px-3 py-2 text-sm font-semibold text-sky-900 disabled:opacity-50" onClick={() => exportData("xlsx")}>{tr("Export XLSX")}</button></>}
        </div>
      </div>
      {studentFilters && <div className="mt-4 flex flex-wrap gap-2">{selectedFilterChips.map((chip) => <span key={chip} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">{chip}</span>)}</div>}
    </header>
    {metaError && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{tr(metaError)}</p>}
    {error && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{tr(error)}</p>}
    {exportError && <p role="alert" className="mt-3 rounded border border-rose-200 bg-rose-50 p-3 text-rose-800">{tr(exportError)}</p>}
    {view === "overview" && !error && <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
        <ColorStatCard title={tr("Total Students")} value={formatNumber(kpis.totalStudents)} loading={loading} tone="blue" />
        {canViewFinancialReports ? <ColorStatCard title={tr("Fees Paid")} value={formatNumber(kpis.feesPaid)} loading={loading} tone="green" /> : null}
        {canViewFinancialReports ? <ColorStatCard title={tr("Fees Unpaid")} value={formatNumber(kpis.feesUnpaid)} loading={loading} tone="red" /> : null}
        <ColorStatCard title={tr("Active")} value={formatNumber(kpis.active)} loading={loading} tone="sky" />
        <ColorStatCard title={tr("Graduated")} value={formatNumber(kpis.graduated)} loading={loading} tone="violet" />
        <ColorStatCard title={tr("Niswans Covered")} value={formatNumber(kpis.niswansCovered)} loading={loading} tone="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-3">
        <ColorStatCard title={tr("This Month Admissions")} value={formatNumber(kpis.thisMonthAdmissions)} loading={loading} tone="teal" small />
        {canViewFinancialReports ? <ColorStatCard title={tr("This Month Fees")} value={formatCurrency(kpis.thisMonthFeesCollection)} loading={loading} tone="emerald" small /> : null}
        <ColorStatCard title={tr("Hostel Yes")} value={formatNumber(kpis.hostelYes)} loading={loading} tone="pink" small />
        <ColorStatCard title={tr("Hostel No")} value={formatNumber(kpis.hostelNo)} loading={loading} tone="indigo" small />
        <ColorStatCard title={tr("Transferred")} value={formatNumber(kpis.transferred)} loading={loading} tone="orange" small />
        <ColorStatCard title={tr("Discontinued")} value={formatNumber(kpis.discontinued)} loading={loading} tone="slate" small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <div className={canViewFinancialReports ? "" : "lg:col-span-2"}>
        <ChartCard title={tr("Admissions per month")} subtitle={`${tr("Last")} ${filters.months} ${tr("months")}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendAdmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name={tr("Admissions")} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>

        {canViewFinancialReports ? <ChartCard title={tr("Fees collection")} subtitle={`${tr("Last")} ${filters.months} ${tr("months")}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendFees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name={tr("Fees")} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        {canViewFinancialReports ? <PreviewTable
          title={tr("Latest Unpaid Students")}
          subtitle={tr("Recent students whose fees are still unpaid")}
          rows={latestUnpaid}
          columns={[
            { key: "name", label: tr("Name") },
            { key: "school", label: tr("Niswan") },
            { key: "course", label: tr("Course") },
            { key: "status", label: tr("Status"), type: "status" },
            { key: "feesStatus", label: tr("Fees"), type: "feesStatus" },
          ]}
        /> : null}

        <div className={canViewFinancialReports ? "" : "lg:col-span-2"}>
        <PreviewTable
          title={tr("Latest Admissions")}
          subtitle={tr("Recently admitted students in the filtered scope")}
          rows={latestAdmissions}
          columns={[
            { key: "name", label: tr("Name") },
            { key: "school", label: tr("Niswan") },
            { key: "course", label: tr("Course") },
            { key: "date", label: tr("Admission Date") },
            { key: "hostel", label: tr("Hostel"), type: "hostel" },
          ]}
        />
        </div>
      </div>

    </>}
    {view === "niswan" && !error && <>
      {loading && <p role="status" className="p-6">{tr("Loading...")}</p>}
      {!loading && hasData && <>
      <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">{tr("Niswan Report")}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {tr(canViewFinancialReports ? "Niswan-wise overall student, fees and status summary." : "Niswan-wise overall student and status summary.")}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
          <MiniSummaryCard title={tr("Niswans")} value={formatNumber(niswanSummary.totalNiswans)} />
          <MiniSummaryCard title={tr("Students")} value={formatNumber(niswanSummary.totalStudents)} />
          {canViewFinancialReports ? <MiniSummaryCard title={tr("Fees Paid")} value={formatNumber(niswanSummary.totalFeesPaid)} tone="green" /> : null}
          {canViewFinancialReports ? <MiniSummaryCard title={tr("Unpaid")} value={formatNumber(niswanSummary.totalUnpaid)} tone="red" /> : null}
          <MiniSummaryCard title={tr("Active")} value={formatNumber(niswanSummary.totalActive)} tone="sky" />
          <MiniSummaryCard title={tr("Graduated")} value={formatNumber(niswanSummary.totalGraduated)} tone="violet" />
        </div>

        <div className="mt-4">
          <NiswanReportTable rows={niswanRows} showFinancial={canViewFinancialReports} />
        </div>
      </div>      </>}
    </>}
    {isDetailed && <DetailedReportsSection key={view} entity={view} meta={meta} studentQueryString={queryString} canExport={canExportReports} refresh={refresh} />}
  </section>;
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="h-72 mt-3">{children}</div>
    </div>
  );
}

function ColorStatCard({ title, value, loading, tone = "blue", small = false }) {
  const tones = {
    blue: "from-blue-600 to-sky-500",
    green: "from-emerald-600 to-green-500",
    red: "from-rose-600 to-red-500",
    sky: "from-sky-600 to-cyan-500",
    violet: "from-violet-600 to-purple-500",
    amber: "from-amber-500 to-orange-500",
    teal: "from-teal-600 to-cyan-500",
    emerald: "from-green-700 to-emerald-500",
    pink: "from-pink-600 to-rose-500",
    indigo: "from-indigo-600 to-blue-500",
    orange: "from-orange-600 to-amber-500",
    slate: "from-slate-700 to-slate-500",
  };

  return (
    <div className={`rounded-lg bg-gradient-to-r ${tones[tone] || tones.blue} text-white p-4 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5`}>
      <div className="text-xs uppercase tracking-wide text-white/80">{title}</div>
      <div className={`${small ? "text-lg" : "text-2xl"} font-bold mt-2`}>
        {loading ? "…" : value}
      </div>
    </div>
  );
}

function MiniSummaryCard({ title, value, tone = "slate" }) {
  const toneClass = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClass[tone] || toneClass.slate} shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

function PreviewTable({ title, subtitle, rows, columns }) {
  const { tr } = useLanguage();
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <span className="text-xs text-slate-400">{safeRows.length} {tr("rows")}</span>
      </div>

      <div className="overflow-auto mt-3 hidden md:block" dir="ltr">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="text-left px-2 py-2 font-medium text-slate-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeRows.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-slate-400" colSpan={columns.length}>
                  {tr("No data")}
                </td>
              </tr>
            ) : (
              safeRows.map((row, idx) => (
                <tr key={row?._id || idx} className="border-t align-top">
                  {columns.map((column) => (
                    <td key={column.key} className="px-2 py-2">
                      <CellValue value={row?.[column.key]} type={column.type} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-3 space-y-3">
        {safeRows.length === 0 ? (
          <div className="text-slate-400 text-sm">{tr("No data")}</div>
        ) : (
          safeRows.map((row, idx) => (
            <div key={row?._id || idx} className="rounded-2xl border border-slate-200 p-3 bg-slate-50/60">
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-3 py-1.5 text-sm">
                  <div className="text-slate-500">{column.label}</div>
                  <div className="text-right text-slate-800 font-medium">
                    <CellValue value={row?.[column.key]} type={column.type} />
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CellValue({ value, type }) {
  const { tr } = useLanguage();
  const safe = value ?? "-";

  if (type === "status") {
    const color =
      safe === "Active"
        ? "bg-sky-50 text-sky-700"
        : safe === "Graduated"
          ? "bg-violet-50 text-violet-700"
          : safe === "Transferred"
            ? "bg-amber-50 text-amber-700"
            : safe === "Discontinued"
              ? "bg-rose-50 text-rose-700"
              : "bg-slate-100 text-slate-700";

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{tr(String(safe))}</span>;
  }

  if (type === "feesStatus") {
    const color = safe === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{tr(String(safe))}</span>;
  }

  if (type === "hostel") {
    const color = safe === "Yes" ? "bg-pink-50 text-pink-700" : "bg-slate-100 text-slate-700";
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{tr(String(safe))}</span>;
  }

  return <>{safe || "-"}</>;
}