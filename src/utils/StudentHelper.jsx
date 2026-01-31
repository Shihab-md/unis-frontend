import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import { FaEye, FaUserCheck, FaEdit, FaTrashAlt, FaExchangeAlt } from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columnsSelect = [
  {
    name: "Students",
    selector: (row) => row.rollNumber + " : " + row.userId.name,
    width: "410px",
  },
];

function getDetails(title, courseName, instituteName, refNumber, year, fees, status) {
  return <div className="mt-3 mb-5">
    <p className='text-md font-bold text-pink-500 mb-2'>{title}</p>
    <p className='mb-1'>{courseName}<span className='text-gray-300 font-bold ml-5 mr-5'>|</span>{instituteName}</p>
    <p>{"Ref. No. : " + refNumber}<span className='text-gray-300 font-bold ml-5 mr-5'>|</span>
      {year || year === 0 ? <span><span>Year : {year}</span><span className='text-gray-300 font-bold ml-5 mr-5'>|</span></span> : null}
      {"Fees : " + fees}<span className='text-gray-300 font-bold ml-5 mr-5'>|</span>
      {"Status : " + status}</p>
  </div>
}

export const columnsSelectForAcademic = [
  {
    name: <div className='text-sm font-bold text-lime-600'>AC Year</div>,
    selector: (row) => row.acYear.acYear,
    width: "95px",
  },
  {
    name: <div className='text-sm font-bold text-lime-600'>Course Details</div>,
    selector: (row) => (<div>
      {row.courseId1 ?
        getDetails(
          'Deeniyath Education', row.courseId1?.name, row.instituteId1?.name,
          row.refNumber1 ? row.refNumber1 : '-', row.year1,
          row.fees1 ? row.fees1 : 0, row.status1 ? row.status1 : ''
        ) : null}

      {row.courseId4 ?
        getDetails(
          'Islamic Home Science', row.courseId4?.name, row.instituteId4?.name,
          row.refNumber4 ? row.refNumber4 : '-', null,
          row.fees4 ? row.fees4 : 0, row.status4 ? row.status4 : ''
        ) : null}

      {row.courseId2 ?
        getDetails(
          'School Education', row.courseId2?.name, row.instituteId2?.name,
          row.refNumber2 ? row.refNumber2 : '-', null,
          row.fees2 ? row.fees2 : 0, row.status2 ? row.status2 : ''
        ) : null}

      {row.courseId3 ?
        getDetails(
          'College Education', row.courseId3?.name, row.instituteId3?.name,
          row.refNumber3 ? row.refNumber3 : '-', row.year3,
          row.fees3 ? row.fees3 : 0, row.status3 ? row.status3 : ''
        ) : null}

      {row.courseId5 ?
        getDetails(
          'Vocational Course', row.courseId5?.name, row.instituteId5?.name,
          row.refNumber5 ? row.refNumber5 : '-', null,
          row.fees5 ? row.fees5 : 0, row.status5 ? row.status5 : ''
        ) : null}
    </div>),
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
    name: "Roll Number",
    selector: (row) => row.rollNumber,
    //  sortable: true,
    width: "160px",
  },
  {
    name: "Student Name",
    selector: (row) => row.name,
    //  sortable: true,
    width: "280px",
  },
  {
    name: "Course",
    // selector: (row) => row.course,
    //  sortable: true,
    width: "250px",
    wrap: true,
    selector: row => (
      <div className="mt-2 mb-2">
        {row.courses?.map((course, i) => (
          <div key={i}>{course.name + ","}</div>
        ))}
      </div>
    ),
  },
  {
    name: "Father / Mother / Guardian Name",
    selector: (row) => row.fatherName,
    //  sortable: true,
    width: "250px",
  },
  {
    name: "District",
    selector: (row) => row.district,
    //  sortable: true,
    width: "190px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    //  sortable: true,
    width: "140px",
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
      {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Promote')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/students/promote/${Id}`)}
          >
            <FaUserCheck className="m-1" />
          </button> </div> : null}
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
