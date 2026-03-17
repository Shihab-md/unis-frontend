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
      const eased = 1 - Math.pow(1 - t, 3);
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

// ✅ Stat card
const StatCard = ({ title, value, loading, colorClass, icon, sub, isCurrency = false }) => {
  const animated = useCountUp(loading ? 0 : value, 950);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/80 bg-white/80 p-5 shadow-lg hover:-translate-y-0.5 hover:shadow-2xl ${colorClass}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-18 w-18 rounded-md bg-white/35 blur-xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/90">
            {title}
          </div>
          <div className="mt-2 text-xl font-bold text-white drop-shadow">
            {loading
              ? "0"
              : isCurrency
                ? `₹ ${Number(animated || 0).toLocaleString("en-IN")}`
                : Number(animated || 0).toLocaleString("en-IN")}
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
  const [searchText, setSearchText] = useState("");

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

  // ✅ Safe school key extractor
  const getSchoolKey = (row) => {
    if (!row?.schoolId) return "";
    if (typeof row.schoolId === "string") return row.schoolId;
    if (row.schoolId?._id) return String(row.schoolId._id);
    return "";
  };

  // ✅ Pending-only Niswan dropdown list from current result
  const pendingSchoolOptions = useMemo(() => {
    const map = new Map();

    for (const row of invoices || []) {
      const key = getSchoolKey(row);
      const school = row?.schoolId;

      if (!key || !school || typeof school === "string") continue;

      if (!map.has(key)) {
        map.set(key, {
          _id: key,
          code: school?.code || "",
          nameEnglish: school?.nameEnglish || "-",
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      String(a.code || "").localeCompare(String(b.code || ""))
    );
  }, [invoices]);

  // ✅ Keep selected school valid when pending list changes
  useEffect(() => {
    if (!isHQ) return;
    if (schoolId === "ALL") return;

    const exists = pendingSchoolOptions.some((s) => String(s._id) === String(schoolId));
    if (!exists) {
      setSchoolId("ALL");
    }
  }, [pendingSchoolOptions, schoolId, isHQ]);

  const filteredInvoices = useMemo(() => {
    const q = String(searchText || "").trim().toLowerCase();
    if (!q) return invoices || [];

    return (invoices || []).filter((row) => {
      const haystack = [
        row?.invoiceNo,
        row?.studentId?.userId?.name,
        row?.schoolId?.nameEnglish,
        row?.schoolId?.code,
        row?.courseId?.name,
        row?.acYear?.acYear,
        row?.status,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      return haystack.includes(q);
    });
  }, [invoices, searchText]);

  const summary = useMemo(() => {
    const total = invoices?.length || 0;
    const totalBalance = (invoices || []).reduce((s, r) => s + Number(r?.balance || 0), 0);

    const schoolKeys = new Set(
      (invoices || [])
        .map((r) => getSchoolKey(r))
        .filter(Boolean)
    );

    const uniqSchools = schoolKeys.size;

    return { total, totalBalance, uniqSchools };
  }, [invoices]);

  const badge = (status) => {
    const s = String(status || "").toUpperCase();
    const base =
      "px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide border shadow-sm";
    if (s === "ISSUED")
      return (
        <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>
          ISSUED
        </span>
      );
    if (s === "PARTIAL")
      return (
        <span className={`${base} bg-purple-50 text-purple-700 border-purple-200`}>
          PARTIAL
        </span>
      );
    return (
      <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
        {s || "-"}
      </span>
    );
  };

  const columns = useMemo(
    () => [
      {
        name: "Invoice",
        selector: (row) => <div className="mt-2 mb-2">
          <p className="mb-3"><span className="text-blue-700 mr-2">No:</span> {row?.invoiceNo || "-"}</p>
          <p><span className="text-blue-700 mr-2">AC Year:</span> {row?.acYear?.acYear || "-"}</p>
        </div>,
        sortable: true, wrap: true, width: "190px",
      },
      {
        name: "Details",
        selector: (row) => <div className="mt-2 mb-2">
          <p className="mb-1"><span className="text-blue-700 mr-2">Student:</span> {row?.studentId?.userId?.name || "-"}</p>
          <p className="mb-1"><span className="text-blue-700 mr-2">Niswan:</span> {row?.schoolId?.nameEnglish || "-"}</p>
          <p><span className="text-blue-700 mr-2">Course:</span> {row?.courseId?.name || "-"}</p>
        </div>,
        sortable: true,
        wrap: true,
        width: "450px",
      },
      { name: "Fees Type", cell: (row) => row?.source || "-", sortable: true, width: "160px", },
      {
        name: "Total & Paid",
        selector: (row) => <div className="mt-2 mb-2">
          <p className="mb-1"><span className="text-blue-700 mr-2">Total: ₹ </span>{Number(row?.total || 0).toLocaleString("en-IN")}</p>
          <p><span className="text-blue-700 mr-2">Paid: ₹ </span>{Number(row?.paidTotal || 0).toLocaleString("en-IN")}</p>
        </div>,
        sortable: true,
        width: "170px",
      },
      {
        name: "Balance",
        selector: (row) => `₹ ${Number(row?.balance || 0).toLocaleString("en-IN")}`,
        sortable: true,
        width: "140px",
      },
      { name: "Status", cell: (row) => badge(row?.status), sortable: true, width: "160px", },
    ],
    []
  );

  const customStyles = useMemo(
    () => ({
      table: { style: { backgroundColor: "transparent" } },
      tableWrapper: { style: { backgroundColor: "transparent" } },
      headRow: {
        style: {
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          minHeight: "52px",
        },
      },
      headCells: {
        style: {
          fontWeight: 700,
          fontSize: "10px",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
      rows: {
        style: {
          minHeight: "56px",
          backgroundColor: "transparent",
          borderBottom: "1px solid #f1f5f9",
          paddingTop: "5px",
          paddingBottom: "5px",
        },
      },
      pagination: {
        style: {
          backgroundColor: "transparent",
        },
      },
      noData: {
        style: {
          backgroundColor: "transparent",
        },
      },
    }),
    []
  );

  if (!isHQ) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          {LinkIcon("/dashboard/accountsPage", "Back")}
        </div>
        <div className="p-4 border rounded text-sm text-red-700 bg-red-50">
          Forbidden: HQ only
        </div>
      </div>
    );
  }

  //if (loading) return getPrcessing();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div>{LinkIcon("/dashboard/accountsPage", "Back")}</div>

        <div className="flex flex-col leading-tight">
          <h2 className="text-lg font-bold">Pending Invoices (Not Received at HQ)</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Academic Year
          </label>
          <select
            className="w-full border p-2 text-sm rounded"
            value={acYear}
            onChange={(e) => setAcYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((a) => (
              <option key={a._id} value={a._id}>
                {a.acYear || a.year || "-"}{" "}
                {String(a.active) === "Active" ? "(Active)" : ""}
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
            <option value="ALL">All Pending Niswans</option>
            {pendingSchoolOptions.map((s) => (
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

      {/* Stats */}
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
          isCurrency={true}
        />
        <StatCard
          title="Total Niswans"
          value={summary.uniqSchools}
          loading={loading}
          icon="🏫"
          colorClass="bg-gradient-to-br from-teal-500 to-emerald-500 border-white/20"
          sub="Unique Niswan"
        />
      </div>

      <div className="md:col-span-12">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Search
        </label>
        <input
          type="text"
          className="w-full border p-2 text-sm rounded"
          placeholder="Search invoice no, student, niswan, course, AC year, status..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table / Cards */}
      {!loading ? (
        <div className="border rounded mt-5 hover:-translate-y-0.5">
          <div className="p-2 font-bold text-xs bg-gray-100 flex items-center justify-between">
            <span>Invoices (Not Received at HQ)</span>
            <span className="text-[12px] font-bold text-red-600">
              {filteredInvoices?.length || 0} / {invoices?.length || 0} record(s)
            </span>
          </div>

          {/* Mobile + Tablet card view */}
          <div className="lg:hidden">
            {filteredInvoices?.length > 0 ? (
              <div className="p-3 space-y-3">
                {filteredInvoices.map((row) => (
                  <div
                    key={row?._id}
                    className="rounded-xl border p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {row?.invoiceNo || "-"}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-500">AC Year : </span>
                          {row?.acYear?.acYear || "-"}
                        </div>
                      </div>

                      <div>{badge(row?.status)}</div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-1 text-[12px] text-slate-700">
                      <div>
                        <span className="font-semibold text-slate-500">Niswan : </span>
                        {row?.schoolId?.nameEnglish || "-"}
                      </div>

                      <div>
                        <span className="font-semibold text-slate-500">Student : </span>
                        {row?.studentId?.userId?.name || "-"}
                      </div>

                      <div>
                        <span className="font-semibold text-slate-500">Course : </span>
                        {row?.courseId?.name || "-"}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          Total
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-800">
                          ₹ {Number(row?.total || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          Paid
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-800">
                          ₹ {Number(row?.paidTotal || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="rounded-lg bg-amber-50 p-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-amber-700">
                          Balance
                        </div>
                        <div className="mt-1 text-sm font-bold text-amber-800">
                          ₹ {Number(row?.balance || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-xs text-gray-600">No pending invoices found</div>
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={filteredInvoices}
              pagination
              highlightOnHover
              dense
              customStyles={customStyles}
              noDataComponent={
                <div className="p-3 text-xs text-gray-600">No pending invoices found</div>
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg shadow-xl border">
          <img
            width={250}
            className="flex items-center justify-center"
            src="/spinner1.gif"
          />
        </div>
      )}
    </div>
  );
}