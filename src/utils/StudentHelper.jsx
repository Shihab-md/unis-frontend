import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert } from '../utils/CommonHelper';
import {
  FaEye,
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
    name: "AC Year",
    selector: (row) => row.acYear.acYear,
    width: "100px",
  },
  {
    name: "Course",
    selector: (row) => row.courseId1.name,
    width: "140px",
  },
  {
    name: "Institute",
    selector: (row) => row.instituteId1.name,
    width: "160px",
  },
  {
    name: "Reference #",
    selector: (row) => row.refNumber1,
    width: "140px",
  },
  {
    name: "Year",
    selector: (row) => row.year,
    width: "60px",
  },
  {
    name: "Fees",
    selector: (row) => row.fees1,
    width: "70px",
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
      <div>
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
