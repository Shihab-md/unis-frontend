import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [academicYear, setAcademicYear] = useState({
    acYear: "",
    desc: "",
  });

  const navigate = useNavigate()

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("acYearAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAcademicYear({ ...academicYear, [name]: value })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post((await getBaseUrl()).toString() + 'academicYear/add', academicYear, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Added!</b>",
          icon: "success",
          timer: 1600,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/dashboard/academicYears");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-md">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Enter Academic Year Details</h2>
        <Link to="/dashboard/academicYears" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Academic Year */}
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Academic Year <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="acYear"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                name="desc"
                onChange={handleChange}
                className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Add Academic Year
        </button>
      </form>
    </div>
  );
};

export default Add;