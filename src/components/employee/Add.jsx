import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getSchoolsFromCache } from '../../utils/SchoolHelper';
import { useAuth } from '../../context/AuthContext'
import { getBaseUrl, handleRightClickAndFullScreen, checkAuth, getPrcessing, showSwalAlert } from '../../utils/CommonHelper';
import {
  FaRegTimesCircle
} from "react-icons/fa";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Add = () => {

  // To prevent right-click AND For FULL screen view.
  handleRightClickAndFullScreen();

  const [processing, setProcessing] = useState()
  const [formData, setFormData] = useState({});
  const [schools, setSchools] = useState([]);
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const [schoolId, setSchoolId] = useState([]);
  //  const [selectedDOJDate, setSelectedDOJDate] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Authenticate the User.
    if (checkAuth("employeeAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  });

  useEffect(() => {
    const getSchoolsMap = async (id) => {
      const schools = await getSchoolsFromCache(id);
      setSchools(schools);

      setSchoolId(schools.filter(school => school._id === localStorage.getItem('schoolId')).map(option => ({
        value: option._id, label: option.code + " : " + option.nameEnglish
      })));
    };
    getSchoolsMap();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSchChange = (option) => {
    setSchoolId(option);
    console.log("Option : " + option + ", value : " + option.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (user.role === "superadmin" && schoolId && schoolId != null && schoolId != '' && schoolId != 'undefined') {
        formDataObj.append('schoolId', schoolId.value)
        console.log("111 - " + schoolId.value)
      } else {
        formDataObj.append('schoolId', localStorage.getItem('schoolId'))
        console.log("222 - " + localStorage.getItem('schoolId'))
      }

      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      }

      const response = await axios.post(
        (await getBaseUrl()).toString() + "employee/add",
        formDataObj,
        {
          headers: headers
        }
      );
      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/employees");
      }
    } catch (error) {
      setProcessing(false);
      //  error.response.render({ form: formData });
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      }
    }
  };

  const { user } = useAuth();

  if (processing) {
    return getPrcessing();
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">Enter Employee Details</h2>
          <Link to="/dashboard/employees" >
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
              {/* School */}
              <div className='md:col-span-2'>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Select Niswan <span className="text-red-700">*</span>
                </label>
                {/*  <select
                  name="schoolId"
                  value={localStorage.getItem('schoolId')}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  //required
                  disabled={user.role === "superadmin" ? false : true}
                >
                  <option value="">Select Niswan</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.code + " : " + school.nameEnglish}
                    </option>
                  ))}
                </select>
                  */}
                <Select className='mt-1 p-1 text-sm text-start'
                  name="schoolId"
                  options={schools.map(option => ({
                    value: option._id, label: option.code + " : " + option.nameEnglish
                  }))}

                  value={schoolId}

                  onChange={handleSchChange}
                  maxMenuHeight={210}
                  isDisabled={user.role === "superadmin" ? false : true}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Name <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 mt-7">
              {/* Employee ID */}
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Employee ID <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Role</option>
                  {user.role === "superadmin" ?
                    <option value="hquser">HQUser</option> : null}
                  {user.role === "superadmin" ?
                    <option value="admin">Admin</option> : null}
                  {user.role === "superadmin" ?
                    <option value="teacher">Teacher</option> : null}
                  <option value="usthadh">Usthadh</option>
                  <option value="warden">Warden</option>
                  <option value="staff">Staff</option>
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
                  onChange={handleChange}
                  min="0"
                  //  placeholder="Contact Number"
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-7">

              {/* Date of Birth 
              <div>
                <label className="block mt-2 text-sm font-medium text-slate-500">
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
                  onChange={handleChange}
                  //      placeholder="DOJ"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>*/}

              {/* Date of Joining */}
              <div className="grid grid-cols-1">
                <label className="block mt-3 text-sm font-medium text-slate-500">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
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
                />
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
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

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
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
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
            Add Employee
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;