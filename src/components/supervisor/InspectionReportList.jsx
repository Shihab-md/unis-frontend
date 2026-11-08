import { openPreservedFilterPopup } from '../common/PreservedFilterPopup';
import { readPopupFilters, savePopupFilters } from '../../utils/popupFilterStorage';
import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { PERMISSIONS } from "../../auth/permissions";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";

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

function InspectionReportCard({ row, index, navigate, user, tr, direction, fontFamily }) {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-2 space-y-1 transition-all 
      duration-200 hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-16.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%", fontFamily }}
    >
      <div className="absolute inset-0 bg-white/85" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 break-words leading-5" dir="auto">
              {row.title || "-"}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500" dir={direction}>
              {tr("Report Date")}: {formatDate(row.reportDate)}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => navigate(`/dashboard/inspection-report/${row._id}`)}
              className={getButtonStyle("View")}
              title={tr("View Details")}
              aria-label={tr("View Details")}
            >
              <FaEye title={tr("View Details")} aria-label={tr("View Details")} className="text-base m-0.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-y-2 text-xs">
          {user.role != 'supervisor' ?
            <div>
              <p className="text-[11px] text-slate-500" dir={direction}>{tr("Supervisor")}</p>
              <p className="font-medium text-slate-800" dir="auto">{row.supervisorName || "-"}</p>
              <p className="text-[11px] text-sky-600" dir="auto">{row.supervisorId || "-"}</p>
            </div>
            : null}
          <div className="border-t border-slate-200/70 pt-2">
            <p className="text-[11px] text-slate-500" dir={direction}>{tr("Niswan")}</p>
            <p className="font-medium text-slate-800" dir="auto">{row.schoolName || "-"}</p>
            <p className="text-[11px] text-sky-600" dir="auto">{row.schoolCode || "-"}</p>
            <p className="text-[11px] text-slate-600" dir="auto">{row.districtState || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const POPUP_KEYS={q:'popupFilter:inspection:search',fromDate:'popupFilter:inspection:from',toDate:'popupFilter:inspection:to'};

export default function InspectionReportList() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { tr, direction, fontFamily } = useLanguage();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [filters,setFilters]=useState(() => readPopupFilters(POPUP_KEYS));
  const requestRef=useRef(0);

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  useEffect(() => {
    if (checkAuth("inspectionReportList") === "NO") {
      showSwalAlert(tr("Error!"), tr("User Authorization Failed!"), "error");
      navigate("/login");
      return;
    }
    loadInspectionReports();
  }, []);

  const loadInspectionReports = async (applied=filters) => {
    const request=++requestRef.current;
    try {
      setLoading(true);
      setFiltering(true);
      const res = await fetchInspectionReports(applied);
      if(request===requestRef.current)setRows(res?.data || []);
    } catch (error) {
      if(request!==requestRef.current)return;
      showSwalAlert(
        tr("Error!"),
        error?.response?.data?.message ||
        error.message ||
        tr("Failed to load inspection reports."),
        "error"
      );
    } finally {
      if(request===requestRef.current){setLoading(false);setFiltering(false);}
    }
  };

  const handleSearch = (event) => {
    const next={...filters,q:event.target.value};
    setFilters(next);savePopupFilters(POPUP_KEYS,next);loadInspectionReports(next);
  };
  const openFilterPopup=async()=>{
    const next=await openPreservedFilterPopup({
      fields:[{key:'fromDate',label:'From Date',type:'date'},{key:'toDate',label:'To Date',type:'date'},{key:'q',label:'Search',type:'text'}],
      values:filters,defaults:{q:'',fromDate:'',toDate:''},tr,direction,fontFamily,
    });
    if(!next)return;
    setFilters(next);savePopupFilters(POPUP_KEYS,next);await loadInspectionReports(next);
  };

  const columns = useMemo(
    () => [
      {
        name: tr("S.No"),
        width: "70px",
        cell: (_, index) => <span>{index + 1}</span>,
      },
      {
        name: tr("Supervisor"),
        width: "340px",
        wrap: true,
        selector: (row) => <div>
          <p className="text-blue-500">{row.supervisorId}</p>
          <p>{row.supervisorName}</p>
        </div>,
      },
      {
        name: tr("Report Date"),
        width: "140px",
        selector: (row) => formatDate(row.reportDate),
      },
      {
        name: tr("Title"),
        wrap: true,
        width: "340px",
        cell: (row) => (
          <div className="py-2">
            <p className="text-slate-800">{row.title}</p>
          </div>
        ),
      },
      {
        name: tr("Niswan"),
        width: "370px",
        wrap: true,
        selector: (row) =>
          <div>
            <p className="text-blue-500 mt-1 mb-1">{row.schoolCode}</p>
            <p className="mb-1">{row.schoolName}</p>
            {/*<p className='mb-1 text-lg font-["Noto_Naskh_Arabic"]'>{row.schoolNameArabic}</p>
            <p className="mb-1">{row.schoolNameNative}</p>*/}
            <p className="mb-2">{row.districtState}</p>
          </div>,
      },
      {
        name: tr("Action"),
        width: "110px",
        cell: (row) => (
          <button
            onClick={() => navigate(`/dashboard/inspection-report/${row._id}`)}
            className={getButtonStyle('View')}
            title={tr("View Details")}
            aria-label={tr("View Details")}
          >
            <FaEye title={tr("View Details")} aria-label={tr("View Details")} className="text-lg m-0.5" />
          </button>
        ),
      },
    ],
    [navigate, tr]
  );

  if (loading && !rows.length) {
    return getSpinner();
  }

  return (
    <div className="mt-1 p-3 lg:p-5 lg:mt-5" style={{ fontFamily }}>
      <div className="text-center">
        <AutoText
          as="h3"
          text={tr("Inspection Reports")}
          variant="heading"
          className="font-bold px-5 py-0 text-shadow-lg text-gray-600"
        />
        <p className="flex md:grid text-xs md:text-sm justify-center text-rose-700" style={{ fontFamily }} dir={direction}>
          ({tr("Records Count")} : {rows ? rows.length : 0})
        </p>
      </div>

      <div className="flex justify-between items-center mt-5">
        {LinkIcon("/dashboard", "Back")}

        <div className="w-3/4 lg:w-1/2 rounded flex lg:border lg:shadow-lg rounded-md justify-between items-center relative lg:bg-[url(/bg-img.jpg)]">
          <div className="w-full text-md flex justify-center items-center pl-2 rounded-l-md">
            <input
              type="text"
              placeholder={tr("Search")}
              className="w-full px-3 py-0.5 border rounded shadow-md justify-center ml-1 lg:ml-0 mr-3 lg:mr-0"
              value={filters.q}
              onChange={handleSearch}
            />
          </div>
          <div className="hidden lg:block p-1 mt-0.5 rounded-md items-center justify-center">
            {LinkIcon("#", "Search")}
          </div>
        </div>

        <div className="" onClick={openFilterPopup}>
          {LinkIcon("#", "Filter")}
        </div>

        {can(PERMISSIONS.INSPECTION_CREATE)
          ? LinkIcon("/dashboard/add-inspection-report", "Add")
          : null}
      </div>

      {(filters.fromDate || filters.toDate) ? (
        <div className="grid lg:flex mt-3 lg:mt-7 text-xs text-lime-600 items-center justify-center">
          <p className="lg:mr-3 justify-center text-center">{tr("Filter Applied")}: </p>

          {filters.fromDate ? (
            <p className="lg:ml-3">
              <span className="text-blue-500">
                {tr("From Date")}: <span className="text-gray-500">{filters.fromDate}</span>
              </span>
            </p>
          ) : null}

          {filters.toDate ? (
            <p className="lg:ml-3">
              <span className="text-blue-500">
                {tr("To Date")}: <span className="text-gray-500">{filters.toDate}</span>
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
        <>
          {/* Mobile / Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 lg:hidden">
            {rows.map((row, index) => (
              <InspectionReportCard
                key={row._id}
                row={row}
                index={index}
                navigate={navigate}
                user={user}
                tr={tr}
                direction={direction}
                fontFamily={fontFamily}
              />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block mt-3 lg:mt-5 rounded-lg shadow-lg">
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
        </>
      )}


    </div>
  );
}

