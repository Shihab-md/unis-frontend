import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";

import { fetchPendingInvoicesHQNotSent } from "../../api/feesApi";
import { getAcademicYearsFromCache } from "../../utils/AcademicYearHelper";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import { showSwalAlert, LinkIcon, getPrcessing } from "../../utils/CommonHelper";

/* ----------------------------- Helpers (UNIS vibe) ----------------------------- */

// ✅ Count-up animation for numbers
const useCountUp = (target, durationMs = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const to = Number.isFinite(Number(target)) ? Number(target) : 0;
    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const v = Math.round(from + (to - from) * eased);
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
};

// ✅ Stat card (same as before)
const StatCard = ({ title, value, loading, colorClass, icon, sub }) => {
  const animated = useCountUp(loading ? 0 : value, 950);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/80 bg-white/80 p-5 shadow-lg hover:-translate-y-0.5 hover:shadow-2xl ${colorClass}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-18 w-18 rounded-md bg-white/35 blur-xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/90">{title}</div>
          <div className="mt-2 text-xl font-bold text-white drop-shadow">
            {loading ? "0" : animated}
          </div>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 text-2xl text-white shadow-md">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function PendingInvoicesNotSentHQ() {
  const role = localStorage.getItem("role");
  const isHQ = role === "superadmin" || role === "hquser";

  const fixedSchoolId = localStorage.getItem("schoolId");

  const [academicYears, setAcademicYears] = useState([]);
  const [schools, setSchools] = useState([]);

  const [acYear, setAcYear] = useState("");
  const [schoolId, setSchoolId] = useState(isHQ ? "ALL" : fixedSchoolId);

  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);

  // Load dropdowns
  useEffect(() => {
    const load = async () => {
      try {
        const years = await getAcademicYearsFromCache();
        const yearsList = Array.isArray(years) ? years : years?.academicYears || [];
        setAcademicYears(yearsList);

        // default year: Active else latest
        const active = yearsList.find((x) => String(x.active) === "Active");
        const sorted = yearsList
          .slice()
          .sort((a, b) =>
            String(b.acYear || b.year || "").localeCompare(String(a.acYear || a.year || ""))
          );
        const fallback = active?._id || sorted?.[0]?._id || "";
        setAcYear((prev) => prev || fallback);

        if (isHQ) {
          const sch = await getSchoolsFromCache();
          const schList = Array.isArray(sch) ? sch : sch?.schools || [];
          setSchools((schList || []).filter((x) => x?.active === "Active"));
        }
      } catch (e) {
        console.log(e);
      }
    };

    load();
  }, [isHQ]);

  const schoolOptions = useMemo(() => {
    return (schools || []).sort((a, b) => String(a.code || "").localeCompare(String(b.code || "")));
  }, [schools]);

  const runSearch = async () => {
    const missing = [];
    if (!acYear) missing.push("Academic Year");
    if (!schoolId && !isHQ) missing.push("Niswan");

    if (missing.length) {
      showSwalAlert("Info", `Please select: ${missing.join(", ")}`, "info");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchPendingInvoicesHQNotSent({ acYear, schoolId });
      if (!res?.success) {
        showSwalAlert("Error", res?.error || "Failed to load", "error");
        setInvoices([]);
        return;
      }
      setInvoices(res?.invoices || []);
    } catch (e) {
      console.log(e);
      showSwalAlert("Error", "Failed to load invoices", "error");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // auto search when ready
  useEffect(() => {
    if (acYear && (isHQ ? true : !!schoolId)) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acYear, schoolId]);

  const summary = useMemo(() => {
    const total = invoices?.length || 0;
    const totalBalance = (invoices || []).reduce((s, r) => s + Number(r?.balance || 0), 0);
    const uniqSchools = new Set((invoices || []).map((r) => r?.schoolId?._id || r?.schoolId)).size;
    return { total, totalBalance, uniqSchools };
  }, [invoices]);

  const badge = (status) => {
    const s = String(status || "").toUpperCase();
    const base = "px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide border shadow-sm";
    if (s === "ISSUED") return <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>ISSUED</span>;
    if (s === "PARTIAL") return <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>PARTIAL</span>;
    return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>{s || "-"}</span>;
  };

  const columns = useMemo(
    () => [
      { name: "Invoice No", selector: (row) => row?.invoiceNo || "-", sortable: true, wrap: true },
      { name: "Niswan", selector: (row) => row?.schoolId?.nameEnglish || "-", sortable: true, wrap: true },
      { name: "Student", selector: (row) => row?.studentId?.userId?.name || "-", wrap: true },
      { name: "Course", selector: (row) => row?.courseId?.name || "-", wrap: true },
      { name: "Total", selector: (row) => Number(row?.total || 0), sortable: true, right: true },
      { name: "Paid", selector: (row) => Number(row?.paidTotal || 0), sortable: true, right: true },
      { name: "Balance", selector: (row) => Number(row?.balance || 0), sortable: true, right: true },
      { name: "Status", cell: (row) => badge(row?.status), sortable: true },
      { name: "Created", selector: (row) => (row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"), sortable: true },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      table: { style: { backgroundColor: "transparent" } },
      headRow: {
        style: {
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          minHeight: "52px",
        },
      },
      headCells: {
        style: {
          fontWeight: 900,
          fontSize: "10px",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
      rows: {
        style: {
          minHeight: "56px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
        },
      },
    }),
    []
  );

  if (!isHQ) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">{LinkIcon("/dashboard/accountsPage", "Back")}</div>
        <div className="p-4 border rounded text-sm text-red-700 bg-red-50">Forbidden: HQ only</div>
      </div>
    );
  }

  if (loading) return getPrcessing();

  return (
    // ✅ SAME background container as Received Batches page
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>

        <div className="flex flex-col leading-tight">
          <h2 className="text-lg font-bold">Pending Invoices (Not Received at HQ)</h2>
        </div>
      </div>

      {/* Filters (keep same simple style like Received Batches) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={acYear}
            onChange={(e) => setAcYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((a) => (
              <option key={a._id} value={a._id}>
                {a.acYear || a.year || "-"} {String(a.active) === "Active" ? "(Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-7">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Niswan</label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          >
            <option value="ALL">All Niswans</option>
            {schoolOptions.map((s) => (
              <option key={s._id} value={s._id}>
                {(s.code ? `${s.code} : ` : "") + (s.nameEnglish || "-")}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            onClick={runSearch}
            className="w-full rounded bg-gradient-to-r from-indigo-300 via-violet-300 to-rose-300 p-2 font-semibold text-slate shadow hover:opacity-95"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats (colorful cards) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4 mt-5">
        <StatCard
          title="Total Pending Invoices"
          value={summary.total}
          loading={loading}
          icon="🧾"
          colorClass="bg-gradient-to-br from-indigo-500 to-violet-500 border-white/20"
          sub="Not received at HQ"
        />
        <StatCard
          title="Total Balance"
          value={summary.totalBalance}
          loading={loading}
          icon="💰"
          colorClass="bg-gradient-to-br from-rose-500 to-orange-400 border-white/20"
          sub="Sum of balances"
        />
        <StatCard
          title="Niswans"
          value={summary.uniqSchools}
          loading={loading}
          icon="🏫"
          colorClass="bg-gradient-to-br from-teal-500 to-emerald-500 border-white/20"
          sub="Unique Niswan"
        />
      </div>

      {/* Table */}
      <div className="border rounded bg-white mt-5 hover:-translate-y-0.5">
        <div className="p-2 font-bold text-xs bg-gray-100 flex items-center justify-between">
          <span>Invoices (Not Received at HQ)</span>
          <span className="text-[11px] font-bold text-gray-600">{invoices?.length || 0} record(s)</span>
        </div>

        <DataTable
          columns={columns}
          data={invoices}
          pagination
          highlightOnHover
          dense
          customStyles={customStyles}
          noDataComponent={<div className="p-3 text-xs text-gray-600">No pending invoices found</div>}
        />
      </div>
    </div>
  );
}
