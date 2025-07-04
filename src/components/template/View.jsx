import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, showSwalAlert } from '../../utils/CommonHelper';
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const handleDownload = () => {
    const link = document.createElement('a');
    //link.href = template.template && template.template != "" ? "data:image/jpeg;base64," + template.template : "/template.jpg";
    link.href = template.template && template.template != "" ? template.template + "?" + new Date().getTime() : "/template.jpg";
    link.download = "123.jpg" || 'downloaded_image'; // Use provided name or default
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShowDialog = async () => {
    setShow("show");
  };
  const handleHideDialog = async () => {
    setShow(null);
  };

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("templateView") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchTemplate = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `template/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          setTemplate(responnse.data.template);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/templates/");
        }
      }
    };
 
    fetchTemplate();
  }, []);

  return (
    <>
      {template ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Template Details</h2>
            <Link to="/dashboard/templates" >
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
                    className="p-2 size-100 border items-center justify-center shadow-lg rounded-lg" onClick={handleHideDialog}
                    src={template.template && template.template != "" ? template.template + "?" + new Date().getTime() : "/template.jpg"}
                  />
                </dialog></div>
                : <div></div>}

              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" title="Click to ZOOM" >
                <img className='size-40 mt-5 border items-center justify-center rounded-lg shadow-lg' onClick={handleShowDialog}
                  src={template.template && template.template != "" ? template.template + "?" + new Date().getTime() : "/template.jpg"}
                />
                {/* <button onClick={handleDownload}>
                  Download Image
                </button>*/}
              </div>

              <div>
                <div className="flex mt-1 space-x-3 mb-5" />

                <ViewCard type="title" text="Course Name" />
                <ViewCard type="data" text={template.courseId.name} />
                <ViewCard type="title" text="Details" />
                <ViewCard type="data" text={template.details} />

                <div className="flex mt-1 space-x-3 mb-5" />
              </div>
            </div>
            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              data-ripple-light="true"
              onClick={() => navigate(`/dashboard/templates`)}
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
