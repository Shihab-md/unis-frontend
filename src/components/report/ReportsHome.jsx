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
import { getBaseUrl } from "../../utils/CommonHelper.jsx"; // adjust if different
import ReportsFiltersDrawer from "./ReportsFiltersDrawer.jsx";
import NiswanReportTable from "./NiswanReportTable.jsx";

const MySwal = withReactContent(Swal);

const defaultFilters = {
  schoolId: "", // ObjectId preferred
  courseId: "",
  acYear: "",
  status: "", // Active/Graduated etc
  months: 36,
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
    try { err = await res.json(); } catch {}
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

export default function ReportsHome() {
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);

  const [filters, setFilters] = useState(defaultFilters);

  // meta
  const [meta, setMeta] = useState({
    schools: [],
    courses: [],
    years: [],
    statuses: ["Active", "Graduated"],
  });

  // report data
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    feesPaid: 0,
    unpaid: 0,
    active: 0,
    graduated: 0,
  });

  const [trendAdmissions, setTrendAdmissions] = useState([]); // [{month, count}]
  const [trendFees, setTrendFees] = useState([]); // [{month, amount}]

  const [latestUnpaid, setLatestUnpaid] = useState([]); // preview table
  const [latestAdmissions, setLatestAdmissions] = useState([]); // preview table

  const [niswanRows, setNiswanRows] = useState([]);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.schoolId) qs.set("schoolId", filters.schoolId);
    if (filters.courseId) qs.set("courseId", filters.courseId);
    if (filters.acYear) qs.set("acYear", filters.acYear);
    if (filters.status) qs.set("status", filters.status);
    qs.set("months", String(filters.months || 12));
    return qs.toString();
  }, [filters]);

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const data = await apiGet(`report/meta`);
      // expected: {success:true, schools:[], courses:[], years:[], statuses:[]}
      setMeta({
        schools: Array.isArray(data?.schools) ? data.schools : [],
        courses: Array.isArray(data?.courses) ? data.courses : [],
        years: Array.isArray(data?.years) ? data.years : [],
        statuses: Array.isArray(data?.statuses) ? data.statuses : ["Active", "Graduated"],
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
      // expected: {kpis, admissionsTrend, feesTrend, latestUnpaid, latestAdmissions}
      setKpis({
        totalStudents: Number(data?.kpis?.totalStudents || 0),
        feesPaid: Number(data?.kpis?.feesPaid || 0),
        unpaid: Number(data?.kpis?.unpaid || 0),
        active: Number(data?.kpis?.active || 0),
        graduated: Number(data?.kpis?.graduated || 0),
      });

      setTrendAdmissions(Array.isArray(data?.admissionsTrend) ? data.admissionsTrend : []);
      setTrendFees(Array.isArray(data?.feesTrend) ? data.feesTrend : []);
      setLatestUnpaid(Array.isArray(data?.latestUnpaid) ? data.latestUnpaid : []);
      setLatestAdmissions(Array.isArray(data?.latestAdmissions) ? data.latestAdmissions : []);
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
      // optional: allow same filters; backend can ignore extra params
      const data = await apiGet(`report/niswan?${queryString}`);
      setNiswanRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (e) {
      // show as toast, avoid blocking
      Swal.fire({
        toast: true,
        position: "top",
        timer: 2500,
        showConfirmButton: false,
        icon: "warning",
        title: e?.message || "Failed to load Niswan report",
      });
      setNiswanRows([]);
    }
  };

  useEffect(() => {
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // whenever filters change, refresh
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

  return (
    <div className="p-3 md:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">
            KPI summary + trends + unpaid/admissions preview
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
            className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm"
            onClick={() => exportHome("csv")}
          >
            Export Home (CSV)
          </button>
          <button
            className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm"
            onClick={() => exportHome("xlsx")}
          >
            Export Home (XLSX)
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        <KpiCard title="Total Students" value={kpis.totalStudents} loading={loading} />
        <KpiCard title="Fees Paid" value={kpis.feesPaid} loading={loading} />
        <KpiCard title="Unpaid" value={kpis.unpaid} loading={loading} />
        <KpiCard title="Active" value={kpis.active} loading={loading} />
        <KpiCard title="Graduated" value={kpis.graduated} loading={loading} />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl border bg-white p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Admissions per month</h2>
            <span className="text-xs text-slate-400">Last {filters.months} months</span>
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendAdmissions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Admissions" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Fees collection</h2>
            <span className="text-xs text-slate-400">Last {filters.months} months</span>
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendFees}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Fees" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preview tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <PreviewTable
          title="Latest Unpaid"
          rows={latestUnpaid}
          columns={[
            { key: "name", label: "Name" },
            { key: "school", label: "School" },
            { key: "course", label: "Course" },
            { key: "year", label: "Year" },
          ]}
        />
        <PreviewTable
          title="Latest Admissions"
          rows={latestAdmissions}
          columns={[
            { key: "name", label: "Name" },
            { key: "school", label: "School" },
            { key: "course", label: "Course" },
            { key: "date", label: "Date" },
          ]}
        />
      </div>

      {/* Niswan report */}
      <div className="mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Niswan Report (Schools)</h2>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm"
              onClick={() => exportNiswan("csv")}
            >
              Export Niswan (CSV)
            </button>
            <button
              className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm"
              onClick={() => exportNiswan("xlsx")}
            >
              Export Niswan (XLSX)
            </button>
          </div>
        </div>

        <div className="mt-2">
          <NiswanReportTable rows={niswanRows} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, loading }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-xl font-bold text-slate-800 mt-1">
        {loading ? "…" : value}
      </div>
    </div>
  );
}

function PreviewTable({ title, rows, columns }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <span className="text-xs text-slate-400">{safeRows.length} rows</span>
      </div>

      <div className="overflow-auto mt-2">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-2 py-2 font-medium text-slate-600">
                  {c.label}
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
              safeRows.map((r, idx) => (
                <tr key={idx} className="border-t">
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-2">
                      {r?.[c.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
