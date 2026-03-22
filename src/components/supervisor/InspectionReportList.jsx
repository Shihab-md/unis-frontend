import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { fetchInspectionReports } from "../../api/inspectionReportApi";
import {
  handleRightClickAndFullScreen,
  getSpinner,
  checkAuth,
  LinkIcon,
  showSwalAlert,
  getFilterGif, getButtonStyle,
} from "../../utils/CommonHelper";
import { useAuth } from "../../context/AuthContext";

const getUserFromLocal = () => {
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
  return d.toLocaleDateString("en-GB");
};

const customStyles = {
  headCells: {
    style: {
      fontWeight: "500",
      fontSize: "13px",
      color: "#475569",
      backgroundColor: "#f8fafc",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "13px",
      backgroundColor: "#ffffff",
    },
    stripedStyle: {
      backgroundColor: "#f8fafc",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#eff6ff",
      transitionDuration: "0.15s",
      transitionProperty: "background-color",
      outlineStyle: "solid",
      outlineWidth: "0px",
    },
  },
  cells: {
    style: {
      color: "#334155",
    },
  },
};

export default function InspectionReportList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const localUser = getUserFromLocal();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (checkAuth("inspectionReportList") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
      return;
    }
    loadInspectionReports();
  }, []);

  const loadInspectionReports = async () => {
    try {
      setLoading(true);
      setFiltering(true);
      const res = await fetchInspectionReports(filters);
      setRows(res?.data || []);
    } catch (error) {
      showSwalAlert(
        "Error!",
        error?.response?.data?.message ||
        error.message ||
        "Failed to load inspection reports.",
        "error"
      );
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setFilters((prev) => ({ ...prev, q: searchValue }));

    const lowered = searchValue.toLowerCase();
    const filtered = (rows || []).filter((row) =>
      row.title?.toLowerCase().includes(lowered) ||
      row.supervisorName?.toLowerCase().includes(lowered) ||
      row.supervisorId?.toLowerCase().includes(lowered) ||
      row.schoolCode?.toLowerCase().includes(lowered) ||
      row.schoolName?.toLowerCase().includes(lowered)
    );

    if (!searchValue.trim()) {
      loadInspectionReports();
    } else {
      setRows(filtered);
    }
  };

  const applyFilters = async () => {
    setShowFilterPopup(false);
    await loadInspectionReports();
  };

  const resetFilters = async () => {
    const emptyFilters = {
      q: "",
      fromDate: "",
      toDate: "",
    };
    setFilters(emptyFilters);
    setShowFilterPopup(false);

    try {
      setLoading(true);
      setFiltering(true);
      const res = await fetchInspectionReports(emptyFilters);
      setRows(res?.data || []);
    } catch (error) {
      showSwalAlert(
        "Error!",
        error?.response?.data?.message ||
        error.message ||
        "Failed to load inspection reports.",
        "error"
      );
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        width: "70px",
        cell: (_, index) => <span>{index + 1}</span>,
      },
      {
        name: "Supervisor",
        width: "340px",
        wrap: true,
        selector: (row) => <div>
          <p className="text-blue-500">{row.supervisorId}</p>
          <p>{row.supervisorName}</p>
        </div>,
      },
      {
        name: "Report Date",
        width: "140px",
        selector: (row) => formatDate(row.reportDate),
      },
      {
        name: "Title",
        wrap: true,
        width: "340px",
        cell: (row) => (
          <div className="py-2">
            <p className="text-slate-800">{row.title}</p>
          </div>
        ),
      },
      {
        name: "Niswan",
        width: "370px",
        wrap: true,
        selector: (row) =>
          <div>
            <p className="text-blue-500">{row.schoolCode}</p>
            <p>{row.schoolName}</p>
          </div>,
      },
      {
        name: "Action",
        width: "110px",
        cell: (row) => (
          <button
            onClick={() => navigate(`/dashboard/inspection-report/${row._id}`)}
            className={getButtonStyle('View')}
          >
            <FaEye className="text-lg m-0.5"/>
          </button>
        ),
      },
    ],
    [navigate]
  );

  if (loading && !rows.length) {
    return getSpinner();
  }

  return (
    <div className="mt-1 p-5 lg:mt-5">
      <div className="text-center">
        <h3 className="text-base lg:text-2xl font-bold px-5 py-0 text-shadow-lg text-gray-600">
          Inspection Reports
          <p className="flex md:grid text-xs md:text-base justify-center text-rose-700">
            (Records Count : {rows ? rows.length : 0})
          </p>
        </h3>
      </div>

      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className="w-full text-md flex justify-center items-center pl-2 rounded-l-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              onChange={handleSearch}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        <div className="mr-3" onClick={() => setShowFilterPopup(true)}>
          {LinkIcon("#", "Filter")}
        </div>

        {String(user?.role || localUser?.role || "").toLowerCase() === "supervisor"
          ? LinkIcon("/dashboard/add-inspection-report", "Add")
          : null}
      </div>

      {(filters.fromDate || filters.toDate) ? (
        <div className="grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center">
          <p className="lg:mr-3 justify-center text-center">Filter Applied: </p>

          {filters.fromDate ? (
            <p className="lg:ml-3">
              <span className="text-blue-500">
                From Date: <span className="text-gray-500">{filters.fromDate}</span>
              </span>
            </p>
          ) : null}

          {filters.toDate ? (
            <p className="lg:ml-3">
              <span className="text-blue-500">
                To Date: <span className="text-gray-500">{filters.toDate}</span>
              </span>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex mt-3 lg:mt-7"></div>
      )}

      {filtering ? (
        getFilterGif()
      ) : (
        <div className="mt-3 lg:mt-5 rounded-lg shadow-lg">
          <DataTable
            columns={columns}
            data={rows}
            highlightOnHover
            striped
            responsive
            persistTableHead
            customStyles={customStyles}
          />
        </div>
      )}

      {showFilterPopup ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3"
          onClick={() => setShowFilterPopup(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-2xl bg-[url(/bg_card.png)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">Filter Inspection Reports</h3>
              <button
                type="button"
                onClick={() => setShowFilterPopup(false)}
                className="rounded px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                onClick={resetFilters}
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
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