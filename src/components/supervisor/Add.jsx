import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const navigate = useNavigate();
  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("supervisorAdd") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }
  });

  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(null)

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const url = (await getBaseUrl()).toString() + "supervisor/add";
      //  alert(JSON.stringify(formData));
      const response = await axios.post(url, formDataObj,
        {
          headers: headers
          //headers: {
          //  Authorization: `Bearer ${localStorage.getItem("token")}`,
          //},
        }
      );
      if (response.data.success) {
        setProcessing(false);
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Added!</b>",
          icon: "success",
          timer: 1600,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate("/dashboard/supervisors");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        Swal.fire('Error!', error.response.data.error, 'error');
      }
    }
  };

  if (processing) {
    return getPrcessing();
  }

  return (
    <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-md content-center">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">Enter Supervisor Details</h2>
        <Link to="/dashboard/supervisors" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Name <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                //  placeholder="Insert Name"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mt-2 text-sm font-medium text-gray-700">
                Email <span className="text-red-700">*</span>
              </label>
              <input
                type="email"
                name="email"
                // value="sass@asffs.vvs"
                onChange={handleChange}
                //  placeholder="Insert Email"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Supervisor ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Supervisor ID <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="supervisorId"
                onChange={handleChange}
                //  placeholder="Supervisor ID"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="contactNumber"
                onChange={handleChange}
                //  placeholder="Contact Number"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="address"
                onChange={handleChange}
                //  placeholder="Address"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Route Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Route Name <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="routeName"
                onChange={handleChange}
                //  placeholder="Route Name"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Qualification <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                onChange={handleChange}
                //    placeholder="Qualification"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-700">*</span>
              </label>
              <input
                type="date"
                name="dob"
                onChange={handleChange}
                //    placeholder="DOB"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-700">*</span>
              </label>
              <select
                name="gender"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marital Status <span className="text-red-700">*</span>
              </label>
              <select
                name="maritalStatus"
                onChange={handleChange}
                placeholder="Marital Status"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Type <span className="text-red-700">*</span>
              </label>
              <select
                name="jobType"
                onChange={handleChange}
                placeholder="Job Type"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Job Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Joining <span className="text-red-700">*</span>
              </label>
              <input
                type="date"
                name="doj"
                onChange={handleChange}
                //      placeholder="DOJ"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="salary"
                onChange={handleChange}
                //    placeholder="Salary"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-700">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="******"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                placeholder="Upload Image"
                accept="image/*"
                className="mt-1 p-2 mb-5 block w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        >
          Add Supervisor
        </button>
      </form>
    </div>
  );
};

export default Add;