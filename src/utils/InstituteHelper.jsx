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
    selector: (row) => row.iCode,
    sortable: true,
    width: "160px",
  }, 
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "270px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    width: "230px",
  },
  {
    name: "District",
    selector: (row) => row.district,
    sortable: true,
    width: "100px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// institutes for salary form
export const getInstitutes = async (id) => {
  let institutes;
  try {
    const responnse = await axios.get(
      `https://unis-server.vercel.app/api/institute/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      institutes = responnse.data.institutes;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return institutes;
};

export const InstituteButtons = ({ Id, onInstituteDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          `https://unis-server.vercel.app/api/institute/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onInstituteDelete();
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
        onClick={() => navigate(`/admin-dashboard/institutes/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/institutes/edit/${Id}`)}
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
