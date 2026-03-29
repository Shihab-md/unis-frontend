import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle, getYearLabel } from '../utils/CommonHelper';
import { FaEye, FaEdit, FaTrashAlt, FaExchangeAlt } from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columnsSelect = [
  {
    name: "Roll Number",
    selector: (row) => `${row.rollNumber || "-"}`,
    width: "200px",
    cell: (row) => (
      <div className="py-2">
        <div className="font-semibold text-slate-800">
          {row.rollNumber || "-"}
        </div>

        {!row.canSelectCertificate ? (
          <div className="mt-1 text-xs font-medium text-red-600">
            {row.certificateBlockReason || "Certificate fee pending"}
          </div>
        ) : (
          <div className="mt-1 text-xs font-medium text-green-700">

          </div>
        )}
      </div>
    ),
  },
  {
    name: "Name",
    selector: (row) => `${row.userId?.name || "-"}`,
    width: "250px",
    cell: (row) => (
      <div className="py-2">
        <div className="font-semibold text-slate-800">
          {row.userId?.name || "-"}
        </div>
      </div>
    ),
  },
];

function getDetails(
  title,
  courseId,
  courseName,
  instituteName,
  refNumber,
  year,
  fees,
  status,
  acYearId,
  certificateFeeMap
) {
  const certKey =
    acYearId && courseId ? `${String(acYearId)}__${String(courseId)}` : "";

  const certInfo = certKey ? certificateFeeMap?.[certKey] : null;
  const certificateFee = Number(certInfo?.total || 0);

  const isCompleted = String(status || "") === "Completed";
  const displayFees = isCompleted && certificateFee > 0 ? certificateFee : Number(fees || 0);
  const feeLabel = isCompleted && certificateFee > 0 ? "Certificate Fees" : "Fees";

  return (
    <div className="mt-3 mb-5">
      <p className="text-md font-bold text-pink-500 mb-2">{title}</p>

      <p className="mb-1">
        {courseName}
        <span className="text-gray-300 font-bold ml-5 mr-5">|</span>
        {instituteName}
      </p>

      <p>
        {"Ref. No. : " + refNumber}
        <span className="text-gray-300 font-bold ml-5 mr-5">|</span>

        {year || year === 0 ? (
          <span>
            <span>Year : {year}</span>
            <span className="text-gray-300 font-bold ml-5 mr-5">|</span>
          </span>
        ) : null}

        {`${feeLabel} : ₹ ${displayFees.toLocaleString("en-IN")}`}
        <span className="text-gray-300 font-bold ml-5 mr-5">|</span>

        {"Status : "}<span className="text-blue-500 ml-1">{status}</span>
      </p>
    </div>
  );
}

export const columnsSelectForAcademic = [
  {
    name: <div className="text-sm font-bold text-lime-600">AC Year</div>,
    selector: (row) => row.acYear?.acYear,
    width: "95px",
  },
  {
    name: <div className="text-sm font-bold text-lime-600">Course Details</div>,
    selector: (row) => (
      <div>
        {row.courseId1
          ? getDetails(
            "Deeniyath Education",
            row.courseId1?._id,
            row.courseId1?.name,
            row.instituteId1?.name,
            row.refNumber1 ? row.refNumber1 : "-",
            row.year1,
            row.fees1,
            row.status1 ? row.status1 : "",
            row.acYear?._id,
            row._certificateFeeMap
          )
          : null}

        {row.courseId4
          ? getDetails(
            "Islamic Home Science",
            row.courseId4?._id,
            row.courseId4?.name,
            row.instituteId4?.name,
            row.refNumber4 ? row.refNumber4 : "-",
            null,
            row.fees4,
            row.status4 ? row.status4 : "",
            row.acYear?._id,
            row._certificateFeeMap
          )
          : null}

        {row.courseId2
          ? getDetails(
            "School Education",
            row.courseId2?._id,
            row.courseId2?.name,
            row.instituteId2?.name,
            row.refNumber2 ? row.refNumber2 : "-",
            null,
            row.fees2,
            row.status2 ? row.status2 : "",
            row.acYear?._id,
            row._certificateFeeMap
          )
          : null}

        {row.courseId3
          ? getDetails(
            "College Education",
            row.courseId3?._id,
            row.courseId3?.name,
            row.instituteId3?.name,
            row.refNumber3 ? row.refNumber3 : "-",
            row.year3,
            row.fees3,
            row.status3 ? row.status3 : "",
            row.acYear?._id,
            row._certificateFeeMap
          )
          : null}

        {row.courseId5
          ? getDetails(
            "Vocational Course",
            row.courseId5?._id,
            row.courseId5?.name,
            row.instituteId5?.name,
            row.refNumber5 ? row.refNumber5 : "-",
            null,
            row.fees5,
            row.status5 ? row.status5 : "",
            row.acYear?._id,
            row._certificateFeeMap
          )
          : null}
      </div>
    ),
    width: "700px",
    wrap: true,
  },
];

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Student details",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1"><span className="text-blue-700 mr-1">Roll No:</span> {row.rollNumber}</p>
      <p className="mb-1"><span className="text-blue-700 mr-1">Name:</span> {row.name}</p>
      <p className="mb-1"><span className="text-blue-700 mr-1">Parent / Guardian:</span> {row.fatherName}</p>
      <p><span className="text-blue-700 mr-1">Ref:</span> {row.about}</p>
    </div>,
    //  sortable: true,
    width: "360px",
  },
  {
    name: "Address",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">{row.address}</p>
      <p className="mb-1">{row.city}</p>
      <p>{row.district}</p>
    </div>,
    wrap: true,
    width: "250px",
  },
  {
    name: "Details",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1"><span className="text-blue-700">📱:</span> {row.contactNumber}</p>
      <p className="mb-1"><span className="text-blue-700">🎀:</span> {row.gender}</p>
      <p className="mb-1"><span className="text-blue-700">🎂:</span> {row.dob ? new Date(row.dob).toLocaleDateString("en-GB") : "-"}</p>
      <p><span className="text-blue-700">🗓️:</span> {row.doa ? new Date(row.doa).toLocaleDateString("en-GB") : "-"}</p>
    </div>,
    //  sortable: true,
    width: "140px",
  },
  {
    name: "Course",
    width: "280px",
    wrap: true,
    selector: row => (
      <div className="mt-2 mb-2">
        <div className="mt-2 mb-2">
          {row.courses?.length ? (
            row.courses.map((course, i) => (
              <div className="mb-2" key={course._id || i}>
                <span className="text-blue-700">{`${i + 1}.`}</span> {`${course.name}`}
                {Number(course.years) > 0 ? ` (${getYearLabel(course.years)})` : ""}
              </div>
            ))
          ) : (
            <div>-</div>
          )}
        </div>
      </div>
    ),
  },
  {
    name: "Status",
    //selector: (row) => row.active,
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1"><span className="text-blue-700 mr-1">Status:</span> {row.active}</p>
      <p className="mb-1"><span className="text-blue-700 mr-1">Married:</span> {row.maritalStatus}</p>
      <p><span className="text-blue-700 mr-1">Hosteler:</span> {row.hostel}</p>
    </div>,
    //  sortable: true,
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
      color: row.active == 'In-Active' ? 'red' : row.active == 'Transferred' ? 'blue' : 'black',
      '&:hover': {
        //		cursor: 'pointer',
        color: row.active == 'In-Active' ? 'red' : row.active == 'Transferred' ? 'blue' : 'black',
      },
    }),
  }
];

