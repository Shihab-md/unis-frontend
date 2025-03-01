import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    width: "250px",
  },
  {
    name: "Route",
    selector: (row) => row.route_name,
    width: "250px",
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
    console.log(responnse)
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
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/supervisors/${Id}`)}
      >
        View
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white"
        onClick={() => navigate(`/admin-dashboard/supervisors/edit/${Id}`)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-600 text-white"
        onClick={() => handleDelete(Id)}
      >
        Delete
      </button>
    </div>
  );
};
