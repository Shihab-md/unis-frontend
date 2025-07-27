import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from './CommonHelper';
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "100px",
  },
  {
    name: "District",
    selector: (row) => row.district,
    sortable: true,
    width: "250px",
  },
  {
    name: "State",
    selector: (row) => row.state,
    sortable: true,
    width: "250px",
  },
  {
    name: "Total Niswans #",
    selector: (row) => row.studentsCount,
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

// districtStates for salary form
export const getDistrictStates = async (id) => {
  let districtStates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `districtState/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      districtStates = responnse.data.districtStates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return districtStates;
};

export const getDistrictStatesFromCache = async (id) => {
  let districtStates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `districtState/fromCache`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      districtStates = responnse.data.districtStates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return districtStates;
};

export const DistrictStateButtons = ({ Id, onDistrictStateDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `districtState/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onDistrictStateDelete();
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

  return (
    <div className="flex space-x-3">
      <button
        className={getButtonStyle('View')}
        onClick={() => navigate(`/dashboard/districtStates/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
      <button
        className={getButtonStyle('Edit')}
        onClick={() => navigate(`/dashboard/districtStates/edit/${Id}`)}
      >
        <FaEdit className="m-1" />
      </button>
      <button
        className={getButtonStyle('Delete')}
        onClick={() => handleDelete(Id)}
      >
        <FaTrashAlt className="m-1" />
      </button>
    </div>
  );
};
