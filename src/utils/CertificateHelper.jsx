import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert, showConfirmationSwalAlert, getButtonStyle } from '../utils/CommonHelper';
import { FaEye, } from "react-icons/fa";
import { useAuth } from '../context/AuthContext'

export const columns = [
  {
    name: "S No",
    selector: (row) => row.sno,
    width: "70px",
  },
  {
    name: "Sanadh No",
    selector: (row) => row.sanadhNo,
    sortable: true,
    width: "110px",
  },
  {
    name: "Sanadh Name",
    selector: (row) => row.sanadhName,
    width: "210px",
  },
  {
    name: "Student Details",
    selector: (row) => (<div className="mt-2 mb-2">
      <p className="mb-1">
        <span className="text-blue-700 mr-4">Roll Number:</span> {row.rollNumber}
      </p>
      <p className="mb-1">
        <span className="text-blue-700 mr-2">Student Name:</span> {row.studentName}
      </p>
      <p>
        <span className="text-blue-700 mr-3">Parent / Guardian name:</span> {row.fatherName}
      </p>
    </div>),
    width: "480px",
  },
  {
    name: "Niswan",
    selector: (row) => (<div className="mt-2 mb-2">
      <p className="mb-1">{row.niswanCode}</p>
      <p className="mb-1">{row.niswanName}</p>
    </div>),
    width: "520px",
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
      showSwalAlert("Error!", error.response.data.error, "error");
    }
  }
  return certificates;
};

export const CertificateButtons = ({ Id, onCertificateDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirm = await showConfirmationSwalAlert('Are you sure to Delete?', '', 'question');
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
          showSwalAlert("Success!", "Successfully Deleted!", "success");
          onCertificateDelete();
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
        }
      }
    }
  };

  const { user } = useAuth();

  return (
    <div className="flex space-x-3 rounded-sm shadow-lg">
      <button
        className={getButtonStyle('View')}
        onClick={() => navigate(`/dashboard/certificates/${Id}`)}
      >
        <FaEye className="m-1" />
      </button>
    </div>
  );
};
