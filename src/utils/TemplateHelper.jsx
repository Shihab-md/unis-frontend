import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

const getTemplateModuleLabel = (row) => {
  if (row.templateModule === "MARKSHEET") {
    return row.marksheetType === "CONSOLIDATED" ? "Consolidated Marksheet" : "Normal Marksheet";
  }
  return "Certificate";
};

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Template Type",
    selector: (row) => getTemplateModuleLabel(row),
    sortable: true,
    width: "190px",
    cell: (row) => (
      <div className="py-1">
        <div className="font-semibold text-blue-700">{getTemplateModuleLabel(row)}</div>
        <div className="text-[11px] text-slate-500">{row.templateModule === "MARKSHEET" ? row.marksheetType : "CERTIFICATE"}</div>
      </div>
    ),
  },
  {
    name: "Course",
    selector: (row) => `${row.code || ""} ${row.name || ""}`,
    sortable: true,
    width: "340px",
    cell: (row) => (
      <div className="py-1 leading-6">
        <div><span className="font-semibold text-slate-500">Code:</span> <span className="font-bold text-blue-700">{row.code || "-"}</span></div>
        <div><span className="font-semibold text-slate-500">Name:</span> <span className="font-semibold text-slate-700">{row.name || "-"}</span></div>
      </div>
    ),
  },
  {
    name: "Details",
    selector: (row) => row.details,
    width: "250px",
    wrap: true,
  },
  {
    name: "Certificate Fees",
    selector: (row) => row.templateModule === "CERTIFICATE" ? Number(row.certificateFees ?? 75) : "-",
    sortable: true,
    width: "150px",
    cell: (row) => row.templateModule === "CERTIFICATE" ? Number(row.certificateFees ?? 75) : <span className="text-slate-400">-</span>,
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

export const getTemplates = async (id) => {
  let templates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `template/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      templates = Array.isArray(responnse.data.templates) ? responnse.data.templates : [];
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return Array.isArray(templates) ? templates : [];
};

export const getTemplatesFromCache = async (id) => {
  let templates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `template/fromCache/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      templates = Array.isArray(responnse.data.templates) ? responnse.data.templates : [];
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return Array.isArray(templates) ? templates : [];
};

export const getCertificateTemplatesFromCache = async () => {
  const templates = await getTemplatesFromCache();
  return templates.filter((template) => !template.templateModule || template.templateModule === "CERTIFICATE");
};

export const getMarksheetTemplatesFromCache = async (marksheetType = "NORMAL") => {
  const templates = await getTemplatesFromCache();
  return templates.filter((template) =>
    template.templateModule === "MARKSHEET" && String(template.marksheetType || "NORMAL") === String(marksheetType || "NORMAL")
  );
};

export const TemplateButtons = ({ Id, onTemplateDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {

    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `template/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onTemplateDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
        }
      }
    }
  };

  const { user } = useAuth();

  return (
    <div className="flex space-x-3 rounded-sm shadow-lg">
      <button
        className={getButtonStyle('View')}
        title="View Details"
        aria-label="View Details"
        onClick={() => navigate(`/dashboard/templates/${Id}`)}
      >
        <FaEye title="View Details" aria-label="View Details" className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        title="Edit"
        aria-label="Edit"
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/templates/edit/${Id}`)}
      >
        <FaEdit title="Edit" aria-label="Edit" className="m-1" />
      </button>
      <button
        className={getButtonStyle('Delete')}
        title="Delete"
        aria-label="Delete"
        disabled={user?.role === "guest"}
        onClick={() => handleDelete(Id)}
      >
        <FaTrashAlt title="Delete" aria-label="Delete" className="m-1" />
      </button>
    </div>
  );
};
