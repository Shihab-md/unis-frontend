import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from '../utils/CommonHelper';
import Swal from 'sweetalert2';
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
    width: "110px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    sortable: true,
    width: "290px",
  },
  {
    name: "Education Type",
    selector: (row) => row.type,
    sortable: true,
    width: "250px",
  },
  {
    name: "State / District",
    selector: (row) => row.district,
    width: "180px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    width: "230px",
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
      (await getBaseUrl()).toString() + `institute/`,
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
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return institutes;
};

export const getInstitutesFromCache = async (id) => {
  let institutes;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `institute/fromCache/`,
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
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return institutes;
};

export const InstituteButtons = ({ Id, onInstituteDelete }) => {
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
          (await getBaseUrl()).toString() + `institute/${id}`,
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
          onInstituteDelete();
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

  return (
    <div className="flex space-x-3">
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/institutes/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/institutes/edit/${Id}`)}
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
