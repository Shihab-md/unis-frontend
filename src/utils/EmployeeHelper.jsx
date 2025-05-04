import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from '../utils/CommonHelper'
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
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "250px",
  },
  {
    name: "Role",
    selector: (row) => row.role,
    sortable: true,
    width: "160px",
  },
  {
    name: "Contact Number",
    selector: (row) => row.contactNumber,
    width: "190px",
  },
  {
    name: "Niswan",
    selector: (row) => row.schoolName,
    sortable: true,
    width: "320px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// employees for salary form
export const getEmployees = async (id) => {
  let employees;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `employee/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      employees = responnse.data.employees;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return employees;
};

export const EmployeeButtons = ({ Id, onEmployeeDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onEmployeeDelete();
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
        onClick={() => navigate(`/admin-dashboard/employees/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
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
