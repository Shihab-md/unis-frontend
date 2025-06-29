import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert } from '../utils/CommonHelper';
import {
  FaEye, FaUserCheck,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export const columnsSelect = [
  {
    name: "Students",
    selector: (row) => row.rollNumber + " : " + row.userId.name,
    width: "410px",
  },
];

export const columnsSelectForAcademic = [
  {
    name: "Aademic Year",
    selector: (row) => row.acYear.acYear,
    width: "120px",
  },
  {
    name: "Course Details",
    selector: (row) => (<div>
      {row.courseId1 ? <div className="mt-2">
        <p className='text-md font-bold text-pink-500'>Deeniyath Education</p>
        <p>{row.courseId1?.name + "  |  " + row.instituteId1?.name}</p>
        <p>{"Ref. # : " + row.refNumber1 + "  |  " + "Year : " + row.year1 + "  |  "
          + "Fees : " + row.fees1 + "  |  " + "Status : " + row.status1}.</p>
      </div> : null}

      {row.courseId2 ? <div className="mt-3">
        <p className='text-md font-bold text-pink-500'>School Education</p>
        <p>{row.courseId2?.name + "  |  " + row.instituteId2?.name}</p>
        <p>{"Ref. # : " + row.refNumber2 + "  |  " + "Year : " + row.year2 + "  |  "
          + "Fees : " + row.fees2 + "  |  " + "Status : " + row.status2}.</p>
      </div> : null}

      {row.courseId3 ? <div className="mt-3">
        <p className='text-md font-bold text-pink-500'>College Education</p>
        <p>{row.courseId3?.name + "  |  " + row.instituteId3?.name}</p>
        <p>{"Ref. # : " + row.refNumber3 + "  |  " + "Year : " + row.year3 + "  |  "
          + "Fees : " + row.fees3 + "  |  " + "Status : " + row.status3}.</p>
      </div> : null}

      {row.courseId4 ? <div className="mt-3">
        <p className='text-md font-bold text-pink-500'>Islamic Home Science</p>
        <p>{row.courseId4?.name + "  |  " + row.instituteId4?.name}</p>
        <p>{"Ref. # : " + row.refNumber4 + "  |  " + "Year : " + row.year4 + "  |  "
          + "Fees : " + row.fees4 + "  |  " + "Status : " + row.status4}.</p>
      </div> : null}

      {row.courseId5 ? <div className="mt-3 mb-3">
        <p className='text-md font-bold text-pink-500'>Vocational Course</p>
        <p>{row.courseId5?.name + "  |  " + row.instituteId5?.name}</p>
        <p>{"Ref. # : " + row.refNumber5 + "  |  " + "Year : " + row.year5 + "  |  "
          + "Fees : " + row.fees5 + "  |  " + "Status : " + row.status5}.</p>
      </div> : null}

    </div>),
    width: "750px",
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
    width: "300px",
  },
  {
    name: "Course",
    // selector: (row) => row.course,
    //  sortable: true,
    width: "250px",
    wrap: true,
    selector: row => (
      <div className="p-1">
        {row.courses.map((course, i) => (
          <div key={i}>{course.name + ","}</div>
        ))}
      </div>
    ),
  },
  {
    name: "Father / Mother / Guardian Name",
    selector: (row) => row.fatherName,
    //  sortable: true,
    width: "300px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    //  sortable: true,
    width: "120px",
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

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/students/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-purple-500 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/students/promote/${Id}`)}
      >
        <FaUserCheck />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/students/edit/${Id}`)}
      >
        <FaEdit />
      </button>
      <button
        className="px-3 py-1 bg-red-600 text-white rounded-sm text-shadow-lg"
        onClick={() => handleDelete(Id)}
      >
        <FaTrashAlt />
      </button>
    </div>
  );
};
