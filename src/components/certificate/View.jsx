import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClick, getSpinner, checkAuth } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle, FaDownload
} from "react-icons/fa";

const View = () => {
  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const navigate = useNavigate();

  const handleDownload = () => {
    if (certificate.certificate) {
      const link = document.createElement('a');
      link.href = certificate.certificate != "" ? "data:image/jpeg;base64," + certificate.certificate : "/certificate.jpg";
      link.download = certificate.courseId.name + "_" + certificate.studentId.rollNumber + "_" + certificate.userId.name + ".jpg" || 'downloaded_image'; // Use provided name or default
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("certificateView") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchCertificate = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `certificate/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setCertificate(responnse.data.certificate);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');;
        }
      }
    };

    fetchCertificate();
  }, []);

  return (
    <>
      {certificate ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md bg-blue-50">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Certificate Details</h2>
            <Link to="/dashboard/certificates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">

              <div className="flex mt-2 space-x-10 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={certificate.certificate && certificate.certificate != "" ? "data:image/jpeg;base64," + certificate.certificate : "/certificate.jpg"}
                />
                <FaDownload onClick={handleDownload} className="text-3xl text-green-700 bg-gray-200 border rounded shadow-xl items-bottom justify-end" />
              </div>

              <div>
                <div className="flex mt-1 space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Sanadh Number:</p>
                  <p className="font-normal">{certificate.code}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Sanadh Name:</p>
                  <p className="font-normal">{certificate.courseId.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Student Roll Number:</p>
                  <p className="font-normal">{certificate.studentId.rollNumber}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Student Name:</p>
                  <p className="font-normal">{certificate.userId.name}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Niswan Name:</p>
                  <p className="font-normal">{certificate.schoolId.nameEnglish}</p>
                </div>
              </div>
            </div>
            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              data-ripple-light="true"
              onClick={() => navigate(`/dashboard/certificates`)}
            >  Back
            </button>
          </div>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;
