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
    name: "Code",
    selector: (row) => row.code,
    sortable: true,
    width: "100px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    width: "250px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    width: "160px",
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

export const SchoolButtons = ({ Id }) => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white"
        onClick={() => navigate(`/admin-dashboard/school/${Id}`)}
      >
        View
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white"
        onClick={() => navigate(`/admin-dashboard/schools/edit/${Id}`)}
      >
        Edit
      </button>
    </div>
  );
};
