import React from "react";
import { getFormattedDate } from "../../utils/CommonHelper";

const EmployeeProfilePrint = ({ employee }) => {
  const safeValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "object") {
      return value?.name || value?.nameEnglish || value?.label || value?._id || "-";
    }

    return value;
  };

  const todayFormatted = () => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSchoolName = () => {
    if (employee?.schoolId?.nameEnglish) {
      return `${employee?.schoolId?.code || ""}${
        employee?.schoolId?.code ? " : " : ""
      }${employee.schoolId.nameEnglish}`;
    }
    return "-";
  };

  const SectionTable = ({ title, rows }) => (
    <div className="mt-4">
      <div className="bg-gray-200 border border-gray-500 px-2 py-1 font-bold uppercase">
        {title}
      </div>

      <table className="w-full border-collapse text-[12px]">
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${title}-${index}`}>
              <td className="w-[34%] border border-t-0 border-r border-gray-300 bg-gray-50 px-2 py-2 align-middle font-semibold leading-normal">
                {row.label}
              </td>
              <td className="border border-t-0 border-gray-300 px-2 py-2 align-middle leading-normal break-words">
                {safeValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="print-page w-full max-w-[210mm] min-h-[297mm] bg-white mx-auto p-[12mm] text-[12px] text-gray-900">
      {/* Header */}
      <div className="border-b-2 border-gray-700 pb-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-[18%] align-middle">
                <img
                  src="/school-logo.png"
                  alt="School Logo"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/school-logo.png";
                  }}
                />
              </td>

              <td className="w-[57%] align-middle text-center">
                <h1 className="text-[20px] font-bold uppercase tracking-wide leading-tight">
                  UNIS Academy
                </h1>
                <p className="text-[11px] mt-1">Employee Management</p>
                <p className="text-[16px] font-semibold mt-2 uppercase">
                  Employee Profile Report
                </p>
              </td>

              <td className="w-[25%] align-middle text-right">
                <img
                  src={
                    employee?.userId?.profileImage && employee.userId.profileImage !== ""
                      ? employee.userId.profileImage
                      : "/avatar.png"
                  }
                  alt="Employee"
                  className="w-24 h-28 object-cover border border-gray-400 inline-block"
                  onError={(e) => {
                    e.currentTarget.src = "/avatar.png";
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Meta */}
      <table className="w-full border-collapse mt-4 text-[12px]">
        <tbody>
          <tr>
            <td className="w-1/2 border border-gray-400 px-2 py-2 align-middle">
              <p>
                <span className="font-semibold">Generated Date:</span>{" "}
                {todayFormatted()}
              </p>
              <p>
                <span className="font-semibold">Employee ID:</span>{" "}
                {safeValue(employee?.employeeId)}
              </p>
            </td>
            <td className="w-1/2 border border-gray-400 px-2 py-2 align-middle">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {safeValue(employee?.userId?.name)}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {safeValue(employee?.userId?.email)}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <SectionTable
        title="Basic Information"
        rows={[
          { label: "Name", value: employee?.userId?.name },
          { label: "Email", value: employee?.userId?.email },
          { label: "Employee ID", value: employee?.employeeId },
          { label: "Niswan Name", value: getSchoolName() },
          { label: "Contact Number", value: employee?.contactNumber },
          { label: "Address", value: employee?.address },
        ]}
      />

      <SectionTable
        title="Personal Information"
        rows={[
          { label: "Qualification", value: employee?.qualification },
          { label: "Date of Birth", value: getFormattedDate(employee?.dob) },
          { label: "Gender", value: employee?.gender },
          { label: "Marital Status", value: employee?.maritalStatus },
        ]}
      />

      <SectionTable
        title="Employment Information"
        rows={[
          { label: "Date of Joining", value: getFormattedDate(employee?.doj) },
          { label: "Salary", value: employee?.salary },
          { label: "Designation / More Details", value: employee?.designation },
        ]}
      />

      {/* Footer */}
      <div className="mt-8 pt-2 border-t border-gray-400 text-center text-[10px] text-gray-700">
        <p>UNIS Academy - Employee Profile Report</p>
        <p>Generated on {todayFormatted()}</p>
      </div>
    </div>
  );
};

export default EmployeeProfilePrint;