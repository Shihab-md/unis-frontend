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
    name: "#",
    selector: (row) => row.sno,
    width: "50px",
  },
  {
    name: "Supervisor details",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-1">User Id:</span> {row.supId}
      </p>
      <p>
        <span className="text-blue-700 mr-2.5">Name:</span> {row.name}
      </p>
    </div>,
    sortable: true,
    width: "430px",
  },
  {
    name: "Contact",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Mobile:</span> {row.contactNumber}
      </p>
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Email:</span> {row.email}
      </p>
      <p>
        <span className="text-blue-700 mr-1">Route:</span> {row.routeName}
      </p>
    </div>,
    width: "320px",
  },
  {
    name: "Niswans #",
    selector: (row) => row.schoolsCount,
    sortable: true,
    width: "120px",
  },
  {
    name: "Students #",
    //selector: (row) => row.studentCount,
    wrap: true,
    selector: row => (
      <div className="mt-2 mb-2">
        <p>
          <span className="font-semibold text-blue-700 mr-1">Total:</span> {row.studentCount}
        </p>
        <div className="mt-1 mb-1"></div>
        {row.studentCountsByCourse?.map((course, i) => (
          <div key={i}>
            <p className="mr-1">
              <span className="text-blue-700">{course.courseName}{" : "}</span>
              <span>{course.count}</span>
            </p>
          </div>
        ))}
      </div>
    ),
    //  sortable: true,
    width: "160px",
  },
  {
    name: "Status",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Status:</span> {row.active}
      </p>
      <p>
        <span className="text-blue-700 mr-1">Job Type:</span> {row.jobType}
      </p>
    </div>,
    width: "160px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

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
      showSwalAlert("Error!", error.response.data.error, "error");
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return supervisors;
};

export const SupervisorButtons = ({ Id, onSupervisorDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {

    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

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
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onSupervisorDelete();
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
    <div className="flex space-x-3 rounded-sm shadow-lg">
      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3 rounded-sm shadow-lg">
          <button
            className={getButtonStyle('View')}
            onClick={() => navigate(`/dashboard/supervisors/${Id}`)}
          >
            <FaEye className="m-1" />
          </button>
          <button
            className={getButtonStyle('Edit')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/supervisors/edit/${Id}`)}
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
        </div> : null}
    </div>
  );
};
