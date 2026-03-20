import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaFilter, FaPlus, FaSearch } from "react-icons/fa";
import { fetchInspectionReports } from "../../api/inspectionReportApi";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

export default function InspectionReportList() {
  const navigate = useNavigate();
  const user = getUser();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    acYear: "",
    fromDate: "",
    toDate: "",
  });

  const loadInspectionReports = async () => {
    try {
      setLoading(true);
      const res = await fetchInspectionReports(filters);
      setRows(res?.data || []);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Failed to load inspection reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspectionReports();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        width: "80px",
        cell: (_, index) => <span>{index + 1}</span>,
      },
      {
        name: "Title",
        grow: 2,
        cell: (row) => (
          <div className="py-2">
            <p className="font-semibold text-slate-800">{row.title}</p>
          </div>
        ),
      },
      {
        name: "Report Date",
        width: "130px",
        selector: (row) => formatDate(row.reportDate),
      },
      {
        name: "Academic Year",
        width: "140px",
        selector: (row) => row.acYear || "-",
      },
      {
        name: "Supervisor Name",
        grow: 1.4,
        selector: (row) => row.supervisorName || "-",
      },
      {
        name: "Niswan",
        width: "120px",
        selector: (row) => row.niswan || row.schoolName || "-",
      },
      {
        name: "Attachments",
        width: "120px",
        cell: (row) => <span>{row.attachments?.length || 0}</span>,
      },
      {
        name: "Action",
        width: "110px",
        cell: (row) => (
          <button
            type="button"
            onClick={() => navigate(`/dashboard/inspection-report/${row._id}`)}
            className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
          >
            <FaEye />
          </button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Inspection Reports</h2>
              <p className="text-sm text-slate-500">
                {String(user?.role || "").toLowerCase() === "supervisor"
                  ? "Your submitted inspection reports"
                  : "All submitted inspection reports"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowFilterPopup(true)}
                className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <FaFilter />
                Filter
              </button>

              {String(user?.role || "").toLowerCase() === "supervisor" && (
                <Link
                  to="/dashboard/add-inspection-report"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  <FaPlus />
                  Add Inspection Report
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border bg-slate-50 px-3 py-3">
              <FaSearch className="text-slate-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                placeholder="Search title / supervisor / niswan / academic year"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={loadInspectionReports}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Search
            </button>
          </div>

          <div className="mb-3 text-sm font-semibold text-slate-600">
            Total Inspection Reports: <span className="text-slate-900">{rows.length}</span>
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={rows}
              progressPending={loading}
              striped
              highlightOnHover
              persistTableHead
            />
          </div>

          <div className="space-y-3 lg:hidden">
            {loading ? (
              <div className="rounded-xl border bg-slate-50 p-4 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-xl border bg-slate-50 p-4 text-center text-sm text-slate-500">
                No inspection reports found.
              </div>
            ) : (
              rows.map((row, index) => (
                <div key={row._id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">S.No</p>
                      <p className="font-semibold text-slate-800">{index + 1}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/inspection-report/${row._id}`)}
                      className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700"
                    >
                      View
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Title" value={row.title} />
                    <Info label="Report Date" value={formatDate(row.reportDate)} />
                    <Info label="Academic Year" value={row.acYear || "-"} />
                    <Info label="Supervisor" value={row.supervisorName || "-"} />
                    <Info label="Niswan" value={row.niswan || row.schoolName || "-"} />
                    <Info label="Attachments" value={String(row.attachments?.length || 0)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showFilterPopup ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
          onClick={() => setShowFilterPopup(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Filter Inspection Reports</h3>
              <button
                type="button"
                onClick={() => setShowFilterPopup(false)}
                className="rounded px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Academic Year">
                <input
                  value={filters.acYear}
                  onChange={(e) => setFilters((prev) => ({ ...prev, acYear: e.target.value }))}
                  placeholder="2025-2026"
                  className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
                />
              </Field>

              <div />

              <Field label="From Date">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                  className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="To Date">
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                  className="w-full rounded-xl border bg-slate-50 px-3 py-3 text-sm outline-none"
                />
              </Field>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    q: "",
                    acYear: "",
                    fromDate: "",
                    toDate: "",
                  });
                }}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFilterPopup(false);
                  loadInspectionReports();
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}