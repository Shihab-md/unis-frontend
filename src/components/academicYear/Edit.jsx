import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import { FaRegTimesCircle } from "react-icons/fa";

const Edit = () => {
  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [processing, setProcessing] = useState(null)
  const [academicYear, setAcademicYear] = useState({
    acYear: "",
    desc: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("acYearEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const fetchAcademicYear = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `academicYear/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const academicYear = responnse.data.academicYear;
          setAcademicYear((prev) => ({
            ...prev,
            acYear: academicYear.acYear,
            desc: academicYear.desc,
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/academicYears");
        }
      }
    };

    fetchAcademicYear();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAcademicYear((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await axios.put(
        (await getBaseUrl()).toString() + `academicYear/${id}`,
        academicYear,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
        navigate("/dashboard/academicYears");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <>
      {academicYear ? (
        <div className="max-w-4xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Academic Year Details</h2>
            <Link to="/dashboard/academicYears" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">

                {/* Academic Year */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Academic Year <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="acYear"
                    value={academicYear.acYear}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Description <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="desc"
                    value={academicYear.desc}
                    onChange={handleChange}
                    className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Academic Year
            </button>
          </form>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default Edit;