export const StudentCard = ({ row, onStudentDelete }) => {
  const statusClass =
    row.active === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : row.active === "Transferred"
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sky-100 shadow-lg p-2 mt-1 transition-all duration-200 
      hover:-translate-y-0.5 hover:shadow-xl bg-[url('/c-12.jpg')] bg-center bg-no-repeat"
      style={{ backgroundSize: "100% 100%" }}
    >
      {/* overlay for readability */}
      <div className="absolute inset-0 bg-white/75" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-pink-800 break-words leading-5 mb-1">
              {row.name || "-"}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Roll No: {row.rollNumber || "-"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 break-words">
              Ref: {row.about || "-"}
            </p>
          </div>

          <div className="shrink-0">
            <span
              className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium shadow-lg ${statusClass}`}
            >
              {row.active || "-"}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div className="col-span-2">
            <span className="text-slate-500">👤 Parent:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.fatherName || "-"}
            </span>
            <span className="text-slate-500 ml-3">📱:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.contactNumber || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🎀:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.gender || "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">💍:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.maritalStatus || "-"}
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
              {row.doa ? new Date(row.doa).toLocaleDateString("en-GB") : "-"}
            </span>
          </div>

          <div>
            <span className="text-slate-500">🏠 Hosteler:</span>{" "}
            <span className="font-medium text-slate-800">
              {row.hostel || "-"}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-slate-500">📍:</span>{" "}
            <span className="font-medxsium text-slate-500 break-words">
              {[row.address, row.city, row.district].filter(Boolean).join(", ") || "-"}
            </span>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-pink-200 bg-white/70 p-2 shadow-lg">
          <p className="text-xs font-semibold text-slate-700 mb-1">Courses</p>

          {Array.isArray(row.courses) && row.courses.length > 0 ? (
            <div className="space-y-1">
              {row.courses.map((course, i) => (
                <p key={course._id || i} className="text-[11px] text-slate-700 leading-4">
                  <span className="text-sky-700 font-medium mr-1">{i + 1}.</span>
                  {course.name || "-"}
                  {Number(course.years) > 0 ? ` (${getYearLabel(course.years)})` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">-</p>
          )}
        </div>

        <div className="flex pt-2 items-center justify-center">
          <StudentButtons Id={row._id} onStudentDelete={onStudentDelete} />
        </div>
      </div>
    </div>
  );
};

// students for salary form
export const getStudents = async (id) => {
  let students;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `student/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      students = responnse.data.students;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return students;
};

export const getStudentsBySchool = async (schoolId) => {
  let studentsBySchool;
  try {

    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `student/bySchoolId/${schoolId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(responnse)
    if (responnse.data.success) {
      studentsBySchool = responnse.data.students;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }

  return studentsBySchool;
};

export const getStudentsBySchoolAndCourse = async (schoolId, templateId) => {
  let studentsBySchoolAndCourse;
  try {

    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `student/bySchoolIdAndCourse/${schoolId}/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(responnse)
    if (responnse.data.success) {
      studentsBySchoolAndCourse = responnse.data.students;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }

  return studentsBySchoolAndCourse;
};

export const StudentButtons = ({ Id, onStudentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {

    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `student/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onStudentDelete();
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
        onClick={() => navigate(`/dashboard/students/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/students/edit/${Id}`)}
      >
        <FaEdit className="m-1" />
      </button>
      {/*{user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Promote')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/students/promote/${Id}`)}
          >
            <FaUserCheck className="m-1" />
          </button> </div> : null}*/}
      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Transfer')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`#`)}
          >
            <FaExchangeAlt className="m-1" />
          </button> </div> : null}
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
