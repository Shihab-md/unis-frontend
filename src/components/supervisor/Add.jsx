import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing,
  showSwalAlert,
  validatePassword,
  PASSWORD_REGEX,
  isPasswordStrong,
} from '../../utils/CommonHelper';
import { useAuth } from "../../context/AuthContext";
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("supervisorAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  });

  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [passwordError, setPasswordError] = useState("");

  const password = formData.password || "";

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Always validate (password is required)
    const err = validatePassword(password);
    setPasswordError(err);
    if (err) return;

    setProcessing(true);

    const formDataObj = new FormData()
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key])
    })

    try {
      if (selectedDOBDate) {
        formDataObj.append('dob', selectedDOBDate)
      }
      if (selectedDOJDate) {
        formDataObj.append('doj', selectedDOJDate)
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const url = (await getBaseUrl()).toString() + "supervisor/add";
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
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/supervisors");
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
    <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold items-center justify-center">
          Enter Supervisor Details
        </h2>
        <Link to="/dashboard/supervisors" >
          <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
            {/* Name */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3 mt-7">
            {/* Supervisor ID */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Contact Number <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="contactNumber"
                onChange={handleChange}
                min="0"
                //  placeholder="Contact Number"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            {/* Route Name */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block mt-2 text-sm font-medium text-slate-500">
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

            {/* Qualification */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
            {/* Date of Birth */}
            <div className="grid grid-cols-1">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Date of Birth <span className="text-red-700">*</span>
              </label>
              <DatePicker
                name="dob"
                selected={selectedDOBDate}
                onChange={(date) => setSelectedDOBDate(date)}
                dateFormat="dd/MM/yyyy"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              //showIcon
              //toggleCalendarOnIconClick
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Gender <span className="text-red-700">*</span>
              </label>
              <select
                name="gender"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Marital Status <span className="text-red-700">*</span>
              </label>
              <select
                name="maritalStatus"
                onChange={handleChange}
                placeholder="Marital Status"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-7">
            {/* Job Type */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Job Type <span className="text-red-700">*</span>
              </label>
              <select
                name="jobType"
                onChange={handleChange}
                placeholder="Job Type"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select><p></p>
            </div>

            {/* Date of Joining */}
            <div className="grid">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Date of Joining <span className="text-red-700">*</span>
              </label>
              <DatePicker
                name="doj"
                selected={selectedDOJDate}
                onChange={(date) => setSelectedDOJDate(date)}
                dateFormat="dd/MM/yyyy"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              //showIcon
              //toggleCalendarOnIconClick
              /><p></p>
            </div>

            {/* Salary */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Salary <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="salary"
                onChange={handleChange}
                min="0"
                //    placeholder="Salary"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              /><p></p>
            </div>

            {/* Password */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Password <span className="text-red-700">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="******"
                value={password}
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
                pattern={PASSWORD_REGEX.source}
                title="8-64 chars, 1 uppercase, 1 lowercase, 1 number, 1 special, no spaces"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
            {/* Image Upload */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                Upload Image
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                placeholder="Upload Image"
                accept="image/*"
                className="mt-1 p-1 mb-5 block w-full border border-gray-300 rounded-md"
              />
            </div>

            {/* More details about the Supervisor */}
            <div className="md:col-span-2">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                More details about the Supervisor
              </label>
              <input
                type="text"
                name="remarks"
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={processing || !isPasswordStrong(password)}
          className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50"
        >
          Add Supervisor
        </button>
      </form >
    </div >
  );
};

export default Add;