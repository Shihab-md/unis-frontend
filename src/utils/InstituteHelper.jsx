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
    width: "90px",
  }, 
  {
    name: "Name",
    selector: (row) => row.name,
    width: "280px",
  },
  {
    name: "Contact Number",
    selector: (row) => row.contactNumber,
    width: "190px",
  },
  {
    name: "District",
    selector: (row) => row.district,
    width: "190px",
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
      `https://unis-server.vercel.app/api/institutes/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      alert("Deleted Successfully...");
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
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/institutes/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white"
        onClick={() => navigate(`/admin-dashboard/institutes/edit/${Id}`)}
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
