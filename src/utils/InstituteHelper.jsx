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
    width: "340px",
  },
  {
    name: "Education Type",
    selector: (row) => row.type,
    sortable: true,
    width: "220px",
  },
  {
    name: "State / District",
    selector: (row) => row.district,
    width: "230px",
  },
  {
    name: "Address",
    selector: (row) => row.address,
    width: "270px",
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
      showSwalAlert("Error!", error.response.data.error, "error");
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return institutes;
};

export const InstituteButtons = ({ Id, onInstituteDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

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
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onInstituteDelete();
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
        onClick={() => navigate(`/dashboard/institutes/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        disabled={user?.role === "guest"}
        onClick={() => navigate(`/dashboard/institutes/edit/${Id}`)}
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
