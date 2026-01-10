import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { getSchoolsFromCache } from "../../utils/SchoolHelper";
import { useAuth } from "../../context/AuthContext";
import {
  getBaseUrl,
  handleRightClickAndFullScreen,
  checkAuth,
  getPrcessing,
  showSwalAlert,
  validatePassword,
  PASSWORD_REGEX,
  isPasswordStrong,
} from "../../utils/CommonHelper";
import { FaRegTimesCircle } from "react-icons/fa";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Add = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({});
  const [schools, setSchools] = useState([]);
  const [selectedDOBDate, setSelectedDOBDate] = useState(null);
  const [selectedDOJDate, setSelectedDOJDate] = useState(null);
  const [schoolId, setSchoolId] = useState(null);

  const [passwordError, setPasswordError] = useState("");

  // Run once (avoid adding event listeners on every render)
  useEffect(() => {
    handleRightClickAndFullScreen();
  }, []);

  // Auth check: add dependency array to avoid running on every render
  useEffect(() => {
    if (checkAuth("employeeAdd") === "NO") {
      showSwalAlert("Error!", "User Authorization Failed!", "error");
      navigate("/login");
    }
  }, [navigate]);

  // Load schools once
  useEffect(() => {
    const getSchoolsMap = async () => {
      const res = await getSchoolsFromCache(); // ✅ don’t pass undefined id

      // ✅ handle different return shapes safely
      const list = Array.isArray(res) ? res : (res?.schools || []);
      setSchools(list);

      const mySchoolId = localStorage.getItem("schoolId");
      const found = list.find((s) => s._id === mySchoolId);

      // ✅ react-select expects {value,label} not array
      setSchoolId(
        found ? { value: found._id, label: `${found.code} : ${found.nameEnglish}` } : null
      );
    };

    getSchoolsMap();
  }, []);


  const roleOptions = useMemo(
    () => [
      { value: "superadmin", label: "SuperAdmin", superadminOnly: true },
      { value: "hquser", label: "HQUser", superadminOnly: true },
      { value: "admin", label: "Admin", superadminOnly: true },
      { value: "teacher", label: "Teacher", superadminOnly: true },
      { value: "usthadh", label: "Usthadh" },
      { value: "warden", label: "Warden" },
      { value: "staff", label: "Staff" },
    ],
    []
  );

  const sortedRoleOptions = useMemo(() => {
    return roleOptions
      .filter((o) => user.role === "superadmin" || !o.superadminOnly)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [roleOptions, user.role]);

  const password = formData.password || ""; // ✅ single source of truth

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSchChange = (option) => {
    setSchoolId(option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Always validate (password is required)
    const err = validatePassword(password);
    setPasswordError(err);
    if (err) return;

    setProcessing(true);

    const formDataObj = new FormData();

    // Append all form fields (including password)
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    try {
      if (selectedDOBDate) formDataObj.append("dob", selectedDOBDate);
      if (selectedDOJDate) formDataObj.append("doj", selectedDOJDate);

      // School selection
      if (user.role === "superadmin" && schoolId?.value) {
        formDataObj.append("schoolId", schoolId.value);
      } else {
        formDataObj.append("schoolId", localStorage.getItem("schoolId"));
      }

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      };

      const response = await axios.post(
        (await getBaseUrl()).toString() + "employee/add",
        formDataObj,
        { headers }
      );

      if (response.data.success) {
        setProcessing(false);
        showSwalAlert("Success!", "Successfully Added!", "success");
        navigate("/dashboard/employees");
      } else {
        setProcessing(false);
        showSwalAlert("Error!", response.data.error || "Add failed", "error");
      }
    } catch (error) {
      setProcessing(false);
      if (error.response && !error.response.data.success) {
        showSwalAlert("Error!", error.response.data.error, "error");
      } else {
        showSwalAlert("Error!", "Server error", "error");
      }
    }
  };

  if (processing) return getPrcessing();

  return (
    <>
      <div className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold items-center justify-center">
            Enter Employee Details
          </h2>
          <Link to="/dashboard/employees">
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
              {/* School */}
              <div className="md:col-span-2">
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Select Niswan <span className="text-red-700">*</span>
                </label>

                <Select
                  className="mt-1 p-1 text-sm text-start"
                  name="schoolId"
                  options={schools.map((s) => ({
                    value: s._id,
                    label: `${s.code} : ${s.nameEnglish}`,
                  }))}
                  value={schoolId}
                  onChange={handleSchChange}
                  maxMenuHeight={210}
                  isDisabled={user.role !== "superadmin"}
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
              {/* Employee ID 
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
              </div>*/}

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
                  <option value=""></option>
                  {sortedRoleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
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
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* DOJ */}
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  Address <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  onChange={handleChange}
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
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {/* DOB */}
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
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
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
                  value={password}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                  pattern={PASSWORD_REGEX.source}
                  title="8-64 chars, 1 uppercase, 1 lowercase, 1 number, 1 special, no spaces"
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
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
                  accept="image/*"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7 mb-5">
              {/* Designation */}
              <div className="md:col-span-3">
                <label className="block mt-2 text-sm font-medium text-slate-500">
                  More details about the Employee
                </label>
                <input
                  type="text"
                  name="designation"
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
            Add Employee
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;