import axios from "axios";
import React, { useEffect, useState } from "react";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, showSwalAlert } from '../../utils/CommonHelper';
import { useParams, useNavigate, Link } from "react-router-dom";
import ViewCard from "../dashboard/ViewCard";
import {
  FaRegTimesCircle
} from "react-icons/fa";

const View = () => {
  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const { id } = useParams();
  const [academicYear, setAcademicYear] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("acYearView") === "NO") {
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
          setAcademicYear(responnse.data.academicYear);
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
  return (
    <>
      {academicYear ? (
        <div className="max-w-3xl mx-auto mt-2 p-8 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Academic Year Details</h2>
            <Link to="/dashboard/academicYears" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="py-2 px-4 border mt-5 mb-1 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="flex space-x-3 mb-5" />

              <ViewCard type="title" text="Academic Year" />
              <ViewCard type="data" text={academicYear.acYear} />

              <ViewCard type="title" text="Description" />
              <ViewCard type="data" text={academicYear.desc} />

              <div className="flex space-x-3 mb-5" />
            </div>
          </div>
          <button
            className="w-full mt-5 mb-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            data-ripple-light="true"
            onClick={() => navigate(`/dashboard/academicYears`)}
          >  Back
          </button>
        </div>
      ) : (
        getSpinner()
      )}
    </>
  );
};

export default View;
