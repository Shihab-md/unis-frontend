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
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { formatAge, formatWorkingExperience } from "../../utils/employeeProfileUtils";

const Add = () => {
  const { tr, t, direction, fontFamily } = useLanguage();

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

  {/*
  // Load schools once
  useEffect(() => {
    const getSchoolsMap = async () => {
      const res = await getSchoolsFromCache();

      const list = Array.isArray(res) ? res : (res?.schools || []);
      const supSchoolIds = JSON.parse(localStorage.getItem("schoolIds"));
      const role = localStorage.getItem("role");

      const filtered =
        role === "supervisor" && Array.isArray(supSchoolIds) && supSchoolIds.length > 0
          ? list.filter((s) => s && supSchoolIds.includes(String(s._id)))
          : list;

      setSchools(filtered);

      const mySchoolId = localStorage.getItem("schoolId");
      const found = list.find((s) => s._id === mySchoolId);

      setSchoolId(
        found ? { value: found._id, label: `${found.code} : ${found.nameEnglish}` } : null
      );
    };

    getSchoolsMap();
  }, []);
  */}

  // Load schools once
  useEffect(() => {
    const getSchoolsMap = async () => {
      const res = await getSchoolsFromCache();

      const list = Array.isArray(res) ? res : (res?.schools || []);
      const activeList = list.filter((s) => s?.active === "Active");

      const supSchoolIds = JSON.parse(localStorage.getItem("schoolIds"));
      const role = localStorage.getItem("role");

      const filtered =
        role === "supervisor" && Array.isArray(supSchoolIds) && supSchoolIds.length > 0
          ? activeList.filter((s) => s && supSchoolIds.includes(String(s._id)))
          : activeList;

      setSchools(filtered);

      const mySchoolId = localStorage.getItem("schoolId");
      const found = filtered.find((s) => String(s._id) === String(mySchoolId));

      setSchoolId(
        found
          ? { value: found._id, label: `${found.code} : ${found.nameEnglish}` }
          : null
      );
    };

    getSchoolsMap();
  }, []);

  const roleOptions = useMemo(
    () => [
      { value: "superadmin", label: t("roles.superadmin", "SuperAdmin") },
      { value: "hquser", label: t("roles.hquser", "HQUser") },
      { value: "admin", label: t("roles.admin", "Admin") },
      { value: "teacher", label: t("roles.teacher", "Teacher") },
      { value: "usthadh", label: t("roles.usthadh", "Usthadh") },
      { value: "warden", label: t("roles.warden", "Warden") }
    ],
    [t]
  );

  const sortedRoleOptions = useMemo(() => {
    const role = String(user?.role || "").toLowerCase();

    const allowedByRole = {
      superadmin: null, // null = all
      hquser: ["admin", "teacher"],
      supervisor: ["admin"],
      admin: ["usthadh", "warden"],
    };

    const allowed = allowedByRole[role];

    return roleOptions
      .filter((o) => !allowed || allowed.includes(o.value))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [roleOptions, user?.role]);

  const password = formData.password || "";

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      const file = files?.[0];

      if (!file) {
        setFormData((prevData) => ({ ...prevData, file: null }));
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (file.size > maxSize) {
        showSwalAlert("Error!", "Image size must be less than 2 MB.", "error");
        e.target.value = "";
        return;
      }
      setFormData((prevData) => ({ ...prevData, [name]: file }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

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

      //alert(user?.role)
      // School selection
      if (["superadmin", "hquser", "supervisor"].includes(user?.role) && schoolId?.value) {
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
      <div dir={direction} style={{ fontFamily }} className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
        <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
          <AutoText as="h2" text={tr("Enter Employee Details")} variant="button" className="font-semibold items-center justify-center" />
          <Link to="/dashboard/employees">
            <FaRegTimesCircle className="text-2xl ml-7 text-red-700 bg-gray-200 rounded-xl shadow-md items-center justify-end" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="py-2 px-4 border mt-5 mb-3 items-center justify-center rounded-lg shadow-lg bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3">
              {/* School */}
              <div className="md:col-span-2">
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Select Niswan")} <span className="text-red-700">*</span>
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
                  isDisabled={!(user.role === "superadmin" || user.role === "hquser" || user.role === "supervisor")}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Name")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Email")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Employee ID")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Role")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Contact Number")} <span className="text-red-700">*</span>
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
                <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Date of Joining")} <span className="text-red-700">*</span>
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
                <div className="mt-1 h-4 text-[10px] font-normal text-slate-500 leading-4">
                  {selectedDOJDate ? (
                    <>
                      {tr("Working Experience")}: <span className="text-blue-700">{formatWorkingExperience(selectedDOJDate, tr)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-7">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Address")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Qualification")} <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Father / Guardian Name */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Father / Guardian Name")}
                </label>
                <input
                  type="text"
                  name="fatherGuardianName"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {/* DOB */}
              <div className="grid grid-cols-1">
                <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Date of Birth")} <span className="text-red-700">*</span>
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
                <div className="mt-1 h-4 text-[10px] font-normal text-slate-500 leading-4">
                  {selectedDOBDate ? (
                    <>
                      {tr("Age")}: <span className="text-blue-700">{formatAge(selectedDOBDate, tr)}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Gender")} <span className="text-red-700">*</span>
                </label>
                <select
                  name="gender"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Male">{tr("Male")}</option>
                  <option value="Female">{tr("Female")}</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block mt-3 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Marital Status")} <span className="text-red-700">*</span>
                </label>
                <select
                  name="maritalStatus"
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value=""></option>
                  <option value="Single">{tr("Single")}</option>
                  <option value="Married">{tr("Married")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
              {/* Salary */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Hadhiya")} <span className="text-red-700">*</span>
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
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Password")} <span className="text-red-700">*</span>
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
                  title={tr("Password requirements")}
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Upload Image")}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7">
              {/* Travelling Allowance */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Travelling Allowance")}
                </label>
                <input
                  type="number"
                  name="travellingAllowance"
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Other Designation */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Other Designation")}
                </label>
                <textarea
                  name="otherDesignation"
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7 mb-5">
              {/* Activities carried out */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Activities carried out")}
                </label>
                <textarea
                  name="activitiesCarriedOut"
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                />
              </div>

              {/* Bank account details */}
              <div>
                <label className="block mt-2 text-xs sm:text-sm font-medium text-slate-500">
                  {tr("Bank account details")}
                </label>
                <textarea
                  name="bankAccountDetails"
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md resize-y"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing || !isPasswordStrong(password)}
            className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
          >
            <AutoText text={tr("Add Employee") } variant="button" className="font-bold" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Add;