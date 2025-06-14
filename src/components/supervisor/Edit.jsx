import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import moment from "moment";
import { getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth, getPrcessing } from '../../utils/CommonHelper';
import Swal from 'sweetalert2';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Edit = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const navigate = useNavigate()
  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [supervisor, setSupervisor] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    routeName: "",
    qualification: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    doj: "",
    designation: "",
    salary: "",
    jobType: "",
  });

  const { id } = useParams();

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("supervisorEdit") === "NO") {
      Swal.fire('Error!', 'User Authorization Failed!', 'error');
      navigate("/login");
    }

    const fetchSupervisor = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `supervisor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const supervisor = responnse.data.supervisor;

          setSelectedDOBDate(supervisor.dob);
          setSelectedDOJDate(supervisor.doj);
          setSupervisor((prev) => ({
            ...prev,
            name: supervisor.userId.name,
            email: supervisor.userId.email,
            supervisorId: supervisor.supervisorId,
            contactNumber: supervisor.contactNumber,
            address: supervisor.address,
            routeName: supervisor.routeName,
            qualification: supervisor.qualification,
            dob: supervisor.dob,
            gender: supervisor.gender,
            maritalStatus: supervisor.maritalStatus,
            doj: supervisor.doj,
            designation: supervisor.designation,
            salary: supervisor.salary,
            jobType: supervisor.jobType
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          Swal.fire('Error!', error.response.data.error, 'error');
          navigate("/dashboard/supervisors/");
        }
      }
    };

    fetchSupervisor();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setSupervisor((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setSupervisor((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {

      if (selectedDOBDate) {
        supervisor.dob = selectedDOBDate;
      }
      if (selectedDOJDate) {
        supervisor.doj = selectedDOJDate;
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const response = await axios.put(
        (await getBaseUrl()).toString() + `supervisor/${id}`,
        supervisor,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        Swal.fire({
          title: "Success!",
          html: "<b>Successfully Updated!</b>",
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
    <>
      {supervisor ? (
        <div className="max-w-4xl mx-auto mt-2 p-5 rounded-md shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Supervisor Details</h2>
            <Link to="/dashboard/supervisors" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={supervisor.name}
                    onChange={handleChange}
                    //      placeholder="Insert Name"
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
                    value={supervisor.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Supervisor ID */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Supervisor ID <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorId"
                    value={supervisor.supervisorId}
                    onChange={handleChange}
                    //  disabled={true}
                    //      placeholder="Supervisor ID"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Contact Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={supervisor.contactNumber}
                    onChange={handleChange}
                    //     placeholder="Contact Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={supervisor.address}
                    onChange={handleChange}
                    //    placeholder="Address"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Route Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Route Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="routeName"
                    value={supervisor.routeName}
                    onChange={handleChange}
                    //    placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Qualification <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={supervisor.qualification}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Date of Birth 
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={moment(new Date(supervisor.dob)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder="DOB"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div> */}

                {/* Date of Birth */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-gray-700">
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
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Gender <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={supervisor.gender}
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
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Marital Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={supervisor.maritalStatus}
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
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Job Type <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={supervisor.jobType}
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

                {/* Date of Joining 
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Date of Joining <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={moment(new Date(supervisor.doj)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //     placeholder="DOJ"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}

                {/* Date of Joining */}
                <div className="grid grid-cols-1">
                  <label className="block mt-2 text-sm font-medium text-gray-700">
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
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Salary <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={supervisor.salary}
                    //    placeholder="Salary"
                    className="mt-1 p-2 mb-3 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-gray-700">
                    Update Image
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
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Supervisor
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
