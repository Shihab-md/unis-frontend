import React from "react";
import { getFormattedDate } from "../../utils/CommonHelper";

const StudentProfilePrint = ({ student }) => {
  const safeValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "object") {
      return value?.name || value?.acYear || value?._id || "-";
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
    if (student?.schoolId?.nameEnglish) {
      return `${student?.schoolId?.code || ""}${student?.schoolId?.code ? " : " : ""
        }${student.schoolId.nameEnglish}`;
    }
    return "-";
  };

  const getDistrictState = () => {
    if (student?.districtStateId?.district || student?.districtStateId?.state) {
      return `${student?.districtStateId?.district || ""}${student?.districtStateId?.district && student?.districtStateId?.state
          ? ", "
          : ""
        }${student?.districtStateId?.state || ""}`;
    }
    return "-";
  };

  const getAcademicYear = (item) => safeValue(item?.acYear?.acYear);

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

  const renderAcademicRows = () => {
    const rows = [];

    if (Array.isArray(student?._academics)) {
      student._academics.forEach((item, index) => {
        for (let i = 1; i <= 5; i += 1) {
          const institute = item?.[`instituteId${i}`]?.name;
          const course = item?.[`courseId${i}`]?.name;
          const year = item?.[`year${i}`];
          const status = item?.[`status${i}`];
          const finalFees = item?.[`finalFees${i}`];

          if (institute || course || year || status || finalFees) {
            rows.push(
              <tr key={`${item?._id || index}-${i}`}>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {getAcademicYear(item)}
                </td>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {safeValue(institute)}
                </td>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {safeValue(course)}
                </td>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {safeValue(year)}
                </td>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {safeValue(status)}
                </td>
                <td className="border border-gray-400 px-2 py-2 align-middle leading-normal">
                  {safeValue(finalFees)}
                </td>
              </tr>
            );
          }
        }
      });
    }

    if (rows.length === 0) {
      rows.push(
        <tr key="no-academic">
          <td
            colSpan="6"
            className="border border-gray-400 px-2 py-3 text-center align-middle"
          >
            No academic details available
          </td>
        </tr>
      );
    }

    return rows;
  };

  return (
    <div className="print-page w-full max-w-[210mm] min-h-[297mm] bg-white mx-auto p-[12mm] text-[12px] text-gray-900">
      {/* Header */}
      <div className="border-b-2 border-gray-700 pb-3">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-[18%] align-middle">
                <img
                  src={student?.schoolId?.logo || "/school-logo.png"}
                  alt="School Logo"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/school-logo.png";
                  }}
                />
              </td>

              <td className="w-[57%] align-middle text-center">
                <h1 className="text-[20px] font-bold uppercase tracking-wide leading-tight">
                  {student?.schoolId?.nameEnglish || "UNIS Academy"}
                </h1>
                <p className="text-[11px] mt-1">
                  {student?.schoolId?.code
                    ? `School Code: ${student.schoolId.code}`
                    : ""}
                </p>
                <p className="text-[16px] font-semibold mt-2 uppercase">
                  Student Profile Report
                </p>
              </td>

              <td className="w-[25%] align-middle text-right">
                <img
                  src={
                    student?.userId?.profileImage &&
                      student.userId.profileImage !== ""
                      ? student.userId.profileImage
                      : "/avatar.png"
                  }
                  alt="Student"
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
                <span className="font-semibold">Roll Number:</span>{" "}
                {safeValue(student?.rollNumber)}
              </p>
            </td>
            <td className="w-1/2 border border-gray-400 px-2 py-2 align-middle">
              <p>
                <span className="font-semibold">Student Name:</span>{" "}
                {safeValue(student?.userId?.name)}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {safeValue(student?.active)}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <SectionTable
        title="Basic Information"
        rows={[
          { label: "Niswan Name (English)", value: getSchoolName() },
          { label: "Roll Number", value: student?.rollNumber },
          { label: "Name", value: student?.userId?.name },
          { label: "Date of Admission", value: getFormattedDate(student?.doa) },
          { label: "Date of Birth", value: getFormattedDate(student?.dob) },
          { label: "Status", value: student?.active },
          { label: "Remarks", value: student?.remarks },
        ]}
      />

      <SectionTable
        title="Personal Information"
        rows={[
          { label: "Gender", value: student?.gender },
          { label: "Marital Status", value: student?.maritalStatus },
          { label: "Mother Tongue", value: student?.motherTongue },
          { label: "Blood Group", value: student?.bloodGroup },
          { label: "Identification Mark 1", value: student?.idMark1 },
          { label: "Identification Mark 2", value: student?.idMark2 },
          { label: "About Student", value: student?.about },
        ]}
      />

      <SectionTable
        title="Family / Guardian Information"
        rows={[
          { label: "Father's Name", value: student?.fatherName },
          { label: "Father's Number", value: student?.fatherNumber },
          { label: "Father's Occupation", value: student?.fatherOccupation },
          { label: "Mother's Name", value: student?.motherName },
          { label: "Mother's Number", value: student?.motherNumber },
          { label: "Mother's Occupation", value: student?.motherOccupation },
          { label: "Guardian's Name", value: student?.guardianName },
          { label: "Guardian's Number", value: student?.guardianNumber },
          { label: "Guardian's Occupation", value: student?.guardianOccupation },
          { label: "Guardian's Relationship", value: student?.guardianRelation },
        ]}
      />

      <SectionTable
        title="Address Information"
        rows={[
          { label: "Address", value: student?.address },
          { label: "Area & Town / City", value: student?.city },
          { label: "Landmark", value: student?.landmark },
          { label: "Pincode", value: student?.pincode },
          { label: "State & District", value: getDistrictState() },
        ]}
      />

      <SectionTable
        title="Hostel Information"
        rows={[
          { label: "Hostel Admission", value: student?.hostel },
          { label: "Hostel Reference Number", value: student?.hostelRefNumber },
          { label: "Hostel Fees", value: student?.hostelFees },
        ]}
      />

      {/* Academic */}
      <div className="mt-4">
        <div className="bg-gray-200 border border-gray-500 px-2 py-1 font-bold uppercase">
          Academic Details
        </div>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Academic Year
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Institute
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Course
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Year
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Status
              </th>
              <th className="border border-gray-400 px-2 py-2 text-left align-middle">
                Final Fees
              </th>
            </tr>
          </thead>
          <tbody>{renderAcademicRows()}</tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-2 border-t border-gray-400 text-center text-[10px] text-gray-700">
        <p>UNIS Academy - Student Profile Report</p>
        <p>Generated on {todayFormatted()}</p>
      </div>
    </div>
  );
};

export default StudentProfilePrint;