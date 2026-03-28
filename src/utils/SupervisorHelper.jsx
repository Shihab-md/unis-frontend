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
    name: "#",
    selector: (row) => row.sno,
    width: "50px",
  },
  {
    name: "Supervisor details",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-2"><span className="text-blue-700 mr-1">🆔:</span> {row.supId}</p>
      <p><span className="text-blue-700 mr-1">👤:</span> {row.name}</p>
    </div>,
    sortable: true,
    width: "430px",
  },
  {
    name: "Contact",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1.5"><span className="text-blue-700 mr-1">📱:</span> {row.contactNumber}</p>
      <p className="mb-1.5"><span className="text-blue-700 mr-1 drop-shadow-xl">@ :</span> {row.email}</p>
      <p className="mb-1.5"><span className="text-blue-700 mr-1">🎂:</span> {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}</p>
      <p className="mb-1.5"><span className="text-blue-700 mr-1">🗓️:</span> {row.doj ? new Date(row.doj).toLocaleDateString("en-GB") : "-"}</p>
      <p><span className="text-blue-700 mr-1">🗺️:</span> {row.routeName ? row.routeName !== "Nil" ? row.routeName : "-" : "-"}</p>
    </div>,
    width: "320px",
  },
  {
    name: "Niswans #",
    selector: (row) => row.schoolsCount,
    sortable: true,
    width: "120px",
  },
  {
    name: "Students #",
    //selector: (row) => row.studentCount,
    wrap: true,
    selector: row => (
      <div className="mt-2 mb-2">
        <p>
          <span className="font-semibold text-blue-700 mr-1">Total:</span> {row.studentCount}
        </p>
        <div className="mt-1 mb-2"></div>
        {row.studentCountsByCourse?.map((course, i) => (
          <div key={i}>
            <p className="mr-1 mb-1">
              <span className="text-pink-700">{course.courseName}{" : "}</span>
              <span>{course.count}</span>
            </p>
          </div>
        ))}
      </div>
    ),
    //  sortable: true,
    width: "160px",
  },
  {
    name: "Status",
    selector: (row) => <div className="mt-2 mb-2">
      {row.active === "Active" ?
        <p className="mb-2"><span className="text-blue-700 mr-1">✅:</span> {row.active}</p>
        : <p className="mb-2"><span className="text-blue-700 mr-1">❎:</span> {row.active}</p>}
      <p><span className="text-blue-700 mr-1">💼:</span> {row.jobType}</p>
    </div>,
    width: "160px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

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


export const SupervisorCard = ({ row }) => {
  const statusClass =
    row.active === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const typeClass =
    row.jobType === "Full-Time"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="rounded-md border border-blue-100 bg-slate-50 shadow-xl p-3 pb-2 space-y-2 hover:-translate-y-0.5 bg-[url(/c-2.jpg)] bg-contain bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h3 className="text-xs font-semibold text-slate-800 break-words leading-5">
            {row.name || "-"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            🆔: {row.supId || "-"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            @: {row.email || "-"}
          </p>
        </div>

        <div className="flex flex-col gap-1 items-end shrink-0 ">
          <span
            className={`inline-flex rounded-md border shadow-lg px-2 py-0.5 text-[10px] font-medium ${statusClass}`}
          >
            {row.active || "-"}
          </span>
          <span
            className={`inline-flex rounded-md border shadow-lg px-2 py-0.5 text-[10px] font-medium ${typeClass}`}
          >
            {row.jobType || "-"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <span className="text-slate-500">📱:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.contactNumber || "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-500">🗺️:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.routeName && row.routeName !== "Nil" ? row.routeName : "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-500">🎂:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-500">🗓️:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.doj ? new Date(row.doj).toLocaleDateString("en-GB") : "-"}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Niswans:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.schoolsCount ?? 0}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Students:</span>{" "}
          <span className="font-medium text-slate-800">
            {row.studentCount ?? 0}
          </span>
        </div>
      </div>

      <div className="flex pt-2 items-center justify-center">
        <SupervisorButtons Id={row._id} />
      </div>
    </div>
  );
};

// supervisors FromCache
export const getSupervisorsFromCache = async (id) => {
  let supervisors;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `supervisor/fromCache/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      supervisors = responnse.data.supervisors;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return supervisors;
};

// supervisors 
export const getSupervisors = async (id) => {
  let supervisors;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `supervisor/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      supervisors = responnse.data.supervisors;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return supervisors;
};

export const SupervisorButtons = ({ Id, onSupervisorDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {

    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onSupervisorDelete();
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
    <div className="flex space-x-3 rounded-sm ">
      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3 rounded-sm">
          <button
            className={getButtonStyle('View')}
            onClick={() => navigate(`/dashboard/supervisors/${Id}`)}
          >
            <FaEye className="m-1" />
          </button>
          <button
            className={getButtonStyle('Edit')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/supervisors/edit/${Id}`)}
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
