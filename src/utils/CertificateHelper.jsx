import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import { FaEye, } from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Sanadh Detail",
    selector: (row) => (<div className="mt-2 mb-2">
      <p className="mb-2">
        <span className="text-blue-700"></span> {row.sanadhName}
      </p>
      <p>
        <span className="text-blue-700"></span> {row.sanadhNo}
      </p>
    </div>),
    sortable: true,
    width: "190px",
  },
  {
    name: "Student Details",
    selector: (row) => (<div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-4">Roll Number:</span> {row.rollNumber}
      </p>
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Student Name:</span> {row.studentName}
      </p>
      <p>
        <span className="text-blue-700 mr-3">Parent / Guardian name:</span> {row.fatherName}
      </p>
    </div>),
    width: "430px",
  },
  {
    name: "Niswan",
    selector: (row) => (<div className="mt-2 mb-2">
      <p className="mb-1">{row.niswanCode}</p>
      <p className="mb-1">{row.niswanName}</p>
    </div>),
    wrap: true,
    width: "500px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

export const CertificateCard = ({ row, onCertificateDelete }) => {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-3 pt-1 pb-2 mt-1 space-y-2 transition-all 
      duration-200 hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-5.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-pink-700 break-words leading-5">
              {row.sanadhNo || "-"}
            </h3>
          </div>
          <span className="shrink-0 inline-flex">
            <CertificateButtons Id={row._id} onCertificateDelete={onCertificateDelete} />
          </span>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-y-1 text-xs">
          <div>
            <span className="text-slate-500">Roll Number:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.rollNumber || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Student Name:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.studentName || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Parent / Guardian:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.fatherName || "-"}
            </span>
          </div>

          <div className="pt-1 border-t border-slate-200/70">
            <p className="text-[12px] font-medium text-slate-800">Niswan</p>
            <p className="text-xs font-small text-slate-500">
              {row.niswanCode || "-"}
            </p>
            <p className="text-xs font-sm text-slate-500 break-words">
              {row.niswanName || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// certificates for salary form
export const getCertificates = async (id) => {
  let certificates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `certificate/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      certificates = responnse.data.certificates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return certificates;
};

export const CertificateButtons = ({ Id, onCertificateDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');
    if (confirm) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `certificate/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onCertificateDelete();
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
        onClick={() => navigate(`/dashboard/certificates/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className="px-5 py-1 m-1 bg-violet-600 text-xs text-teal-100 rounded-md shadow-md shadow-teal-200 hover:-translate-y-0.5"
        onClick={() => navigate(`/dashboard/certificates/reprint/${Id}`)}
      >
        Re-Print
      </button>
      <button
        className="px-5 py-1 m-1 bg-yellow-600 text-xs text-teal-100 rounded-md shadow-md shadow-teal-200 hover:-translate-y-0.5"
        onClick={() => navigate(`/dashboard/certificates/duplicate-print/${Id}`)}
      >
        Duplicate
      </button>
    </div>
  );
};
