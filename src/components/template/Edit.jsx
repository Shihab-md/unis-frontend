import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import { getBaseUrl, handleRightClick } from '../../utils/CommonHelper'
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Edit = () => {

  // To prevent right-click.
  document.addEventListener('contextmenu', handleRightClick);

  const [template, setTemplate] = useState({
    code: "",
    details: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

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
          const template = responnse.data.template;
          setTemplate((prev) => ({
            ...prev,
            code: template.code,
            details: template.details,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    fetchTemplate();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setTemplate((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setTemplate((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const response = await axios.put(
        (await getBaseUrl()).toString() + `template/${id}`,
        template,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        alert("Updated Successfully...");
        navigate("/admin-dashboard/templates");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {template ? (
        <div className="max-w-4xl mx-auto mt-2 bg-white p-5 rounded-md shadow-md">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Template Details</h2>
            <Link to="/admin-dashboard/templates" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={template.code}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Details <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="details"
                    value={template.details}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Template Image Upload */}
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Update Template Image <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    placeholder="Upload Template"
                    required
                    accept="image/*"
                    className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                  />
                </div>

              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Template
            </button>
          </form>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default Edit;
