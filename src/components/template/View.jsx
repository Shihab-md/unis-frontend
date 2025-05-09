import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBaseUrl } from '../../utils/CommonHelper'
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          alert(error.response.data.error);
        }
      }
    };

    fetchTemplate();
  }, []);
  return (
    <>
      {template ? (
        <div className="max-w-3xl mx-auto mt-2 bg-white p-8 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Template Details</h2>
            <Link to="/admin-dashboard/templates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg">

              <div className="flex mt-2 space-x-3 mb-3 items-center justify-center" >
                <img className='size-40 border items-center justify-center rounded-lg shadow-lg'
                  src={template.template && template.template != "" ? "data:image/jpeg;base64," + template.template : "/template.jpg"}
                />
              </div>
              <div>
                <div className="flex mt-1 space-x-3 mb-5" />
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Code:</p>
                  <p className="font-normal">{template.code}</p>
                </div>
                <div className="flex space-x-3 mb-5">
                  <p className="font-medium">Details:</p>
                  <p className="font-normal">{template.details}</p>
                </div>
              </div>
            </div>
            <button
              className="w-full mt-1 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
              data-ripple-light="true"
              onClick={() => navigate(`/admin-dashboard/templates`)}
            >  Back
            </button>
          </div>
        </div>
      ) : (
        <div> Loading ....</div>
      )}
    </>
  );
};

export default View;
