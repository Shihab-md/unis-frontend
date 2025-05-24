import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl } from '../../utils/CommonHelper'
import {
  FaRegTimesCircle, FaDownload
} from "react-icons/fa";

const View = () => {

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
          alert(error.response.data.error);
        }
      }
    };

    fetchCertificate();
  }, []);

  return (
    <>
      {certificate ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Certificate Details</h2>
            <Link to="/admin-dashboard/certificates" >
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
              onClick={() => navigate(`/admin-dashboard/certificates`)}
            >  Back
            </button>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center rounded-lg shadow-lg'>
          <img width={430} className='flex p-7 items-center justify-center rounded-lg shadow-lg w-34' src="/spinner.gif" />
        </div>
      )}
    </>
  );
};

export default View;
