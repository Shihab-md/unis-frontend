import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl } from '../utils/CommonHelper'
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
    name: "Sanadh No",
    selector: (row) => row.sanadhNo,
    sortable: true,
    width: "120px",
  },
  {
    name: "Sanadh Name",
    selector: (row) => row.sanadhName,
    width: "140px",
  },
  {
    name: "Student Name",
    selector: (row) => row.studentName,
    width: "280px",
  },
  {
    name: "Roll Number",
    selector: (row) => row.rollNumber,
    width: "140px",
  },
  {
    name: "Niswan",
    selector: (row) => row.niswanCode + " : " + row.niswanName,
    width: "430px",
  },
  {
    name: "Action",
    selector: (row) => row.action,
    center: "true",
  },
];

// certificates for salary form
export const getCertificates = async (id) => {
  let certificates;
  try {
    const responnse = await axios.get(
      (await getBaseUrl()).toString() + `certificate/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (responnse.data.success) {
      certificates = responnse.data.certificates;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      Swal.fire('Error!', error.response.data.error, 'error');
    }
  }
  return certificates;
};

export const CertificateButtons = ({ Id, onCertificateDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = window.confirm("Do you want to delete?");
    if (confirm) {
      try {
        const responnse = await axios.delete(
          (await getBaseUrl()).toString() + `certificate/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          alert("Deleted Successfully...");
          onCertificateDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
        }
      }
    }
  };

  return (
    <div className="flex space-x-3 rounded-sm shadow-lg">
      <button
        className="px-3 py-1 bg-teal-600 text-white rounded-sm text-shadow-lg"
        onClick={() => navigate(`/admin-dashboard/certificates/${Id}`)}
      >
        <FaEye />
      </button>
    </div>
  );
};
