import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Academic year",
    selector: (row) => row.acYear,
    sortable: true,
    width: "160px",
  },
  {
    name: "Description",
    selector: (row) => row.desc,
    sortable: true,
    width: "210px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    //  sortable: true,
    width: "130px",
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return academicYears;
};

export const getAcademicYearsFromCache = async (id) => {
  let academicYears;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `academicYear/fromCache`,
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return academicYears;
};

export const AcademicYearButtons = ({ Id, onAcademicYearDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

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
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onAcademicYearDelete();
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
      <button
        className={getButtonStyle('View')}
        onClick={() => navigate(`/dashboard/academicYears/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/academicYears/edit/${Id}`)}
      >
        <FaEdit className="m-1" />
      </button>
      <button
        className={getButtonStyle('Delete')}
        disabled={user?.role === "guest"}
        onClick={() => handleDelete(Id)}
      >
        <FaTrashAlt className="m-1" />
      </button>
    </div>
  );
};
