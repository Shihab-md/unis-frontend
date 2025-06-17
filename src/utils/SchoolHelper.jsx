import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from '../utils/CommonHelper';
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2';
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
    width: "110px",
  },
  {
    name: "Name",
    selector: (row) => row.name,
    //  sortable: true,
    width: "430px",
  },
  {
    name: "District & State",
    selector: (row) => row.district,
    //  sortable: true,
    width: "250px",
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
    console.log(responnse)
    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      Swal.fire('Error!', error.response.data.error, 'error');
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
    console.log(responnse)
    if (responnse.data.success) {
      schools = responnse.data.schools;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return schools;
};

export const SchoolButtons = ({ Id, onSchoolDelete }) => {
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
          (await getBaseUrl()).toString() + `school/${id}`,
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
          onSchoolDelete();
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
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/dashboard/schools/${Id}`)}
      >
        <FaEye />
      </button>
      {user.role === "superadmin" || user.role === "hquser" || user.role === "admin" ?
        <div className="flex space-x-3">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-sm text-shadow-lg"
            onClick={() => navigate(`/dashboard/schools/edit/${Id}`)}
          >
            <FaEdit />
          </button> </div> : null}
      {user.role === "superadmin" || user.role === "hquser" ?
        <div className="flex space-x-3">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-sm text-shadow-lg"
            onClick={() => handleDelete(Id)}
          >
            <FaTrashAlt />
          </button> </div> : null}
    </div>
  );
};
