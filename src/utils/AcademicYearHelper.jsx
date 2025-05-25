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
    name: "Academic year",
    selector: (row) => row.acYear,
    sortable: true,
    width: "190px",
  },
  {
    name: "Description",
    selector: (row) => row.desc,
    sortable: true,
    width: "250px",
  },
  {
    name: "New Admissions #",
    selector: (row) => row.newAddmissions,
    width: "160px",
  },
  {
    name: "Total Students #",
    selector: (row) => row.studentsCount,
    width: "160px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// academicYears for salary form
export const getAcademicYears = async (id) => {
  let academicYears;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `academicYear/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      academicYears = responnse.data.academicYears;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return academicYears;
};

export const AcademicYearButtons = ({ Id, onAcademicYearDelete }) => {
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
          (await getBaseUrl()).toString() + `academicYear/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          //alert("Deleted Successfully...");
          Swal.fire('Success!', 'Successfully Deleted!', 'success');
          onAcademicYearDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          // alert(error.response.data.error);
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
        onClick={() => navigate(`/admin-dashboard/academicYears/${Id}`)}
      >
        <FaEye />
      </button>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/academicYears/edit/${Id}`)}
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
