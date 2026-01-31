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
  /*{
    name: "S.No",
    selector: (row) => row.sno,
    width: "60px",
  },*/
  {
    name: "Code",
    /*  name: (
        <div>
          Title
          <input
            type="text"
            placeholder="Code"
            value={row.code}
            onChange={(e) => onChange(e)}
            style={{ width: "80%" }}
          />
        </div>
      ),*/
    selector: (row) => row.code,
    //  sortable: true,
    width: "120px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    //  sortable: true,
    width: "370px",
  },
  {
    name: "No. of Students",
    //selector: (row) => row.studentCount,
    wrap: true,
    selector: row => (
      <div className="mt-2 mb-2">
        {"Total : " + row.studentCount}
        <div className="mt-1 mb-1"></div>
        {row.studentCountsByCourse?.map((course, i) => (
          <div key={i}>{course.courseName + " : " + course.count}</div>
        ))}
      </div>
    ),
    //  sortable: true,
    width: "120px",
  },
  {
    name: "District & State",
    selector: (row) => row.districtState,
    //  sortable: true,
    width: "210px",
  },
  {
    name: "Status",
    selector: (row) => row.active,
    //  sortable: true,
    width: "100px",
  },
  {
    name: "Supervisor",
    selector: (row) => row.supervisorId + " : " + row.supervisorName,
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
