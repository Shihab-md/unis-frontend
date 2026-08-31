import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  getButtonStyle,
} from "../utils/CommonHelper";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatAmount = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const formatYearText = (years) => {
  const yearCount = toNumber(years);
  if (yearCount <= 0) return "-";
  return `${yearCount} ${yearCount === 1 ? "Year" : "Years"}`;
};

export const getCourseSubjects = (course = {}) => {
  const subjects = [];

  for (let i = 1; i <= 10; i++) {
    const name = String(course?.[`subject${i}`] || "").trim();
    const code = String(course?.[`subject${i}Code`] || "").trim();
    const maxMark = course?.[`subject${i}MaxMark`];
    const passMark = course?.[`subject${i}PassMark`];

    if (name) {
      subjects.push({
        subjectNo: i,
        code: code || "-",
        name,
        maxMark:
          maxMark === undefined || maxMark === null || maxMark === ""
            ? "-"
            : maxMark,
        passMark:
          passMark === undefined || passMark === null || passMark === ""
            ? "-"
            : passMark,
      });
    }
  }

  return subjects;
};

const getEducationTypeClass = (type = "") => {
  const normalizedType = String(type || "").trim();

  if (normalizedType === "Deeniyath Education") {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }

  if (normalizedType === "Islamic Home Science") {
    return "bg-pink-50 text-pink-700 border-pink-200";
  }

  if (normalizedType === "School Education") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (normalizedType === "College Education") {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }

  if (normalizedType === "Teacher Training") {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
};

export const CourseSubjectTable = ({ row }) => {
  const subjects = getCourseSubjects(row);

  return (
    <div className="mt-2 rounded-md border border-pink-200 bg-white/75 p-1 shadow-lg">
      <div className="text-center text-[12px] font-semibold text-blue-600">
        No. of Subjects: {subjects.length}
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 mx-1 mt-1 mb-1">
        <table className="w-full text-left text-[11px] md:text-[12px]">
          <thead className="bg-gray-100 text-pink-700">
            <tr>
              <th className="px-2 py-1 font-semibold">Code</th>
              <th className="px-2 py-1 font-semibold">Name</th>
              <th className="w-14 px-2 py-1 text-right font-semibold">Max</th>
              <th className="w-14 px-2 py-1 text-right font-semibold">Pass</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <tr key={subject.subjectNo} className="hover:bg-sky-50/60">
                  <td className="px-2 py-1 font-semibold text-sky-700 break-words">
                    {subject.code || "-"}
                  </td>
                  <td className="px-2 py-1 text-slate-700 break-words">
                    {subject.name || "-"}
                  </td>
                  <td className="px-2 py-1 text-right font-semibold text-slate-700">
                    {subject.maxMark ?? "-"}
                  </td>
                  <td className="px-2 py-1 text-right font-semibold text-slate-700">
                    {subject.passMark ?? "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-2 text-center text-[11px] text-slate-500"
                >
                  No subjects added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const columns = [
  {
    name: "S No.",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Course",
    selector: (row) => (
      <div className="my-2 flex flex-col gap-1.5">
        <p className="text-[12px] leading-5 text-slate-600">
          <span className="font-semibold text-blue-700">Code:</span>{" "}
          <span className="font-semibold text-slate-800">{row.code || "-"}</span>
        </p>

        <p className="text-[12px] leading-5 text-slate-600 break-words">
          <span className="font-semibold text-purple-700">Name:</span>{" "}
          <span className="text-[13px] font-semibold text-slate-800">
            {row.name || "-"}
          </span>
        </p>
      </div>
    ),
    sortable: true,
    sortFunction: (a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || "")),
    width: "270px",
    wrap: true,
  },
  {
    name: "Education Type",
    selector: (row) => (
      <div className="my-2 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] leading-5 text-slate-600">
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-sm ${getEducationTypeClass(
              row.type
            )}`}
          >
            {row.type || "-"}
          </span>
        </div>
      </div>
    ),
    sortable: true,
    sortFunction: (a, b) =>
      String(a?.name || "").localeCompare(String(b?.name || "")),
    width: "180px",
    wrap: true,
  },
  {
    name: "Fees",
    selector: (row) => formatAmount(row?.fees),
    width: "120px",
  },
  {
    name: "Years",
    selector: (row) => formatYearText(row?.years),
    width: "120px",
  },
  {
    name: "Subjects",
    selector: (row) => (
      <div className="w-full py-1 mb-3">
        <CourseSubjectTable row={row} />
      </div>
    ),
    width: "520px",
    wrap: true,
  },
  {
    name: "Actions",
    selector: (row) => row.action,
    center: "true",
    width: "190px",
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
  const typeClass = getEducationTypeClass(row.type);

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-3 pt-1 pb-2 mt-1 space-y-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-1.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/75" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex flex-col gap-1.5">
            <p className="text-[11px] leading-5 text-slate-500">
              <span className="font-semibold text-blue-700">Code:</span>{" "}
              <span className="font-semibold text-slate-800">{row.code || "-"}</span>
            </p>

            <h3 className="text-sm font-semibold text-slate-800 break-words leading-5">
              <span className="text-purple-700">Name:</span>{" "}
              {row.name || "-"}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] leading-5 text-slate-500">
              <span className="font-semibold text-slate-600">Type:</span>
              <span
                className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-xl ${typeClass}`}
              >
                {row.type || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <span className="text-slate-500">Fees:</span>{" "}
            <span className="font-medium text-slate-800">
              {formatAmount(row.fees)}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Years:</span>{" "}
            <span className="font-medium text-slate-800">
              {formatYearText(row.years)}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-500">Remarks:</span>{" "}
            <span className="font-medium text-slate-800 break-words line-clamp-2">
              {row.remarks || "-"}
            </span>
          </div>
        </div>

        <CourseSubjectTable row={row} />

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
    const result = await showConfirmationSwalAlert(
      "Are you sure to Delete?",
      "",
      "question"
    );

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
    }
  };

  const { user } = useAuth();

  return (
    <div className="flex space-x-3">
      <button
        className={getButtonStyle("View")}
        title="View Details"
        aria-label="View Details"
        onClick={() => navigate(`/dashboard/courses/${Id}`)}
      >
        <FaEye title="View Details" aria-label="View Details" className="m-1" />
      </button>
      <button
        className={getButtonStyle("Edit")}
        title="Edit"
        aria-label="Edit"
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/courses/edit/${Id}`)}
      >
        <FaEdit title="Edit" aria-label="Edit" className="m-1" />
      </button>
      <button
        className={getButtonStyle("Delete")}
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
