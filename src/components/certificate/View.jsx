import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import { FaRegTimesCircle, FaDownload } from "react-icons/fa";

const View = () => {

  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const handleDownload = () => {
    if (!certificate) return;

    const url =
      certificate.certificateDriveDownloadUrl ||
      certificate.certificate ||
      "";

    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download =
        (certificate.courseId?.name || "CERT") + "_" +
        (certificate.studentId?.rollNumber || "") + "_" +
        (certificate.userId?.name || "") + ".png";
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

    if (checkAuth("certificateView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
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
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/certificates")
        }
      }
    };

    fetchCertificate();
  }, []);

  const fatherName = certificate?.studentId?.fatherName
    ? certificate?.studentId?.fatherName
    : certificate?.studentId?.motherName
      ? certificate?.studentId?.motherName
      : certificate?.studentId?.guardianName
        ? certificate?.studentId?.guardianName
        : "";
  const fileId = certificate?.certificateDriveFileId;
  const imgSrc = fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
    : (certificate?.certificateDrivePreviewUrl || certificate?.certificate || "");

  return (
    <>
      {certificate ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-sm lg:text-xl font-semibold items-center justify-center">Certificate Details</h2>
            <Link to="/dashboard/certificates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              {show ? (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3"
                  title="Click to Close"
                  onClick={handleHideDialog}
                >
                  <img
                    className="max-h-[90vh] max-w-[95vw] rounded-lg border bg-white p-1 shadow-2xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                    src={imgSrc ? `${imgSrc}` : "/certificate.jpg"}
                    alt="Certificate Preview"
                  />
                </div>
              ) : null}

              <div
                className="mt-2 mb-3 flex items-center justify-center space-x-6"
                title="Click to ZOOM"
              >
                <img
                  className="mt-3 p-0.5 h-40 w-40 cursor-zoom-in rounded-lg border object-cover shadow-lg hover:-translate-y-0.5"
                  onClick={handleShowDialog}
                  src={imgSrc ? `${imgSrc}` : "/certificate.jpg"}
                  alt="Certificate Thumbnail"
                />

                <FaDownload
                  onClick={handleDownload}
                  className="cursor-pointer rounded border bg-gray-200 text-3xl text-green-700 shadow-xl hover:-translate-y-0.5"
                  title="Download"
                />
              </div>

              <div className="flex mt-1 space-x-3 mb-5" />

              <ViewCard type="title" text="Sanadh Number" />
              <ViewCard type="data" text={certificate.code} />

              <ViewCard type="title" text="Sanadh Name" />
              <ViewCard type="data" text={certificate.courseId?.name} />

              <ViewCard type="title" text="Student Roll Number" />
              <ViewCard type="data" text={certificate.studentId?.rollNumber} />

              <ViewCard type="title" text="Student Name" />
              <ViewCard type="data" text={certificate.userId?.name} />

              <ViewCard type="title" text="Father / Mother / Guardian Name" />
              <ViewCard type="data" text={fatherName} />

              <ViewCard type="title" text="Niswan Name" />
              <ViewCard type="data" text={certificate.schoolId?.code + " : " + certificate.schoolId?.nameEnglish} />

              <div className="flex mt-1 space-x-3 mb-5" />
            </div>
            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:-translate-y-0.5"
              data-ripple-light="true"
              onClick={() => navigate(`/dashboard/certificates`)}
            >
              Back
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