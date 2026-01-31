import React, { useEffect, useState } from "react";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'
import {
  getBaseUrl, handleRightClickAndFullScreen, getSpinner, checkAuth,
  getPrcessing, showSwalAlert
} from '../../utils/CommonHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Edit = () => {

  // To prevent right-click AND For FULL screen view.
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);;

  const [processing, setProcessing] = useState(null)
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    role: "",
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
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [schools, setSchools] = useState([]);

  const { user } = useAuth();

  const roleOptions = [
    { value: "superadmin", label: "SuperAdmin" },
    { value: "hquser", label: "HQUser" },
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "usthadh", label: "Usthadh" },
    { value: "warden", label: "Warden" }
  ];

  const getAllowedRoleValues = (loginRole) => {
    const r = String(loginRole || "").toLowerCase();

    if (r === "superadmin") {
      return roleOptions.map((o) => o.value); // all
    }

    if (r === "hquser") {
      return roleOptions
        .filter((o) => o.value !== "superadmin") // all except superadmin
        .map((o) => o.value);
    }

    if (r === "supervisor") {
      return ["admin"];
    }

    if (r === "admin") {
      return ["usthadh", "warden", "staff"];
    }

    return []; // safe default
  };

  const allowed = new Set(getAllowedRoleValues(user?.role));

  const sortedRoleOptions = roleOptions
    .filter((o) => allowed.has(o.value))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

  useEffect(() => {

    // Authenticate the User.
    if (checkAuth("employeeEdit") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }

    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);
    };
    getSchoolsMap();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const responnse = await axios.get(
          (await getBaseUrl()).toString() + `employee/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responnse.data.success) {
          const employee = responnse.data.employee;

          setSelectedDOBDate(employee.dob);
          setSelectedDOJDate(employee.doj);

          setEmployee((prev) => ({
            ...prev,
            name: employee.userId.name,
            email: employee.userId.email,
            role: employee.userId.role,
            schoolId: employee.schoolId._id,
            employeeId: employee.employeeId,
            contactNumber: employee.contactNumber,
            address: employee.address,
            designation: employee.designation,
            qualification: employee.qualification,
            gender: employee.gender,
            maritalStatus: employee.maritalStatus,
            salary: employee.salary,
            active: employee.active
          }));
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          showSwalAlert("Error!", error.response.data.error, "error");
          navigate("/dashboard/employees");
        }
      }
    };

    fetchEmployee();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setEmployee((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setEmployee((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (selectedDOBDate) {
        employee.dob = selectedDOBDate;
      } else {
        employee.dob = "";
      }
      if (selectedDOJDate) {
        employee.doj = selectedDOJDate;
      } else {
        employee.doj = "";
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }
      const response = await axios.put(
        (await getBaseUrl()).toString() + `employee/${id}`,
        employee,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Updated!", "success");
        navigate("/dashboard/employees");
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
      {employee ? (
        <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
          <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold items-center justify-center">Update Employee Details</h2>
            <Link to="/dashboard/employees" >
              <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
            </Link>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
              <div className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-5 mb-3">

                {/* School */}
                <div className='md:col-span-2'>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Select Niswan <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="schoolId"
                    value={employee.schoolId}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={true}
                  >
                    <option value=""></option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.code + " : " + school.nameEnglish}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Name <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={employee.name}
                    onChange={handleChange}
                    //      placeholder="Insert Name"
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
                    value={employee.email}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Insert Email"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 mt-7">
                {/* Employee ID */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Employee ID <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={employee.employeeId}
                    onChange={handleChange}
                    disabled={true}
                    //      placeholder="Employee ID"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Role <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="role"
                    value={employee.role || ""}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                    disabled={user.role !== "superadmin"}
                  >
                    <option value=""></option>

                    {sortedRoleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active */}
                <div>
                  <label className="block mt-3 text-sm font-medium text-slate-500">
                    Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="active"
                    value={employee.active}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  >
                    <option value=""></option>
                    <option value="Active">Active</option>
                    <option value="In-Active">In-Active</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Contact Number <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="contactNumber"
                    value={employee.contactNumber}
                    onChange={handleChange}
                    min="0"
                    //     placeholder="Contact Number"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
                {/* Address */}
                <div className='md:col-span-2'>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Address <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={employee.address}
                    onChange={handleChange}
                    //    placeholder="Address"
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
                    value={employee.qualification}
                    onChange={handleChange}
                    //    placeholder="Qualification"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">

                {/* Date of Birth 
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Date of Birth <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={moment(new Date(employee.dob)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //    placeholder="DOB"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}

                {/* Date of Birth */}
                <div className="grid grid-cols-1">
                  <label className="block mt-3 text-sm font-medium text-slate-500">
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
                  <label className="block mt-3 text-sm font-medium text-slate-500">
                    Gender <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="gender"
                    value={employee.gender}
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
                  <label className="block mt-3 text-sm font-medium text-slate-500">
                    Marital Status <span className="text-red-700">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={employee.maritalStatus}
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

                {/* Date of Joining 
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Date of Joining <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="date"
                    name="doj"
                    value={moment(new Date(employee.doj)).format("YYYY-MM-DD")}
                    onChange={handleChange}
                    //     placeholder="DOJ"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>*/}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
                {/* Date of Joining */}
                <div className="grid grid-cols-1">
                  <label className="block mt-1 text-sm font-medium text-slate-500">
                    Date of Joining <span className="text-red-700">*</span>
                  </label>
                  <DatePicker
                    name="doj"
                    selected={selectedDOJDate}
                    onChange={(date) => setSelectedDOJDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="mb-4 p-2 block w-full border border-gray-300 rounded-md"
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
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    Salary <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={employee.salary}
                    min="0"
                    //    placeholder="Salary"
                    className="mt-1 mb-3 p-2 block w-full border border-gray-300 rounded-md"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7 mb-5">

                {/* Designation */}
                <div className='md:col-span-3'>
                  <label className="block mt-2 text-sm font-medium text-slate-500">
                    More details about the Employee
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={employee.designation}
                    onChange={handleChange}
                    //  placeholder="Route Name"
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //  required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
            >
              Update Employee
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
