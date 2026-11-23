import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  getButtonStyle,
} from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../auth/permissions';
import { UiText, useLanguage } from '../i18n/LanguageContext';
import { translateUiPhrase } from '../i18n/uiPhrases';
import { formatAge, formatWorkingExperience } from './supervisorProfileUtils';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const CompactDateDuration = ({ value, formatter }) => {
  const { tr } = useLanguage();

  if (!value) return <span>-</span>;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span>-</span>;

  return (
    <span className="inline-flex flex-col align-top">
      <span>{date.toLocaleDateString("en-GB")}</span>
      <span className="mt-0.5 text-[10px] font-normal leading-tight text-slate-500">
        ({formatter(value, tr)})
      </span>
    </span>
  );
};

export const columns = [
  {
    name: "#",
    selector: (row) => row.sno,
    width: "50px",
  },
  {
    name: <UiText text="Supervisor details" />,
    selector: (row) => (
      <div className="mt-2 mb-2">
        <p className="mb-2">
          <span className="text-blue-700 mr-1">🆔:</span> {row.supId}
        </p>
        <p className="mt-4 font-semibold text-purple-600">
          <span></span> {row.name}
        </p>
      </div>
    ),
    sortable: true,
    width: "240px",
    wrap: true,
  },
  {
    name: <UiText text="Contact" />,
    selector: (row) => (
      <div className="mt-2 mb-2">
        <p className="mb-1.5">
          <span className="text-blue-700 mr-1">📱:</span> {row.contactNumber}
        </p>
        <p className="mb-1.5">
          <span className="text-blue-700 mr-1 drop-shadow-xl">@ :</span> {row.email}
        </p>
        <p className="mb-1.5">
          <span className="text-blue-700 mr-1">🎂:</span>{" "}
          <CompactDateDuration value={row.dob} formatter={formatAge} />
        </p>
        <p className="mb-1.5">
          <span className="text-blue-700 mr-1">🗓️:</span>{" "}
          <CompactDateDuration value={row.doj} formatter={formatWorkingExperience} />
        </p>
        <p>
          <span className="text-blue-700 mr-1">🗺️:</span>{" "}
          {row.routeName ? row.routeName !== "Nil" ? row.routeName : "-" : "-"}
        </p>
      </div>
    ),
    width: "210px",
    wrap: true,
  },
  {
    name: <UiText text="Niswans" />,
    selector: (row) => (
      <div className="w-full py-1">
        <NiswanCountTable row={row} />
      </div>
    ),
    sortable: true,
    width: "190px",
    wrap: true,
  },
  {
    name: <UiText text="Employees" />,
    selector: (row) => (
      <div className="w-full py-1">
        <EmployeeCountTable row={row} />
      </div>
    ),
    width: "230px",
    wrap: true,
  },
  {
    name: <UiText text="Students" />,
    selector: (row) => (
      <div className="w-full py-2">
        <StudentCountTable row={row} />
      </div>
    ),
    width: "320px",
    wrap: true,
  },
  {
    name: <UiText text="Status" />,
    selector: (row) => (
      <div className="mt-2 mb-2">
        {row.active === "Active" ? (
          <p className="mb-2">
            <span className="text-blue-700 mr-1">✅:</span> <UiText text={row.active} />
          </p>
        ) : (
          <p className="mb-2">
            <span className="text-blue-700 mr-1">❎:</span> <UiText text={row.active} />
          </p>
        )}

        <p>
          <span className="text-blue-700 mr-1">💼:</span> <UiText text={row.jobType} />
        </p>
      </div>
    ),
    width: "140px",
  },
  {
    name: <UiText text="Action" />,
    selector: (row) => row.action,
    center: "true",
    width: "100px",
  },
];

export const conditionalRowStyles = [
  {
    when: row => row.active,
    style: row => ({
      color: row.active == 'In-Active' ? 'red' : 'black',
      '&:hover': {
        color: row.active == 'In-Active' ? 'red' : 'black',
      },
    }),
  }
];

