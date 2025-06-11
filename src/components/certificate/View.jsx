import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle, FaDownload
} from "react-icons/fa";

const View = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [show, setShow] = useState(null);
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

  const handleShowDialog = async () => {
    setShow("show");
  };
  const handleHideDialog = async () => {
    setShow(null);
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
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/certificates")
        }
      }
    };

    fetchCertificate();
  }, []);

  return (
    <>
      {certificate ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Certificate Details</h2>
            <Link to="/dashboard/certificates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">

              {show ?
                <div className="bg-white rounded-lg" title="Click to Close"><dialog
                  className="dialog rounded-lg"
                  style={{ position: 'absolute' }}
                  open
                  onClick={handleHideDialog}
                >
                  <img
                    className="p-2 size-100 border items-center justify-center shadow-lg" onClick={handleHideDialog}
                    src={certificate.certificate && certificate.certificate != "" ? "data:image/jpeg;base64," + certificate.certificate : "/certificate.jpg"}
                  />
                </dialog></div>
                : <div></div>}

              <div className="flex mt-2 space-x-10 mb-3 items-center justify-center" title="Click to ZOOM">
                <img className='size-40 mt-3 border items-center justify-center rounded-lg shadow-lg' onClick={handleShowDialog}
                  src={certificate.certificate && certificate.certificate != "" ? "data:image/jpeg;base64," + certificate.certificate : "/certificate.jpg"}
                />
                <FaDownload onClick={handleDownload} className="text-3xl text-green-700 bg-gray-200 border rounded shadow-xl items-bottom justify-end" />
              </div>

              <div className="flex mt-1 space-x-3 mb-5" />

              <ViewCard type="title" text="Sanadh Number" />
              <ViewCard type="data" text={certificate.code} />

              <ViewCard type="title" text="Sanadh Name" />
              <ViewCard type="data" text={certificate.courseId.name} />

              <ViewCard type="title" text="Student Roll Number" />
              <ViewCard type="data" text={certificate.studentId.rollNumber} />

              <ViewCard type="title" text="Student Name" />
              <ViewCard type="data" text={certificate.userId.name} />

              <ViewCard type="title" text="Niswan Name" />
              <ViewCard type="data" text={certificate.schoolId.code + " : " + certificate.schoolId.nameEnglish} />

              <div className="flex mt-1 space-x-3 mb-5" />
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
