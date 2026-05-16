import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getBaseUrl,
  showSwalAlert,
  showConfirmationSwalAlert,
  getButtonStyle,
} from './CommonHelper';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext';

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getEmployeeTotals = (row) => {
  const roles = Array.isArray(row.employeeCountsByRole)
    ? row.employeeCountsByRole
    : [];

  const activeTotal = roles.reduce(
    (total, role) => total + toNumber(role.activeCount),
    0
  );

  const inactiveTotal = roles.reduce(
    (total, role) => total + toNumber(role.inactiveCount),
    0
  );

  const total = roles.reduce(
    (totalValue, role) =>
      totalValue + toNumber(role.totalCount ?? role.count),
    0
  );

  return {
    activeTotal: activeTotal || toNumber(row.employeeActiveCount),
    inactiveTotal: inactiveTotal || toNumber(row.employeeInactiveCount),
    total: total || toNumber(row.employeeCount),
  };
};

const getStudentTotals = (row) => {
  const courses = Array.isArray(row.studentCountsByCourse)
    ? row.studentCountsByCourse
    : [];

  const activeTotal = courses.reduce(
    (total, course) => total + toNumber(course.activeCount),
    0
  );

  const inactiveTotal = courses.reduce(
    (total, course) => total + toNumber(course.inactiveCount),
    0
  );

  const alumniTotal = courses.reduce(
    (total, course) => total + toNumber(course.alumniCount),
    0
  );

  const total = courses.reduce(
    (totalValue, course) =>
      totalValue + toNumber(course.totalCount ?? course.count),
    0
  );

  return {
    activeTotal: activeTotal || toNumber(row.studentActiveCount),
    inactiveTotal: inactiveTotal || toNumber(row.studentInactiveCount),
    alumniTotal: alumniTotal || toNumber(row.studentAlumniCount),
    total: total || toNumber(row.studentCount),
  };
};

export const NiswanCountTable = ({ row }) => {
  const activeCount = toNumber(row.niswanActiveCount ?? row.activeSchoolCount);
  const inactiveCount = toNumber(row.niswanInactiveCount ?? row.inactiveSchoolCount);
  const totalCount = toNumber(row.niswanCount ?? row.schoolCount ?? row._schoolsCount)
    || activeCount + inactiveCount;

  return (
    <div className="mt-3 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Niswans
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
        <table className="w-full text-left text-[11px]">
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1.5 text-slate-700">Active</td>
              <td className="px-3 py-1.5 text-right font-semibold text-emerald-700">
                {activeCount}
              </td>
            </tr>

            <tr className="hover:bg-sky-50/60">
              <td className="px-2 py-1.5 text-slate-700">In-Active</td>
              <td className="px-3 py-1.5 text-right font-semibold text-rose-700">
                {inactiveCount}
              </td>
            </tr>

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
    </div>
  );
};