export const NiswanCountTable = ({ row }) => {
  const activeCount = toNumber(row.schoolActiveCount ?? row.niswanActiveCount);
  const inactiveCount = toNumber(row.schoolInactiveCount ?? row.niswanInactiveCount);

  const totalCount =
    toNumber(row.schoolsCount ?? row._schoolsCount ?? row.schoolCount) ||
    activeCount + inactiveCount;

  return (
    <div className="mt-2 rounded-md bg-white/75 p-1">
      <div className="text-center text-[12px] font-semibold text-blue-600">
        {translateUiPhrase("Niswans")}
      </div>

      <div className="overflow-hidden rounded-sm border border-slate-300 bg-white/80 mx-1 mt-1 mb-1">
        <table className="w-full text-left text-[12px] md:text-[12px]">
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1 text-slate-700">{translateUiPhrase("Active")}</td>
              <td className="w-10 px-2 py-1 text-right font-semibold text-emerald-700">
                {activeCount}
              </td>
            </tr>

            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1 text-slate-700">{translateUiPhrase("In-Active")}</td>
              <td className="w-10 px-2 py-1 text-right font-semibold text-rose-700">
                {inactiveCount}
              </td>
            </tr>

            <tr className="bg-gray-100">
              <td className="px-2 py-1 font-semibold text-pink-700">{translateUiPhrase("Total")}</td>
              <td className="w-10 px-2 py-1 text-right font-semibold text-pink-700">
                {totalCount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const EmployeeCountTable = ({ row }) => {
  const roles = Array.isArray(row.employeeCountsByRole)
    ? row.employeeCountsByRole
    : [];

  const totalCount =
    toNumber(row.employeeCount) ||
    roles.reduce((total, role) => total + toNumber(role.count), 0);

  return (
    <div className="mt-2 rounded-md bg-white/75 p-1 mb-1">
      <div className="text-center text-[12px] font-semibold text-blue-600">
        {translateUiPhrase("Employees")}
      </div>

      {roles.length > 0 ? (
        <div className="overflow-hidden rounded-sm border border-slate-300 bg-white/80 mx-1 mt-1 mb-1">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-gray-100 text-pink-700">
              <tr>
                <th className="px-2 py-1 font-semibold">{translateUiPhrase("Role")}</th>
                <th className="w-14 px-2 py-1 text-right font-semibold">
                  {translateUiPhrase("Count")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {roles.map((role, i) => (
                <tr key={i} className="hover:bg-sky-50/60">
                  <td className="px-2 py-1 text-slate-700 break-words">
                    {translateUiPhrase(role.role || "-")}
                  </td>

                  <td className="w-14 px-2 py-1 text-right font-semibold text-sky-700">
                    {role.count ?? 0}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-100">
                <td className="px-2 py-1 font-semibold text-pink-700">
                  {translateUiPhrase("Total")}
                </td>

                <td className="w-10 px-2 py-1 text-right font-semibold text-pink-700">
                  {totalCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export const StudentCountTable = ({ row }) => {
  const courses = Array.isArray(row.studentCountsByCourse)
    ? row.studentCountsByCourse
    : [];

  const uniqueStudentCount = toNumber(row.studentCount);

  const courseTotalCount =
    toNumber(row.studentCourseCount) ||
    courses.reduce((total, course) => total + toNumber(course.count), 0);

  return (
    <div className="mt-3 md:mt-1 rounded-md bg-white/75 p-1 mr-3 ml-3 md:mr-0 md:ml-0">
      <div className="text-center text-[12px] font-semibold text-blue-600">
        {translateUiPhrase("Students")}: {uniqueStudentCount}
      </div>

      {courses.length > 0 ? (
        <div className="overflow-hidden rounded-sm border border-slate-300 bg-white/80 ml-2 mr-2 mt-1 mb-1">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-gray-100 text-pink-700">
              <tr>
                <th className="px-2 py-1.5 font-semibold">{translateUiPhrase("Course")}</th>
                <th className="w-16 px-2 py-1.5 text-center font-semibold">
                  {translateUiPhrase("Count")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {courses.map((course, i) => (
                <tr key={i} className="hover:bg-sky-50/60">
                  <td className="px-2 py-1.5 text-slate-700 break-words">
                    {course.courseName || "-"}
                  </td>

                  <td className="px-3 py-1.5 text-right font-semibold text-sky-700">
                    {course.count ?? 0}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-100">
                <td className="px-2 py-1.5 font-semibold text-pink-700">
                  {translateUiPhrase("Course wise Total")}
                </td>

                <td className="px-3 py-1.5 text-right font-semibold text-pink-700">
                  {courseTotalCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

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
    <div
      className="relative overflow-hidden rounded-md border border-blue-100 bg-slate-50 shadow-xl p-3 pb-2 space-y-2 
      hover:-translate-y-0.5 bg-[url(/c-3.jpg)] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/65" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h3 className="text-[13px] font-semibold text-purple-600 break-words leading-5 mb-3">
              {row.name || "-"}
            </h3>

            <p className="text-[12px] text-slate-500 mt-0.5">
              🆔: {row.supId || "-"}
            </p>

            <p className="text-[12px] text-slate-500 mt-0.5 break-words">
              @: {row.email || "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1 items-end shrink-0">
            <span
              className={`inline-flex rounded-md border shadow-lg px-2 py-1 text-[12px] font-medium ${statusClass}`}
            >
              <UiText text={row.active || "-"} />
            </span>

            <span
              className={`inline-flex rounded-md border shadow-lg px-2 py-1 text-[12px] font-medium ${typeClass}`}
            >
              <UiText text={row.jobType || "-"} />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2 text-xs">
          <div>
            <span className="text-slate-500">📱:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.contactNumber || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🗺️:</span>{" "}
            <span className="text-slate-800">
              {row.routeName && row.routeName !== "Nil" ? row.routeName : "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🎂:</span>{" "}
            <span className="font-xs text-slate-800">
              <CompactDateDuration value={row.dob} formatter={formatAge} />
            </span>
          </div>

          <div>
            <span className="text-slate-500">🗓️:</span>{" "}
            <span className="font-xs text-slate-800">
              <CompactDateDuration value={row.doj} formatter={formatWorkingExperience} />
            </span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 items-start p-0">
          <div className="min-w-0">
            <NiswanCountTable row={row} />
          </div>
          <div className="min-w-0">
            <EmployeeCountTable row={row} />
          </div>
        </div>
        <StudentCountTable row={row} />

        <div className="flex mt-1 pt-2 items-center justify-center">
          {row.action || <SupervisorButtons Id={row._id} />}
        </div>
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
    const result = await showConfirmationSwalAlert(
      'Are you sure to Delete?',
      '',
      'question'
    );

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

          if (typeof onSupervisorDelete === "function") {
            onSupervisorDelete();
          }
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
        }
      }
    }
  };

  const { can } = useAuth();

  return (
    <div className="flex space-x-3 rounded-sm">
      {(can(PERMISSIONS.SUPERVISOR_VIEW) || can(PERMISSIONS.SUPERVISOR_EDIT) || can(PERMISSIONS.SUPERVISOR_DELETE)) ? (
        <div className="flex space-x-3 lg:flex-col lg:space-x-0 lg:space-y-3 items-center">
          {can(PERMISSIONS.SUPERVISOR_VIEW) ? (
            <button
              className={getButtonStyle('View')}
              title={translateUiPhrase("View Details")}
              aria-label={translateUiPhrase("View Details")}
              onClick={() => navigate(`/dashboard/supervisors/${Id}`)}
            >
              <FaEye title={translateUiPhrase("View Details")} aria-label={translateUiPhrase("View Details")} className="m-1" />
            </button>
          ) : null}

          {can(PERMISSIONS.SUPERVISOR_EDIT) ? (
            <button
              className={getButtonStyle('Edit')}
              title={translateUiPhrase("Edit")}
              aria-label={translateUiPhrase("Edit")}
              onClick={() => navigate(`/dashboard/supervisors/edit/${Id}`)}
            >
              <FaEdit title={translateUiPhrase("Edit")} aria-label={translateUiPhrase("Edit")} className="m-1" />
            </button>
          ) : null}

          {can(PERMISSIONS.SUPERVISOR_DELETE) ? (
            <button
              className={getButtonStyle('Delete')}
              title={translateUiPhrase("Delete")}
              aria-label={translateUiPhrase("Delete")}
              onClick={() => handleDelete(Id)}
            >
              <FaTrashAlt title={translateUiPhrase("Delete")} aria-label={translateUiPhrase("Delete")} className="m-1" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};