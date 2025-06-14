import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from '../utils/CommonHelper';
import Swal from 'sweetalert2';
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
    width: "340px",
  },
  {
    name: "Role",
    selector: (row) => row.role,
    sortable: true,
    width: "120px",
  },
  {
    name: "Contact Number",
    selector: (row) => row.contactNumber,
    width: "140px",
  },
  {
    name: "Niswan",
    selector: (row) => row.schoolCode + " : " + row.schoolName,
    sortable: true,
    width: "460px",
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
      Swal.fire('Error!', error.response.data.error, 'error');
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
    const result = await Swal.fire({
      title: 'Are you sure to Delete?',
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

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
          Swal.fire({
            title: "Success!",
            html: "<b>Successfully Deleted!</b>",
            icon: "success",
            timer: 1600,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          onEmployeeDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
        }
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Swal.fire('Cancelled', 'Your file is safe!', 'error');
      // Handle cancellation logic (optional)
    }
  };

  const { user } = useAuth();

  return (
    <div className="flex space-x-3">
      {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
            onClick={() => navigate(`/dashboard/employees/${Id}`)}
          >
            <FaEye />
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
            onClick={() => navigate(`/dashboard/employees/edit/${Id}`)}
          >
            <FaEdit />
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-sm text-shadow-lg"
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt />
          </button>
        </div> : null}
    </div>
  );
};
