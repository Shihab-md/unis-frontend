import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext'
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
    selector: (row) => row.empId + " : " + row.name,
    sortable: true,
    width: "320px",
  },
  {
    name: "Role",
    selector: (row) => row.role,
    sortable: true,
    width: "110px",
  },
  {
    name: "Contact",
    selector: (row) => <div><p>{row.contactNumber}</p><p>{row.email}</p></div>,
    width: "230px",
  },
  {
    name: "Niswan",
    selector: (row) => row.schoolCode + " : " + row.schoolName,
    sortable: true,
    width: "450px",
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return employees;
};

export const conditionalRowStyles = [
  {
    when: row => row.active,
    style: row => ({
      //	backgroundColor: 'rgba(63, 195, 128, 0.9)',
      color: row.active == 'In-Active' ? 'red' : 'black',
      '&:hover': {
        //		cursor: 'pointer',
        color: row.active == 'In-Active' ? 'red' : 'black',
      },
    }),
  }
];

export const EmployeeButtons = ({ Id, onEmployeeDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
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
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onEmployeeDelete();
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

  const { user } = useAuth();

  return (
    <div className="flex space-x-3">
      {user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('View')}
            onClick={() => navigate(`/dashboard/employees/${Id}`)}
          >
            <FaEye className="m-1" />
          </button>
        </div> : null}

      {user.role === "superadmin" || user.role === "supervisor" || user.role === "admin" ?
        <div className="flex space-x-4">
          <button
            className={getButtonStyle('Edit')}
            onClick={() => navigate(`/dashboard/employees/edit/${Id}`)}
          >
            <FaEdit className="m-1" />
          </button>
          <button
            className={getButtonStyle('Delete')}
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt className="m-1" />
          </button>
        </div> : null}
    </div>
  );
};
