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
  /*{
    name: "Image",
    selector: (row) => row.profileImage,
    width: "90px",
  }, */
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "320px",
  },
  {
    name: "Contact Number",
    selector: (row) => row.contactNumber,
    width: "190px",
  },
  {
    name: "Route",
    selector: (row) => row.routeName,
    sortable: true,
    width: "250px",
  },
  {
    name: "No. of Niswans",
    selector: (row) => "ALL",
    sortable: true,
    width: "190px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// supervisors for salary form
export const getSupervisors = async (id) => {
  let supervisors;
  try {
    const responnse = await axios.get(
      `https://unis-server.vercel.app/api/supervisors/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      supervisors = responnse.data.supervisors;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return supervisors;
};

export const SupervisorButtons = ({ Id, onSupervisorDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          `https://unis-server.vercel.app/api/supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onSupervisorDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    }
  };

  return (
    <div className="flex space-x-3 rounded-sm shadow-lg">
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/supervisors/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/supervisors/edit/${Id}`)}
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
