import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  getButtonStyle,
} from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext'
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const StudentCountTable = ({ row }) => {
  const courses = Array.isArray(row.studentCountsByCourse)
    ? row.studentCountsByCourse
    : [];

  const totalCount =
    toNumber(row.studentCount) ||
    courses.reduce((total, course) => total + toNumber(course.count), 0);

  return (
    <div className="mt-3 md:mt-1 mb-1 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md mr-5 ml-5 md:mr-0 md:ml-0">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Students: {totalCount}
      </div>

      {courses.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-100 text-pink-700">
              <tr>
                <th className="px-2 py-1.5 font-semibold">Course</th>
                <th className="w-16 px-2 py-1.5 text-center font-semibold">
                  Count
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
            </tbody>
          </table>
        </div>
      ) : null}
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
    <div className="mt-3 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md mr-5 ml-5 md:mr-0 md:ml-0">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Employees: {totalCount}
      </div>

      {roles.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-100 text-pink-700">
              <tr>
                <th className="px-2 py-1.5 font-semibold">Role</th>
                <th className="w-16 px-2 py-1.5 text-center font-semibold">
                  Count
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {roles.map((role, i) => (
                <tr key={i} className="hover:bg-sky-50/60">
                  <td className="px-2 py-1.5 text-slate-700 break-words">
                    {role.role || "-"}
                  </td>

                  <td className="px-3 py-1.5 text-right font-semibold text-sky-700">
                    {role.count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export const columns = [
  {
    name: "S.No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Niswan details",
    selector: (row) => (
      <div className="mt-2 mb-2">
        <p className="mb-1">
          <span className="text-blue-700 mr-2">Code:</span> {row.code}
        </p>
        <p className="mb-1">
          <span className="text-blue-700"></span> {row.name}
        </p>
        <p className='mb-1 text-lg font-["Noto_Naskh_Arabic"]'>
          <span className='text-blue-700'></span> {row.nameArabic}
        </p>
        <p>
          <span className="text-blue-700"></span> {row.nameNative}
        </p>
      </div>
    ),
    sortable: true,
    wrap: true,
    width: "320px",
  },
  {
    name: "Address",
    selector: (row) => (
      <div className="mt-2 mb-2">
        <p className="mb-1 text-fuchsia-500 font-semibold">{row.address}</p>
        <p className="mb-1">{row.city}</p>
        <p className='mb-1'>{row.landmark}</p>
        <p>{row.districtState}</p>
      </div>
    ),
    wrap: true,
    width: "190px",
  },
  {
    name: "Details",
    selector: (row) => (
      <div className="mt-2 mb-2">
        {row.active === "Active" ? (
          <p className="mb-1">
            <span className="text-blue-700 mr-1">✅:</span> {row.active}
          </p>
        ) : (
          <p className="mb-1">
            <span className="text-blue-700 mr-1">❎:</span> {row.active}
          </p>
        )}

        <p className="mb-1">
          <span className="text-blue-700 mr-1">👤:</span> {row.incharge1}
        </p>
        <p>
          <span className="text-blue-700 mr-1">📱:</span> {row.incharge1Number}
        </p>
        <p className="mt-5 mb-1">
          <span className="text-blue-700 mr-1">Supervisor</span>
        </p>
        <p>
          <span className="text-blue-700 mr-1">🆔:</span> {row.supervisorId}
        </p>
        <p>{row.supervisorName}</p>
      </div>
    ),
    wrap: true,
    width: "270px",
  },
  {
    name: "Employees",
    selector: (row) => (
      <div className="w-full py-1">
        <EmployeeCountTable row={row} />
      </div>
    ),
    wrap: true,
    width: "210px",
  },
  {
    name: "Students",
    selector: (row) => (
      <div className="w-full py-1">
        <StudentCountTable row={row} />
      </div>
    ),
    wrap: true,
    width: "240px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
    width: "190px",
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

export const SchoolCard = ({ row, onSchoolDelete }) => {
  const statusClass =
    row.active === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-2 transition-all duration-200 
      hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-11.jpg')] bg-center"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/85" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-blue-700 break-words leading-5">
              {row.code || "-"}
            </h3>

            <h3 className="flex text-xs mt-0.5 font-semibold text-slate-800">
              {row.name || "-"}
            </h3>

            {row.nameArabic ? (
              <p className='mt-1 text-base font-["Noto_Naskh_Arabic"] text-slate-800'>
                {row.nameArabic}
              </p>
            ) : null}

            {row.nameNative ? (
              <p className="mt-0.5 text-[11px] text-slate-600">
                {row.nameNative}
              </p>
            ) : null}
          </div>

          <div className="shrink-0">
            <span
              className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium shadow-lg ${statusClass}`}
            >
              {row.active || "-"}
            </span>
          </div>
        </div>

        <div className="col-span-2 text-xs mt-3">
          <span className="text-slate-500">📍:</span>{" "}
          <span className="font-xs text-slate-500 break-words">
            {row.address ? (
              <span className="font-semibold text-blue-700">{row.address}</span>
            ) : (
              "-"
            )}
            {[row.city, row.landmark, row.districtState].filter(Boolean).length > 0
              ? `${row.address ? ", " : ""}${[row.city, row.landmark, row.districtState]
                .filter(Boolean)
                .join(", ")}`
              : ""}
          </span>
        </div>

        <div className="mt-3 grid gap-x-3 gap-y-2 text-xs">
          <div>
            <p className="text-medium font-semibold text-slate-600 mb-1">
              Incharge:
            </p>
            <span className="text-slate-500">👤:</span>{" "}
            <span className="font-xs text-slate-500">
              {row.incharge1 || "-"}
            </span>
            <span className="text-slate-500 ml-3">📱:</span>{" "}
            <span className="font-xs text-slate-500">
              {row.incharge1Number || "-"}
            </span>
          </div>

          <div>
            <p className="text-medium font-semibold text-slate-600 mb-1">
              Supervisor:
            </p>
            <span className="font-xs text-slate-500">
              {row.supervisorId && row.supervisorName
                ? `${row.supervisorId} : ${row.supervisorName}`
                : "-"}
            </span>
          </div>
        </div>

        <StudentCountTable row={row} />
        <EmployeeCountTable row={row} />

        <div className="flex pt-3 items-center justify-center">
          {row.action || (
            <SchoolButtons Id={row._id} onSchoolDelete={onSchoolDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export const getSchools = async (id) => {
  let schools;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `school/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return schools;
};

export const getSchoolsFromCache = async (id) => {
  let schools;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `school/fromCache/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return schools;
};

export const SchoolButtons = ({ Id, onSchoolDelete }) => {
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
          (await getBaseUrl()).toString() + `school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");

          if (typeof onSchoolDelete === "function") {
            onSchoolDelete();
          }
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
        className={getButtonStyle('View')}
        onClick={() => navigate(`/dashboard/schools/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>

      {user.role === "superadmin" || user.role === "hquser" ? (
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Edit')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/schools/edit/${Id}`)}
          >
            <FaEdit className="m-1" />
          </button>
        </div>
      ) : null}

      {user.role === "superadmin" || user.role === "hquser" ? (
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Delete')}
            disabled={user?.role === "guest"}
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt className="m-1" />
          </button>
        </div>
      ) : null}
    </div>
  );
};