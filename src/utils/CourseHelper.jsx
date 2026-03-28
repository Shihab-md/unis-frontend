import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Code",
    selector: (row) => row.code,
    sortable: true,
    width: "100px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "320px",
    wrap: true,
  },
  {
    name: "Education Type",
    selector: (row) => row.type,
    sortable: true,
    width: "230px",
  },
  {
    name: "Remarks",
    selector: (row) => row.remarks,
    width: "250px",
    wrap: true,
  },
  {
    name: "Fees",
    selector: (row) => row.fees,
    width: "100px",
  },
  {
    name: "Years",
    selector: (row) => row.years,
    width: "100px",
  },
  {
    name: "No. of Subjects",
    selector: (row) => row.subjectsCount,
    width: "120px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// courses for salary form
export const getCourses = async (id) => {
  let courses;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `course/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      courses = responnse.data.courses;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return courses;
};

export const CourseCard = ({ row, onCourseDelete }) => {
  const typeClass =
    row.type === "Deeniyath Education"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : row.type === "Islamic Home Science"
        ? "bg-pink-50 text-pink-700 border-pink-200"
        : row.type === "School Education"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : row.type === "College Education"
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-3 pt-1 pb-2 mt-1 space-y-2 transition-all 
      duration-200 hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-15.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/80" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 break-words leading-5">
              {row.name || "-"}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Code: {row.code || "-"}
            </p>
          </div>

          <div className="shrink-0">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-xl ${typeClass}`}
            >
              {row.type || "-"}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
          <div>
            <span className="text-slate-500">Fees:</span>{" "}
            <span className="font-medium text-slate-800">
              ₹ {Number(row.fees || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Years:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.years ?? 0}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Subjects:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.subjectsCount ?? 0}
            </span>
          </div>

          <div className="col-span-3">
            <span className="text-slate-500">Remarks:</span>{" "}
            <span className="font-medium text-slate-800 break-words  line-clamp-2">
              {row.remarks || "-"}
            </span>
          </div>
        </div>

        <div className="flex pt-2 items-center justify-center">
          <CourseButtons Id={row._id} onCourseDelete={onCourseDelete} />
        </div>
      </div>
    </div>
  );
};

export const getCoursesFromCache = async (id) => {
  let courses;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `course/fromCache/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      courses = responnse.data.courses;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return courses;
};

export const CourseButtons = ({ Id, onCourseDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onCourseDelete();
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
      <button
        className={getButtonStyle('View')}
        onClick={() => navigate(`/dashboard/courses/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/courses/edit/${Id}`)}
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
    </div>
  );
};
