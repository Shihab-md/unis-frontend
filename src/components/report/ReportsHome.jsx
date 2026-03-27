import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getBaseUrl } from "../../utils/CommonHelper.jsx";
import ReportsFiltersDrawer from "./ReportsFiltersDrawer.jsx";
import NiswanReportTable from "./NiswanReportTable.jsx";

const MySwal = withReactContent(Swal);

const defaultFilters = {
  schoolId: "",
  schoolCode: "",
  q: "",
  courseId: "",
  acYear: "",
  status: "",
  feesStatus: "",
  hostel: "",
  months: 12,
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

async function apiGet(path) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}${path}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

async function downloadFile(path, filename) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}${path}`, { headers: authHeaders() });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err?.error || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

const formatNumber = (value) => Number(value || 0).toLocaleString();
const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString()}`;

export default function ReportsHome() {
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);

  const [meta, setMeta] = useState({
    schools: [],
    courses: [],
    academicYears: [],
    years: [],
    statuses: ["Active", "In-Active", "Transferred", "Graduated", "Discontinued"],
    feeStatuses: ["Paid", "Unpaid"],
    hostels: ["Yes", "No"],
  });

  const [kpis, setKpis] = useState({
    totalStudents: 0,
    feesPaid: 0,
    feesUnpaid: 0,
    active: 0,
    graduated: 0,
    inactive: 0,
    transferred: 0,
    discontinued: 0,
    hostelYes: 0,
    hostelNo: 0,
    niswansCovered: 0,
    thisMonthAdmissions: 0,
    thisMonthFeesCollection: 0,
  });

  const [trendAdmissions, setTrendAdmissions] = useState([]);
  const [trendFees, setTrendFees] = useState([]);
  const [latestUnpaid, setLatestUnpaid] = useState([]);
  const [latestAdmissions, setLatestAdmissions] = useState([]);
  const [niswanRows, setNiswanRows] = useState([]);
  const [niswanSummary, setNiswanSummary] = useState({
    totalNiswans: 0,
    totalStudents: 0,
    totalFeesPaid: 0,
    totalUnpaid: 0,
    totalActive: 0,
    totalGraduated: 0,
  });

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.schoolId) qs.set("schoolId", filters.schoolId);
    if (filters.schoolCode) qs.set("schoolCode", filters.schoolCode);
    if (filters.q) qs.set("q", filters.q);
    if (filters.courseId) qs.set("courseId", filters.courseId);
    if (filters.acYear) qs.set("acYear", filters.acYear);
    if (filters.status) qs.set("status", filters.status);
    if (filters.feesStatus) qs.set("feesStatus", filters.feesStatus);
    if (filters.hostel) qs.set("hostel", filters.hostel);
    qs.set("months", String(filters.months || 12));
    return qs.toString();
  }, [filters]);

  const selectedFilterChips = useMemo(() => {
    const chips = [];
    const schools = Array.isArray(meta?.schools) ? meta.schools : [];
    const courses = Array.isArray(meta?.courses) ? meta.courses : [];
    const years = Array.isArray(meta?.academicYears)
      ? meta.academicYears
      : Array.isArray(meta?.years)
        ? meta.years
        : [];

    if (filters.q) chips.push(`Search: ${filters.q}`);
    if (filters.schoolCode) chips.push(`Code: ${filters.schoolCode}`);
    if (filters.schoolId) {
      const school = schools.find((item) => String(item._id) === String(filters.schoolId));
      chips.push(`Niswan: ${school?.code || school?.nameEnglish || filters.schoolId}`);
    }
    if (filters.courseId) {
      const course = courses.find((item) => String(item._id) === String(filters.courseId));
      chips.push(`Course: ${course?.name || filters.courseId}`);
    }
    if (filters.acYear) {
      const year = years.find((item) => String(item._id) === String(filters.acYear));
      chips.push(`Year: ${year?.acYear || filters.acYear}`);
    }
    if (filters.status) chips.push(`Status: ${filters.status}`);
    if (filters.feesStatus) chips.push(`Fees: ${filters.feesStatus}`);
    if (filters.hostel) chips.push(`Hostel: ${filters.hostel}`);
    chips.push(`Months: ${filters.months}`);
    return chips;
  }, [filters, meta]);

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const data = await apiGet(`report/meta`);
      setMeta({
        schools: Array.isArray(data?.schools) ? data.schools : [],
        courses: Array.isArray(data?.courses) ? data.courses : [],
        academicYears: Array.isArray(data?.academicYears)
          ? data.academicYears
          : Array.isArray(data?.years)
            ? data.years
            : [],
        years: Array.isArray(data?.years)
          ? data.years
          : Array.isArray(data?.academicYears)
            ? data.academicYears
            : [],
        statuses: Array.isArray(data?.statuses) ? data.statuses : [],
        feeStatuses: Array.isArray(data?.feeStatuses) ? data.feeStatuses : [],
        hostels: Array.isArray(data?.hostels) ? data.hostels : [],
      });
    } catch (e) {
      await MySwal.fire({
        title: "Error",
        text: e?.message || "Failed to load filters",
        icon: "error",
      });
    } finally {
      setMetaLoading(false);
    }
  };

  const loadHome = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`report/home?${queryString}`);
      setKpis({
        totalStudents: Number(data?.kpis?.totalStudents || 0),
        feesPaid: Number(data?.kpis?.feesPaid || 0),
        feesUnpaid: Number(data?.kpis?.feesUnpaid || 0),
        active: Number(data?.kpis?.active || 0),
        graduated: Number(data?.kpis?.graduated || 0),
        inactive: Number(data?.kpis?.inactive || 0),
        transferred: Number(data?.kpis?.transferred || 0),
        discontinued: Number(data?.kpis?.discontinued || 0),
        hostelYes: Number(data?.kpis?.hostelYes || 0),
        hostelNo: Number(data?.kpis?.hostelNo || 0),
        niswansCovered: Number(data?.kpis?.niswansCovered || 0),
        thisMonthAdmissions: Number(data?.kpis?.thisMonthAdmissions || 0),
        thisMonthFeesCollection: Number(data?.kpis?.thisMonthFeesCollection || 0),
      });

      setTrendAdmissions(
        Array.isArray(data?.trends?.admissions)
          ? data.trends.admissions
          : Array.isArray(data?.admissionsTrend)
            ? data.admissionsTrend
            : []
      );

      setTrendFees(
        Array.isArray(data?.trends?.feesCollection)
          ? data.trends.feesCollection
          : Array.isArray(data?.feesTrend)
            ? data.feesTrend
            : []
      );

      setLatestUnpaid(
        Array.isArray(data?.previews?.latestUnpaid)
          ? data.previews.latestUnpaid
          : Array.isArray(data?.latestUnpaid)
            ? data.latestUnpaid
            : []
      );

      setLatestAdmissions(
        Array.isArray(data?.previews?.latestAdmissions)
          ? data.previews.latestAdmissions
          : Array.isArray(data?.latestAdmissions)
            ? data.latestAdmissions
            : []
      );
    } catch (e) {
      await MySwal.fire({
        title: "Error",
        text: e?.message || "Failed to load report home",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNiswanReport = async () => {
    try {
      const data = await apiGet(`report/niswan?${queryString}`);
      setNiswanRows(Array.isArray(data?.rows) ? data.rows : []);
      setNiswanSummary(
        data?.summary || {
          totalNiswans: 0,
          totalStudents: 0,
          totalFeesPaid: 0,
          totalUnpaid: 0,
          totalActive: 0,
          totalGraduated: 0,
        }
      );
    } catch (e) {
      Swal.fire({
        toast: true,
        position: "top",
        timer: 2500,
        showConfirmButton: false,
        icon: "warning",
        title: e?.message || "Failed to load Niswan report",
      });
      setNiswanRows([]);
      setNiswanSummary({
        totalNiswans: 0,
        totalStudents: 0,
        totalFeesPaid: 0,
        totalUnpaid: 0,
        totalActive: 0,
        totalGraduated: 0,
      });
    }
  };

  useEffect(() => {
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      await loadHome();
      await loadNiswanReport();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onApplyFilters = (next) => setFilters(next);

  const exportHome = async (format) => {
    const filename = `ReportsHome_${Date.now()}.${format}`;
    await downloadFile(`report/home/export?${queryString}&format=${format}`, filename);
  };

  const exportNiswan = async (format) => {
    const filename = `Niswan_Report_${Date.now()}.${format}`;
    await downloadFile(`report/niswan/export?${queryString}&format=${format}`, filename);
  };

  const clearAllFilters = () => setFilters(defaultFilters);

  return (
    <div className="p-3 md:p-6 bg-slate-50 min-h-screen">
      <div className="rounded-lg bg-gradient-to-r from-sky-700 via-cyan-700 to-emerald-700 text-white shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports Dashboard</h1>
            <p className="text-sm md:text-base text-white/85 mt-2">
              Overall UNIS student reporting with filters, trends, Niswan summary and export.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <ReportsFiltersDrawer
              meta={meta}
              value={filters}
              loading={metaLoading}
              onApply={onApplyFilters}
            />
            <button
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-sm"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-white text-sky-700 hover:bg-sky-50 text-sm font-medium"
              onClick={() => exportHome("xlsx")}
            >
              Export Home
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {selectedFilterChips.map((chip) => (
            <span
              key={chip}
              className="px-3 py-1 rounded-full bg-white/15 border border-white/15 text-xs md:text-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
        <ColorStatCard title="Total Students" value={formatNumber(kpis.totalStudents)} loading={loading} tone="blue" />
        <ColorStatCard title="Fees Paid" value={formatNumber(kpis.feesPaid)} loading={loading} tone="green" />
        <ColorStatCard title="Fees Unpaid" value={formatNumber(kpis.feesUnpaid)} loading={loading} tone="red" />
        <ColorStatCard title="Active" value={formatNumber(kpis.active)} loading={loading} tone="sky" />
        <ColorStatCard title="Graduated" value={formatNumber(kpis.graduated)} loading={loading} tone="violet" />
        <ColorStatCard title="Niswans Covered" value={formatNumber(kpis.niswansCovered)} loading={loading} tone="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-3">
        <ColorStatCard title="This Month Admissions" value={formatNumber(kpis.thisMonthAdmissions)} loading={loading} tone="teal" small />
        <ColorStatCard title="This Month Fees" value={formatCurrency(kpis.thisMonthFeesCollection)} loading={loading} tone="emerald" small />
        <ColorStatCard title="Hostel Yes" value={formatNumber(kpis.hostelYes)} loading={loading} tone="pink" small />
        <ColorStatCard title="Hostel No" value={formatNumber(kpis.hostelNo)} loading={loading} tone="indigo" small />
        <ColorStatCard title="Transferred" value={formatNumber(kpis.transferred)} loading={loading} tone="orange" small />
        <ColorStatCard title="Discontinued" value={formatNumber(kpis.discontinued)} loading={loading} tone="slate" small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <ChartCard title="Admissions per month" subtitle={`Last ${filters.months} months`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendAdmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Admissions" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fees collection" subtitle={`Last ${filters.months} months`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendFees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" name="Fees" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <PreviewTable
          title="Latest Unpaid Students"
          subtitle="Recent students whose fees are still unpaid"
          rows={latestUnpaid}
          columns={[
            { key: "name", label: "Name" },
            { key: "school", label: "Niswan" },
            { key: "course", label: "Course" },
            { key: "status", label: "Status", type: "status" },
            { key: "feesStatus", label: "Fees", type: "feesStatus" },
          ]}
        />

        <PreviewTable
          title="Latest Admissions"
          subtitle="Recently admitted students in the filtered scope"
          rows={latestAdmissions}
          columns={[
            { key: "name", label: "Name" },
            { key: "school", label: "Niswan" },
            { key: "course", label: "Course" },
            { key: "date", label: "Admission Date" },
            { key: "hostel", label: "Hostel", type: "hostel" },
          ]}
        />
      </div>

      <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Niswan Report</h2>
            <p className="text-sm text-slate-500 mt-1">
              Niswan-wise overall student, fees and status summary.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm"
              onClick={() => exportNiswan("csv")}
            >
              Export CSV
            </button>
            <button
              className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm"
              onClick={() => exportNiswan("xlsx")}
            >
              Export XLSX
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
          <MiniSummaryCard title="Niswans" value={formatNumber(niswanSummary.totalNiswans)} />
          <MiniSummaryCard title="Students" value={formatNumber(niswanSummary.totalStudents)} />
          <MiniSummaryCard title="Fees Paid" value={formatNumber(niswanSummary.totalFeesPaid)} tone="green" />
          <MiniSummaryCard title="Unpaid" value={formatNumber(niswanSummary.totalUnpaid)} tone="red" />
          <MiniSummaryCard title="Active" value={formatNumber(niswanSummary.totalActive)} tone="sky" />
          <MiniSummaryCard title="Graduated" value={formatNumber(niswanSummary.totalGraduated)} tone="violet" />
        </div>

        <div className="mt-4">
          <NiswanReportTable rows={niswanRows} />
        </div>
      </div>
    </div>
  );
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
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl hover:shadow-2xl transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <span className="text-xs text-slate-400">{safeRows.length} rows</span>
      </div>

      <div className="overflow-auto mt-3 hidden md:block">
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
                  No data
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
          <div className="text-slate-400 text-sm">No data</div>
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

    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{safe}</span>;
  }

  if (type === "feesStatus") {
    const color = safe === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{safe}</span>;
  }

  if (type === "hostel") {
    const color = safe === "Yes" ? "bg-pink-50 text-pink-700" : "bg-slate-100 text-slate-700";
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{safe}</span>;
  }

  return <>{safe || "-"}</>;
}