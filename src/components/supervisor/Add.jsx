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
import { getBusinessTodayDate } from "../../utils/dateRules";
import { AutoText, useLanguage } from "../../i18n/LanguageContext";
import { formatAge, formatWorkingExperience } from "../../utils/supervisorProfileUtils";

const Add = () => {
  const { tr, direction, fontFamily } = useLanguage();

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
    <div dir={direction} style={{ fontFamily }} className="max-w-5xl mx-auto mt-2 p-5 shadow-lg border">
      <div className="flex py-2 px-4 items-center justify-center bg-teal-700 text-white rounded-lg shadow-lg">
        <AutoText as="h2" text={tr("Enter Supervisor Details")} variant="button" className="font-semibold items-center justify-center" />
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
                {tr("Name")} <span className="text-red-700">*</span>
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
                {tr("Email")} <span className="text-red-700">*</span>
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
                {tr("Supervisor ID")} <span className="text-red-700">*</span>
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
                {tr("Contact Number")} <span className="text-red-700">*</span>
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
                {tr("Route Name")} <span className="text-red-700">*</span>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-7">
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Address")} <span className="text-red-700">*</span>
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
                {tr("Qualification")} <span className="text-red-700">*</span>
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

            {/* Father / Guardian Name */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
            {/* Date of Birth */}
            <div className="grid grid-cols-1">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Date of Birth")} <span className="text-red-700">*</span>
              </label>
              <DatePicker
                name="dob"
                maxDate={getBusinessTodayDate()}
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Marital Status")} <span className="text-red-700">*</span>
              </label>
              <select
                name="maritalStatus"
                onChange={handleChange}
                placeholder={tr("Marital Status")}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Single">{tr("Single")}</option>
                <option value="Married">{tr("Married")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-7">
            {/* Job Type */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Job Type")} <span className="text-red-700">*</span>
              </label>
              <select
                name="jobType"
                onChange={handleChange}
                placeholder={tr("Job Type")}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              >
                <option value=""></option>
                <option value="Full-Time">{tr("Full-Time")}</option>
                <option value="Part-Time">{tr("Part-Time")}</option>
              </select><p></p>
            </div>

            {/* Date of Joining */}
            <div className="grid">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Date of Joining")} <span className="text-red-700">*</span>
              </label>
              <DatePicker
                name="doj"
                maxDate={getBusinessTodayDate()}
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
              <div className="mt-1 h-4 text-[10px] font-normal text-slate-500 leading-4">
                {selectedDOJDate ? (
                  <>
                    {tr("Working Experience")}: <span className="text-blue-700">{formatWorkingExperience(selectedDOJDate, tr)}</span>
                  </>
                ) : null}
              </div><p></p>
            </div>

            {/* Salary */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Hadhiya")} <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                name="salary"
                onChange={handleChange}
                min="0"
                //    placeholder="Hadhiya"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              /><p></p>
            </div>

            {/* Password */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
                <p className="text-red-600 text-sm mt-1">
                  {tr(passwordError)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
            {/* Travelling Allowance */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
            {/* Activities carried out */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
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
              <label className="block mt-2 text-sm font-medium text-slate-500">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
            {/* Image Upload */}
            <div>
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("Upload Image")}
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                placeholder={tr("Upload Image")}
                accept="image/*"
                className="mt-1 p-1 mb-5 block w-full border border-gray-300 rounded-md"
              />
            </div>

            {/* More details about the Supervisor */}
            <div className="md:col-span-2">
              <label className="block mt-2 text-sm font-medium text-slate-500">
                {tr("More details about the Supervisor")}
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
          className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50 hover:-translate-y-0.5"
        >
          <AutoText text={tr("Add Supervisor")} variant="button" className="font-bold" />
        </button>
      </form >
    </div >
  );
};

export default Add;