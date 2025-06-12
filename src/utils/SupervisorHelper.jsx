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
  /*{
    name: "Image",
    selector: (row) => row.profileImage,
    width: "90px",
  }, */
  {
    name: "Supervisor",
    selector: (row) => row.supId + " : " + row.name,
    sortable: true,
    width: "470px",
  },
  {
    name: "Contact Number",
    selector: (row) => row.contactNumber,
    width: "150px",
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
    width: "280px",
  },
  {
    name: "Route",
    selector: (row) => row.routeName,
    sortable: true,
    width: "190px",
  },
  {
    name: "No. of Niswans",
    selector: (row) => row.schoolsCount,
    sortable: true,
    width: "160px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// supervisors FromCache
export const getSupervisorsFromCache = async (id) => {
  let supervisors;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `supervisor/fromCache/`,
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
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return supervisors;
};

// supervisors 
export const getSupervisors = async (id) => {
  let supervisors;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `supervisor/`,
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
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return supervisors;
};

export const SupervisorButtons = ({ Id, onSupervisorDelete }) => {
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
          (await getBaseUrl()).toString() + `supervisor/${id}`,
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
          onSupervisorDelete();
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
    <div className="flex space-x-3 rounded-sm shadow-lg">
      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3 rounded-sm shadow-lg">
          <button
            className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
            onClick={() => navigate(`/dashboard/supervisors/${Id}`)}
          >
            <FaEye />
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
            onClick={() => navigate(`/dashboard/supervisors/edit/${Id}`)}
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
