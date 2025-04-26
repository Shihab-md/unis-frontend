import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "60px",
  },
  { 
    name: "Code",
    selector: (row) => row.code,
    sortable: true,
    width: "100px",
  }, 
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "280px",
  },
  {
    name: "Education Type",
    selector: (row) => row.type,
    sortable: true,
    width: "250px",
  },
  {
    name: "Remarks",
    selector: (row) => row.remarks,
    width: "250px",
  },
  {
    name: "Fees",
    selector: (row) => row.fees,
    width: "120px",
  },
  {
    name: "No. of Subjects",
    selector: (row) => row.subjectsCount,
    width: "140px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// courses for salary form
export const getCourses = async (id) => {
  let courses;
  try {
    const responnse = await axios.get(
      `https://unis-server.vercel.app/api/course/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      courses = responnse.data.courses;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return courses;
};

export const CourseButtons = ({ Id, onCourseDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          `https://unis-server.vercel.app/api/course/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onCourseDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/courses/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/courses/edit/${Id}`)}
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
