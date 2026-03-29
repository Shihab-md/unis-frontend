import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext'
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Name",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1"><span className="text-blue-700 mr-1">🆔:</span> {row.empId}</p>
      <p><span className="text-blue-700 mr-1">👤:</span> {row.name}</p>
    </div>,
    sortable: true,
    width: "300px",
  },
  {
    name: "Role",
    selector: (row) => {
      const r = String(row?.role || "").trim();
      if (!r) return "-";
      return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
    },
    sortable: true,
    width: "110px",
  },
  {
    name: "Contact",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1"><span className="text-blue-700">📱:</span> {row.contactNumber}</p>
      <p className="mb-1"><span className="text-blue-700 mr-0.5 drop-shadow-xl">@ :</span> {row.email}</p>
      <p className="mb-1"><span className="text-blue-700">🎂:</span> {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}</p>
      <p><span className="text-blue-700">🗓️:</span> {row.doj ? new Date(row.doj).toLocaleDateString("en-GB") : "-"}</p>
    </div>,
    width: "270px",
  },
  {
    name: "Niswan",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-1">Code:</span> {row.schoolCode}
      </p>
      <p>{row.schoolName}</p>
    </div>,
    sortable: true,
    wrap: true,
    width: "430px",
  },
  {
    name: "Status",
    selector: (row) => <div className="mt-2 mb-2">
      {row.active === "Active" ?
        <p><span className="text-blue-700 mr-0.5">✅:</span> {row.active}</p>
        : <p><span className="text-blue-700 mr-0.5">❎:</span> {row.active}</p>}
    </div>,
    width: "110px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// employees for salary form
export const getEmployees = async (id) => {
  let employees;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `employee/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      employees = responnse.data.employees;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return employees;
};

export const conditionalRowStyles = [
  {
    when: row => row.active,
    style: row => ({
      //	backgroundColor: 'rgba(63, 195, 128, 0.9)',
      color: row.active == 'In-Active' ? 'red' : 'black',
      '&:hover': {
        //		cursor: 'pointer',
        color: row.active == 'In-Active' ? 'red' : 'black',
      },
    }),
  }
];

export const EmployeeCard = ({ row, onEmployeeDelete }) => {
  const statusClass =
    row.active === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const roleText = (() => {
    const r = String(row?.role || "").trim();
    if (!r) return "-";
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  })();

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-3 pt-1 pb-2 mt-1 space-y-2 transition-all duration-200 
      hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-4.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/40" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-violet-700 break-words leading-5">
              {row.name || "-"}
            </h3>
            <p className="mt-0.5 mt-1 text-[11px] text-slate-500">
              🆔: {row.empId || "-"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700 shadow-lg">
              {roleText}
            </span>
            <span
              className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium shadow-lg ${statusClass}`}
            >
              {row.active || "-"}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div className="col-span-2">
            <span className="text-slate-500">📱:</span>{" "}
            <span className="font-xs text-slate-500">
              {row.contactNumber || "-"}
            </span>
            <span className="text-slate-500 ml-3">   @:</span>{" "}
            <span className="font-xs text-slate-500 break-all">
              {row.email || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🎂:</span>{" "}
            <span className="font-xs text-slate-500">
              {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🗓️:</span>{" "}
            <span className="font-xs text-slate-500">
              {row.doj ? new Date(row.doj).toLocaleDateString("en-GB") : "-"}
            </span>
          </div>

          <div className="col-span-2">
            <p className="text-slate-800">Niswan:</p>{" "}
            <span className="font-xs text-slate-500 break-words">
              {row.schoolCode ? `${row.schoolCode} - ` : ""}
              {row.schoolName || "-"}
            </span>
          </div>
        </div>

        <div className="flex pt-2 items-center justify-center">
          <EmployeeButtons Id={row._id} onEmployeeDelete={onEmployeeDelete} />
        </div>
      </div>
    </div>
  );
};

export const EmployeeButtons = ({ Id, onEmployeeDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onEmployeeDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
        }
      }
      //  } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Swal.fire('Cancelled', 'Your file is safe!', 'error');
      // Handle cancellation logic (optional)
    }
  };

  const { user } = useAuth();

  return (
    <div className="flex space-x-3">
      {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('View')}
            onClick={() => navigate(`/dashboard/employees/${Id}`)}
          >
            <FaEye className="m-1" />
          </button>
        </div> : null}

      {user.role === "superadmin" || user.role === "supervisor" || user.role === "admin" ?
        <div className="flex space-x-4">
          <button
            className={getButtonStyle('Edit')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/employees/edit/${Id}`)}
          >
            <FaEdit className="m-1" />
          </button>
          <button
            className={getButtonStyle('Delete')}
            disabled={user?.role === "guest"}
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt className="m-1" />
          </button>
        </div> : null}
    </div>
  );
};
