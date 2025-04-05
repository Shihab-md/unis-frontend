import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export const columns = [
  {
    name: "S.No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Code",
    selector: (row) => row.code,
    sortable: true,
    width: "110px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    width: "370px",
  },
  {
    name: "Area, District / State",
    selector: (row) => row.address + ", " + row.district,
    width: "190px",
  },
  {
    name: "Supervisor Id",
    selector: (row) => row.supervisorId,
    width: "160px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    width: "110px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// schools for salary form
export const getSchools = async (id) => {
  let schools;
  try {
    const responnse = await axios.get(
      `https://unis-server.vercel.app/api/schools/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(responnse)
    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return schools;
};

export const SchoolButtons = ({ Id, onSchoolDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          `https://unis-server.vercel.app/api/school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onSchoolDelete();
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
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/schools/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white"
        onClick={() => navigate(`/admin-dashboard/schools/edit/${Id}`)}
      >
        <FaEdit />
      </button>
      <button
        className="px-3 py-1 bg-red-600 text-white"
        onClick={() => handleDelete(Id)}
      >
        <FaTrashAlt />
      </button>
    </div>
  );
};