export const EmployeeCountTable = ({ row }) => {
  const employeeTotals = getEmployeeTotals(row);

  return (
    <div className="mt-3 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Employees
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-gray-100 text-pink-700">
            <tr>
              <th className="px-2 py-1.5 font-semibold">Role</th>
              <th className="w-14 px-1 py-1.5 text-right font-semibold">
                Active
              </th>
              <th className="w-16 px-1 py-1.5 text-right font-semibold">
                In-Active
              </th>
              <th className="w-14 px-1 py-1.5 text-right font-semibold">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {Array.isArray(row.employeeCountsByRole) &&
              row.employeeCountsByRole.map((role, i) => {
                const activeCount = toNumber(role.activeCount);
                const inactiveCount = toNumber(role.inactiveCount);
                const totalCount =
                  toNumber(role.totalCount ?? role.count) ||
                  activeCount + inactiveCount;

                return (
                  <tr key={i} className="hover:bg-sky-50/60">
                    <td className="px-2 py-1.5 text-slate-700 break-words">
                      {role.role || "-"}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-emerald-700">
                      {activeCount}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-rose-700">
                      {inactiveCount}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-sky-700">
                      {totalCount}
                    </td>
                  </tr>
                );
              })}

            <tr className="bg-gray-100">
              <td className="px-2 py-1.5 font-semibold text-pink-700">
                Total
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {employeeTotals.activeTotal}
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {employeeTotals.inactiveTotal}
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {employeeTotals.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StudentCountTable = ({ row }) => {
  const studentTotals = getStudentTotals(row);

  return (
    <div className="mt-3 rounded-md border border-pink-200 bg-white/75 p-1 shadow-md">
      <div className="text-center text-[13px] font-semibold text-blue-600">
        Students
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white/80 ml-2 mr-2 mt-1 mb-1">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-gray-100 text-pink-700">
            <tr>
              <th className="px-2 py-1.5 font-semibold">Course</th>
              <th className="w-14 px-1 py-1.5 text-right font-semibold">
                Active
              </th>
              <th className="w-16 px-1 py-1.5 text-right font-semibold">
                In-Active
              </th>
              <th className="w-14 px-1 py-1.5 text-right font-semibold">
                Alumni
              </th>
              <th className="w-14 px-1 py-1.5 text-right font-semibold">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {Array.isArray(row.studentCountsByCourse) &&
              row.studentCountsByCourse.map((course, i) => {
                const activeCount = toNumber(course.activeCount);
                const inactiveCount = toNumber(course.inactiveCount);
                const alumniCount = toNumber(course.alumniCount);
                const totalCount =
                  toNumber(course.totalCount ?? course.count) ||
                  activeCount + inactiveCount + alumniCount;

                return (
                  <tr key={i} className="hover:bg-sky-50/60">
                    <td className="px-2 py-1.5 text-slate-700 break-words">
                      {course.courseName || "-"}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-emerald-700">
                      {activeCount}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-rose-700">
                      {inactiveCount}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-sky-700">
                      {alumniCount}
                    </td>

                    <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                      {totalCount}
                    </td>
                  </tr>
                );
              })}

            <tr className="bg-gray-100">
              <td className="px-2 py-1.5 font-semibold text-pink-700">
                Total
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {studentTotals.activeTotal}
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {studentTotals.inactiveTotal}
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {studentTotals.alumniTotal}
              </td>

              <td className="px-1 py-1.5 text-right font-semibold text-pink-700">
                {studentTotals.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DistrictStateCard = ({ row }) => {
  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-2 mt-1 transition-all duration-200
      hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-12.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      <div className="absolute inset-0 bg-white/75" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-pink-800 break-words leading-5 mb-1">
              {row.district || "-"}
            </h3>

            <p className="mt-0.5 text-[11px] text-slate-500 break-words">
              State: {row.state || "-"}
            </p>
          </div>

          <span className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 shadow-lg">
            #{row.sno || "-"}
          </span>
        </div>

        <NiswanCountTable row={row} />
        <EmployeeCountTable row={row} />
        <StudentCountTable row={row} />

        <div className="flex pt-3 items-center justify-center">
          {row.action}
        </div>
      </div>
    </div>
  );
};

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "80px",
  },
  {
    name: "District / State",
    selector: (row) => (
      <div className="py-2">
        <p className="font-semibold text-slate-800">
          {row.district || "-"}
        </p>
        <p className="text-xs text-slate-500">
          {row.state || "-"}
        </p>
      </div>
    ),
    sortable: true,
    width: "220px",
  },
  {
    name: "Niswans",
    selector: (row) => (
      <div className="w-full py-2">
        <NiswanCountTable row={row} />
      </div>
    ),
    width: "210px",
    wrap: true,
  },
  {
    name: "Employees",
    selector: (row) => (
      <div className="w-full py-2">
        <EmployeeCountTable row={row} />
      </div>
    ),
    width: "340px",
    wrap: true,
  },
  {
    name: "Students",
    selector: (row) => (
      <div className="w-full py-2">
        <StudentCountTable row={row} />
      </div>
    ),
    width: "420px",
    wrap: true,
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
    width: "170px",
  },
];

// districtStates for salary form
export const getDistrictStates = async (id) => {
  let districtStates;

  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `districtState/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (responnse.data.success) {
      districtStates = responnse.data.districtStates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }

  return districtStates;
};

export const getDistrictStatesFromCache = async (id) => {
  let districtStates;

  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `districtState/fromCache`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (responnse.data.success) {
      districtStates = responnse.data.districtStates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }

  return districtStates;
};

export const DistrictStateButtons = ({ Id, onDistrictStateDelete }) => {
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
          (await getBaseUrl()).toString() + `districtState/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onDistrictStateDelete();
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
        onClick={() => navigate(`/dashboard/districtStates/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>

      <button
        className={getButtonStyle('Edit')}
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/districtStates/edit/${Id}`)}
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