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
    name: "S.No",
    selector: (row) => row.sno,
    width: "60px",
  },
  {
    name: "Niswan details",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Code:</span> {row.code}
      </p>
      <p className="mb-1">
        <span className="text-blue-700"></span> {row.name}
      </p>
      <p className='mb-1 font-["Noto_Naskh_Arabic"]'>
        <span className='text-blue-700'></span> {row.nameArabic}
      </p>
      <p>
        <span className="text-blue-700"></span> {row.nameNative}
      </p>
    </div>,
    sortable: true,
    width: "460px",
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
    width: "120px",
  },
  {
    name: "Address",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">{row.address}</p>
      <p className="mb-1">{row.city}</p>
      <p className='mb-1'>{row.landmark}</p>
      <p>{row.districtState}</p>
    </div>,
    //  sortable: true,
    wrap: true,
    width: "230px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    //  sortable: true,
    width: "100px",
  },
  {
    name: "Supervisor",
    selector: (row) => <div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-1">Id:</span> {row.supervisorId}
      </p>
      <p>{row.supervisorName}</p>
    </div>,
    //  sortable: true,
    width: "320px",
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

export const getSchools = async (id) => {
  let schools;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `school/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    //console.log(responnse)
    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return schools;
};

export const getSchoolsFromCache = async (id) => {
  let schools;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `school/fromCache/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    //  console.log(responnse)
    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return schools;
};

export const SchoolButtons = ({ Id, onSchoolDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const result = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');

    if (result.isConfirmed) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `school/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onSchoolDelete();
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
        onClick={() => navigate(`/dashboard/schools/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>

      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Edit')}
            disabled={user?.role === "guest"}
            onClick={() => navigate(`/dashboard/schools/edit/${Id}`)}
          >
            <FaEdit className="m-1" />
          </button> </div> : null}

      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3">
          <button
            className={getButtonStyle('Delete')}
            disabled={user?.role === "guest"}
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt className="m-1" />
          </button> </div> : null}

    </div>
  );
};
