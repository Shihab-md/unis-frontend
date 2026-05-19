import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  getButtonStyle,
} from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const NiswanCountTable = ({ row }) => {
  const activeCount = toNumber(row.schoolActiveCount ?? row.niswanActiveCount);
  const inactiveCount = toNumber(row.schoolInactiveCount ?? row.niswanInactiveCount);

  const totalCount =
    toNumber(row.schoolsCount ?? row._schoolsCount ?? row.schoolCount) ||
    activeCount + inactiveCount;

  return (
    <div className="mt-3 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md mr-5 ml-5 md:mr-0 md:ml-0">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Niswans
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
        <table className="w-full text-left text-[11px]">
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1.5 text-slate-700">
                Active
              </td>
              <td className="w-16 px-3 py-1.5 text-right font-semibold text-emerald-700">
                {activeCount}
              </td>
            </tr>

            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1.5 text-slate-700">
                In-Active
              </td>
              <td className="w-16 px-3 py-1.5 text-right font-semibold text-rose-700">
                {inactiveCount}
              </td>
            </tr>

            <tr className="bg-gray-100">
              <td className="px-2 py-1.5 font-semibold text-pink-700">
                Total
              </td>
              <td className="w-16 px-3 py-1.5 text-right font-semibold text-pink-700">
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

              <tr className="bg-gray-100">
                <td className="px-2 py-1.5 font-semibold text-pink-700">
                  Total
                </td>

                <td className="px-3 py-1.5 text-right font-semibold text-pink-700">
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

// export const StudentCountTable = ({ row }) => {
//   const courses = Array.isArray(row.studentCountsByCourse)
//     ? row.studentCountsByCourse
//     : [];

//   const totalCount =
//     toNumber(row.studentCount) ||
//     courses.reduce((total, course) => total + toNumber(course.count), 0);

//   return (
//     <div className="mt-3 md:mt-1 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md mr-5 ml-5 md:mr-0 md:ml-0">
//       <div className="text-center text-[13px] font-semibold text-blue-600">
//         Students: {totalCount}
//       </div>

//       {courses.length > 0 ? (
//         <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
//           <table className="w-full text-left text-[11px]">
//             <thead className="bg-gray-100 text-pink-700">
//               <tr>
//                 <th className="px-2 py-1.5 font-semibold">Course</th>
//                 <th className="w-16 px-2 py-1.5 text-center font-semibold">
//                   Count
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100">
//               {courses.map((course, i) => (
//                 <tr key={i} className="hover:bg-sky-50/60">
//                   <td className="px-2 py-1.5 text-slate-700 break-words">
//                     {course.courseName || "-"}
//                   </td>

//                   <td className="px-3 py-1.5 text-right font-semibold text-sky-700">
//                     {course.count ?? 0}
//                   </td>
//                 </tr>
//               ))}

//               <tr className="bg-gray-100">
//                 <td className="px-2 py-1.5 font-semibold text-pink-700">
//                   Total
//                 </td>

//                 <td className="px-3 py-1.5 text-right font-semibold text-pink-700">
//                   {totalCount}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ) : null}
//     </div>
//   );
// };
export const StudentCountTable = ({ row }) => {
  const courses = Array.isArray(row.studentCountsByCourse)
    ? row.studentCountsByCourse
    : [];

  const uniqueStudentCount = toNumber(row.studentCount);

  const courseTotalCount =
    toNumber(row.studentCourseCount) ||
    courses.reduce((total, course) => total + toNumber(course.count), 0);

  return (
    <div className="mt-3 md:mt-1 rounded-md border border-pink-200 bg-white/75 p-1 shadow-lg mr-5 ml-5 md:mr-0 md:ml-0">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Students: {uniqueStudentCount}
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

              <tr className="bg-gray-100">
                <td className="px-2 py-1.5 font-semibold text-pink-700">
                  Course wise Total
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

export const columns = [
  {
    name: "#",
    selector: (row) => row.sno,
    width: "50px",
  },
  {
    name: "Supervisor details",
    selector: (row) => (
      <div className="mt-2 mb-2">
        <p className="mb-2">
          <span className="text-blue-700 mr-1">🆔:</span> {row.supId}
        </p>
        <p>
          <span className="text-blue-700 mr-1">👤:</span> {row.name}
        </p>
      </div>
    ),
    sortable: true,
    width: "240px",
    wrap: true,
  },
  {
    name: "Contact",
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
          {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}
        </p>
        <p className="mb-1.5">
          <span className="text-blue-700 mr-1">🗓️:</span>{" "}
          {row.doj ? new Date(row.doj).toLocaleDateString("en-GB") : "-"}
        </p>
        <p>
          <span className="text-blue-700 mr-1">🗺️:</span>{" "}
          {row.routeName ? row.routeName !== "Nil" ? row.routeName : "-" : "-"}
        </p>
      </div>
    ),
    width: "230px",
    wrap: true,
  },
  {
    name: "Niswans",
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
    name: "Employees",
    selector: (row) => (
      <div className="w-full py-1">
        <EmployeeCountTable row={row} />
      </div>
    ),
    width: "200px",
    wrap: true,
  },
  {
    name: "Students",
    selector: (row) => (
      <div className="w-full py-2">
        <StudentCountTable row={row} />
      </div>
    ),
    width: "250px",
    wrap: true,
  },
  {
    name: "Status",
    selector: (row) => (
      <div className="mt-2 mb-2">
        {row.active === "Active" ? (
          <p className="mb-2">
            <span className="text-blue-700 mr-1">✅:</span> {row.active}
          </p>
        ) : (
          <p className="mb-2">
            <span className="text-blue-700 mr-1">❎:</span> {row.active}
          </p>
        )}

        <p>
          <span className="text-blue-700 mr-1">💼:</span> {row.jobType}
        </p>
      </div>
    ),
    width: "120px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
    width: "200px",
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
            <h3 className="text-xs font-semibold text-slate-800 break-words leading-5">
              {row.name || "-"}
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
              🆔: {row.supId || "-"}
            </p>

            <p className="text-[11px] text-slate-500 mt-0.5 break-words">
              @: {row.email || "-"}
            </p>
          </div>

          <div className="flex flex-col gap-1 items-end shrink-0">
            <span
              className={`inline-flex rounded-md border shadow-lg px-2 py-1 text-[10px] font-medium ${statusClass}`}
            >
              {row.active || "-"}
            </span>

            <span
              className={`inline-flex rounded-md border shadow-lg px-2 py-1 text-[10px] font-medium ${typeClass}`}
            >
              {row.jobType || "-"}
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
        </div>

        <NiswanCountTable row={row} />
        <StudentCountTable row={row} />
        <EmployeeCountTable row={row} />

        <div className="flex pt-2 items-center justify-center">
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

  const { user } = useAuth();

  return (
    <div className="flex space-x-3 rounded-sm">
      {user.role === "superadmin" || user.role === "hquser" ? (
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
        </div>
      ) : null}
    </div>
  );
};